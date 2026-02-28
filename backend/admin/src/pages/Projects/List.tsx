import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

interface Project {
  id: string;
  slug: string;
  titleEs: string;
  status: string;
  featured: boolean;
  order: number;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  planned: 'bg-yellow-100 text-yellow-700',
};
const statusLabels: Record<string, string> = {
  active: 'Activo', completed: 'Completado', planned: 'Planificado',
};

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/admin/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este proyecto?')) return;
    await api.delete(`/admin/projects/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Proyectos</h2>
        <Link
          to="/admin/projects/new"
          className="bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 transition-colors"
        >
          + Nuevo proyecto
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Destacado</th>
                <th className="px-4 py-3 text-left">Orden</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.titleEs}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.status]}`}>
                      {statusLabels[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.featured ? '⭐' : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/projects/${p.id}`} className="text-primary-800 hover:underline text-xs">Editar</Link>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay proyectos aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
