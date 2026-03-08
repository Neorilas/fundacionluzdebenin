import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/projects', label: 'Proyectos', icon: '🏗️' },
  { to: '/admin/blog', label: 'Blog', icon: '✍️' },
  { to: '/admin/pages', label: 'Páginas', icon: '📄' },
  { to: '/admin/contacts', label: 'Mensajes', icon: '📬' },
  { to: '/admin/campaigns', label: 'Campañas', icon: '🐾' },
  { to: '/admin/faqs', label: 'FAQs', icon: '❓' },
  { to: '/admin/subscribers', label: 'Suscriptores', icon: '📧' },
  { to: '/admin/donations', label: 'Donaciones', icon: '💚' },
  { to: '/admin/users', label: 'Administradores', icon: '👤' },
  { to: '/admin/settings', label: 'Configuración', icon: '⚙️' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Props) {
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white flex flex-col
      transition-transform duration-200
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:relative lg:inset-auto lg:translate-x-0 lg:z-auto lg:flex-shrink-0
    `}>
      <div className="p-5 border-b border-primary-700 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold leading-tight">Fundación Luz de Benín</h1>
          <p className="text-primary-light text-xs mt-1">Panel de administración</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-primary-200 hover:text-white p-1 ml-2 flex-shrink-0"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {links.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
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
