import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Building2, Users, UserCircle, Contact, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">RealEstate CRM</h1>
          <p className="text-sm text-gray-400">{user?.name}</p>
          <span className="text-xs px-2 py-1 bg-blue-600 rounded mt-1 inline-block capitalize">{user?.role}</span>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink to="/" className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <Home size={18} /> Dashboard
          </NavLink>
          <NavLink to="/properties" className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <Building2 size={18} /> Properties
          </NavLink>
          <NavLink to="/leads" className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <Users size={18} /> Leads
          </NavLink>
          <NavLink to="/contacts" className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <Contact size={18} /> Contacts
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/users" className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
              <UserCircle size={18} /> Users
            </NavLink>
          )}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 w-full rounded hover:bg-gray-800 text-red-400">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
