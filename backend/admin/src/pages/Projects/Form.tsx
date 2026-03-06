import { useEffect, useRef, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor, { commands } from '@uiw/react-md-editor';
import api from '../../api';
import BilingualField from '../../components/BilingualField';
import MediaPicker from '../../components/MediaPicker';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface ProjectImage { url: string; alt: string; }

interface FormData {
  slug: string;
  titleEs: string;
  titleFr: string;
  descEs: string;
  descFr: string;
  status: string;
  featured: boolean;
  images: ProjectImage[];
  order: number;
}

const empty: FormData = {
  slug: '', titleEs: '', titleFr: '', descEs: '', descFr: '',
  status: 'active', featured: false, images: [], order: 0,
};

function normalizeImages(raw: (string | ProjectImage)[]): ProjectImage[] {
  return raw.map(img => typeof img === 'string' ? { url: img, alt: '' } : img);
}

export default function ProjectsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(empty);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!id);
  const [isDirty, setIsDirty] = useState(false);
  const initialLoadedRef = useRef(!id);
  const [descLang, setDescLang] = useState<'es' | 'fr'>('es');
  const [translatingDesc, setTranslatingDesc] = useState(false);
  const [showImageInserter, setShowImageInserter] = useState(false);
  const editorApiRef = useRef<any>(null);

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/admin/projects`).then(r => {
        const p = r.data.find((x: { id: string }) => x.id === id);
        if (p) setForm({
          slug: p.slug, titleEs: p.titleEs, titleFr: p.titleFr,
          descEs: p.descEs, descFr: p.descFr, status: p.status,
          featured: p.featured, images: normalizeImages(p.images), order: p.order,
        });
      }).finally(() => {
        setLoading(false);
        initialLoadedRef.current = true;
      });
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const set = (name: string, value: string | boolean) => {
    setForm(f => {
      const next: Partial<FormData> = { [name]: value };
      if (name === 'titleEs' && !slugTouched) {
        next.slug = toSlug(value as string);
      }
      return { ...f, ...next };
    });
    if (initialLoadedRef.current) setIsDirty(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/admin/projects/${id}`, form);
      } else {
        await api.post('/admin/projects', form);
      }
      setIsDirty(false);
      navigate('/admin/projects');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div></div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
            if (isDirty && !confirm('¿Salir sin guardar? Se perderán los cambios.')) return;
            navigate('/admin/projects');
          }}
          className="text-gray-400 hover:text-gray-600"
        >←</button>
        <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }}
              required
              placeholder="mi-proyecto"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => set('order', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>
        </div>

        <BilingualField label="Título" nameEs="titleEs" nameFr="titleFr" valueEs={form.titleEs} valueFr={form.titleFr} onChange={set} required />
        {/* Description editor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={translatingDesc || !form.descEs.trim()}
                onClick={async () => {
                  setTranslatingDesc(true);
                  try {
                    const r = await api.post('/admin/translate', { text: form.descEs, from: 'es', to: 'fr' });
                    set('descFr', r.data.translatedText || form.descEs);
                    setDescLang('fr');
                  } catch { alert('Error al traducir'); }
                  finally { setTranslatingDesc(false); }
                }}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-40 flex items-center gap-1"
              >
                {translatingDesc ? <span className="inline-block w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" /> : '🌐'}
                {translatingDesc ? 'Traduciendo…' : 'Auto-FR'}
              </button>
              <div className="flex border border-gray-300 rounded overflow-hidden text-xs">
                <button type="button" onClick={() => setDescLang('es')} className={`px-3 py-1 ${descLang === 'es' ? 'bg-primary-800 text-white' : 'bg-white text-gray-600'}`}>ES</button>
                <button type="button" onClick={() => setDescLang('fr')} className={`px-3 py-1 ${descLang === 'fr' ? 'bg-primary-800 text-white' : 'bg-white text-gray-600'}`}>FR</button>
              </div>
            </div>
          </div>
          <div data-color-mode="light">
            <MDEditor
              value={descLang === 'es' ? form.descEs : form.descFr}
              onChange={val => set(descLang === 'es' ? 'descEs' : 'descFr', val || '')}
              height={300}
              preview="edit"
              extraCommands={[
                {
                  name: 'imageInsert',
                  keyCommand: 'imageInsert',
                  buttonProps: { 'aria-label': 'Insertar imagen en el texto', title: 'Insertar imagen en el texto' },
                  icon: (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                  ),
                  execute: (_state: unknown, api: any) => {
                    editorApiRef.current = api;
                    setShowImageInserter(true);
                  },
                },
                commands.fullscreen,
              ]}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Editando: {descLang === 'es' ? '🇪🇸 Español' : '🇫🇷 Français'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
            >
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="planned">Planificado</option>
            </select>
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="w-4 h-4 text-primary-800 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Proyecto destacado</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes</label>
          <ProjectImageManager
            images={form.images}
            onChange={imgs => { setForm(f => ({ ...f, images: imgs })); if (initialLoadedRef.current) setIsDirty(true); }}
          />
        </div>

        {showImageInserter && (
          <MediaPicker
            onSelect={url => {
              if (editorApiRef.current) {
                editorApiRef.current.replaceSelection(`\n![imagen](${url})\n`);
                editorApiRef.current = null;
              }
              setShowImageInserter(false);
            }}
            onClose={() => {
              editorApiRef.current = null;
              setShowImageInserter(false);
            }}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={() => {
            if (isDirty && !confirm('¿Salir sin guardar? Se perderán los cambios.')) return;
            navigate('/admin/projects');
          }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button type="submit" disabled={saving} className="bg-primary-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---- Inline image manager with alt text ----
interface ProjectImageManagerProps {
  images: ProjectImage[];
  onChange: (imgs: ProjectImage[]) => void;
}

function ProjectImageManager({ images, onChange }: ProjectImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList) => {
    setUploading(true);
    const next = [...images];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const r = await api.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        next.push({ url: r.data.url, alt: '' });
      } catch { /* skip */ }
    }
    onChange(next);
    setUploading(false);
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const updateAlt = (idx: number, alt: string) => {
    const next = images.map((img, i) => i === idx ? { ...img, alt } : img);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {images.map((img, idx) => (
        <div key={idx} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <img src={img.url} alt={img.alt || ''} className="w-20 h-20 object-cover rounded border border-gray-200 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={img.alt}
              onChange={e => updateAlt(idx, e.target.value)}
              placeholder="Texto alternativo (alt) — describe la imagen para SEO y accesibilidad"
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-800"
            />
            <p className="text-xs text-gray-400 mt-1">{img.url}</p>
          </div>
          <button type="button" onClick={() => remove(idx)} className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-sm text-gray-400 hover:border-primary-800 hover:text-primary-800 transition-colors disabled:opacity-50"
      >
        {uploading ? 'Subiendo…' : '+ Añadir imagen'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && upload(e.target.files)} />
    </div>
  );
}
