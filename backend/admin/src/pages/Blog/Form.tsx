import { useEffect, useState, useRef, FormEvent, KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import api from '../../api';
import BilingualField from '../../components/BilingualField';

async function translateText(text: string): Promise<string> {
  if (!text.trim()) return '';
  const r = await api.post('/admin/translate', { text, from: 'es', to: 'fr' });
  return r.data.translatedText || text;
}

type PostStatus = 'draft' | 'published' | 'scheduled';

interface FormData {
  slug: string;
  titleEs: string; titleFr: string;
  excerptEs: string; excerptFr: string;
  contentEs: string; contentFr: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: PostStatus;
  scheduledAt: string; // ISO string for datetime-local input
}

const empty: FormData = {
  slug: '', titleEs: '', titleFr: '', excerptEs: '', excerptFr: '',
  contentEs: '', contentFr: '', coverImage: '', category: '',
  tags: [], status: 'draft', scheduledAt: '',
};

function tagsFromJson(raw: string): string[] {
  try { return JSON.parse(raw || '[]'); } catch { return []; }
}

function statusFromPost(p: { published: boolean; scheduledAt: string | null }): PostStatus {
  if (p.published) return 'published';
  if (p.scheduledAt) return 'scheduled';
  return 'draft';
}

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(empty);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [contentLang, setContentLang] = useState<'es' | 'fr'>('es');
  const [translatingContent, setTranslatingContent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/admin/blog/${id}`).then(r => {
        const p = r.data;
        // Format scheduledAt for datetime-local input (strip seconds)
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
          status: statusFromPost(p),
          scheduledAt: scheduled,
        });
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (name: string, value: string | boolean | string[]) =>
    setForm(f => ({ ...f, [name]: value }));

  // Image upload
  const handleImageUpload = async (file: File) => {
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
      if (data.url) set('coverImage', data.url);
      else alert('Error al subir la imagen');
    } catch { alert('Error al subir la imagen'); }
    finally { setUploading(false); }
  };

  // Tags
  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => set('tags', form.tags.filter(t => t !== tag));

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && form.tags.length) {
      removeTag(form.tags[form.tags.length - 1]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.status === 'scheduled' && !form.scheduledAt) {
      alert('Selecciona una fecha y hora de publicación.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        titleEs: form.titleEs, titleFr: form.titleFr,
        excerptEs: form.excerptEs, excerptFr: form.excerptFr,
        contentEs: form.contentEs, contentFr: form.contentFr,
        coverImage: form.coverImage,
        category: form.category,
        tags: form.tags,
        published: form.status === 'published',
        scheduledAt: form.status === 'scheduled' ? form.scheduledAt : null,
      };
      if (isEdit) {
        await api.put(`/admin/blog/${id}`, payload);
      } else {
        await api.post('/admin/blog', payload);
      }
      navigate('/admin/blog');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/blog')} className="text-gray-400 hover:text-gray-600">←</button>
        <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar post' : 'Nuevo post'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              required
              placeholder="mi-articulo-de-blog"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>

          <BilingualField label="Título" nameEs="titleEs" nameFr="titleFr" valueEs={form.titleEs} valueFr={form.titleFr} onChange={set} required />
          <BilingualField label="Extracto" nameEs="excerptEs" nameFr="excerptFr" valueEs={form.excerptEs} valueFr={form.excerptFr} onChange={set} multiline rows={2} />

          {/* Category + Tags */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                placeholder="Educación, Salud, Noticias…"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas <span className="text-gray-400 font-normal">(Enter o coma para añadir)</span></label>
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
                  placeholder={form.tags.length === 0 ? 'benin, educacion…' : ''}
                  className="flex-1 min-w-[120px] border-none outline-none text-sm py-0.5 bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover image */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Imagen de portada</label>
          <div className="flex items-start gap-4">
            {form.coverImage && (
              <img
                src={form.coverImage}
                alt="Portada"
                className="h-24 w-36 object-cover rounded-lg border border-gray-200 shrink-0"
              />
            )}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Subiendo…' : form.coverImage ? 'Cambiar imagen' : 'Subir imagen'}
              </button>
              {form.coverImage && (
                <button
                  type="button"
                  onClick={() => set('coverImage', '')}
                  className="ml-2 text-sm text-red-500 hover:text-red-700"
                >
                  Quitar
                </button>
              )}
              <p className="text-xs text-gray-400">JPG, PNG, WebP. Recomendado: 1200×630px</p>
            </div>
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
          <div data-color-mode="light">
            <MDEditor
              value={contentLang === 'es' ? form.contentEs : form.contentFr}
              onChange={(val) => set(contentLang === 'es' ? 'contentEs' : 'contentFr', val || '')}
              height={480}
              preview="edit"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Editando en: {contentLang === 'es' ? '🇪🇸 Español' : '🇫🇷 Français'}</p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Estado de publicación</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {([
              { value: 'draft', label: '📝 Borrador', desc: 'No visible en la web' },
              { value: 'published', label: '✅ Publicado', desc: 'Visible ahora mismo' },
              { value: 'scheduled', label: '🕐 Programado', desc: 'Se publica automáticamente' },
            ] as { value: PostStatus; label: string; desc: string }[]).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('status', opt.value)}
                className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                  form.status === opt.value
                    ? 'border-primary-800 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>

          {form.status === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de publicación</label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={e => set('scheduledAt', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required={form.status === 'scheduled'}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
              />
              <p className="text-xs text-gray-400 mt-1">El servidor comprueba cada minuto y publica automáticamente.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/blog')} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button type="submit" disabled={saving || uploading} className="bg-primary-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : form.status === 'draft' ? 'Guardar borrador' : form.status === 'scheduled' ? 'Programar publicación' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}
