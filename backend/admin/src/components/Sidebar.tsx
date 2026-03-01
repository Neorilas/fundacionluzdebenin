import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/projects', label: 'Proyectos', icon: '🏗️' },
  { to: '/admin/blog', label: 'Blog', icon: '✍️' },
  { to: '/admin/pages', label: 'Páginas', icon: '📄' },
  { to: '/admin/contacts', label: 'Mensajes', icon: '📬' },
  { to: '/admin/campaigns', label: 'Campañas', icon: '🐾' },
  { to: '/admin/donations', label: 'Donaciones', icon: '💚' },
  { to: '/admin/settings', label: 'Configuración', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-primary-800 text-white flex flex-col">
      <div className="p-5 border-b border-primary-700">
        <h1 className="text-lg font-bold">Fundación Luz de Benín</h1>
        <p className="text-primary-light text-xs mt-1">Panel de administración</p>
      </div>
      <nav className="flex-1 py-4">
        {links.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-primary-700 text-white font-semibold border-r-4 border-accent'
                  : 'text-primary-100 hover:bg-primary-700'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-primary-700 text-xs text-primary-200">
        v1.0.0
      </div>
    </aside>
  );
}
