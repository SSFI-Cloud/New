'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Image as ImageIcon,
    Calendar,
    Eye,
    Edit,
    Trash2,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useBanners } from '@/lib/hooks/useCMS';
import { Banner, BannerPosition } from '@/types/cms';
import { getStatusConfig, BANNER_POSITIONS, formatDate } from '@/types/cms';

export default function BannersPage() {
    const { fetchBanners, isLoading, error } = useBanners();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [positionFilter, setPositionFilter] = useState<string>('all');

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        try {
            const data = await fetchBanners();
            setBanners(data);
        } catch (err) {
            console.error('Failed to load banners', err);
        }
    };

    const filteredBanners = banners.filter(banner => {
        const matchesSearch = banner.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPosition = positionFilter === 'all' || banner.position === positionFilter;
        return matchesSearch && matchesPosition;
    });

    const getPositionLabel = (position: BannerPosition) => {
        return BANNER_POSITIONS.find(p => p.value === position)?.label || position;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Banners & Sliders
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage your homepage sliders and promotional banners
                    </p>
                </div>
                <Link
                    href="/dashboard/cms/banners/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Banner</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search banners..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Positions</option>
                        {BANNER_POSITIONS.map(pos => (
                            <option key={pos.value} value={pos.value}>{pos.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-[300px] animate-pulse" />
                    ))}
                </div>
            ) : filteredBanners.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        No Banners Found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                        {searchQuery ? "Try adjusting your search or filters." : "Get started by creating your first banner or slider."}
                    </p>
                    {!searchQuery && (
                        <Link
                            href="/dashboard/cms/banners/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Banner</span>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBanners.map((banner) => {
                        const status = getStatusConfig(banner.status);
                        return (
                            <motion.div
                                key={banner.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all"
                            >
                                {/* Image Preview */}
                                <div className="relative aspect-video bg-slate-100 dark:bg-slate-900">
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                                        }}
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${status.color.replace('bg-', 'border-').replace('/20', '/30')} ${status.color} backdrop-blur-sm`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Link
                                            href={`/dashboard/cms/banners/${banner.id}`}
                                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-lg backdrop-blur-sm transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 mb-1">
                                            {banner.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                {getPositionLabel(banner.position)}
                                            </span>
                                            <span>•</span>
                                            <span>Order: {banner.sortOrder}</span>
                                        </div>
                                    </div>

                                    {banner.linkUrl && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                            <ExternalLink className="w-3 h-3" />
                                            <span className="truncate">{banner.linkUrl}</span>
                                        </div>
                                    )}

                                    {banner.startDate && (
                                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(banner.startDate)}</span>
                                            {banner.endDate && (
                                                <>
                                                    <span>-</span>
                                                    <span>{formatDate(banner.endDate)}</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
