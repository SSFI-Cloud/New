// src/components/layout/Footer.tsx
'use client';

import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-dark-900 border-t border-white/10">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Image src="/logo.png" alt="SSFI" width={32} height={32} />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">SSFI</h3>
                <p className="text-xs text-gray-400">Skating Federation</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The official governing body for roller and inline skating sports in India, promoting excellence and growth nationwide.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com/ssfi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary-500 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/ssfi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary-500 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/ssfi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary-500 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/ssfi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary-500 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {['About Us', 'Events', 'Gallery', 'News', 'Contact'].map((link) => (
                <li key={link}>
                  <Link
                    href={`/${link.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Members */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">For Members</h4>
            <ul className="space-y-3">
              {[
                { name: 'Register', href: '/register' },
                { name: 'Login', href: '/login' },
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'Events', href: '/events' },
                { name: 'Certificates', href: '/certificates' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:info@ssfi.in"
                  className="flex items-start gap-3 text-gray-400 hover:text-primary-400 text-sm transition-colors"
                >
                  <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>info@ssfi.in</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+911234567890"
                  className="flex items-start gap-3 text-gray-400 hover:text-primary-400 text-sm transition-colors"
                >
                  <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>+91 123 456 7890</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-400 text-sm">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    SSFI Headquarters
                    <br />
                    New Delhi, India
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} SSFI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
