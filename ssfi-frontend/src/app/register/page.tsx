'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Users,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Lock,
} from 'lucide-react';

import { useRegistrationStatuses } from '@/lib/hooks/useAffiliation';
import type { RegistrationType, RegistrationStatus } from '@/types/affiliation';
import { REGISTRATION_TYPES, formatRegistrationDate, getDaysRemaining } from '@/types/affiliation';

export default function AffiliationRegistrationPage() {
  const { fetchStatuses, data: statuses, isLoading, error } = useRegistrationStatuses();

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const getStatusIcon = (status: RegistrationStatus | undefined) => {
    if (!status) return <Lock className="w-6 h-6" />;
    if (status.isOpen) return <CheckCircle2 className="w-6 h-6" />;
    return <Lock className="w-6 h-6" />;
  };

  const getRegistrationTypeIcon = (type: RegistrationType) => {
    switch (type) {
      case 'STATE_SECRETARY':
        return <MapPin className="w-8 h-8" />;
      case 'DISTRICT_SECRETARY':
        return <Building2 className="w-8 h-8" />;
      case 'CLUB':
        return <Users className="w-8 h-8" />;
    }
  };

  const getStatus = (type: RegistrationType): RegistrationStatus | undefined => {
    if (!statuses) return undefined;
    return statuses[type];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Affiliation{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Registration
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join the Skating Sports Federation of India. Register as a State Secretary,
            District Secretary, or affiliate your Club.
          </p>
        </motion.div>

        {/* Registration Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REGISTRATION_TYPES.map((regType, index) => {
              const status = getStatus(regType.value);
              const isOpen = status?.isOpen || false;
              const window = status?.window;

              return (
                <motion.div
                  key={regType.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? 'border-green-500/50 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10'
                      : 'border-slate-700/50'
                  }`}
                >
                  {/* Status Badge */}
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                      isOpen
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    {isOpen ? 'Open' : 'Closed'}
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                        isOpen
                          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400'
                          : 'bg-slate-700/50 text-slate-500'
                      }`}
                    >
                      {getRegistrationTypeIcon(regType.value)}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-white mb-2">{regType.label}</h3>
                    <p className="text-slate-400 text-sm mb-4">{regType.description}</p>

                    {/* Window Info */}
                    {window && (
                      <div className="space-y-2 mb-4 p-3 bg-slate-900/50 rounded-xl">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-400">
                            {formatRegistrationDate(window.startDate)} -{' '}
                            {formatRegistrationDate(window.endDate)}
                          </span>
                        </div>
                        {isOpen && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400">
                              {getDaysRemaining(window.endDate)} days remaining
                            </span>
                          </div>
                        )}
                        {window.fee > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">Fee:</span>
                            <span className="text-white font-semibold">₹{window.fee}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message */}
                    <p
                      className={`text-sm mb-6 ${
                        isOpen ? 'text-green-400' : 'text-slate-500'
                      }`}
                    >
                      {status?.message || 'Registration status unavailable'}
                    </p>

                    {/* Action Button */}
                    {isOpen ? (
                      <Link
                        href={`/register/${regType.value.toLowerCase().replace('_', '-')}`}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all"
                      >
                        Register Now
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700/50 text-slate-500 rounded-xl font-semibold cursor-not-allowed"
                      >
                        <Lock className="w-5 h-5" />
                        Registration Closed
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Registration Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
            <div className="space-y-2">
              <p className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                Registration windows are opened periodically by SSFI admin
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                Complete all required fields and upload valid documents
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                Aadhaar card is mandatory for identity verification
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                Applications are reviewed by the appropriate authority
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                You will receive SMS/Email notification upon approval
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                Contact support@ssfi.in for any queries
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-500 text-sm mt-8"
        >
          Already registered?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Login here
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
