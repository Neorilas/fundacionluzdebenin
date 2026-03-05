import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
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

const FRONTEND_URL = typeof window !== 'undefined'
  ? (window.location.port === '5173' ? 'http://localhost:3000' : window.location.origin)
  : '';

async function translateText(text: string): Promise<string> {
  if (!text.trim()) return '';
  const r = await api.post('/admin/translate', { text, from: 'es', to: 'fr' });
  return r.data.translatedText || text;
}

interface FormData {
  slug: string;
  titleEs: string; titleFr: string;
  excerptEs: string; excerptFr: string;
  contentEs: string; contentFr: string;
  coverImage: string;
  category: string;
  tags: string[];
  scheduledAt: string;
}

const empty: FormData = {
  slug: '', titleEs: '', titleFr: '', excerptEs: '', excerptFr: '',
  contentEs: '', contentFr: '', coverImage: '', category: '',
  tags: [], scheduledAt: '',
};

function tagsFromJson(raw: string): string[] {
  try { return JSON.parse(raw || '[]'); } catch { return []; }
}

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(empty);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [contentLang, setContentLang] = useState<'es' | 'fr'>('es');
  const [translatingContent, setTranslatingContent] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!id);
  const [isDirty, setIsDirty] = useState(false);
  const initialLoadedRef = useRef(!id);

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/admin/blog/${id}`).then(r => {
        const p = r.data;
        const scheduled = p.scheduledAt
          ? new Date(p.scheduledAt).toISOString().slice(0, 16)
          : '';
        setForm({
          slug: p.slug, titleEs: p.titleEs, titleFr: p.titleFr,
          excerptEs: p.excerptEs, excerptFr: p.excerptFr,
          contentEs: p.contentEs, contentFr: p.contentFr,
          coverImage: p.coverImage || '',
          category: p.category || '',
          tags: tagsFromJson(p.tags),
          scheduledAt: scheduled,
        });
        if (scheduled) setShowSchedule(true);
      }).finally(() => {
        setLoading(false);
        initialLoadedRef.current = true;
      });
    }
  }, [id, isEdit]);

  const set = (name: string, value: string | string[]) => {
    setForm(f => {
      const next: Partial<FormData> = { [name]: value };
      if (name === 'titleEs' && !slugTouched) {
        next.slug = toSlug(value as string);
      }
      return { ...f, ...next };
    });
    if (initialLoadedRef.current) setIsDirty(true);
  };

  // Tags
  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };
  const removeTag = (tag: string) => set('tags', form.tags.filter(t => t !== tag));
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
    else if (e.key === 'Backspace' && !tagInput && form.tags.length) removeTag(form.tags[form.tags.length - 1]);
  };

  const save = async (published: boolean) => {
    if (showSchedule && !published && !form.scheduledAt) {
      alert('Selecciona una fecha y hora de publicación.');
      return;
    }
    setSaving(published ? 'publish' : 'draft');
    try {
      const payload = {
        ...form,
        tags: form.tags,
        published,
        scheduledAt: showSchedule && !published ? form.scheduledAt : null,
      };
      if (isEdit) {
        await api.put(`/admin/blog/${id}`, payload);
      } else {
        await api.post('/admin/blog', payload);
      }
      setIsDirty(false);
      navigate('/admin/blog');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      alert(message);
    } finally {
      setSaving(null);
    }
  };

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div></div>;

  return (
    <div className="max-w-5xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isDirty && !confirm('¿Salir sin guardar? Se perderán los cambios.')) return;
              navigate('/admin/blog');
            }}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >←</button>
          <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar post' : 'Nuevo post'}</h2>
        </div>
        <div className="flex items-center gap-2">
          {form.slug && (
            <a
              href={`${FRONTEND_URL}/es/blog/${form.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-primary-800 transition-colors px-2 py-1"
            >
              👁 Ver en la web
            </a>
          )}
          <button
            type="button"
            onClick={() => save(false)}
            disabled={!!saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {saving === 'draft' ? 'Guardando…' : '💾 Guardar borrador'}
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={!!saving}
            className="px-5 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving === 'publish' ? 'Publicando…' : '🚀 Publicar'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Main column ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Slug + Titles */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.slug}
                onChange={e => { setSlugTouched(true); set('slug', e.target.value); }}
                required
                placeholder="mi-articulo"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 font-mono"
              />
            </div>
            <BilingualField label="Título" nameEs="titleEs" nameFr="titleFr" valueEs={form.titleEs} valueFr={form.titleFr} onChange={set} required />
            <BilingualField label="Extracto" nameEs="excerptEs" nameFr="excerptFr" valueEs={form.excerptEs} valueFr={form.excerptFr} onChange={set} multiline rows={2} />
          </div>

          {/* Content editor */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Contenido</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={translatingContent || !form.contentEs.trim()}
                  onClick={async () => {
                    setTranslatingContent(true);
                    try {
                      const translated = await translateText(form.contentEs);
                      set('contentFr', translated);
                      setContentLang('fr');
                    } catch { alert('Error al traducir'); }
                    finally { setTranslatingContent(false); }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-40 flex items-center gap-1"
                >
                  {translatingContent
                    ? <span className="inline-block w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                    : '🌐'
                  }
                  {translatingContent ? 'Traduciendo…' : 'Auto-FR'}
                </button>
                <div className="flex border border-gray-300 rounded overflow-hidden text-xs">
                  <button type="button" onClick={() => setContentLang('es')} className={`px-3 py-1 ${contentLang === 'es' ? 'bg-primary-800 text-white' : 'bg-white text-gray-600'}`}>ES</button>
                  <button type="button" onClick={() => setContentLang('fr')} className={`px-3 py-1 ${contentLang === 'fr' ? 'bg-primary-800 text-white' : 'bg-white text-gray-600'}`}>FR</button>
                </div>
              </div>
            </div>
            <div data-color-mode="light">
              <MDEditor
                value={contentLang === 'es' ? form.contentEs : form.contentFr}
                onChange={val => set(contentLang === 'es' ? 'contentEs' : 'contentFr', val || '')}
                height={480}
                preview="edit"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Editando: {contentLang === 'es' ? '🇪🇸 Español' : '🇫🇷 Français'}</p>
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Imagen destacada */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Imagen destacada</h3>
            {form.coverImage ? (
              <div className="space-y-2">
                <img
                  src={form.coverImage}
                  alt="Portada"
                  className="w-full aspect-video object-cover rounded-lg border border-gray-200"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="flex-1 text-xs text-center py-1.5 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={() => set('coverImage', '')}
                    className="flex-1 text-xs text-center py-1.5 border border-red-200 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-800 hover:text-primary-800 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium">Seleccionar imagen</span>
              </button>
            )}
          </div>

          {/* Categoría */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Categoría</h3>
            <input
              type="text"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              placeholder="Educación, Salud, Noticias…"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>

          {/* Etiquetas */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Etiquetas</h3>
            <div className="flex flex-wrap gap-1.5 border border-gray-300 rounded-md px-2 py-1.5 min-h-[38px] focus-within:ring-2 focus-within:ring-primary-800">
              {form.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-primary-600 hover:text-primary-900 leading-none">×</button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput.trim() && addTag(tagInput)}
                placeholder={form.tags.length === 0 ? 'Enter o coma para añadir' : ''}
                className="flex-1 min-w-[80px] border-none outline-none text-xs py-0.5 bg-transparent"
              />
            </div>
          </div>

          {/* Programar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showSchedule}
                onChange={e => setShowSchedule(e.target.checked)}
                className="w-4 h-4 text-primary-800 rounded"
              />
              <span className="text-sm font-semibold text-gray-800">Programar publicación</span>
            </label>
            {showSchedule && (
              <div className="mt-3">
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={e => set('scheduledAt', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                />
                <p className="text-xs text-gray-400 mt-1">Pulsa "Guardar borrador" para programar.</p>
              </div>
            )}
          </div>

          {/* Bottom save buttons (repeat for convenience) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => save(true)}
              disabled={!!saving}
              className="w-full py-2.5 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving === 'publish' ? 'Publicando…' : '🚀 Publicar'}
            </button>
            <button
              type="button"
              onClick={() => save(false)}
              disabled={!!saving}
              className="w-full py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {saving === 'draft' ? 'Guardando…' : '💾 Guardar borrador'}
            </button>
          </div>
        </div>
      </form>

      {showMediaPicker && (
        <MediaPicker
          onSelect={url => set('coverImage', url)}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
