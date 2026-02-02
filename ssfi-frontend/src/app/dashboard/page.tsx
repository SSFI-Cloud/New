'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import AdminDashboard from '@/components/dashboard/admin/AdminDashboard';
import ClubDashboard from '@/components/dashboard/club/ClubDashboard';
import StudentDashboard from '@/components/dashboard/student/StudentDashboard';
// Import other dashboards when created
// import StateDashboard from '@/components/dashboard/state/StateDashboard';
// import DistrictDashboard from '@/components/dashboard/district/DistrictDashboard';

import { useAuth } from '@/lib/hooks/useAuth';
import type { UserRole } from '@/types/dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const renderDashboard = () => {
    switch (user.role as UserRole) {
      case 'GLOBAL_ADMIN':
        return <AdminDashboard />;
      case 'STATE_SECRETARY':
        // return <StateDashboard />;
        return <PlaceholderDashboard role="State Secretary" />;
      case 'DISTRICT_SECRETARY':
        // return <DistrictDashboard />;
        return <PlaceholderDashboard role="District Secretary" />;
      case 'CLUB_OWNER':
        return <ClubDashboard />;
      case 'STUDENT':
        return <StudentDashboard />;
      default:
        return <PlaceholderDashboard role="Unknown" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {renderDashboard()}
      </div>
    </div>
  );
}

// Placeholder for dashboards not yet fully implemented
function PlaceholderDashboard({ role }: { role: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
        <span className="text-4xl">🚧</span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">{role} Dashboard</h1>
      <p className="text-slate-400">
        This dashboard is being customized for your role.
      </p>
      <p className="text-slate-500 text-sm mt-2">
        The full dashboard experience will be available soon.
      </p>
    </div>
  );
}
