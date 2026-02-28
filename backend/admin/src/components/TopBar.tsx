import { useAuth } from '../App';

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          👤 {user?.name}
        </span>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
