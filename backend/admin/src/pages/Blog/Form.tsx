import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import BilingualField from '../../components/BilingualField';
import MediaPicker from '../../components/MediaPicker';
import RichTextEditor from '../../components/RichTextEditor';

interface Category { id: string; name: string; }

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

function stripMarkdown(html: string): string {
  // Strip HTML tags (content is now HTML from TipTap)
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(md: string): number {
  const clean = stripMarkdown(md);
  return clean.split(/\s+/).filter(w => w.length > 0).length;
}

function wordCountColor(n: number): string {
  if (n < 300) return 'text-red-500';
  if (n < 600) return 'text-amber-500';
  if (n < 1000) return 'text-green-600';
  return 'text-blue-600';
}

function wordCountLabel(n: number): string {
  if (n < 300) return '· mín. 300 recomendado';
  if (n < 600) return '· buen inicio';
  if (n < 1000) return '· bien para SEO ✓';
  return '· excelente ✓';
}

interface FormData {
  slug: string;
  titleEs: string; titleFr: string;
  metaTitleEs: string; metaTitleFr: string;
  excerptEs: string; excerptFr: string;
  contentEs: string; contentFr: string;
  coverImage: string;
  coverImageAlt: string;
  category: string;
  tags: string[];
  focusKeyword: string;
  scheduledAt: string;
}

const empty: FormData = {
  slug: '', titleEs: '', titleFr: '', metaTitleEs: '', metaTitleFr: '',
  excerptEs: '', excerptFr: '', contentEs: '', contentFr: '',
  coverImage: '', coverImageAlt: '', category: '', tags: [],
  focusKeyword: '', scheduledAt: '',
};

function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0).length;
  return Math.max(1, Math.round(words / 200));
}

function charCountColor(n: number, min: number, max: number): string {
  if (n === 0) return 'text-gray-400';
  if (n < min) return 'text-amber-500';
  if (n > max) return 'text-red-500';
  return 'text-green-600';
}

interface SeoCheck { label: string; ok: boolean; warn?: boolean; }
function seoChecks(form: FormData, words: number): SeoCheck[] {
  const titleLen = form.titleEs.length;
  const excerptLen = form.excerptEs.length;
  const kw = form.focusKeyword.trim().toLowerCase();
  return [
    { label: `Título ${titleLen} car. (ideal 40-60)`, ok: titleLen >= 40 && titleLen <= 60, warn: titleLen > 0 && (titleLen < 40 || titleLen > 60) },
    { label: `Meta desc. ${excerptLen} car. (ideal 120-155)`, ok: excerptLen >= 120 && excerptLen <= 155, warn: excerptLen > 0 && (excerptLen < 120 || excerptLen > 155) },
    { label: 'Imagen de portada con alt', ok: !!form.coverImage && !!form.coverImageAlt },
    { label: `${words} palabras (mín. 600)`, ok: words >= 600 },
    { label: 'Palabra clave definida', ok: !!kw },
    { label: 'Keyword en el título', ok: !!kw && form.titleEs.toLowerCase().includes(kw) },
    { label: 'Keyword en el extracto', ok: !!kw && form.excerptEs.toLowerCase().includes(kw) },
  ];
}

function tagsFromJson(raw: string): string[] {
  try { return JSON.parse(raw || '[]'); } catch { return []; }
}

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(empty);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [contentLang, setContentLang] = useState<'es' | 'fr'>('es');
  const [translatingContent, setTranslatingContent] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!id);
  const [isDirty, setIsDirty] = useState(false);
  const initialLoadedRef = useRef(!id);
  const [categories, setCategories] = useState<Category[]>([]);

  const isEdit = !!id;

  useEffect(() => {
    api.get('/admin/blog-categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

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
          metaTitleEs: p.metaTitleEs || '', metaTitleFr: p.metaTitleFr || '',
          excerptEs: p.excerptEs, excerptFr: p.excerptFr,
          contentEs: p.contentEs, contentFr: p.contentFr,
          coverImage: p.coverImage || '',
          coverImageAlt: p.coverImageAlt || '',
          category: p.category || '',
          tags: tagsFromJson(p.tags),
          focusKeyword: p.focusKeyword || '',
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
        const r = await api.post('/admin/blog', payload);
        if (!published) {
          // Nuevo post guardado como borrador: actualizar URL sin salir
          navigate(`/admin/blog/${r.data.id}`, { replace: true });
        }
      }
      setIsDirty(false);
      if (published) {
        navigate('/admin/blog');
      } else {
        setSavedOk(true);
        setTimeout(() => setSavedOk(false), 3000);
      }
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

  const handlePreview = async () => {
    if (!form.titleEs && !form.slug) {
      alert('Escribe al menos el título antes de previsualizar.');
      return;
    }
    const PREVIEW_SECRET = 'preview-luz-benin';
    // If clean and already saved, open immediately
    if (id && !isDirty) {
      window.open(`${FRONTEND_URL}/es/blog/${form.slug}/?preview=${PREVIEW_SECRET}`, '_blank', 'noopener');
      return;
    }
    // Otherwise save as draft first, then open preview
    setSaving('draft');
    try {
      const payload = { ...form, tags: form.tags, published: false, scheduledAt: null };
      let slug = form.slug;
      let savedId = id;
      if (id) {
        await api.put(`/admin/blog/${id}`, payload);
      } else {
        const r = await api.post('/admin/blog', payload);
        slug = r.data.slug;
        savedId = r.data.id;
      }
      setIsDirty(false);
      window.open(`${FRONTEND_URL}/es/blog/${slug}/?preview=${PREVIEW_SECRET}`, '_blank', 'noopener');
      if (savedId !== id) {
        // Switch URL to edit mode without adding a history entry
        navigate(`/admin/blog/${savedId}`, { replace: true });
      }
    } catch {
      alert('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(null);
    }
  };

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
          {savedOk && (
            <span className="text-sm text-green-600 font-medium">✓ Borrador guardado</span>
          )}
          {(form.titleEs || form.slug) && (
            <button
              type="button"
              onClick={handlePreview}
              disabled={!!saving}
              className="text-xs text-gray-400 hover:text-primary-800 disabled:opacity-50 transition-colors px-2 py-1"
            >
              {saving === 'draft' ? 'Guardando…' : '👁 Vista previa'}
            </button>
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
            <BilingualField label="Extracto (meta description)" nameEs="excerptEs" nameFr="excerptFr" valueEs={form.excerptEs} valueFr={form.excerptFr} onChange={set} multiline rows={2} />
            <div className="flex items-center justify-between -mt-2">
              {form.contentEs ? (
                <button
                  type="button"
                  onClick={() => {
                    const excerpt = stripMarkdown(form.contentEs);
                    set('excerptEs', excerpt.length <= 155 ? excerpt : excerpt.slice(0, 152) + '…');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  ↩ Auto-extracto del contenido
                </button>
              ) : <span />}
              <span className={`text-xs font-mono ${charCountColor(form.excerptEs.length, 120, 155)}`}>
                {form.excerptEs.length}/155
              </span>
            </div>
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
            <RichTextEditor
              key={contentLang}
              value={contentLang === 'es' ? form.contentEs : form.contentFr}
              onChange={val => set(contentLang === 'es' ? 'contentEs' : 'contentFr', val)}
              placeholder={contentLang === 'es' ? 'Escribe el contenido en español…' : 'Écrivez le contenu en français…'}
              minHeight={480}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">Editando: {contentLang === 'es' ? '🇪🇸 Español' : '🇫🇷 Français'}</p>
              {(() => {
                const n = countWords(contentLang === 'es' ? form.contentEs : form.contentFr);
                return (
                  <p className={`text-xs font-medium ${wordCountColor(n)}`}>
                    {n} palabras {wordCountLabel(n)}
                  </p>
                );
              })()}
            </div>
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
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Texto alternativo (alt)</label>
                  <input
                    type="text"
                    value={form.coverImageAlt}
                    onChange={e => set('coverImageAlt', e.target.value)}
                    placeholder="Describe la imagen para accesibilidad y SEO"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-800"
                  />
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
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 bg-white"
            >
              <option value="">Sin categoría</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <a href="/admin/blog/categories" className="text-xs text-gray-400 hover:text-primary-800 mt-1 inline-block">+ Gestionar categorías</a>
          </div>

          {/* Palabra clave objetivo */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Palabra clave objetivo</h3>
            <input
              type="text"
              value={form.focusKeyword}
              onChange={e => set('focusKeyword', e.target.value)}
              placeholder="Ej: orfanatos en Benin"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
            <p className="text-xs text-gray-400 mt-1">Término principal por el que quieres posicionar este post.</p>
          </div>

          {/* Meta título SEO */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Meta título SEO</h3>
            <p className="text-xs text-gray-400 -mt-1">Si lo dejas vacío se usa el título del post.</p>
            {(['es', 'fr'] as const).map(lang => {
              const field = lang === 'es' ? 'metaTitleEs' : 'metaTitleFr';
              const val = form[field];
              const len = val.length;
              return (
                <div key={lang}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600">{lang === 'es' ? '🇪🇸 ES' : '🇫🇷 FR'}</label>
                    <span className={`text-xs font-mono ${charCountColor(len, 40, 60)}`}>{len}/60</span>
                  </div>
                  <input
                    type="text"
                    value={val}
                    onChange={e => set(field, e.target.value)}
                    placeholder={lang === 'es' ? form.titleEs : form.titleFr}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                  />
                </div>
              );
            })}
          </div>

          {/* Panel SEO */}
          {(() => {
            const words = countWords(form.contentEs);
            const mins = readingTime(form.contentEs);
            const checks = seoChecks(form, words);
            const score = checks.filter(c => c.ok).length;
            const total = checks.length;
            const scoreColor = score === total ? 'text-green-600' : score >= total - 2 ? 'text-amber-500' : 'text-red-500';
            return (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">Análisis SEO</h3>
                  <span className={`text-sm font-bold ${scoreColor}`}>{score}/{total}</span>
                </div>
                <ul className="space-y-1.5">
                  {checks.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className={c.ok ? 'text-green-500' : c.warn ? 'text-amber-500' : 'text-red-400'}>
                        {c.ok ? '✓' : c.warn ? '⚠' : '✗'}
                      </span>
                      <span className={c.ok ? 'text-gray-600' : 'text-gray-500'}>{c.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                  Tiempo de lectura estimado: <strong className="text-gray-600">{mins} min</strong>
                </p>
              </div>
            );
          })()}

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
