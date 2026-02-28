import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import BilingualField from '../../components/BilingualField';
import ImageUpload from '../../components/ImageUpload';

interface FormData {
  slug: string;
  titleEs: string;
  titleFr: string;
  descEs: string;
  descFr: string;
  status: string;
  featured: boolean;
  images: string[];
  order: number;
}

const empty: FormData = {
  slug: '', titleEs: '', titleFr: '', descEs: '', descFr: '',
  status: 'active', featured: false, images: [], order: 0,
};

export default function ProjectsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(empty);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/admin/projects`).then(r => {
        const p = r.data.find((x: { id: string }) => x.id === id);
        if (p) setForm({
          slug: p.slug, titleEs: p.titleEs, titleFr: p.titleFr,
          descEs: p.descEs, descFr: p.descFr, status: p.status,
          featured: p.featured, images: p.images, order: p.order,
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
        await api.put(`/admin/projects/${id}`, form);
      } else {
        await api.post('/admin/projects', form);
      }
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
        <button onClick={() => navigate('/admin/projects')} className="text-gray-400 hover:text-gray-600">←</button>
        <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
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
        <BilingualField label="Descripción" nameEs="descEs" nameFr="descFr" valueEs={form.descEs} valueFr={form.descFr} onChange={set} multiline rows={5} required />

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
          <ImageUpload value={form.images} onChange={(urls) => setForm(f => ({ ...f, images: urls }))} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/admin/projects')} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button type="submit" disabled={saving} className="bg-primary-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
}
