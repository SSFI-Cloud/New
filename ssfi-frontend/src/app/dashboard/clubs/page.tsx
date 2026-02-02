'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Shield,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Eye,
    Download,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    MapPin,
    Users,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    Phone,
    Mail,
    Calendar,
    MoreVertical,
    FileText,
    Image as ImageIcon,
    AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/hooks/useAuth';

// Types
interface Club {
    id: number;
    membership_id: string;
    club_name: string;
    contact_person: string;
    mobile_number: string;
    email_address: string;
    district_name: string;
    state_name: string;
    state_code: string;
    established_year: string;
    skatersCount: number;
    verified: number;
    status: string;
    created_at: string;
}

interface ApiResponse {
    status: string;
    data: {
        clubs: Club[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

// Mock states & districts for filters (Ideally fetch from API)
const mockStates = [
    { id: 23, state_name: 'Tamil Nadu', code: 'TN' },
    { id: 11, state_name: 'Karnataka', code: 'KA' },
];

export default function ClubsPage() {
    const { token } = useAuth();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [stateFilter, setStateFilter] = useState<number | 'all'>('all');
    const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');
    const [sortField, setSortField] = useState<keyof Club>('club_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewingClub, setViewingClub] = useState<Club | null>(null);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({
        totalClubs: 0,
        verifiedClubs: 0,
        pendingClubs: 0,
        totalSkaters: 0
    });

    const fetchClubs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
                sortField,
                sortOrder,
            };
            if (searchQuery) params.search = searchQuery;
            if (stateFilter !== 'all') params.stateId = stateFilter;
            // Backend handling for verification filter needs status parameter
            if (verificationFilter === 'verified') params.statusStr = 'APPROVED'; // Assuming backend handles this
            if (verificationFilter === 'pending') params.statusStr = 'PENDING';

            const response = await axios.get<ApiResponse>('http://localhost:5001/api/v1/clubs', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.status === 'success') {
                const { clubs: data, meta } = response.data.data;
                setClubs(data);
                setTotalPages(meta.totalPages);

                // Calculate stats (Approximate for current view or if backend sends metadata)
                // For accurate counts, backend should provide summary
                setStats({
                    totalClubs: meta.total,
                    verifiedClubs: data.filter(c => c.verified === 1).length, // Only current page
                    pendingClubs: data.filter(c => c.verified === 0).length, // Only current page
                    totalSkaters: data.reduce((acc, c) => acc + c.skatersCount, 0)
                });
            }
        } catch (err: any) {
            console.error('Error fetching clubs:', err);
            setError(err.response?.data?.message || 'Failed to fetch clubs');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (token) fetchClubs();
        }, 500);
        return () => clearTimeout(timer);
    }, [token, currentPage, searchQuery, stateFilter, verificationFilter, sortField, sortOrder]);


    const handleSort = (field: keyof Club) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getVerificationBadge = (verified: number) => {
        if (verified === 1) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                <Clock className="w-3 h-3" />
                Pending
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Clubs Management</h1>
                    <p className="text-slate-400 mt-1">Manage all affiliated skating clubs</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <Link
                        href="/dashboard/clubs/new"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Club
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
                            <Shield className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalClubs}</p>
                            <p className="text-sm text-slate-400">Total Clubs</p>
                        </div>
                    </div>
                </motion.div>

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
                            <p className="text-2xl font-bold text-white">{stats.verifiedClubs}+</p>
                            <p className="text-sm text-slate-400">Verified</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.pendingClubs}+</p>
                            <p className="text-sm text-slate-400">Pending</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalSkaters}</p>
                            <p className="text-sm text-slate-400">Total Skaters</p>
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
                        placeholder="Search clubs by name, ID, or contact..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
                <select
                    value={stateFilter === 'all' ? 'all' : stateFilter}
                    onChange={(e) => setStateFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                    <option value="all">All States</option>
                    {mockStates.map(state => (
                        <option key={state.id} value={state.id}>{state.state_name}</option>
                    ))}
                </select>
                <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value as 'all' | 'verified' | 'pending')}
                    className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                                    />
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-medium text-slate-400 cursor-pointer hover:text-white"
                                    onClick={() => handleSort('membership_id')}
                                >
                                    <div className="flex items-center gap-2">
                                        Club ID
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-medium text-slate-400 cursor-pointer hover:text-white"
                                    onClick={() => handleSort('club_name')}
                                >
                                    <div className="flex items-center gap-2">
                                        Club Details
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Contact</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Location</th>
                                <th
                                    className="px-4 py-3 text-center text-sm font-medium text-slate-400 cursor-pointer hover:text-white"
                                    onClick={() => handleSort('skatersCount')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Skaters
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-slate-400">Status</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : clubs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                        No clubs found
                                    </td>
                                </tr>
                            ) : (
                                clubs.map((club, index) => (
                                    <motion.tr
                                        key={club.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-slate-700/30 hover:bg-slate-700/20"
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm text-blue-400">{club.membership_id}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                                    <Shield className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{club.club_name}</p>
                                                    <p className="text-sm text-slate-400">Est. {club.established_year}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <p className="text-sm text-white">{club.contact_person}</p>
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Phone className="w-3 h-3" />
                                                    {club.mobile_number}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-500" />
                                                <div>
                                                    <p className="text-sm text-white">{club.district_name}</p>
                                                    <p className="text-xs text-slate-400">{club.state_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-500/20 text-purple-400 text-sm font-medium rounded-lg">
                                                {club.skatersCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {getVerificationBadge(club.verified)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewingClub(club)}
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={`/dashboard/clubs/${club.id}/edit`}
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
                        <p className="text-sm text-slate-400">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Club Detail Modal */}
            <AnimatePresence>
                {viewingClub && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setViewingClub(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                                            <Shield className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{viewingClub.club_name}</h2>
                                            <p className="text-blue-400 font-mono text-sm">{viewingClub.membership_id}</p>
                                        </div>
                                    </div>
                                    {getVerificationBadge(viewingClub.verified)}
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Contact Person</p>
                                        <p className="font-medium text-white">{viewingClub.contact_person}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Mobile</p>
                                        <p className="font-medium text-white">{viewingClub.mobile_number}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Email</p>
                                        <p className="font-medium text-white text-sm">{viewingClub.email_address}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Established</p>
                                        <p className="font-medium text-white">{viewingClub.established_year}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Location</p>
                                        <p className="font-medium text-white">{viewingClub.district_name}, {viewingClub.state_name}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Registered Skaters</p>
                                        <p className="font-medium text-white">{viewingClub.skatersCount}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        href={`/dashboard/clubs/${viewingClub.id}/edit`}
                                        className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Club
                                    </Link>
                                    <Link
                                        href={`/dashboard/students?club=${viewingClub.id}`}
                                        className="flex-1 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-medium flex items-center justify-center gap-2"
                                    >
                                        <Users className="w-4 h-4" />
                                        View Skaters
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
