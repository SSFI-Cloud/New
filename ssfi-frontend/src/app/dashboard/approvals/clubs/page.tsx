'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Search,
    CheckCircle,
    XCircle,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Clock,
    Phone,
    Mail,
    MapPin,
    FileText,
    X,
    Check,
    AlertTriangle,
    Building2,
    Calendar,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/hooks/useAuth';

// Types
interface PendingClub {
    id: number;
    membership_id: string;
    club_name: string;
    contact_person: string;
    mobile_number: string;
    email_address: string;
    registration_number: string;
    established_year: string;
    district_name: string;
    state_name: string;
    club_address: string;
    logo_path: string;
    certificate: string;
    proof: string;
    created_at: string;
    status: string;
}

interface ApiResponse {
    status: string;
    data: {
        clubs: PendingClub[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export default function ClubApprovalsPage() {
    const { token } = useAuth();
    const [clubs, setClubs] = useState<PendingClub[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewingClub, setViewingClub] = useState<PendingClub | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedForReject, setSelectedForReject] = useState<PendingClub | null>(null);
    const itemsPerPage = 10;
    const [totalPending, setTotalPending] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPendingClubs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
                status: 'PENDING', // Fetch only pending clubs
            };
            if (searchQuery) params.search = searchQuery;

            const response = await axios.get<ApiResponse>('http://localhost:5001/api/v1/clubs', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.status === 'success') {
                const { clubs: data, meta } = response.data.data;
                setClubs(data);
                setTotalPages(meta.totalPages);
                setTotalPending(meta.total);
            }
        } catch (err: any) {
            console.error('Error fetching pending clubs:', err);
            // Don't show error on 404/empty, just empty list
            if (err.response?.status !== 404) {
                setError(err.response?.data?.message || 'Failed to fetch pending clubs');
            } else {
                setClubs([]);
                setTotalPending(0);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (token) fetchPendingClubs();
        }, 500);
        return () => clearTimeout(timer);
    }, [token, currentPage, searchQuery]);

    const handleApprove = async (club: PendingClub) => {
        setProcessingId(club.id);
        try {
            await axios.put(`http://localhost:5001/api/v1/clubs/${club.id}/status`,
                { status: 'APPROVED' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh list
            fetchPendingClubs();
            setViewingClub(null);
        } catch (err: any) {
            console.error('Error approving club:', err);
            alert('Failed to approve club');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!selectedForReject) return;
        setProcessingId(selectedForReject.id);
        try {
            await axios.put(`http://localhost:5001/api/v1/clubs/${selectedForReject.id}/status`,
                { status: 'REJECTED', remarks: rejectReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchPendingClubs();
            setShowRejectModal(false);
            setSelectedForReject(null);
            setRejectReason('');
            setViewingClub(null);
        } catch (err: any) {
            console.error('Error rejecting club:', err);
            alert('Failed to reject club');
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectModal = (club: PendingClub) => {
        setSelectedForReject(club);
        setShowRejectModal(true);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Club Approvals</h1>
                    <p className="text-slate-400 mt-1">Review and approve pending club registrations</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{totalPending} Pending</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by club name, ID, or contact..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full py-12 text-center">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                    </div>
                ) : clubs.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400 opacity-50" />
                        <p>No pending club approvals</p>
                    </div>
                ) : (
                    clubs.map((club, index) => (
                        <motion.div
                            key={club.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
                        >
                            <div className="p-4">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                                        <Shield className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-white truncate">{club.club_name}</h3>
                                        <p className="text-xs text-blue-400 font-mono">{club.membership_id}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Building2 className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{club.contact_person}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{club.district_name}, {club.state_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                                        <span className="text-xs text-slate-500">
                                            Submitted {new Date(club.created_at).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 pt-0 flex gap-2">
                                <button
                                    onClick={() => setViewingClub(club)}
                                    className="flex-1 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 text-sm font-medium flex items-center justify-center gap-1"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <button
                                    onClick={() => handleApprove(club)}
                                    disabled={processingId === club.id}
                                    className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                    {processingId === club.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Approve
                                </button>
                                <button
                                    onClick={() => openRejectModal(club)}
                                    className="py-2 px-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm font-medium"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-slate-400 text-sm px-3">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* View Detail Modal - Same as before but data driven */}
            <AnimatePresence>
                {viewingClub && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setViewingClub(null)}
                    >
                        <motion.div className="bg-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between">
                                <h2 className="text-xl font-bold text-white">{viewingClub.club_name}</h2>
                                <button onClick={() => setViewingClub(null)}><X className="text-slate-400" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 text-sm">Contact Person</p>
                                    <p className="text-white">{viewingClub.contact_person}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Mobile</p>
                                    <p className="text-white">{viewingClub.mobile_number}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Email</p>
                                    <p className="text-white">{viewingClub.email_address}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Location</p>
                                    <p className="text-white">{viewingClub.district_name}, {viewingClub.state_name}</p>
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-slate-700">
                                <button
                                    onClick={() => handleApprove(viewingClub)}
                                    disabled={processingId === viewingClub.id}
                                    className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processingId === viewingClub.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Approve</>}
                                </button>
                                <button
                                    onClick={() => openRejectModal(viewingClub)}
                                    className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 font-medium flex items-center justify-center gap-2"
                                >
                                    <X className="w-5 h-5" /> Reject
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && selectedForReject && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div className="bg-slate-800 rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-bold text-white text-center mb-4">Reject Club</h3>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason for rejection..."
                                className="w-full bg-slate-700 text-white rounded p-3 mb-4"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 bg-slate-700 text-white rounded">Cancel</button>
                                <button onClick={handleReject} className="flex-1 py-2 bg-red-500 text-white rounded">Reject</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
