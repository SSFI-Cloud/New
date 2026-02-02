'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Trophy,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    Download,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    MapPin,
    Loader2,
    Calendar,
    Users,
    CheckCircle,
    IndianRupee,
    Flag,
    Building2,
    Globe,
    X,
    AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/hooks/useAuth';

// Types
interface Event {
    id: number;
    event_id: string; // code
    title: string; // name
    event_name: string; // mapped from title
    type: string;
    category: string;
    level: string; // NATIONAL, STATE, DISTRICT
    start_date: string;
    end_date: string;
    registration_deadline: string;
    venue: string;
    city: string;
    state: string;
    status: string; // DRAFT, PUBLISHED, etc.
    registrations_count: number;
    created_at: string;
    // Computed for frontend compatibility
    event_level_type_id: number;
    event_fees: number; // Not in getAllEvents response currently? Added in mapping?
}

interface ApiResponse {
    status: string;
    data: {
        events: Event[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

const eventLevels = [
    { id: 1, name: 'District Level', icon: Building2, color: 'bg-blue-500/20 text-blue-400' },
    { id: 2, name: 'State Level', icon: Flag, color: 'bg-purple-500/20 text-purple-400' },
    { id: 3, name: 'National Meet', icon: Globe, color: 'bg-amber-500/20 text-amber-400' },
];

export default function EventsPage() {
    const { token } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortField, setSortField] = useState<string>('start_date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({
        totalEvents: 0,
        activeEvents: 0,
        totalRegistrations: 0,
        totalRevenue: 0
    });

    const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
                sortField: sortField === 'event_name' ? 'name' : sortField === 'start_date' ? 'eventDate' : sortField,
                sortOrder,
            };
            if (searchQuery) params.search = searchQuery;
            // Filter mapping
            if (levelFilter !== 'all') {
                if (levelFilter === 1) params.level = 'DISTRICT';
                if (levelFilter === 2) params.level = 'STATE';
                if (levelFilter === 3) params.level = 'NATIONAL';
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter === 'active' ? 'PUBLISHED' : 'COMPLETED'; // Rough mapping
            }

            const response = await axios.get<ApiResponse>('http://localhost:5001/api/v1/events', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.status === 'success') {
                const { events: data, meta } = response.data.data;
                // Map backend data to frontend structure
                const mappedEvents = data.map((e: any) => ({
                    ...e,
                    event_name: e.title,
                    event_level_type_id: e.level === 'NATIONAL' ? 3 : e.level === 'STATE' ? 2 : 1,
                    event_fees: 0, // Backend needs to return this. For now 0.
                    status: e.status === 'PUBLISHED' || e.status === 'ONGOING' ? 'active' : 'inactive' // Map status
                }));

                setEvents(mappedEvents);
                setTotalPages(meta.totalPages);

                setStats({
                    totalEvents: meta.total,
                    activeEvents: mappedEvents.filter((e: any) => e.status === 'active').length,
                    totalRegistrations: mappedEvents.reduce((acc: number, e: any) => acc + (e.registrations_count || 0), 0),
                    totalRevenue: 0 // Need fee info
                });
            }
        } catch (err: any) {
            console.error('Error fetching events:', err);
            setError(err.response?.data?.message || 'Failed to fetch events');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (token) fetchEvents();
        }, 500);
        return () => clearTimeout(timer);
    }, [token, currentPage, searchQuery, levelFilter, statusFilter, sortField, sortOrder]);


    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getEventLevelBadge = (levelId: number) => {
        const level = eventLevels.find(l => l.id === levelId);
        if (!level) return null;
        const Icon = level.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 ${level.color} text-xs font-medium rounded-full`}>
                <Icon className="w-3 h-3" />
                {level.name}
            </span>
        );
    };

    const getRegistrationStatus = (regStart: string, regEnd: string) => {
        if (!regStart || !regEnd) return <span className="text-slate-500 text-xs">Dates TBD</span>;
        const now = new Date();
        const start = new Date(regStart);
        const end = new Date(regEnd);

        if (now < start) {
            return <span className="text-amber-400 text-xs">Opens {new Date(regStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>;
        } else if (now > end) {
            return <span className="text-slate-500 text-xs">Closed</span>;
        } else {
            return <span className="text-green-400 text-xs">Open Now</span>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Events Management</h1>
                    <p className="text-slate-400 mt-1">Manage championships and competitions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <Link
                        href="/dashboard/events/new"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Event
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
                            <p className="text-sm text-slate-400">Total Events</p>
                        </div>
                    </div>
                </motion.div>
                {/* Other stats... */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.activeEvents}</p>
                            <p className="text-sm text-slate-400">Active Events</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search events..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
                <select
                    value={levelFilter === 'all' ? 'all' : levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                    <option value="all">All Levels</option>
                    {eventLevels.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Completed</option>
                </select>
            </div>

            {/* Events Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full py-12 text-center">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        No events found
                    </div>
                ) : (
                    events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-blue-500/50 transition-colors"
                        >
                            {/* Event Header */}
                            <div className="relative h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4">
                                <div className="absolute top-4 left-4">
                                    {getEventLevelBadge(event.event_level_type_id)}
                                </div>
                                <div className="absolute top-4 right-4">
                                    {event.status === 'active' ? (
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Active</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs font-medium rounded-full">{event.status}</span>
                                    )}
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-lg font-bold text-white line-clamp-2">{event.event_name}</h3>
                                </div>
                            </div>

                            {/* Event Details */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(event.start_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                    <span className="truncate">{event.venue}</span>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500">Registrations</p>
                                            <p className="text-sm font-medium text-white">{event.registrations_count}</p>
                                        </div>
                                    </div>
                                    {getRegistrationStatus(event.registration_deadline, event.registration_deadline)}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 pt-0 flex gap-2">
                                <button
                                    onClick={() => setViewingEvent(event)}
                                    className="flex-1 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 text-sm font-medium flex items-center justify-center gap-1"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <Link
                                    href={`/dashboard/events/${event.id}/edit`}
                                    className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm font-medium flex items-center justify-center gap-1"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </Link>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {viewingEvent && (
                    <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewingEvent(null)}>
                        <motion.div className="bg-slate-800 rounded-2xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">{viewingEvent.event_name}</h2>
                                <button onClick={() => setViewingEvent(null)}><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            {/* Details content */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 text-sm">Venue</p>
                                    <p className="text-white">{viewingEvent.venue}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">City</p>
                                    <p className="text-white">{viewingEvent.city}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
