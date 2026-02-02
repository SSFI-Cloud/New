'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    Download,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Building2,
    Users,
    Loader2,
    AlertCircle,
    Globe
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/hooks/useAuth';

// Types
interface State {
    id: number;
    state_name: string;
    code: string;
    logo?: string;
    website?: string;
    districtsCount: number;
    clubsCount: number;
    skatersCount: number;
    eventsCount: number;
    created_at: string;
}

interface ApiResponse {
    status: string;
    data: {
        states: State[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export default function StatesPage() {
    const { user, token } = useAuth();
    const [states, setStates] = useState<State[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<keyof State>('state_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stats
    const [stats, setStats] = useState({
        totalStates: 0,
        totalDistricts: 0,
        totalClubs: 0,
        totalSkaters: 0
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingState, setEditingState] = useState<State | null>(null);
    const [selectedStates, setSelectedStates] = useState<number[]>([]);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);

    const fetchStates = async () => {
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

            const response = await axios.get<ApiResponse>('http://localhost:5001/api/v1/states', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data && response.data.data) {
                const { states: data, meta } = response.data.data;
                setStates(data);
                setTotalPages(meta.totalPages);

                const currentStats = {
                    totalStates: meta.total,
                    totalDistricts: data.reduce((acc, d) => acc + d.districtsCount, 0),
                    totalClubs: data.reduce((acc, d) => acc + d.clubsCount, 0),
                    totalSkaters: data.reduce((acc, d) => acc + d.skatersCount, 0),
                };
                setStats(currentStats);
            }
        } catch (err: any) {
            console.error('Error fetching states:', err);
            setError(err.response?.data?.message || 'Failed to fetch states');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (token) {
                fetchStates();
            } else {
                setIsLoading(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [token, currentPage, searchQuery, sortField, sortOrder]);


    const handleSort = (field: keyof State) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const toggleSelectAll = () => {
        if (selectedStates.length === states.length) {
            setSelectedStates([]);
        } else {
            setSelectedStates(states.map(s => s.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedStates(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure?')) return;
        // API call to delete
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">States Management</h1>
                    <p className="text-slate-400 mt-1">Manage states and their associations</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add State
                    </button>
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
                            <Globe className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalStates}</p>
                            <p className="text-sm text-slate-400">Total States</p>
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
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalDistricts}</p>
                            <p className="text-sm text-slate-400">Total Districts</p>
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
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalClubs}</p>
                            <p className="text-sm text-slate-400">Total Clubs</p>
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
                        placeholder="Search states..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
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
                                        checked={selectedStates.length === states.length && states.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                                    />
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-medium text-slate-400 cursor-pointer hover:text-white"
                                    onClick={() => handleSort('state_name')}
                                >
                                    <div className="flex items-center gap-2">
                                        State Name
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-medium text-slate-400 cursor-pointer hover:text-white"
                                    onClick={() => handleSort('code')}
                                >
                                    <div className="flex items-center gap-2">
                                        Code
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-center text-sm font-medium text-slate-400 cursor-pointer hover:text-white"
                                    onClick={() => handleSort('districtsCount')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Districts
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-center text-sm font-medium text-slate-400 cursor-pointer hover:text-white"
                                    onClick={() => handleSort('clubsCount')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Clubs
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-center text-sm font-medium text-slate-400 cursor-pointer hover:text-white"
                                    onClick={() => handleSort('skatersCount')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Skaters
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : states.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                        No states found
                                    </td>
                                </tr>
                            ) : (
                                states.map((state, index) => (
                                    <motion.tr
                                        key={state.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-slate-700/30 hover:bg-slate-700/20"
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedStates.includes(state.id)}
                                                onChange={() => toggleSelect(state.id)}
                                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                    <Globe className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <span className="font-medium text-white">{state.state_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs font-mono rounded">
                                                {state.code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-slate-300">{state.districtsCount}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-slate-300">{state.clubsCount}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-slate-300">{state.skatersCount}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingState(state)}
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(state.id)}
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
                                className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
