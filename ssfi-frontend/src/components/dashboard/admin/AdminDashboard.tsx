import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Settings,
  Calendar,
  UserPlus,
  TrendingUp,
} from 'lucide-react';

import { QuickAction } from '../shared/DashboardComponents';
import { useDashboard } from '@/lib/hooks/useDashboard';
import type { AdminDashboardData } from '@/types/dashboard';

// Modular Sections
import { StatsSection } from './sections/StatsSection';
import { ApprovalsSection } from './sections/ApprovalsSection';
import { ChartsSection } from './sections/ChartsSection';
import { RecentActivitySection } from './sections/RecentActivitySection';

export default function AdminDashboard() {
  const { fetchDashboard, data, isLoading, error } = useDashboard();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !data || data.role !== 'GLOBAL_ADMIN') {
    return (
      <div className="text-center text-red-400 py-12">
        {error || 'Failed to load dashboard'}
      </div>
    );
  }

  const dashboard = data as AdminDashboardData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here's what's happening with SSFI.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* 1. Overview Stats */}
      <StatsSection overview={dashboard.overview} />

      {/* 2. Pending Approvals */}
      <ApprovalsSection approvals={dashboard.pendingApprovals} />

      {/* 3. Charts (Uses FIX for object access) */}
      <ChartsSection statistics={dashboard.statistics} />

      {/* 4. Recent Activity */}
      <RecentActivitySection recentActivity={dashboard.recentActivity} />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            title="Create Event"
            description="Schedule a new event"
            icon={Calendar}
            href="/dashboard/events/create"
            color="blue"
          />
          <QuickAction
            title="Open Registration"
            description="Manage registration windows"
            icon={UserPlus}
            href="/dashboard/registration-windows"
            color="green"
          />
          <QuickAction
            title="View Reports"
            description="Analytics & insights"
            icon={TrendingUp}
            href="/dashboard/reports"
            color="purple"
          />
          <QuickAction
            title="Settings"
            description="System configuration"
            icon={Settings}
            href="/dashboard/settings"
            color="amber"
          />
        </div>
      </motion.div>
    </div>
  );
}
