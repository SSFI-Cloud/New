'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Menu as MenuIcon,
    Layout,
    Link as LinkIcon,
    MoreVertical,
    Edit,
    Trash2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useMenus } from '@/lib/hooks/useCMS';
import { Menu, MenuLocation, MENU_LOCATIONS } from '@/types/cms';

export default function MenusPage() {
    const { fetchMenus, isLoading } = useMenus();
    const [menus, setMenus] = useState<Menu[]>([]);

    useEffect(() => {
        loadMenus();
    }, []);

    const loadMenus = async () => {
        try {
            const data = await fetchMenus();
            setMenus(data);
        } catch (err) {
            console.error('Failed to load menus', err);
        }
    };

    const getLocationLabel = (location: MenuLocation) => {
        return MENU_LOCATIONS.find(l => l.value === location)?.label || location;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Navigation Menus
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage your site's header, footer, and sidebar navigation
                    </p>
                </div>
                <Link
                    href="/dashboard/cms/menus/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Menu</span>
                </Link>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-40 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse" />
                    ))}
                </div>
            ) : menus.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                        <MenuIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        No Menus Configured
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                        Configure your website navigation menus here.
                    </p>
                    <Link
                        href="/dashboard/cms/menus/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Menu</span>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menus.map((menu) => (
                        <motion.div
                            key={menu.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Layout className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={`/dashboard/cms/menus/${menu.id}`}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                {menu.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {getLocationLabel(menu.location)}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <LinkIcon className="w-4 h-4" />
                                    <span>{menu.items.length} items</span>
                                </div>
                                {menu.isActive ? (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                                        <CheckCircle className="w-3 h-3" />
                                        Active
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                        <XCircle className="w-3 h-3" />
                                        Inactive
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
