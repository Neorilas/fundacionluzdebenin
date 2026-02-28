import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Stats {
  projects: number;
  posts: number;
  unreadMessages: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ projects: 0, posts: 0, unreadMessages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/projects'),
      api.get('/admin/blog'),
      api.get('/admin/contacts'),
    ]).then(([projects, blog, contacts]) => {
      setStats({
        projects: projects.data.length,
        posts: blog.data.length,
        unreadMessages: contacts.data.filter((c: { read: boolean }) => !c.read).length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Proyectos', value: stats.projects, icon: '🏗️', to: '/admin/projects', color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Posts del Blog', value: stats.posts, icon: '✍️', to: '/admin/blog', color: 'bg-blue-50 border-blue-200' },
    { label: 'Mensajes sin leer', value: stats.unreadMessages, icon: '📬', to: '/admin/contacts', color: stats.unreadMessages > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200' },
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {cards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className={`${card.color} border rounded-xl p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <span className="text-4xl">{card.icon}</span>
                </div>
              </Link>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-primary-800 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <p className="text-sm font-medium text-gray-700">{action.label}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
