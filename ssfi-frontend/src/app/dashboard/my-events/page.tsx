'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    MapPin,
    Trophy,
    Medal,
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Download,
    ChevronRight,
    Loader2,
    Filter,
    ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/hooks/useAuth';

interface Event {
    id: number;
    name: string;
    eventDate: string;
    venue: string;
    city: string;
    state: string;
    status: string;
    eventLevel?: string;
}

interface Registration {
    id: number;
    eventId: number;
    event: Event;
    status: string;
    paymentStatus: string;
    categories: any;
    disciplines: any;
    fee: number;
}

interface ApiResponse {
    status: string;
    data: {
        registrations: Registration[];
    };
}

export default function MyEventsPage() {
    const { token } = useAuth();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            if (!token) return;
            try {
                const response = await axios.get<ApiResponse>('http://localhost:5001/api/v1/events/my-events', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.status === 'success') {
                    setRegistrations(response.data.data.registrations);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [token]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full"><CheckCircle className="w-3 h-3" /> Approved</span>;
            case 'PENDING': return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
            case 'REJECTED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full"><XCircle className="w-3 h-3" /> Rejected</span>;
            default: return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-500/20 text-slate-400 text-xs font-medium rounded-full">{status}</span>;
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        if (status === 'COMPLETED') return <span className="text-xs text-green-400 font-medium">Payment Successful</span>;
        if (status === 'PENDING') return <span className="text-xs text-amber-400 font-medium">Payment Pending</span>;
        return <span className="text-xs text-red-400 font-medium">Payment Failed</span>;
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = reg.event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.event.venue.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'upcoming' && new Date(reg.event.eventDate) > new Date()) ||
            (filterStatus === 'completed' && new Date(reg.event.eventDate) <= new Date());
        return matchesSearch && matchesFilter;
    });

    const activeEventsCount = registrations.filter(r => new Date(r.event.eventDate) > new Date()).length;
    const completedEventsCount = registrations.filter(r => new Date(r.event.eventDate) <= new Date()).length;
    // Mock medals count for now
    const medalsCount = { gold: 1, silver: 0, bronze: 1 };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Events</h1>
                    <p className="text-slate-400 mt-1">Track your competition usage, results, and upcoming events</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Placeholder for 'Register for Event' button if needed */}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{registrations.length}</p>
                            <p className="text-sm text-slate-400">Total Events</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{activeEventsCount}</p>
                            <p className="text-sm text-slate-400">Upcoming</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{completedEventsCount}</p>
                            <p className="text-sm text-slate-400">Completed</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <Medal className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{medalsCount.gold + medalsCount.silver + medalsCount.bronze}</p>
                            <p className="text-sm text-slate-400">Medals Won</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search events..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-10 pr-8 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none min-w-[150px]"
                    >
                        <option value="all">All Events</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Event List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="py-12 text-center">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                    </div>
                ) : filteredRegistrations.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No events found</p>
                    </div>
                ) : (
                    filteredRegistrations.map((reg, index) => {
                        const eventDate = new Date(reg.event.eventDate);
                        const isUpcoming = eventDate > new Date();

                        return (
                            <motion.div
                                key={reg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Date Box */}
                                        <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-slate-700/50 rounded-xl border border-slate-600/50">
                                            <span className="text-xs font-semibold text-slate-400 uppercase">{eventDate.toLocaleDateString('en-IN', { month: 'short' })}</span>
                                            <span className="text-2xl font-bold text-white">{eventDate.getDate()}</span>
                                            <span className="text-xs text-slate-500">{eventDate.getFullYear()}</span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {reg.event.eventLevel && (
                                                            <span className="text-xs font-medium text-blue-400 px-2 py-0.5 bg-blue-500/10 rounded-full">{reg.event.eventLevel}</span>
                                                        )}
                                                        {getStatusBadge(reg.status)}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white truncate">{reg.event.name}</h3>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{reg.event.venue}, {reg.event.city}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{isUpcoming ? 'Starts in 5 days' : 'Completed'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    {getPaymentStatusBadge(reg.paymentStatus)}
                                                </div>
                                            </div>

                                            {/* Categories */}
                                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                                <p className="text-xs font-medium text-slate-500 mb-2 uppercase">Participating In</p>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {Array.isArray(reg.categories) && reg.categories.length > 0 ? (
                                                        reg.categories.map((cat: string, idx: number) => (
                                                            <span key={idx} className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-lg border border-slate-600/50">
                                                                {cat}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-slate-500 italic">No categories specified</span>
                                                    )}
                                                </div>

                                                {/* Actions / Results (Mocked for completed) */}
                                                <div className="flex items-center justify-between">
                                                    {!isUpcoming ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-slate-400">Result:</span>
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20">
                                                                <Medal className="w-3.5 h-3.5" />
                                                                <span className="text-xs font-bold">Gold Medal</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-slate-500 italic">Results pending</div>
                                                    )}

                                                    <div className="flex gap-2">
                                                        {reg.status === 'APPROVED' && (
                                                            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
                                                                <Download className="w-4 h-4" />
                                                                Receipt
                                                            </button>
                                                        )}
                                                        {!isUpcoming && reg.status === 'APPROVED' && (
                                                            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
                                                                <Download className="w-4 h-4" />
                                                                Certificate
                                                            </button>
                                                        )}
                                                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg flex items-center gap-2 border border-slate-700 transition-colors">
                                                            Details
                                                            <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
