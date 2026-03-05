import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface ScheduledPost { id: string; titleEs: string; scheduledAt: string; }
interface RecentContact  { id: string; name: string; subject: string; read: boolean; createdAt: string; }

interface DashboardData {
  stats: { projectsCount: number; postsCount: number; unreadCount: number };
  scheduledPosts: ScheduledPost[];
  recentContacts: RecentContact[];
  monthlyDonations: { total: number; count: number };
}

const empty: DashboardData = {
  stats: { projectsCount: 0, postsCount: 0, unreadCount: 0 },
  scheduledPosts: [],
  recentContacts: [],
  monthlyDonations: { total: 0, count: 0 },
};

function fmtEuros(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateTime(s: string) {
  return new Date(s).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(empty);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const monthName = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const statCards = [
    { label: 'Proyectos', value: data.stats.projectsCount, icon: '🏗️', to: '/admin/projects', color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Posts del Blog', value: data.stats.postsCount, icon: '✍️', to: '/admin/blog', color: 'bg-blue-50 border-blue-200' },
    { label: 'Mensajes sin leer', value: data.stats.unreadCount, icon: '📬', to: '/admin/contacts', color: data.stats.unreadCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200' },
    { label: `Donaciones (${monthName})`, value: fmtEuros(data.monthlyDonations.total), icon: '💚', to: '/admin/donations', color: 'bg-green-50 border-green-200', sub: `${data.monthlyDonations.count} donaciones` },
  ];

  const quickActions = [
    { label: 'Nuevo proyecto', to: '/admin/projects/new', icon: '➕' },
    { label: 'Nuevo post', to: '/admin/blog/new', icon: '✏️' },
    { label: 'Ver mensajes', to: '/admin/contacts', icon: '📬' },
    { label: 'Configuración', to: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <Link key={card.label} to={card.to} className={`${card.color} border rounded-xl p-6 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    {card.sub && <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>}
                  </div>
                  <span className="text-3xl">{card.icon}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Lower section: contacts + scheduled */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Recent contacts */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Últimos mensajes</h3>
                <Link to="/admin/contacts" className="text-xs text-primary-800 hover:underline">Ver todos →</Link>
              </div>
              {data.recentContacts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No hay mensajes</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {data.recentContacts.map(c => (
                    <li key={c.id}>
                      <Link to="/admin/contacts" className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                        <span className="mt-0.5 text-base">{c.read ? '📭' : '📬'}</span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm truncate ${c.read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>{c.name}</p>
                          <p className="text-xs text-gray-400 truncate">{c.subject}</p>
                        </div>
                        <span className="text-xs text-gray-300 shrink-0">{fmtDate(c.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Scheduled posts + quick actions */}
            <div className="space-y-6">
              {data.scheduledPosts.length > 0 && (
                <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-blue-50 bg-blue-50">
                    <h3 className="font-semibold text-blue-800 text-sm">📅 Publicaciones programadas</h3>
                    <Link to="/admin/blog" className="text-xs text-blue-700 hover:underline">Ver blog →</Link>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {data.scheduledPosts.map(p => (
                      <li key={p.id}>
                        <Link to={`/admin/blog/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                          <p className="text-sm text-gray-800 truncate flex-1">{p.titleEs}</p>
                          <span className="text-xs text-blue-600 shrink-0 ml-3">{p.scheduledAt ? fmtDateTime(p.scheduledAt) : '—'}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Acciones rápidas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <Link key={action.label} to={action.to}
                      className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-primary-800 hover:shadow-md transition-all">
                      <div className="text-2xl mb-1">{action.icon}</div>
                      <p className="text-xs font-medium text-gray-700">{action.label}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
