'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Calendar,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePages } from '@/lib/hooks/useCMS';
import { Page, PageFormData } from '@/types/cms';
import { getStatusConfig, PAGE_TEMPLATES, formatDate } from '@/types/cms';

export default function PagesPage() {
    const { fetchPages, isLoading, error } = usePages();
    const [pages, setPages] = useState<Page[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        try {
            const result = await fetchPages();
            // Handle pagination object response
            if (result && 'data' in result && Array.isArray(result.data)) {
                setPages(result.data);
            } else if (Array.isArray(result)) {
                setPages(result);
            } else {
                setPages([]);
            }
        } catch (err) {
            console.error('Failed to load pages', err);
        }
    };

    const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTemplateLabel = (template: string) => {
        return PAGE_TEMPLATES.find(t => t.value === template)?.label || template;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Static Pages
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage static content like About Us, Privacy Policy, etc.
                    </p>
                </div>
                <Link
                    href="/dashboard/cms/pages/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Page</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : filteredPages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            No Pages Found
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                            Create your first page to get started.
                        </p>
                        {!searchQuery && (
                            <Link
                                href="/dashboard/cms/pages/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Page</span>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Page Title</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Template</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Last Updated</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredPages.map((page) => {
                                    const status = getStatusConfig(page.status);
                                    return (
                                        <motion.tr
                                            key={page.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-1">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white">{page.title}</div>
                                                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                                            <LinkIcon className="w-3 h-3" />
                                                            <span>/{page.slug}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {getTemplateLabel(page.template)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color.replace('bg-', 'border-').replace('/20', '/30')} ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {formatDate(page.updatedAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/page/${page.slug}`}
                                                        target="_blank"
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="View Page"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/cms/pages/${page.id}`}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Edit Page"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete Page"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
