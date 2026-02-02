'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Events', href: '/events' },
  { name: 'Affiliation', href: '/register' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'News', href: '/news' },
  { name: 'Contact', href: '/contact' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  // Mock auth state - replace with actual auth hook
  const isAuthenticated = false;
  const user = { name: 'User', email: 'user@example.com' };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    // Implement logout
    console.log('Logout');
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-dark-900/95 backdrop-blur-xl border-b border-white/10 shadow-xl'
          : 'bg-transparent'
          }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="SSFI Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-display font-bold text-white group-hover:text-primary-400 transition-colors">
                  SSFI
                </h1>
                <p className="text-xs text-gray-400">Skating Federation</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-semibold transition-colors ${pathname === item.href
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {item.name}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                // User Menu
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-semibold text-white">
                      {user?.name || 'User'}
                    </span>
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 rounded-lg bg-dark-800 border border-white/10 shadow-xl overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/10">
                          <p className="text-sm font-semibold text-white">{user?.name}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Auth Buttons
                <>
                  <Link
                    href="/login"
                    className="hidden md:inline-flex items-center px-4 py-2 text-sm font-semibold text-white hover:text-primary-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-sm shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 transition-all duration-300"
                  >
                    Register
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/10 bg-dark-900/95 backdrop-blur-xl"
            >
              <div className="container mx-auto px-4 py-6 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${pathname === item.href
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-colors md:hidden"
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-20" />
    </>
  );
};

export default Header;
