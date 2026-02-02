'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Image as ImageIcon,
    Video,
    MoreVertical,
    Edit,
    Trash2,
    FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { useGalleryAlbums } from '@/lib/hooks/useCMS';
import { GalleryAlbum } from '@/types/cms';
import { getStatusConfig } from '@/types/cms';

export default function GalleryPage() {
    const { fetchAlbums, isLoading, error } = useGalleryAlbums();
    const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadAlbums();
    }, []);

    const loadAlbums = async () => {
        try {
            const result = await fetchAlbums();
            // Handle pagination object response
            if (result && 'data' in result && Array.isArray(result.data)) {
                setAlbums(result.data);
            } else if (Array.isArray(result)) {
                setAlbums(result);
            } else {
                setAlbums([]);
            }
        } catch (err) {
            console.error('Failed to load albums', err);
        }
    };

    const filteredAlbums = albums.filter(album =>
        album.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Media Gallery
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Organize your photos and videos into albums
                    </p>
                </div>
                <Link
                    href="/dashboard/cms/gallery/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Album</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search albums..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-[250px] animate-pulse" />
                    ))}
                </div>
            ) : filteredAlbums.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                        <FolderOpen className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        No Albums Found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                        Create an album to start uploading photos and videos.
                    </p>
                    {!searchQuery && (
                        <Link
                            href="/dashboard/cms/gallery/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Album</span>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAlbums.map((album) => {
                        const status = getStatusConfig(album.status);
                        return (
                            <motion.div
                                key={album.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -5 }}
                                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all"
                            >
                                {/* Cover Image */}
                                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900 group">
                                    <img
                                        src={album.coverImage}
                                        alt={album.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Empty+Album';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                                            {album.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-white/80 text-sm">
                                            <div className="flex items-center gap-1">
                                                <ImageIcon className="w-4 h-4" />
                                                <span>{album._count?.items || 0} items</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30`}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions Overlay */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/dashboard/cms/gallery/${album.id}`}
                                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-100 rounded-lg backdrop-blur-sm transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
