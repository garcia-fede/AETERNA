import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Building2,
  Pill,
  HeartPulse,
  Bell,
  User,
  UserCog,
} from 'lucide-react';
import type { Rol } from '../types';

interface Props {
  children: React.ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles?: Rol[];
  dividerAbove?: boolean;
}

const navItems: NavItem[] = [
  // Items operativos (ADMIN + PERSONAL)
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'PERSONAL'] },
  { to: '/residentes', label: 'Residentes', icon: Users, roles: ['ADMIN', 'PERSONAL'] },
  { to: '/medicacion', label: 'Tablero del turno', icon: Pill, roles: ['ADMIN', 'PERSONAL'] },
  { to: '/cuidados', label: 'Cuidados del turno', icon: HeartPulse, roles: ['ADMIN', 'PERSONAL'] },
  { to: '/novedades', label: 'Novedades', icon: Bell, roles: ['ADMIN', 'PERSONAL'] },
  // Administración (solo ADMIN)
  { to: '/admin/usuarios', label: 'Usuarios', icon: UserCog, roles: ['ADMIN'], dividerAbove: true },
  // Portal familiar
  { to: '/familiar', label: 'Mi familiar', icon: User, roles: ['FAMILIAR'] },
  { to: '/familiar/medicacion', label: 'Medicación', icon: Pill, roles: ['FAMILIAR'] },
  { to: '/familiar/bienestar', label: 'Bienestar', icon: HeartPulse, roles: ['FAMILIAR'] },
  { to: '/familiar/novedades', label: 'Novedades', icon: Bell, roles: ['FAMILIAR'] },
];

export default function Layout({ children }: Props) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredItems = navItems.filter(
    ({ roles }) => !roles || (user?.rol && roles.includes(user.rol))
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">AETERNA</p>
            <p className="text-xs text-gray-500">Gestión Geriátrica</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredItems.map(({ to, label, icon: Icon, dividerAbove }) => (
            <div key={to}>
              {dividerAbove && (
                <div className="my-2 border-t border-gray-100" />
              )}
              <NavLink
                to={to}
                end={to === '/familiar'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            </div>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-700">
                {user?.nombre?.[0]}{user?.apellido?.[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
