'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    CheckCircle,
    XCircle,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Clock,
    User,
    Phone,
    Mail,
    Calendar,
    MapPin,
    Shield,
    FileText,
    X,
    Check,
    AlertTriangle,
} from 'lucide-react';

// Types
interface PendingStudent {
    id: number;
    membership_id: string;
    full_name: string;
    father_name: string;
    mobile_number: string;
    email_address: string;
    date_of_birth: string;
    gender: string;
    category_name: string;
    club_name: string;
    club_id: number;
    district_name: string;
    state_name: string;
    aadhar_number: string;
    identity_proof: string;
    profile_photo: string;
    created_at: string;
}

// Mock data
const mockPendingStudents: PendingStudent[] = [
    { id: 100, membership_id: 'SSFI/BS/TN/25/S0100', full_name: 'RAHUL KUMAR', father_name: 'SURESH KUMAR', mobile_number: '9876543210', email_address: 'rahul.kumar@gmail.com', date_of_birth: '2015-05-15', gender: 'Male', category_name: 'Speed Quad', club_name: 'RARS OOTY', club_id: 151, district_name: 'Nilgiris', state_name: 'Tamil Nadu', aadhar_number: '****5678', identity_proof: '/uploads/id_proof_100.jpg', profile_photo: '/uploads/photo_100.jpg', created_at: '2025-01-25' },
    { id: 101, membership_id: 'SSFI/BS/TN/25/S0101', full_name: 'PRIYA SHARMA', father_name: 'RAJESH SHARMA', mobile_number: '9988776655', email_address: 'priya.sharma@gmail.com', date_of_birth: '2016-08-22', gender: 'Female', category_name: 'Speed Inline', club_name: 'PS SPORTS ARENA KARUR', club_id: 87, district_name: 'Karur', state_name: 'Tamil Nadu', aadhar_number: '****1234', identity_proof: '/uploads/id_proof_101.jpg', profile_photo: '/uploads/photo_101.jpg', created_at: '2025-01-24' },
    { id: 102, membership_id: 'SSFI/BS/TN/25/S0102', full_name: 'ARJUN REDDY', father_name: 'VENKAT REDDY', mobile_number: '8877665544', email_address: 'arjun.reddy@gmail.com', date_of_birth: '2014-12-10', gender: 'Male', category_name: 'Speed Quad', club_name: 'MM TIGERS SKATING ACADEMY', club_id: 58, district_name: 'Tiruvallur', state_name: 'Tamil Nadu', aadhar_number: '****9012', identity_proof: '/uploads/id_proof_102.jpg', profile_photo: '/uploads/photo_102.jpg', created_at: '2025-01-23' },
    { id: 103, membership_id: 'SSFI/BS/KA/25/S0001', full_name: 'SNEHA PATIL', father_name: 'MAHESH PATIL', mobile_number: '7766554433', email_address: 'sneha.patil@gmail.com', date_of_birth: '2017-03-08', gender: 'Female', category_name: 'Recreational Inline', club_name: 'BENGALURU SKATING CLUB', club_id: 180, district_name: 'Bengaluru', state_name: 'Karnataka', aadhar_number: '****3456', identity_proof: '/uploads/id_proof_103.jpg', profile_photo: '/uploads/photo_103.jpg', created_at: '2025-01-22' },
];

export default function StudentApprovalsPage() {
    const [students, setStudents] = useState<PendingStudent[]>(mockPendingStudents);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [viewingStudent, setViewingStudent] = useState<PendingStudent | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedForReject, setSelectedForReject] = useState<PendingStudent | null>(null);
    const itemsPerPage = 10;

    // Filter students
    const filteredStudents = students.filter(student =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.membership_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.mobile_number.includes(searchQuery)
    );

    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleApprove = async (student: PendingStudent) => {
        setProcessingId(student.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStudents(prev => prev.filter(s => s.id !== student.id));
        setProcessingId(null);
        setViewingStudent(null);
    };

    const handleReject = async () => {
        if (!selectedForReject) return;
        setProcessingId(selectedForReject.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStudents(prev => prev.filter(s => s.id !== selectedForReject.id));
        setProcessingId(null);
        setShowRejectModal(false);
        setSelectedForReject(null);
        setRejectReason('');
        setViewingStudent(null);
    };

    const openRejectModal = (student: PendingStudent) => {
        setSelectedForReject(student);
        setShowRejectModal(true);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Speed Quad': return 'bg-blue-500/20 text-blue-400';
            case 'Speed Inline': return 'bg-green-500/20 text-green-400';
            case 'Recreational Inline': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Student Approvals</h1>
                    <p className="text-slate-400 mt-1">Review and approve pending student registrations</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{students.length} Pending</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, ID, or mobile..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Student</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Club</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Location</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Submitted</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : paginatedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400 opacity-50" />
                                        <p>No pending approvals</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedStudents.map((student, index) => (
                                    <motion.tr
                                        key={student.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-slate-700/30 hover:bg-slate-700/20"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${student.gender === 'Male' ? 'bg-cyan-500/20' : 'bg-pink-500/20'}`}>
                                                    <User className={`w-5 h-5 ${student.gender === 'Male' ? 'text-cyan-400' : 'text-pink-400'}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{student.full_name}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{student.membership_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(student.category_name)}`}>
                                                {student.category_name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-white">{student.club_name}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-slate-300">{student.district_name}</p>
                                            <p className="text-xs text-slate-500">{student.state_name}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-slate-400">{new Date(student.created_at).toLocaleDateString('en-IN')}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewingStudent(student)}
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(student)}
                                                    disabled={processingId === student.id}
                                                    className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 hover:text-green-300 disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    {processingId === student.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(student)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-4 h-4" />
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
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Detail Modal */}
            <AnimatePresence>
                {viewingStudent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setViewingStudent(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${viewingStudent.gender === 'Male' ? 'bg-cyan-500/20' : 'bg-pink-500/20'}`}>
                                        <User className={`w-7 h-7 ${viewingStudent.gender === 'Male' ? 'text-cyan-400' : 'text-pink-400'}`} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{viewingStudent.full_name}</h2>
                                        <p className="text-blue-400 font-mono text-sm">{viewingStudent.membership_id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setViewingStudent(null)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Father's Name</p>
                                        <p className="font-medium text-white">{viewingStudent.father_name}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Date of Birth</p>
                                        <p className="font-medium text-white">{new Date(viewingStudent.date_of_birth).toLocaleDateString('en-IN')} ({calculateAge(viewingStudent.date_of_birth)} yrs)</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Mobile</p>
                                        <p className="font-medium text-white">{viewingStudent.mobile_number}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Email</p>
                                        <p className="font-medium text-white text-sm truncate">{viewingStudent.email_address}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Category</p>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(viewingStudent.category_name)}`}>
                                            {viewingStudent.category_name}
                                        </span>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-slate-400 mb-1">Aadhaar</p>
                                        <p className="font-medium text-white font-mono">{viewingStudent.aadhar_number}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4 col-span-2">
                                        <p className="text-sm text-slate-400 mb-1">Club</p>
                                        <p className="font-medium text-white">{viewingStudent.club_name}</p>
                                        <p className="text-sm text-slate-400">{viewingStudent.district_name}, {viewingStudent.state_name}</p>
                                    </div>
                                </div>

                                {/* Document Preview */}
                                <div>
                                    <p className="text-sm font-medium text-slate-400 mb-3">Documents</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                                            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                            <p className="text-sm text-white">Identity Proof</p>
                                            <button className="text-xs text-blue-400 mt-1">View Document</button>
                                        </div>
                                        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                                            <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                            <p className="text-sm text-white">Profile Photo</p>
                                            <button className="text-xs text-blue-400 mt-1">View Photo</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t border-slate-700">
                                    <button
                                        onClick={() => handleApprove(viewingStudent)}
                                        disabled={processingId === viewingStudent.id}
                                        className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processingId === viewingStudent.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Approve
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => openRejectModal(viewingStudent)}
                                        className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 font-medium flex items-center justify-center gap-2"
                                    >
                                        <X className="w-5 h-5" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && selectedForReject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowRejectModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-800 rounded-2xl max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white text-center mb-2">Reject Registration</h3>
                                <p className="text-slate-400 text-center mb-6">
                                    Are you sure you want to reject <span className="text-white font-medium">{selectedForReject.full_name}</span>'s registration?
                                </p>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Reason for rejection</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Enter reason (optional)"
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowRejectModal(false)}
                                        className="flex-1 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={processingId === selectedForReject.id}
                                        className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processingId === selectedForReject.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Reject'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
