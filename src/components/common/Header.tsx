import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { WebsiteSettings } from '../../types';

interface HeaderProps {
  settings?: WebsiteSettings | null;
}

export const Header: React.FC<HeaderProps> = ({ settings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, actualTheme, setTheme } = useTheme();
  const location = useLocation();

  const businessName = settings?.business_name || "Get Dress'd by Rissée";

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Rental Collection', path: '/dresses' },
    { name: 'Rental & Delivery Guide', path: '/payment' },
    { name: 'About Atelier', path: '/about' },
    { name: 'Fittings & Inquiries', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand Name */}
          <Link to="/" className="flex flex-col text-left group">
            <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
              {businessName}
            </span>
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-stone-700 dark:text-stone-300 font-sans font-medium">
              Curated Vietnamese Dress Rentals
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm tracking-wider uppercase font-medium transition-all duration-200 relative py-1 ${
                  isActive(link.path)
                    ? 'text-stone-950 dark:text-stone-50 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-stone-900 dark:bg-stone-100 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions: Theme Toggle & Reserve CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
              title={`Current theme: ${theme}. Click to switch.`}
              aria-label="Toggle theme"
            >
              {actualTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/dresses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-medium uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white shadow-sm hover:shadow transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#dfc8b4]" />
              <span>Browse Catalog</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-stone-600 dark:text-stone-400"
              aria-label="Toggle theme"
            >
              {actualTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-800 dark:text-stone-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 dark:border-stone-800 bg-[#faf9f6] dark:bg-stone-950 px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium tracking-wide py-2 border-b border-stone-100 dark:border-stone-900 ${
                  isActive(link.path)
                    ? 'text-stone-950 dark:text-stone-50 font-bold'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-2">
            <Link
              to="/dresses"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-medium uppercase tracking-widest shadow"
            >
              <Sparkles className="w-4 h-4 text-[#dfc8b4]" />
              <span>Explore The Collection</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
