import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from './api';

// Auth context
interface AdminUser { id: string; email: string; name: string; }
interface AuthCtx {
  user: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/admin/auth/me')
        .then(r => setUser(r.data))
        .catch(() => { localStorage.removeItem('admin_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const r = await api.post('/admin/auth/login', { email, password });
    localStorage.setItem('admin_token', r.data.token);
    setToken(r.data.token);
    setUser(r.data.admin);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-800"></div></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// Layout
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectsList from './pages/Projects/List';
import ProjectsForm from './pages/Projects/Form';
import BlogList from './pages/Blog/List';
import BlogForm from './pages/Blog/Form';
import PagesEditor from './pages/Pages/Editor';
import ContactsInbox from './pages/Contacts/Inbox';
import DonationsSettings from './pages/Donations/Settings';
import ProductForm from './pages/Donations/ProductForm';
import GeneralSettings from './pages/Settings/General';

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/*" element={
            <RequireAuth>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="projects" element={<ProjectsList />} />
                  <Route path="projects/new" element={<ProjectsForm />} />
                  <Route path="projects/:id" element={<ProjectsForm />} />
                  <Route path="blog" element={<BlogList />} />
                  <Route path="blog/new" element={<BlogForm />} />
                  <Route path="blog/:id" element={<BlogForm />} />
                  <Route path="pages" element={<PagesEditor />} />
                  <Route path="contacts" element={<ContactsInbox />} />
                  <Route path="donations" element={<DonationsSettings />} />
                  <Route path="donations/products/new" element={<ProductForm />} />
                  <Route path="donations/products/:id" element={<ProductForm />} />
                  <Route path="settings" element={<GeneralSettings />} />
                  <Route path="*" element={<Navigate to="/admin/" replace />} />
                </Routes>
              </AdminLayout>
            </RequireAuth>
          } />
          <Route path="*" element={<Navigate to="/admin/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
