import { useEffect, useState } from 'react';
import api from '../../api';

interface Subscriber {
  id: string;
  email: string;
  nombre: string;
  lang: string;
  source: string;
  tags: string;
  active: boolean;
  createdAt: string;
}

const SOURCE_LABELS: Record<string, string> = {
  newsletter: 'Newsletter',
  'tu-santo': 'Tu Santo',
};

export default function SubscribersList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSource, setFilterSource] = useState('');
  const [filterActive, setFilterActive] = useState('true');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterSource) params.set('source', filterSource);
    if (filterActive) params.set('active', filterActive);
    api.get(`/admin/subscribers?${params.toString()}`)
      .then(r => setSubscribers(r.data.subscribers))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterSource, filterActive]);

  const handleUnsubscribe = async (id: string) => {
    if (!confirm('¿Desactivar este suscriptor?')) return;
    await api.put(`/admin/subscribers/${id}/unsubscribe`);
    load();
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filterSource) params.set('source', filterSource);
    if (filterActive) params.set('active', filterActive);
    const token = localStorage.getItem('admin_token');
    window.open(`/api/admin/subscribers/export.csv?${params.toString()}&token=${token}`, '_blank');
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString('es-ES');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Suscriptores</h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 text-white text-sm font-medium rounded-lg hover:bg-primary-800 transition-colors"
        >
          ⬇️ Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterSource}
          onChange={e => setFilterSource(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas las fuentes</option>
          <option value="newsletter">Newsletter</option>
          <option value="tu-santo">Tu Santo</option>
        </select>
        <select
          value={filterActive}
          onChange={e => setFilterActive(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Desactivados</option>
        </select>
        <span className="self-center text-sm text-gray-500">
          {subscribers.length} suscriptor{subscribers.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No hay suscriptores con los filtros seleccionados
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Fuente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Idioma</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map(sub => (
                  <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">{sub.email}</td>
                    <td className="px-4 py-3 text-gray-700">{sub.nombre || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.source === 'tu-santo'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {SOURCE_LABELS[sub.source] || sub.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 uppercase text-xs">{sub.lang}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sub.active ? 'Activo' : 'Baja'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(sub.createdAt)}</td>
                    <td className="px-4 py-3">
                      {sub.active && (
                        <button
                          onClick={() => handleUnsubscribe(sub.id)}
                          className="text-xs text-red-600 hover:text-red-800 hover:underline"
                        >
                          Dar de baja
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
