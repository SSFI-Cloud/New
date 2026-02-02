'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Users,
    MapPin,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Filter,
    PieChart,
    Activity,
    IndianRupee,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/hooks/useAuth';

// Chart Components (Custom implementations to avoid heavy deps)
const BarChart = ({ data, color = 'bg-blue-500' }: { data: number[], color?: string }) => {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end justify-between h-32 gap-1 pt-4">
            {data.map((value, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-full">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(value / max) * 100}%` }}
                        className={`w-full rounded-t-sm ${color} opacity-80 hover:opacity-100 transition-opacity min-h-[4px]`}
                    />
                </div>
            ))}
        </div>
    );
};

const LineChart = ({ data, color = '#3b82f6' }: { data: number[], color?: string }) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="h-32 w-full pt-4 relative overflow-hidden">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <motion.polyline
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                />
                <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    d={`M0,100 ${points.split(' ').map((p, i) => i === 0 ? `L${p}` : `L${p}`).join(' ')} L100,100 Z`}
                    fill={color}
                    stroke="none"
                />
            </svg>
        </div>
    );
};

export default function ReportsPage() {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false); // Mock loading for instant feel or real fetch

    // Mock Data for Reports
    // Real implementation would fetch /api/v1/reports/dashboard
    const stats = {
        totalRegistrations: 1250,
        registrationsGrowth: 15,
        totalRevenue: 450000,
        revenueGrowth: 8.5,
        activeEvents: 12,
        activeClubs: 45
    };

    const registrationTrend = [45, 60, 75, 50, 80, 95, 110, 90, 105, 120, 140, 125]; // Monthly
    const revenueTrend = [15000, 22000, 18000, 25000, 30000, 28000, 35000, 40000, 38000, 42000, 50000, 48000];

    // State Performance Mock
    const statePerformance = [
        { name: 'Tamil Nadu', students: 450, clubs: 15, revenue: 150000, trend: 'up' },
        { name: 'Karnataka', students: 380, clubs: 12, revenue: 125000, trend: 'up' },
        { name: 'Kerala', students: 250, clubs: 8, revenue: 85000, trend: 'down' },
        { name: 'Maharashtra', students: 120, clubs: 5, revenue: 45000, trend: 'up' },
        { name: 'Delhi', students: 50, clubs: 2, revenue: 20000, trend: 'stable' }
    ];

    useEffect(() => {
        // Here we could fetch real stats
    }, [token]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
                    <p className="text-slate-400 mt-1">Comprehensive overview of association performance</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 border border-slate-700">
                        <Calendar className="w-4 h-4" />
                        <span>Last 30 Days</span>
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Total Registrations</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{stats.totalRegistrations}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-400">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="font-medium">+{stats.registrationsGrowth}%</span>
                        <span className="text-slate-500 ml-1">vs last month</span>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-white mt-1">₹{(stats.totalRevenue / 100000).toFixed(2)}L</h3>
                        </div>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <IndianRupee className="w-5 h-5 text-green-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-400">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="font-medium">+{stats.revenueGrowth}%</span>
                        <span className="text-slate-500 ml-1">vs last month</span>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Active Events</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{stats.activeEvents}</h3>
                        </div>
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Calendar className="w-5 h-5 text-amber-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Activity className="w-4 h-4" />
                        <span>Running currently</span>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Active Clubs</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{stats.activeClubs}</h3>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Filter className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-400">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>+2 new this week</span>
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-lg font-bold text-white mb-4">Registration Trends</h3>
                    <BarChart data={registrationTrend} color="bg-blue-500" />
                    <div className="flex justify-between mt-4 text-xs text-slate-500">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-lg font-bold text-white mb-4">Revenue Overview</h3>
                    <LineChart data={revenueTrend} color="#10b981" />
                    <div className="flex justify-between mt-4 text-xs text-slate-500">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </motion.div>
            </div>

            {/* Detailed Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">State-wise Performance</h3>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All Results</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-800/80 text-xs text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4 text-left font-semibold">State</th>
                                <th className="px-6 py-4 text-left font-semibold">Students</th>
                                <th className="px-6 py-4 text-left font-semibold">Active Clubs</th>
                                <th className="px-6 py-4 text-left font-semibold">Revenue</th>
                                <th className="px-6 py-4 text-right font-semibold">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {statePerformance.map((state, i) => (
                                <tr key={i} className="hover:bg-slate-700/20">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-500" />
                                            <span className="text-white font-medium">{state.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{state.students}</td>
                                    <td className="px-6 py-4 text-slate-300">{state.clubs}</td>
                                    <td className="px-6 py-4 text-slate-300">₹{state.revenue.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-right">
                                        {state.trend === 'up' && <span className="text-green-400 text-xs font-bold inline-flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Up</span>}
                                        {state.trend === 'down' && <span className="text-red-400 text-xs font-bold inline-flex items-center"><ArrowDownRight className="w-3 h-3 mr-1" /> Down</span>}
                                        {state.trend === 'stable' && <span className="text-amber-400 text-xs font-bold inline-flex items-center"><Activity className="w-3 h-3 mr-1" /> Stable</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
