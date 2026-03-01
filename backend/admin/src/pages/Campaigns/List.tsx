import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

interface Campaign {
  id: string;
  slug: string;
  emoji: string;
  titleEs: string;
  amountCents: number;
  colorScheme: string;
  active: boolean;
  sortOrder: number;
}

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/admin/campaigns').then(r => setCampaigns(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta campaña?')) return;
    await api.delete(`/admin/campaigns/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Campañas</h2>
        <Link
          to="/admin/campaigns/new"
          className="bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 transition-colors"
        >
          + Nueva campaña
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
                <th className="px-4 py-3 text-left">Campaña</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Precio</th>
                <th className="px-4 py-3 text-left">Color</th>
                <th className="px-4 py-3 text-left">Activa</th>
                <th className="px-4 py-3 text-left">Orden</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <span className="mr-2">{c.emoji}</span>{c.titleEs}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-gray-700">{(c.amountCents / 100).toFixed(0)}€/mes</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.colorScheme === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {c.colorScheme}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.active ? '✅' : '⏸️'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/campaigns/${c.id}`} className="text-primary-800 hover:underline text-xs">Editar</Link>
                      <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No hay campañas aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
