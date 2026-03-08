'use client';

import { useEffect, useRef, useState } from 'react';
import api from '../api';

interface MediaFile {
  url: string;
  filename: string;
  size: number;
  createdAt: string;
}

interface Props {
  onSelect: (url: string, alt?: string) => void;
  onClose: () => void;
  /** When true, shows an alt text input before confirming (for markdown insertion) */
  askAlt?: boolean;
}

export default function MediaPicker({ onSelect, onClose, askAlt = false }: Props) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/upload').then(r => setFiles(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('admin_token');
      const r = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await r.json();
      if (data.url) {
        load();
        setSelected(data.url);
      }
    } finally { setUploading(false); }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`¿Eliminar "${filename}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(filename);
    try {
      await api.delete(`/admin/upload/${filename}`);
      if (selected?.endsWith(`/${filename}`)) setSelected(null);
      setFiles(f => f.filter(x => x.filename !== filename));
    } finally {
      setDeleting(null);
    }
  };

  const fmt = (bytes: number) =>
    bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Biblioteca de medios</h2>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 disabled:opacity-50 transition-colors"
            >
              {uploading
                ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Subiendo…</>
                : '+ Subir imagen'
              }
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <div className="text-5xl mb-3">🖼️</div>
              <p className="text-sm">No hay imágenes subidas aún.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-primary-800 text-sm font-medium hover:underline"
              >
                Subir la primera imagen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {files.map(f => (
                <div key={f.filename} className="relative group">
                  <button
                    type="button"
                    onClick={() => setSelected(f.url === selected ? null : f.url)}
                    className={`relative rounded-lg overflow-hidden border-2 aspect-square transition-all w-full ${
                      selected === f.url
                        ? 'border-primary-800 ring-2 ring-primary-800 ring-offset-1'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={f.url}
                      alt={f.filename}
                      className="w-full h-full object-cover"
                    />
                    {selected === f.url && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary-800 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    disabled={deleting === f.filename}
                    onClick={() => handleDelete(f.filename)}
                    title="Eliminar imagen"
                    className="absolute bottom-1 left-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50 text-xs"
                  >
                    {deleting === f.filename ? '…' : '×'}
                  </button>

                  <p className="text-[10px] text-gray-400 truncate mt-0.5 px-0.5">{fmt(f.size)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          {askAlt && selected && (
            <div className="px-6 pt-4 pb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Texto alternativo (alt) — describe la imagen para accesibilidad y SEO
              </label>
              <input
                type="text"
                value={altText}
                onChange={e => setAltText(e.target.value)}
                placeholder="Ej: Niños del orfanato durante el almuerzo, Cotonou"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                autoFocus
              />
            </div>
          )}
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-sm text-gray-500">
              {selected
                ? <span className="font-medium text-gray-700">Seleccionada: <span className="font-mono text-xs">{selected.split('/').pop()}</span></span>
                : `${files.length} imagen${files.length !== 1 ? 'es' : ''}`
              }
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
              <button
                onClick={() => { if (selected) { onSelect(selected, altText); onClose(); } }}
                disabled={!selected}
                className="px-5 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 disabled:opacity-40 transition-colors"
              >
                Usar imagen seleccionada
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
