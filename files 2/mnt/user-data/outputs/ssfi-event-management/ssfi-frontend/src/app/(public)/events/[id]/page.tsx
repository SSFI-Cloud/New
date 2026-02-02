'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Trophy,
  ChevronLeft,
  Ticket,
  Share2,
  Heart,
  AlertCircle,
  CheckCircle2,
  Info,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

import { useEvent } from '@/lib/hooks/useEvents';
import EventRegistrationModal from '@/components/events/EventRegistrationModal';
import type { Event } from '@/types/event';
import {
  getStatusConfig,
  isRegistrationOpen,
  getDaysUntilEvent,
  formatEventDate,
  DISCIPLINES,
  AGE_CATEGORIES,
} from '@/types/event';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const { fetchEvent, data: event, isLoading, error } = useEvent();

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
          <p className="text-slate-400 mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(event.status);
  const canRegister = isRegistrationOpen(event);
  const daysUntil = getDaysUntilEvent(event.eventDate);
  const registrationCount = event._count?.registrations || 0;

  const disciplineLabels = event.disciplines.map(
    (d) => DISCIPLINES.find((disc) => disc.value === d)
  );

  const ageCategoryLabels = event.ageCategories.map(
    (c) => AGE_CATEGORIES.find((cat) => cat.value === c)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Banner */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
            <Trophy className="w-32 h-32 text-slate-600" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Link
            href="/events"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-sm rounded-xl text-white hover:bg-slate-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Events
          </Link>
        </div>

        {/* Status Badge */}
        <div className="absolute top-6 right-6">
          <span
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${statusConfig.bgColor} ${statusConfig.color} backdrop-blur-sm`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Title Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                {event.eventLevel.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium">
                {event.eventType.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {event.name}
            </h1>
            <p className="text-lg text-slate-300 max-w-3xl">
              {event.shortDescription || event.description.slice(0, 200)}...
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
              >
                <Calendar className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-sm text-slate-400">Event Date</p>
                <p className="text-white font-semibold">
                  {formatEventDate(event.eventDate, event.eventEndDate)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
              >
                <MapPin className="w-6 h-6 text-green-400 mb-2" />
                <p className="text-sm text-slate-400">Venue</p>
                <p className="text-white font-semibold truncate">{event.city}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
              >
                <Users className="w-6 h-6 text-purple-400 mb-2" />
                <p className="text-sm text-slate-400">Registered</p>
                <p className="text-white font-semibold">
                  {registrationCount}
                  {event.maxParticipants && ` / ${event.maxParticipants}`}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
              >
                <CreditCard className="w-6 h-6 text-amber-400 mb-2" />
                <p className="text-sm text-slate-400">Entry Fee</p>
                <p className="text-white font-semibold">
                  {event.entryFee > 0 ? `₹${event.entryFee}` : 'Free'}
                </p>
              </motion.div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">About this Event</h2>
              <div className="prose prose-invert prose-slate max-w-none">
                <p className="text-slate-300 whitespace-pre-wrap">{event.description}</p>
              </div>
            </motion.div>

            {/* Disciplines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Disciplines</h2>
              <div className="flex flex-wrap gap-3">
                {disciplineLabels.map((disc) =>
                  disc ? (
                    <div
                      key={disc.value}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-xl"
                    >
                      <span className="text-xl">{disc.icon}</span>
                      <span className="text-white font-medium">{disc.label}</span>
                    </div>
                  ) : null
                )}
              </div>
            </motion.div>

            {/* Age Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Age Categories</h2>
              <div className="flex flex-wrap gap-2">
                {ageCategoryLabels.map((cat) =>
                  cat ? (
                    <span
                      key={cat.value}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-medium"
                    >
                      {cat.label}
                    </span>
                  ) : null
                )}
              </div>
            </motion.div>

            {/* Venue Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Venue</h2>
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold text-lg">{event.venue}</p>
                  {event.venueAddress && (
                    <p className="text-slate-400 mt-1">{event.venueAddress}</p>
                  )}
                  <p className="text-slate-400">
                    {event.city}
                    {event.state && `, ${event.state.name}`}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Registration Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
              >
                <h3 className="text-lg font-bold text-white mb-4">Registration</h3>

                {/* Registration Timeline */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm text-slate-400">Registration Opens</p>
                      <p className="text-white">
                        {new Date(event.registrationStartDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div>
                      <p className="text-sm text-slate-400">Registration Closes</p>
                      <p className="text-white">
                        {new Date(event.registrationEndDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fee Info */}
                <div className="p-4 bg-slate-900/50 rounded-xl mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Entry Fee</span>
                    <span className="text-2xl font-bold text-white">
                      {event.entryFee > 0 ? `₹${event.entryFee}` : 'Free'}
                    </span>
                  </div>
                  {event.lateFee && event.lateFeeStartDate && (
                    <p className="text-xs text-amber-400 mt-2">
                      * Late fee of ₹{event.lateFee} applies after{' '}
                      {new Date(event.lateFeeStartDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>

                {/* Register Button */}
                {canRegister ? (
                  <button
                    onClick={() => setShowRegistrationModal(true)}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Ticket className="w-5 h-5" />
                    Register Now
                  </button>
                ) : (
                  <div className="text-center">
                    <button
                      disabled
                      className="w-full py-4 bg-slate-700 text-slate-400 rounded-xl font-semibold cursor-not-allowed"
                    >
                      {event.status === 'REGISTRATION_CLOSED'
                        ? 'Registration Closed'
                        : event.status === 'COMPLETED'
                        ? 'Event Completed'
                        : 'Registration Not Open'}
                    </button>
                    {event.status === 'PUBLISHED' && (
                      <p className="text-sm text-slate-500 mt-2">
                        Opens on{' '}
                        {new Date(event.registrationStartDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                )}

                {/* Spots Remaining */}
                {event.maxParticipants && canRegister && (
                  <p className="text-center text-sm text-slate-400 mt-4">
                    {event.maxParticipants - registrationCount} spots remaining
                  </p>
                )}
              </motion.div>

              {/* Share Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
              >
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                  <button className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                    <Heart className="w-5 h-5" />
                    Save
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <EventRegistrationModal
        event={event}
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={() => {
          setShowRegistrationModal(false);
          // Refresh event data
          fetchEvent(eventId);
        }}
      />
    </div>
  );
}
