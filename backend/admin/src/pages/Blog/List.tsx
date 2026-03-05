import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import ConfirmDialog from '../../components/ConfirmDialog';

interface Post {
  id: string;
  slug: string;
  titleEs: string;
  category: string;
  published: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
}

export default function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);

  const load = () => {
    api.get('/admin/blog').then(r => setPosts(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!confirm) return;
    await api.delete(`/admin/blog/${confirm.id}`);
    setConfirm(null);
    load();
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString('es-ES');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Blog</h2>
        <Link
          to="/admin/blog/new"
          className="bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 transition-colors"
        >
          + Nuevo post
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Publicado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.titleEs}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.slug}</td>
                  <td className="px-4 py-3">
                    {p.published
                      ? <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">✅ Publicado</span>
                      : p.scheduledAt
                      ? <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">🕐 {formatDate(p.scheduledAt)}</span>
                      : <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">📝 Borrador</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.publishedAt ? formatDate(p.publishedAt) : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/blog/${p.id}`} className="text-primary-800 hover:underline text-xs">Editar</Link>
                      <button onClick={() => setConfirm({ id: p.id, name: p.titleEs })} className="text-red-600 hover:underline text-xs">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay posts aún</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title="¿Eliminar post?"
        message={`Se eliminará permanentemente "${confirm?.name}". Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
