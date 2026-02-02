'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    Trophy,
    ChevronLeft,
    Share2,
    Ticket,
    Info,
    Award,
    FileText,
    AlertCircle,
    ArrowRight,
} from 'lucide-react';
import {
    formatEventDate,
    getStatusConfig,
    isRegistrationOpen,
    getDaysUntilEvent,
    DISCIPLINES,
    type Event
} from '@/types/event';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setIsLoading(true);
                // Using direct fetch or apiClient if available.
                // Assuming API endpoint is /events/:id
                const response = await apiClient.get<{ success: boolean; data: Event }>(`/events/${params.id}`);
                setEvent(response.data.data);
            } catch (err: any) {
                console.error('Error fetching event:', err);
                setError(err.message || 'Failed to load event details');
                toast.error('Failed to load event details');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchEvent();
        }
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Event Not Found</h2>
                <p className="text-slate-400 mb-6">{error || "The event you're looking for doesn't exist."}</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const statusConfig = getStatusConfig(event.status);
    const daysUntil = getDaysUntilEvent(event.eventDate);
    const canRegister = isRegistrationOpen(event);

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    {event.bannerImage ? (
                        <img
                            src={event.bannerImage}
                            alt={event.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 max-w-7xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4"
                    >
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="mr-2 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </button>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${statusConfig.bgColor} ${statusConfig.color} bg-opacity-90`}>
                                {statusConfig.label}
                            </span>
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300 backdrop-blur-sm border border-blue-500/30">
                                {event.eventLevel}
                            </span>
                            {daysUntil > 0 && daysUntil <= 30 && (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-500/20 text-amber-300 backdrop-blur-sm border border-amber-500/30">
                                    {daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days left`}
                                </span>
                            )}
                        </div>

                        {/* Title & Info */}
                        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight max-w-4xl">
                            {event.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-slate-300 text-lg mt-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                <span>{formatEventDate(event.eventDate, event.eventEndDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-400" />
                                <span>{event.venue}, {event.city}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 md:p-8"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-blue-400" />
                                <h2 className="text-xl font-bold text-white">About Event</h2>
                            </div>
                            <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </motion.div>

                        {/* Disciplines */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 md:p-8"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <h2 className="text-xl font-bold text-white">Disciplines & Categories</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(event.disciplines || []).map((discValue) => {
                                    const discipline = DISCIPLINES.find(d => d.value === discValue);
                                    return (
                                        <div key={discValue} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                            <span className="text-2xl">{discipline?.icon || '🏅'}</span>
                                            <div>
                                                <h3 className="font-semibold text-white mb-1">{discipline?.label || discValue}</h3>
                                                <p className="text-sm text-slate-400">Open for all age categories</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {event.ageCategories && event.ageCategories.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-slate-800">
                                    <h3 className="text-sm font-medium text-slate-400 mb-3">Age Categories</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {event.ageCategories.map((cat) => (
                                            <span key={cat} className="px-3 py-1 rounded-full text-sm bg-slate-800 text-slate-300 border border-slate-700">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Registration Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sticky top-24"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Entry Fee</p>
                                    <p className="text-2xl font-bold text-white">
                                        {event.entryFee > 0 ? `₹${event.entryFee}` : 'Free'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-400 mb-1">Participants</p>
                                    <p className="text-xl font-bold text-white flex items-center justify-end gap-2">
                                        <Users className="w-5 h-5 text-blue-400" />
                                        {event._count?.registrations || 0}
                                    </p>
                                </div>
                            </div>

                            {canRegister ? (
                                <button
                                    onClick={() => router.push(`/register?eventId=${event.id}`)}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <Ticket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    Register Now
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="w-full py-4 bg-slate-700 text-slate-400 rounded-xl font-bold text-lg cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Clock className="w-5 h-5" />
                                    Registration Closed
                                </button>
                            )}

                            <div className="mt-6 space-y-4 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-700/50">
                                    <span className="text-slate-400">Registration Opens</span>
                                    <span className="text-white">{new Date(event.registrationStartDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-700/50">
                                    <span className="text-slate-400">Registration Closes</span>
                                    <span className="text-red-300">{new Date(event.registrationEndDate).toLocaleDateString()}</span>
                                </div>
                                {event.maxParticipants && (
                                    <div className="flex justify-between py-2 border-b border-slate-700/50">
                                        <span className="text-slate-400">Total Spots</span>
                                        <span className="text-white">{event.maxParticipants}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
