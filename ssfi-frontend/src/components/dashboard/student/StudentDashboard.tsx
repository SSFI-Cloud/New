'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  User,
  Trophy,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Phone,
  Mail,
  Building2,
  RefreshCw,
  MapPin,
  Ticket,
} from 'lucide-react';

import { StatusBadge } from '../shared/DashboardComponents';
import { useDashboard } from '@/lib/hooks/useDashboard';
import type { StudentDashboardData } from '@/types/dashboard';

export default function StudentDashboardComponent() {
  const { fetchDashboard, data, isLoading, error } = useDashboard();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (error || !data || data.role !== 'STUDENT') {
    return (
      <div className="text-center text-red-400 py-12">
        {error || 'Failed to load dashboard'}
      </div>
    );
  }

  const dashboard = data as StudentDashboardData;
  const { profile, membership, eventRegistrations, upcomingEvents, stats } = dashboard;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl border border-amber-500/20 p-6"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt=""
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-amber-500/20"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <User className="w-12 h-12 text-amber-400" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-amber-400 font-mono text-lg mt-1">{profile.uid}</p>
              </div>
              <StatusBadge status={profile.status} size="md" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-slate-500">Age Category</p>
                <p className="text-white font-medium">{profile.ageCategory}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Gender</p>
                <p className="text-white font-medium">{profile.gender}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">State</p>
                <p className="text-white font-medium">{profile.state}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">District</p>
                <p className="text-white font-medium">{profile.district}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Membership & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Membership Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`col-span-1 md:col-span-2 rounded-2xl border p-6 ${membership.isActive
            ? 'bg-green-500/10 border-green-500/20'
            : 'bg-red-500/10 border-red-500/20'
            }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Membership Status</p>
              <p className={`text-2xl font-bold ${membership.isActive ? 'text-green-400' : 'text-red-400'}`}>
                {membership.isActive ? 'Active' : 'Expired'}
              </p>
              {membership.expiryDate && (
                <p className="text-sm text-slate-400 mt-1">
                  {membership.isActive ? 'Expires' : 'Expired'} on{' '}
                  {new Date(membership.expiryDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${membership.isActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {membership.isActive ? (
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-400" />
              )}
            </div>
          </div>

          {(membership.needsRenewal || !membership.isActive) && (
            <Link
              href="/dashboard/renew-membership"
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl font-medium transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Renew Membership
            </Link>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Trophy className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Events Registered</p>
              <p className="text-2xl font-bold text-white">{stats.totalEventsRegistered}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Upcoming</p>
              <p className="text-2xl font-bold text-white">{stats.upcomingEventsCount}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Club Info */}
      {profile.club && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            My Club
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-semibold text-white">{profile.club.name}</p>
              {profile.club.phone && (
                <p className="text-slate-400 flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" />
                  {profile.club.phone}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Event Registrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h3 className="font-semibold text-white">My Event Registrations</h3>
            <Link href="/dashboard/my-events" className="text-sm text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-700/50 max-h-96 overflow-y-auto">
            {eventRegistrations.length > 0 ? (
              eventRegistrations.slice(0, 5).map((reg: any) => (
                <Link
                  key={reg.id}
                  href={`/events/${reg.event.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-700/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-blue-400">
                      {new Date(reg.event.eventDate).toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-white">
                      {new Date(reg.event.eventDate).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{reg.event.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {reg.event.venue}, {reg.event.city}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={reg.status} />
                    <StatusBadge status={reg.paymentStatus} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No event registrations yet</p>
                <Link
                  href="/events"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                >
                  <Ticket className="w-4 h-4" />
                  Browse Events
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h3 className="font-semibold text-white">Events You Can Join</h3>
            <Link href="/events" className="text-sm text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-700/50">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event: any) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-700/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-green-400">
                      {new Date(event.eventDate).toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-white">
                      {new Date(event.eventDate).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{event.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.venue}, {event.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">
                      {event.entryFee ? `₹${event.entryFee}` : 'Free'}
                    </p>
                    <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                      Register
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No eligible events available right now</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-700">
              <Phone className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="text-white">{profile.phone}</p>
            </div>
          </div>
          {profile.email && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-700">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="text-white">{profile.email}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
