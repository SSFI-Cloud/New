'use client';

import Link from 'next/link';
import { ArrowRight, FileText, Newspaper, Image, Settings } from 'lucide-react';

const modules = [
    {
        title: 'News & Announcements',
        description: 'Manage news articles, press releases, and updates.',
        icon: Newspaper,
        href: '/dashboard/cms/news',
        color: 'bg-blue-500',
    },
    {
        title: 'Static Pages',
        description: 'Create and edit static content pages like About Us, TERMS.',
        icon: FileText,
        href: '/dashboard/cms/pages',
        color: 'bg-purple-500',
    },
    {
        title: 'Gallery & Media',
        description: 'Manage photo albums, videos, and media assets.',
        icon: Image,
        href: '/dashboard/cms/gallery',
        color: 'bg-pink-500',
    },
    {
        title: 'Site Settings',
        description: 'Configure global site settings, SEO, and contact info.',
        icon: Settings,
        href: '/dashboard/cms/settings',
        color: 'bg-slate-500',
    },
];

export default function CMSOverviewPage() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <Link
                        key={module.title}
                        href={module.href}
                        className="group relative overflow-hidden bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all hover:-translate-y-1"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${module.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`} />

                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-xl ${module.color} bg-opacity-20 flex items-center justify-center mb-4`}>
                                <module.icon className={`w-6 h-6 ${module.color.replace('bg-', 'text-')}`} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                            <p className="text-slate-400 mb-4 h-10">{module.description}</p>

                            <div className="flex items-center text-sm font-medium text-white group-hover:gap-2 transition-all">
                                Access Module <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
