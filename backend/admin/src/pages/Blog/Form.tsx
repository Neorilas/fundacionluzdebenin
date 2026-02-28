import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import BilingualField from '../../components/BilingualField';

interface FormData {
  slug: string;
  titleEs: string; titleFr: string;
  excerptEs: string; excerptFr: string;
  contentEs: string; contentFr: string;
  coverImage: string;
  published: boolean;
}

const empty: FormData = {
  slug: '', titleEs: '', titleFr: '', excerptEs: '', excerptFr: '',
  contentEs: '', contentFr: '', coverImage: '', published: false,
};

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(empty);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contentLang, setContentLang] = useState<'es' | 'fr'>('es');

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/admin/blog/${id}`).then(r => {
        const p = r.data;
        setForm({
          slug: p.slug, titleEs: p.titleEs, titleFr: p.titleFr,
          excerptEs: p.excerptEs, excerptFr: p.excerptFr,
          contentEs: p.contentEs, contentFr: p.contentFr,
          coverImage: p.coverImage, published: p.published,
        });
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (name: string, value: string | boolean) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/admin/blog/${id}`, form);
      } else {
        await api.post('/admin/blog', form);
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                required
                placeholder="mi-post-increible"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de portada (URL)</label>
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => set('coverImage', e.target.value)}
                placeholder="/uploads/mi-imagen.jpg"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
              />
            </div>
          </div>

          <BilingualField label="Título" nameEs="titleEs" nameFr="titleFr" valueEs={form.titleEs} valueFr={form.titleFr} onChange={set} required />
          <BilingualField label="Extracto" nameEs="excerptEs" nameFr="excerptFr" valueEs={form.excerptEs} valueFr={form.excerptFr} onChange={set} multiline rows={2} />

          <div className="flex items-center mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set('published', e.target.checked)}
                className="w-4 h-4 text-primary-800 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Publicado</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Contenido (Markdown)</label>
            <div className="flex border border-gray-300 rounded overflow-hidden text-xs">
              <button type="button" onClick={() => setContentLang('es')} className={`px-3 py-1 ${contentLang === 'es' ? 'bg-primary-800 text-white' : 'bg-white text-gray-600'}`}>ES</button>
              <button type="button" onClick={() => setContentLang('fr')} className={`px-3 py-1 ${contentLang === 'fr' ? 'bg-primary-800 text-white' : 'bg-white text-gray-600'}`}>FR</button>
            </div>
          </div>
          <textarea
            value={contentLang === 'es' ? form.contentEs : form.contentFr}
            onChange={(e) => set(contentLang === 'es' ? 'contentEs' : 'contentFr', e.target.value)}
            rows={20}
            placeholder="# Título&#10;&#10;Escribe el contenido en Markdown..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/blog')} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button type="submit" disabled={saving} className="bg-primary-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar post'}
          </button>
        </div>
      </form>
    </div>
  );
}
