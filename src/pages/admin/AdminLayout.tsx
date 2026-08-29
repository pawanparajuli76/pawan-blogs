import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  Download,
  Mail,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const sidebarLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Blog Posts', path: '/admin/posts', icon: FileText },
  { name: 'Categories', path: '/admin/categories', icon: FolderTree },
  { name: 'Tags', path: '/admin/tags', icon: Tags },
  { name: 'Resources', path: '/admin/resources', icon: Download },
  { name: 'Messages', path: '/admin/messages', icon: Mail },
  { name: 'Profile', path: '/admin/profile', icon: User },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <div className="text-navy-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-navy-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-900 text-white fixed inset-y-0 left-0 z-30">
        <SidebarContent onSignOut={handleSignOut} />
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white lg:hidden animate-slide-down">
            <SidebarContent onSignOut={handleSignOut} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-navy-100 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <button
            className="lg:hidden p-2 rounded-lg text-navy-700 hover:bg-navy-50"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-navy-600">Admin Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-900 transition-colors"
            >
              View Site
              <ExternalLink size={14} />
            </Link>
            <div className="w-px h-6 bg-navy-200" />
            <span className="text-sm text-navy-600 hidden sm:block">
              {session.user.email}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  onSignOut,
  onNavigate,
}: {
  onSignOut: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-navy-700">
        <Link to="/admin" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center text-gold-400 font-serif text-xl font-bold">
            PP
          </div>
          <div>
            <div className="font-serif text-sm font-semibold text-white leading-none">
              Pawan Parajuli
            </div>
            <div className="text-xs text-navy-400 mt-0.5">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-navy-700 text-gold-400'
                    : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-navy-700">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
