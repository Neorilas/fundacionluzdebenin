import { useEffect, useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import ConfirmDialog from '../../components/ConfirmDialog';

interface Category { id: string; name: string; slug: string; order: number; }

export default function BlogCategories() {
  const navigate = useNavigate();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);

  const load = () => {
    api.get('/admin/blog-categories').then(r => setCats(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await api.post('/admin/blog-categories', { name: newName.trim(), order: cats.length });
      setNewName('');
      load();
    } finally { setAdding(false); }
  };

  const save = async (id: string) => {
    if (!editName.trim()) return;
    await api.put(`/admin/blog-categories/${id}`, { name: editName.trim() });
    setEditId(null);
    load();
  };

  const del = async () => {
    if (!confirm) return;
    await api.delete(`/admin/blog-categories/${confirm.id}`);
    setConfirm(null);
    load();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') add();
  };
  const onEditKey = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') save(id);
    if (e.key === 'Escape') setEditId(null);
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/blog')} className="text-gray-400 hover:text-gray-600">←</button>
        <h2 className="text-2xl font-bold text-gray-900">Categorías del blog</h2>
      </div>

      {/* Add new */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Nueva categoría</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ej: Proyectos, Noticias, Testimonios…"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
          <button
            type="button"
            onClick={add}
            disabled={adding || !newName.trim()}
            className="bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 disabled:opacity-50 transition-colors"
          >
            {adding ? '…' : 'Añadir'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-800" />
          </div>
        ) : cats.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No hay categorías aún</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {cats.map(cat => (
              <li key={cat.id} className="flex items-center gap-3 px-4 py-3">
                {editId === cat.id ? (
                  <>
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => onEditKey(e, cat.id)}
                      className="flex-1 border border-primary-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                    />
                    <button onClick={() => save(cat.id)} className="text-xs text-primary-800 font-medium hover:underline">Guardar</button>
                    <button onClick={() => setEditId(null)} className="text-xs text-gray-400 hover:underline">Cancelar</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-gray-900">{cat.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
                    <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="text-xs text-primary-800 hover:underline">Editar</button>
                    <button onClick={() => setConfirm({ id: cat.id, name: cat.name })} className="text-xs text-red-500 hover:underline">Eliminar</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="¿Eliminar categoría?"
        message={`Se eliminará "${confirm?.name}". Los posts con esta categoría no se ven afectados.`}
        onConfirm={del}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
