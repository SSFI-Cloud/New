'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Plus,
    Search,
    // Filter, // Unused
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
    Shield,
    AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/hooks/useAuth';

// Types
interface District {
    id: number;
    district_name: string;
    code: string;
    state_id: number;
    state_name: string;
    state_code: string;
    clubsCount: number;
    skatersCount: number;
    eventsCount: number;
    created_at: string;
}

interface ApiResponse {
    status: string;
    data: {
        districts: District[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

// Mock states for filter (Ideally request from API)
const mockStates = [
    { id: 23, state_name: 'Tamil Nadu', code: 'TN' },
    { id: 11, state_name: 'Karnataka', code: 'KA' },
    { id: 14, state_name: 'Maharashtra', code: 'MH' },
    { id: 12, state_name: 'Kerala', code: 'KL' },
];

export default function DistrictsPage() {
    const { user, token } = useAuth();
    const [districts, setDistricts] = useState<District[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [stateFilter, setStateFilter] = useState<number | 'all'>('all');
    const [sortField, setSortField] = useState<keyof District>('district_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stats
    const [stats, setStats] = useState({
        totalDistricts: 0,
        totalClubs: 0,
        totalSkaters: 0,
        totalEvents: 0
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
    const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);

    const fetchDistricts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // In a real app, query params would be constructed here
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
                sortField,
                sortOrder,
            };
            if (searchQuery) params.search = searchQuery;
            if (stateFilter !== 'all') params.stateId = stateFilter;

            const response = await axios.get<ApiResponse>('http://localhost:5001/api/v1/districts', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.status === 'success') {
                const { districts: data, meta } = response.data.data;
                setDistricts(data);
                setTotalPages(meta.totalPages);

                // Calculate stats from current page (Approximation, ideally backend provides separate stats endpoint)
                // For accurate total stats we might need a separate endpoint or meta
                // Using total count from meta for districts
                const currentStats = {
                    totalDistricts: meta.total, // Total districts across all pages
                    totalClubs: data.reduce((acc, d) => acc + d.clubsCount, 0), // Current page only - limitation
                    totalSkaters: data.reduce((acc, d) => acc + d.skatersCount, 0),
                    totalEvents: data.reduce((acc, d) => acc + d.eventsCount, 0),
                };
                // For consistency, we might just display what we have or request summary stats
                setStats(currentStats);
            }
        } catch (err: any) {
            console.error('Error fetching districts:', err);
            setError(err.response?.data?.message || 'Failed to fetch districts');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            console.log('DistrictsPage: useEffect triggered', { token: !!token, searchQuery, stateFilter, currentPage });
            if (token) {
                fetchDistricts();
            } else {
                console.log('DistrictsPage: No token, skipping fetch');
                setIsLoading(false); // Stop loading if no token (though ideally redirect)
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [token, currentPage, searchQuery, stateFilter, sortField, sortOrder]);


    const handleSort = (field: keyof District) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const toggleSelectAll = () => {
        if (selectedDistricts.length === districts.length) {
            setSelectedDistricts([]);
        } else {
            setSelectedDistricts(districts.map(d => d.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedDistricts(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure?')) return;
        // API call to delete
    };

    // Re-calculate local totals for display if needed, but we used api stats
    const totalClubs = districts.reduce((acc, d) => acc + d.clubsCount, 0); // View only
    const totalSkaters = districts.reduce((acc, d) => acc + d.skatersCount, 0);
    const totalEvents = districts.reduce((acc, d) => acc + d.eventsCount, 0);


    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Districts Management</h1>
                    <p className="text-slate-400 mt-1">Manage districts across all states</p>
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
                        Add District
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Stats Cards - Showing metadata totals if possible, else current view sums */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalDistricts}</p>
                            <p className="text-sm text-slate-400">Total Districts</p>
                        </div>
                    </div>
                </motion.div>

                {/* Placeholder stats for now as backend aggregate is not strictly available on listing API without extra queries */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{totalClubs}+</p>
                            <p className="text-sm text-slate-400">Active Clubs</p>
                        </div>
                    </div>
                </motion.div>
                {/* ... other stats ... */}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search districts..."
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
                                        checked={selectedDistricts.length === districts.length && districts.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                                    />
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-medium text-slate-400 cursor-pointer hover:text-white"
                                    onClick={() => handleSort('district_name')}
                                >
                                    <div className="flex items-center gap-2">
                                        District Name
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-medium text-slate-400 cursor-pointer hover:text-white"
                                    onClick={() => handleSort('state_name')}
                                >
                                    <div className="flex items-center gap-2">
                                        State
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
                                {/* 
                <th
                  className="px-4 py-3 text-center text-sm font-medium text-slate-400 cursor-pointer hover:text-white"
                  onClick={() => handleSort('eventsCount')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Events
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                */}
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
                            ) : districts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                        No districts found
                                    </td>
                                </tr>
                            ) : (
                                districts.map((district, index) => (
                                    <motion.tr
                                        key={district.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-slate-700/30 hover:bg-slate-700/20"
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedDistricts.includes(district.id)}
                                                onChange={() => toggleSelect(district.id)}
                                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-4 h-4 text-purple-400" />
                                                </div>
                                                <span className="font-medium text-white">{district.district_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs font-mono rounded">
                                                    {district.state_code}
                                                </span>
                                                <span className="text-slate-400">{district.state_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-slate-300">{district.clubsCount}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-slate-300">{district.skatersCount}</span>
                                        </td>
                                        {/*
                    <td className="px-4 py-3 text-center">
                      <span className="text-slate-300">{district.eventsCount}</span>
                    </td>
                    */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingDistrict(district)}
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(district.id)}
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

                {/* Pagination - Simplified for now, backend pagination available */}
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
