import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Research', path: '/services' },
  { name: 'Teaching', path: '/resources' },
  { name: 'Blogs', path: '/blog' },
  { name: 'Resources', path: '/resources' },
  { name: 'Contact', path: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-soft' : 'bg-white'
      }`}
    >
      <nav className="container-wide flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center text-gold-400 font-serif text-xl font-bold shadow-soft transition-transform group-hover:scale-105">
            PP
          </div>
          <div className="hidden sm:block">
            <div className="font-serif text-lg font-semibold text-navy-900 leading-none">
              Pawan Parajuli
            </div>
            <div className="text-xs text-navy-500 mt-0.5">Chartered Accountant</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-navy-900 bg-navy-50'
                      : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <Link to="/contact" className="hidden sm:inline-flex btn-primary btn-sm">
            Contact Me
          </Link>
          <button
            className="lg:hidden p-2 rounded-lg text-navy-700 hover:bg-navy-50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-navy-100 animate-slide-down">
          <ul className="container-wide py-4 space-y-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'text-navy-900 bg-navy-50' : 'text-navy-600 hover:bg-navy-50'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <Link to="/contact" className="btn-primary w-full">
                Contact Me
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
