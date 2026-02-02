'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    Download,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Loader2,
    CheckCircle,
    Clock,
    User,
    X,
    Trophy,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/hooks/useAuth';

// Types
interface Student {
    id: number;
    ssfi_id: string; // membership_id mapped to ssfi_id
    name: string; // full_name mapped to name
    father_name: string;
    mobile: string; // mobile_number mapped to mobile
    email: string; // email_address mapped to email
    dob: string; // date_of_birth mapped to dob
    gender: string;
    category_name?: string; // Optional/Mapped to N/A
    club_name: string;
    club_id: number;
    district_name: string;
    state_name: string;
    coach_name: string;
    approval_status: string; // verified mapped to approval_status
    profile_image: string;
    created_at: string;
}

interface ApiResponse {
    status: string;
    data: {
        students: Student[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

const categories = ['Speed Quad', 'Speed Inline', 'Recreational Inline', 'Adjustable/Tenacity'];

export default function StudentsPage() {
    const { token } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');
    const [sortField, setSortField] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({
        totalStudents: 0,
        verifiedStudents: 0,
        pendingStudents: 0,
        maleStudents: 0,
        femaleStudents: 0
    });

    const fetchStudents = async () => {
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
            // if (categoryFilter !== 'all') params.category = categoryFilter; // Backend support needed

            if (verificationFilter === 'verified') params.status = 'APPROVED';
            if (verificationFilter === 'pending') params.status = 'PENDING';

            const response = await axios.get<ApiResponse>('http://localhost:5001/api/v1/students', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.status === 'success') {
                const { students: data, meta } = response.data.data;
                setStudents(data);
                setTotalPages(meta.totalPages);

                // Stats approximation
                setStats({
                    totalStudents: meta.total,
                    verifiedStudents: data.filter(s => s.approval_status === 'APPROVED').length,
                    pendingStudents: data.filter(s => s.approval_status === 'PENDING').length,
                    maleStudents: data.filter(s => s.gender === 'MALE').length, // Enum match
                    femaleStudents: data.filter(s => s.gender === 'FEMALE').length
                });
            }
        } catch (err: any) {
            console.error('Error fetching students:', err);
            setError(err.response?.data?.message || 'Failed to fetch students');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (token) fetchStudents();
        }, 500);
        return () => clearTimeout(timer);
    }, [token, currentPage, searchQuery, categoryFilter, verificationFilter, sortField, sortOrder]);


    // Calculate age from DOB
    const calculateAge = (dob: string) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getCategoryColor = (category: string) => {
        // Placeholder logic
        switch (category) {
            case 'Speed Quad': return 'bg-blue-500/20 text-blue-400';
            case 'Speed Inline': return 'bg-green-500/20 text-green-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    const getGenderIcon = (gender: string) => {
        return gender === 'MALE' ? 'text-cyan-400' : 'text-pink-400';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Students Management</h1>
                    <p className="text-slate-400 mt-1">Manage all registered skaters</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <Link
                        href="/dashboard/students/new"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Student
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
                            <p className="text-sm text-slate-400">Total</p>
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
                            <p className="text-2xl font-bold text-white">{stats.verifiedStudents}+</p>
                            <p className="text-sm text-slate-400">Verified</p>
                        </div>
                    </div>
                </motion.div>

                {/* ... Other stats */}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, ID, or mobile..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                    <option value="all">All Categories</option>
                    {/* Categories list */}
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
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500" />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('membership_id')}>
                                    <div className="flex items-center gap-2">ID <ArrowUpDown className="w-4 h-4" /></div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">Student <ArrowUpDown className="w-4 h-4" /></div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Club</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-slate-400">Age</th>
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
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">No students found</td>
                                </tr>
                            ) : (
                                students.map((student, index) => (
                                    <motion.tr
                                        key={student.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-slate-700/30 hover:bg-slate-700/20"
                                    >
                                        <td className="px-4 py-3">
                                            <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm text-blue-400">{student.ssfi_id}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${student.gender === 'MALE' ? 'bg-cyan-500/20' : 'bg-pink-500/20'}`}>
                                                    <User className={`w-5 h-5 ${getGenderIcon(student.gender)}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{student.name}</p>
                                                    <p className="text-sm text-slate-400">{student.gender}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-500/20 text-slate-400">
                                                N/A
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm text-white">{student.club_name}</p>
                                                <p className="text-xs text-slate-400">{student.district_name}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-white font-medium">{calculateAge(student.dob)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {student.approval_status === 'APPROVED' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                                    <CheckCircle className="w-3 h-3" /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setViewingStudent(student)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {/* Other actions mapped similarly */}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Logic */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-slate-700 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-slate-400">Page {currentPage} of {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-slate-700 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {viewingStudent && (
                    <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewingStudent(null)}>
                        <motion.div className="bg-slate-800 rounded-2xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">{viewingStudent.name}</h2>
                                <button onClick={() => setViewingStudent(null)}><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 text-sm">Father Name</p>
                                    <p className="text-white">{viewingStudent.father_name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">DOB</p>
                                    <p className="text-white">{viewingStudent.dob}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Mobile</p>
                                    <p className="text-white">{viewingStudent.mobile}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Email</p>
                                    <p className="text-white">{viewingStudent.email}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Coach</p>
                                    <p className="text-white">{viewingStudent.coach_name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Club</p>
                                    <p className="text-white">{viewingStudent.club_name}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
