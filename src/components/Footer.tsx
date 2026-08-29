import { Link } from 'react-router-dom';
import { Linkedin, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const footerNav = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Blog', path: '/blog' },
  { name: 'Resources', path: '/resources' },
  { name: 'Contact', path: '/contact' },
];

const legalLinks = [
  { name: 'Privacy Policy', path: '/privacy-policy' },
  { name: 'Disclaimer', path: '/disclaimer' },
  { name: 'Terms of Use', path: '/terms-of-use' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-navy-100">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center text-gold-400 font-serif text-xl font-bold">
                PP
              </div>
              <div>
                <div className="font-serif text-lg font-semibold text-white leading-none">
                  Pawan Parajuli
                </div>
                <div className="text-xs text-navy-300 mt-0.5">Chartered Accountant</div>
              </div>
            </div>
            <p className="text-sm text-navy-300 leading-relaxed">
              Helping individuals, businesses and entrepreneurs understand taxation,
              accounting, compliance and financial matters in Nepal.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {footerNav.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-navy-300 hover:text-gold-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-navy-300 hover:text-gold-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-navy-300">
                <Mail size={16} className="text-gold-400 flex-shrink-0" />
                <a href="mailto:pawanparajuli33@gmail.com" className="hover:text-gold-400 transition-colors">
                  pawanparajuli33@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-navy-300">
                <Phone size={16} className="text-gold-400 flex-shrink-0" />
                <a href="tel:+9779846796501" className="hover:text-gold-400 transition-colors">
                  9846796501
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-navy-300">
                <MapPin size={16} className="text-gold-400 flex-shrink-0" />
                Nepal
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-9 h-9 bg-navy-700 rounded-lg flex items-center justify-center text-navy-300 hover:bg-navy-600 hover:text-gold-400 transition-all"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 bg-navy-700 rounded-lg flex items-center justify-center text-navy-300 hover:bg-navy-600 hover:text-gold-400 transition-all"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-navy-700 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-navy-400">
            &copy; {year} Pawan Parajuli, Chartered Accountant. All rights reserved.
          </p>
          <p className="text-xs text-navy-400">
            The content on this website is for educational purposes only and does not constitute
            professional advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
