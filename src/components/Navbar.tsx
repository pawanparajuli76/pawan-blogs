import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Linkedin, Mail, Search } from 'lucide-react';
import profileHeaderPhoto from '@/assets/profile-header.jpg';
import { useProfile } from '@/hooks/useProfile';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Research', path: '/services' },
  { name: 'Blogs', path: '/blog' },
  { name: 'Resources', path: '/resources' },
  { name: 'Contact', path: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { profile } = useProfile();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const fullName = profile?.full_name || 'Pawan Parajuli';
  const title = profile?.professional_title || 'Chartered Accountant';
  const email = profile?.email || 'pawanparajuli33@gmail.com';
  const linkedinUrl = profile?.linkedin_url || 'https://www.linkedin.com';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-navy-950 border-b border-navy-800/80 ${
        scrolled ? 'bg-navy-950/95 backdrop-blur-md shadow-soft-lg' : 'bg-navy-950'
      }`}
    >
      <nav className="container-wide flex items-center justify-between h-20 md:h-24">
        {/* Top Left: Circular Profile Photograph (Maroon Sweater) + Name & Title */}
        <Link to="/" className="flex items-center gap-3.5 md:gap-4 group py-1">
          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gold-400/60 shadow-md flex-shrink-0 group-hover:border-gold-400 transition-colors">
            <img
              src={profileHeaderPhoto}
              alt={fullName}
              className="w-full h-full object-cover object-[center_20%]"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-serif text-lg md:text-xl font-bold text-white tracking-tight leading-none group-hover:text-gold-300 transition-colors">
              {fullName}
            </span>
            <span className="text-[11px] md:text-xs font-medium text-gold-400 tracking-wider mt-1.5 uppercase">
              {title}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-gold-400 bg-navy-900 font-semibold shadow-sm border border-gold-400/30'
                      : 'text-navy-200 hover:text-white hover:bg-navy-900/60'
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Top Right: Minimal Professional Icons (LinkedIn, Email, Search) */}
        <div className="flex items-center gap-2">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-navy-300 hover:text-gold-400 hover:bg-navy-900 transition-colors"
          >
            <Linkedin size={18} />
          </a>

          <a
            href={`mailto:${email}`}
            aria-label="Email Contact"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-navy-300 hover:text-gold-400 hover:bg-navy-900 transition-colors"
          >
            <Mail size={18} />
          </a>

          <Link
            to="/blog"
            aria-label="Search Research and Blogs"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-navy-300 hover:text-gold-400 hover:bg-navy-900 transition-colors"
          >
            <Search size={18} />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-navy-200 hover:text-white hover:bg-navy-900 ml-1"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-navy-950 border-t border-navy-800 animate-slide-down">
          <ul className="container-wide py-4 space-y-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-gold-400 bg-navy-900 font-semibold border-l-2 border-gold-400'
                        : 'text-navy-200 hover:text-white hover:bg-navy-900'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
