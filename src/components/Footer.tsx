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

      <div className="container-wide relative z-10 pt-8 sm:pt-10 pb-5 sm:pb-6">
        {/* 3-Column Balanced Grid (25% Quick Links | 25% Blogs | 50% Contact) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Column 1: Quick Links (25%) */}
          <div className="md:col-span-3 text-left">
            <div className="flex md:hidden items-center justify-between">
              <button
                type="button"
                onClick={() => setQuickLinksOpen((prev) => !prev)}
                className="flex items-center justify-between w-full text-gold-400 hover:text-gold-300 font-semibold text-xs uppercase tracking-wider transition-colors py-1 cursor-pointer select-none"
                aria-expanded={quickLinksOpen}
              >
                <span>Quick Links</span>
                <span className="text-sm font-bold leading-none w-5 h-5 flex items-center justify-center bg-white/10 rounded">
                  {quickLinksOpen ? '−' : '+'}
                </span>
              </button>
            </div>

            {/* Desktop header */}
            <h3 className="hidden md:block text-gold-400 font-semibold text-xs uppercase tracking-wider mb-2.5 py-1">
              Quick Links
            </h3>

            {/* List: Always visible on desktop, toggleable on mobile */}
            <ul className={`${quickLinksOpen ? 'block' : 'hidden'} md:block mt-2 md:mt-0 space-y-2 text-xs sm:text-[13px] pl-1 md:pl-0`}>
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/80 hover:text-gold-400 transition-colors inline-block py-0.5"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Blogs (25%) */}
          <div className="md:col-span-3 text-left">
            <div className="flex md:hidden items-center justify-between">
              <button
                type="button"
                onClick={() => setBlogsOpen((prev) => !prev)}
                className="flex items-center justify-between w-full text-gold-400 hover:text-gold-300 font-semibold text-xs uppercase tracking-wider transition-colors py-1 cursor-pointer select-none"
                aria-expanded={blogsOpen}
              >
                <span>Blogs</span>
                <span className="text-sm font-bold leading-none w-5 h-5 flex items-center justify-center bg-white/10 rounded">
                  {blogsOpen ? '−' : '+'}
                </span>
              </button>
            </div>

            {/* Desktop header */}
            <h3 className="hidden md:block text-gold-400 font-semibold text-xs uppercase tracking-wider mb-2.5 py-1">
              Blogs
            </h3>

            {/* List: Always visible on desktop, toggleable on mobile */}
            <ul className={`${blogsOpen ? 'block' : 'hidden'} md:block mt-2 md:mt-0 space-y-2 text-xs sm:text-[13px] pl-1 md:pl-0`}>
              {blogCategories.map((cat) => (
                <li key={cat.path}>
                  <Link
                    to={cat.path}
                    className="text-white/80 hover:text-gold-400 transition-colors inline-block py-0.5"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact (50% - Uses center and right space naturally) */}
          <div className="md:col-span-6 text-left">
            <h3 className="text-gold-400 font-semibold text-xs uppercase tracking-wider mb-2.5 py-1">
              Contact
            </h3>

            {/* Contact Items - Cleanly stacked on mobile, flexible row on desktop */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-y-2 sm:gap-x-4 text-xs sm:text-[13px] text-white/85 mb-3.5">
              <a
                href="mailto:pawanparajuli33@gmail.com"
                className="inline-flex items-center gap-2 hover:text-gold-400 transition-colors py-0.5 break-all"
              >
                <Mail size={14} className="text-gold-400 flex-shrink-0" />
                <span>pawanparajuli33@gmail.com</span>
              </a>

              <span className="text-white/30 hidden sm:inline">|</span>

              <a
                href="tel:+9779846796501"
                className="inline-flex items-center gap-2 hover:text-gold-400 transition-colors py-0.5"
              >
                <Phone size={14} className="text-gold-400 flex-shrink-0" />
                <span>+977 9846796501</span>
              </a>

              <span className="text-white/30 hidden sm:inline">|</span>

              <span className="inline-flex items-center gap-2 py-0.5">
                <MapPin size={14} className="text-gold-400 flex-shrink-0" />
                <span>Nepal</span>
              </span>
            </div>

            {/* Social Icons with comfortable touch targets */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* WhatsApp */}
              <a
                href="https://wa.me/9779846796501"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-gold-500/20 text-white/85 hover:text-gold-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <FaWhatsapp size={15} />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/pawann_07/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-gold-500/20 text-white/85 hover:text-gold-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <FaInstagram size={15} />
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/pawan-parajuli-569728377"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-gold-500/20 text-white/85 hover:text-gold-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <FaLinkedinIn size={14} />
              </a>

              {/* Email */}
              <a
                href="mailto:pawanparajuli33@gmail.com"
                aria-label="Email"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-gold-500/20 text-white/85 hover:text-gold-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <FaEnvelope size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-6 sm:mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-white/70">
          <p>© {year} Pawan Parajuli. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">
              Privacy Policy
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
