import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Tag,
  Mail,
  Sliders,
  History,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Plus,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, actualTheme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Poll or fetch unread inquiries badge
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    api.inquiries.list().then((inqs) => {
      if (!isMounted) return;
      setUnreadCount(
        inqs.filter((i) => ['INQUIRY_RECEIVED', 'REVIEWING', 'MORE_INFO_NEEDED'].includes(i.status)).length
      );
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Dresses & Catalog', path: '/admin/dresses', icon: Layers, exact: false },
    { name: 'Categories', path: '/admin/categories', icon: Tag, exact: false },
    { name: 'Inquiries', path: '/admin/inquiries', icon: Mail, exact: false, badge: unreadCount },
    { name: 'Website Settings', path: '/admin/settings', icon: Sliders, exact: false },
    { name: 'Activity History', path: '/admin/history', icon: History, exact: false },
  ];

  const isNavActive = (item: typeof navItems[0]) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex transition-colors duration-200">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 shrink-0">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-200/80 dark:border-stone-800">
          <Link to="/admin" className="flex flex-col">
            <span className="font-serif text-2xl font-medium tracking-tight text-stone-900 dark:text-stone-100">
              Get Dress'd
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-stone-500 dark:text-stone-400 font-sans font-semibold">
              by Rissée • Owner Portal
            </span>
          </Link>
        </div>

        {/* Quick Add Dress CTA */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800/80">
          <Link
            to="/admin/dresses/new"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Dress</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all ${
                  active
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Public Website & Session Info */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 space-y-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#dfc8b4]" />
              <span>View Live Website</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="text-xs">
              <span className="block font-medium text-stone-900 dark:text-stone-100">{user?.name || 'Rissée'}</span>
              <span className="text-[11px] text-stone-400">Atelier Owner</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Toggle Dark/Light Mode"
                aria-label="Toggle theme"
              >
                {actualTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                title="Sign out of Admin"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header for Mobile & Desktop */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Toggle admin navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Admin Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Toggle Dark/Light Mode"
              aria-label="Toggle theme"
            >
              {actualTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {unreadCount > 0 && (
              <Link
                to="/admin/inquiries"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{unreadCount} Unread Inquiry</span>
              </Link>
            )}

            <Link
              to="/admin/dresses/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-medium uppercase tracking-wider hover:bg-stone-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dress</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium uppercase tracking-wider ${
                    active
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1"
              >
                <span>View Public Boutique</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-rose-600 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};
