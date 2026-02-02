'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Search,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/hooks/useAuth';

interface StateSecretary {
    id: string;
    uid: string;
    name: string;
    email: string;
    phone: string;
    state: {
        name: string;
        code: string;
    };
    registrationWindowId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

export default function StateSecretariesApprovalPage() {
    const { token } = useAuth();
    const [secretaries, setSecretaries] = useState<StateSecretary[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED
    const [search, setSearch] = useState('');

    const fetchSecretaries = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5001/api/v1/state-secretaries', {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: filter === 'ALL' ? undefined : filter, search }
            });
            if (response.data.status === 'success') {
                setSecretaries(response.data.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch secretaries', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchSecretaries();
    }, [token, filter, search]);

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        if (!confirm(`Are you sure you want to ${status} this application?`)) return;

        setActionLoading(id);
        try {
            await axios.put(`http://localhost:5001/api/v1/state-secretaries/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchSecretaries();
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">State Secretary Approvals</h1>
                    <p className="text-slate-400">Manage state secretary registrations</p>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, or State..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : secretaries.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
                    <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No {filter.toLowerCase()} applications found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {secretaries.map((sec) => (
                        <motion.div
                            key={sec.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold text-white">{sec.name}</h3>
                                    <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-mono">
                                        {sec.uid}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${sec.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            sec.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                        }`}>
                                        {sec.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> {sec.email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> {sec.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-white font-medium mt-1">
                                        <MapPin className="w-4 h-4 text-blue-400" /> State: {sec.state.name} ({sec.state.code})
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4" /> Applied: {new Date(sec.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {sec.status === 'PENDING' && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleAction(sec.id, 'APPROVED')}
                                        disabled={actionLoading === sec.id}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg border border-green-500/50 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === sec.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(sec.id, 'REJECTED')}
                                        disabled={actionLoading === sec.id}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/50 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === sec.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                        Reject
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
