'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  Trophy,
  Calendar,
  AlertCircle,
  ChevronRight,
  Bell,
} from 'lucide-react';

import {
  StatCard,
  RecentList,
  StatusBadge,
  ChartCard,
  SimpleBarChart,
  DonutChart,
  QuickAction,
} from '../shared/DashboardComponents';
import { useDashboard } from '@/lib/hooks/useDashboard';
import type { ClubDashboardData } from '@/types/dashboard';

export default function ClubDashboard() {
  const { fetchDashboard, data, isLoading, error } = useDashboard();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error || !data || data.role !== 'CLUB_OWNER') {
    return (
      <div className="text-center text-red-400 py-12">
        {error || 'Failed to load dashboard'}
      </div>
    );
  }

  const dashboard = data as ClubDashboardData;

  // Prepare chart data
  // Prepare chart data
  const genderChartData = [
    { label: 'Male', value: dashboard.statistics?.studentsByGender?.['MALE'] || 0, color: '#3b82f6' },
    { label: 'Female', value: dashboard.statistics?.studentsByGender?.['FEMALE'] || 0, color: '#ec4899' },
    { label: 'Other', value: dashboard.statistics?.studentsByGender?.['OTHER'] || 0, color: '#8b5cf6' },
  ];

  const ageCategoryData = Object.entries(dashboard.statistics?.studentsByAgeCategory || {})
    .map(([label, value]) => ({ label, value: Number(value), color: 'bg-purple-500' }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">{dashboard.club.name}</h1>
          <p className="text-slate-400 mt-1">
            {dashboard.club.district}, {dashboard.club.state} • Code: {dashboard.club.code}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={dashboard.club.status} size="md" />
          <button className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={dashboard.overview.totalStudents || 0}
          icon={Users}
          color="purple"
          href="/dashboard/students"
          delay={0}
        />
        <StatCard
          title="Approved"
          value={dashboard.overview.approvedStudents || 0}
          icon={UserCheck}
          color="green"
          delay={0.1}
        />
        <StatCard
          title="Pending Approval"
          value={dashboard.overview.pendingStudents || 0}
          icon={Clock}
          color="amber"
          href="/dashboard/students?status=PENDING"
          delay={0.2}
        />
        <StatCard
          title="Event Registrations"
          value={dashboard.statistics?.totalEventRegistrations || 0}
          icon={Trophy}
          color="blue"
          href="/dashboard/event-registrations"
          delay={0.3}
        />
      </div>

      {/* Membership Alert */}
      {(dashboard.overview.expiredMemberships || 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-red-400 font-semibold">Expired Memberships</p>
              <p className="text-sm text-slate-400">
                {dashboard.overview.expiredMemberships} students have expired memberships and need renewal
              </p>
            </div>
            <Link
              href="/dashboard/students?membership=expired"
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
            >
              View List
            </Link>
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <div className="lg:col-span-2">
          <RecentList
            title="Recent Students"
            items={dashboard.recentActivity?.students || []}
            href="/dashboard/students"
            delay={0.5}
            renderItem={(student: any) => (
              <div className="flex items-center gap-3">
                {student.profilePhoto ? (
                  <img
                    src={student.profilePhoto}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {student.ageCategory} • {student.uid}
                  </p>
                </div>
                <StatusBadge status={student.status} />
              </div>
            )}
          />
        </div>

        {/* Students by Gender */}
        <ChartCard title="Students by Gender" delay={0.6}>
          <DonutChart data={genderChartData} size={140} />
        </ChartCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Age Category */}
        <ChartCard title="Students by Age Category" delay={0.7}>
          <SimpleBarChart data={ageCategoryData} />
        </ChartCard>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h3 className="font-semibold text-white">Upcoming Events</h3>
            <Link href="/events" className="text-sm text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-700/50">
            {(dashboard.upcomingEvents || []).length > 0 ? (
              (dashboard.upcomingEvents || []).map((event: any, index: number) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-700/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex flex-col items-center justify-center">
                    <span className="text-xs text-blue-400">
                      {new Date(event.eventDate).toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-white">
                      {new Date(event.eventDate).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{event.name}</p>
                    <p className="text-sm text-slate-500 truncate">
                      {event.venue}, {event.city}
                    </p>
                  </div>
                  {event.status === 'REGISTRATION_OPEN' && (
                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg">
                      Register Now
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </Link>
              ))
            ) : (
              <p className="p-4 text-center text-slate-500">No upcoming events</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            title="Add Student"
            description="Register new student"
            icon={UserPlus}
            href="/dashboard/students/add"
            color="green"
          />
          <QuickAction
            title="Event Registration"
            description="Register students for events"
            icon={Trophy}
            href="/dashboard/event-registrations/new"
            color="blue"
          />
          <QuickAction
            title="Manage Students"
            description="View & edit student details"
            icon={Users}
            href="/dashboard/students"
            color="purple"
          />
          <QuickAction
            title="View Events"
            description="Browse upcoming events"
            icon={Calendar}
            href="/events"
            color="amber"
          />
        </div>
      </motion.div>
    </div>
  );
}
