import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaLinkedinIn, FaEnvelope } from 'react-icons/fa6';

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Research', path: '/services' },
  { name: 'Resources', path: '/resources' },
  { name: 'Contact', path: '/contact' },
];

const blogCategories = [
  { name: 'Taxation', path: '/blog/category/taxation' },
  { name: 'Accounting & NFRS', path: '/blog/category/accounting' },
  { name: 'Audit & Assurance', path: '/blog/category/audit' },
  { name: 'Corporate Compliance', path: '/blog/category/compliance' },
  { name: 'Business & Economy', path: '/blog/category/business' },
];

export function Footer() {
  const year = new Date().getFullYear();
  const [quickLinksOpen, setQuickLinksOpen] = useState(false);
  const [blogsOpen, setBlogsOpen] = useState(false);

  return (
    <footer className="relative w-full overflow-hidden text-white/85">
      {/* Background Image with subtle neutral dark overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/Footer.png"
          alt="Footer Background"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <div className="container-wide relative z-10 pt-7 pb-4">
        {/* 3-Column Balanced Grid (25% Quick Links | 25% Blogs | 50% Contact) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Column 1: Quick Links (25%) */}
          <div className="md:col-span-3 text-left">
            <button
              type="button"
              onClick={() => setQuickLinksOpen((prev) => !prev)}
              className="flex items-center gap-2 text-gold-400 hover:text-gold-300 font-semibold text-xs uppercase tracking-wider transition-colors py-1 cursor-pointer select-none"
              aria-expanded={quickLinksOpen}
            >
              <span>Quick Links</span>
              <span className="text-sm font-bold leading-none w-3 text-center">
                {quickLinksOpen ? '−' : '+'}
              </span>
            </button>

            {quickLinksOpen && (
              <ul className="mt-2 space-y-1.5 text-xs sm:text-[13px] animate-fade-in pl-1">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-white/80 hover:text-gold-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Column 2: Blogs (25%) */}
          <div className="md:col-span-3 text-left">
            <button
              type="button"
              onClick={() => setBlogsOpen((prev) => !prev)}
              className="flex items-center gap-2 text-gold-400 hover:text-gold-300 font-semibold text-xs uppercase tracking-wider transition-colors py-1 cursor-pointer select-none"
              aria-expanded={blogsOpen}
            >
              <span>Blogs</span>
              <span className="text-sm font-bold leading-none w-3 text-center">
                {blogsOpen ? '−' : '+'}
              </span>
            </button>

            {blogsOpen && (
              <ul className="mt-2 space-y-1.5 text-xs sm:text-[13px] animate-fade-in pl-1">
                {blogCategories.map((cat) => (
                  <li key={cat.path}>
                    <Link
                      to={cat.path}
                      className="text-white/80 hover:text-gold-400 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Column 3: Contact (50% - Uses center and right space naturally) */}
          <div className="md:col-span-6 text-left">
            <h3 className="text-gold-400 font-semibold text-xs uppercase tracking-wider mb-2.5 py-1">
              Contact
            </h3>

            {/* Email | Phone | Nepal in ONE horizontal row on desktop */}
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 sm:gap-x-4 text-xs sm:text-[13px] text-white/85 mb-3">
              <a
                href="mailto:pawanparajuli33@gmail.com"
                className="inline-flex items-center gap-1.5 hover:text-gold-400 transition-colors"
              >
                <Mail size={13} className="text-gold-400 flex-shrink-0" />
                <span>pawanparajuli33@gmail.com</span>
              </a>

              <span className="text-white/30 hidden sm:inline">|</span>

              <a
                href="tel:+9779846796501"
                className="inline-flex items-center gap-1.5 hover:text-gold-400 transition-colors"
              >
                <Phone size={13} className="text-gold-400 flex-shrink-0" />
                <span>+977 9846796501</span>
              </a>

              <span className="text-white/30 hidden sm:inline">|</span>

              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} className="text-gold-400 flex-shrink-0" />
                <span>Nepal</span>
              </span>
            </div>

            {/* Social Icons Left-Aligned within Contact Column with official recognizable brand icons */}
            <div className="flex items-center gap-2.5">
              {/* WhatsApp */}
              <a
                href="https://wa.me/9779846796501"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-gold-500/20 text-white/85 hover:text-gold-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <FaWhatsapp size={15} />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/pawann_07/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-gold-500/20 text-white/85 hover:text-gold-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <FaInstagram size={15} />
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/pawan-parajuli-569728377"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-gold-500/20 text-white/85 hover:text-gold-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <FaLinkedinIn size={14} />
              </a>

              {/* Email */}
              <a
                href="mailto:pawanparajuli33@gmail.com"
                aria-label="Email"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-gold-500/20 text-white/85 hover:text-gold-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <FaEnvelope size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-5 pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-white/70">
          <p>© {year} Pawan Parajuli</p>

          <div className="flex items-center gap-2">
            <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">
              Privacy
            </Link>
            <span className="text-white/40">·</span>
            <Link to="/disclaimer" className="hover:text-gold-400 transition-colors">
              Disclaimer
            </Link>
            <span className="text-white/40">·</span>
            <Link to="/terms-of-use" className="hover:text-gold-400 transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
