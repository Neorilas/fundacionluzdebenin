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
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaPicker({ onSelect, onClose }: Props) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
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
                <button
                  key={f.filename}
                  type="button"
                  onClick={() => setSelected(f.url === selected ? null : f.url)}
                  className={`relative rounded-lg overflow-hidden border-2 aspect-square transition-all ${
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
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <p className="text-sm text-gray-500">
            {selected
              ? <span className="font-medium text-gray-700">Seleccionada: <span className="font-mono text-xs">{selected.split('/').pop()}</span></span>
              : `${files.length} imagen${files.length !== 1 ? 'es' : ''}`
            }
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
            <button
              onClick={() => { if (selected) { onSelect(selected); onClose(); } }}
              disabled={!selected}
              className="px-5 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 disabled:opacity-40 transition-colors"
            >
              Usar imagen seleccionada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
