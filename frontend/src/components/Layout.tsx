import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Settings, Search, User, Key, Play, History, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children?: ReactNode;
}

const navItems = [
  { path: '/search', label: 'Búsqueda', icon: Search },
  { path: '/personals', label: 'Datos Personales', icon: User },
  { path: '/questions', label: 'Preguntas', icon: Settings },
  { path: '/secrets', label: 'Credenciales', icon: Key },
  { path: '/settings', label: 'Configuración', icon: Settings },
  { path: '/run', label: 'Ejecutar Bot', icon: Play },
  { path: '/history', label: 'Historial', icon: History },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  // If children are provided directly, use them; otherwise use Outlet
  const content = children || <Outlet />;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>🤖 LinkedIn Bot</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                <ChevronRight size={16} className="nav-arrow" />
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="main-content">
        {content}
      </main>
    </div>
  );
}
