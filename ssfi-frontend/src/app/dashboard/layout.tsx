'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  Trophy,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Globe,
  UserPlus,
  ClipboardList,
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { type UserRole } from '@/types/dashboard';
import { ROLE_CONFIG } from '@/config/roles';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY', 'CLUB_OWNER', 'STUDENT'],
  },
  {
    label: 'States',
    href: '/dashboard/states',
    icon: Globe,
    roles: ['GLOBAL_ADMIN'],
  },
  {
    label: 'Districts',
    href: '/dashboard/districts',
    icon: MapPin,
    roles: ['GLOBAL_ADMIN', 'STATE_SECRETARY'],
  },
  {
    label: 'Clubs',
    href: '/dashboard/clubs',
    icon: Building2,
    roles: ['GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY'],
  },
  {
    label: 'Students',
    href: '/dashboard/students',
    icon: Users,
    roles: ['GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY', 'CLUB_OWNER'],
  },
  {
    label: 'Events',
    href: '/dashboard/events',
    icon: Trophy,
    roles: ['GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY'],
  },
  {
    label: 'My Events',
    href: '/dashboard/my-events',
    icon: Calendar,
    roles: ['STUDENT'],
  },
  {
    label: 'Approvals',
    href: '/dashboard/approvals',
    icon: ClipboardList,
    roles: ['GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY'],
    children: [
      { label: 'State Secretaries', href: '/dashboard/approvals/state-secretaries' },
      { label: 'District Secretaries', href: '/dashboard/approvals/district-secretaries' },
      { label: 'Clubs', href: '/dashboard/approvals/clubs' },
      { label: 'Students', href: '/dashboard/approvals/students' },
    ],
  },
  {
    label: 'Registration Windows',
    href: '/dashboard/registration-windows',
    icon: UserPlus,
    roles: ['GLOBAL_ADMIN'],
  },
  {
    label: 'Payments',
    href: '/dashboard/payments',
    icon: CreditCard,
    roles: ['GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY', 'CLUB_OWNER'],
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
    roles: ['GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY'],
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY', 'CLUB_OWNER', 'STUDENT'],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const userRole = (user?.role || 'STUDENT') as UserRole;
  const roleConfig = ROLE_CONFIG[userRole];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  // Filter children based on role
  const getFilteredChildren = (item: NavItem) => {
    if (!item.children) return [];

    // Admin sees all, others see filtered
    if (userRole === 'GLOBAL_ADMIN') return item.children;

    return item.children.filter(child => {
      if (child.href.includes('state-secretaries')) return (userRole as string) === 'GLOBAL_ADMIN';
      if (child.href.includes('district-secretaries')) return ['GLOBAL_ADMIN', 'STATE_SECRETARY'].includes(userRole);
      if (child.href.includes('clubs')) return ['GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY'].includes(userRole);
      if (child.href.includes('students')) return ['GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY'].includes(userRole);
      return true;
    });
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    if (item.children) {
      return item.children.some(child => pathname.startsWith(child.href));
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold">SSFI</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || typeof window !== 'undefined') && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-800 border-r border-slate-700 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
              } transition-transform lg:transition-none`}
          >
            {/* Logo */}
            <div className="p-4 border-b border-slate-700">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <span className="text-white font-bold text-lg block">SSFI</span>
                  <span className="text-slate-500 text-xs">Dashboard</span>
                </div>
              </Link>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user?.name || 'User'}</p>
                  <p className={`text-xs ${roleConfig.color === 'red' ? 'text-red-400' : roleConfig.color === 'blue' ? 'text-blue-400' : roleConfig.color === 'green' ? 'text-green-400' : roleConfig.color === 'purple' ? 'text-purple-400' : 'text-amber-400'}`}>
                    {roleConfig.icon} {roleConfig.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const children = getFilteredChildren(item);
                const hasChildren = children.length > 0;
                const isExpanded = expandedItems.includes(item.label);
                const active = isParentActive(item);

                return (
                  <div key={item.label}>
                    {hasChildren ? (
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${active
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1 font-medium">{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${active
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )}

                    {hasChildren && isExpanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        {children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive(child.href)
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'text-slate-500 hover:bg-slate-700/30 hover:text-slate-300'
                              }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
