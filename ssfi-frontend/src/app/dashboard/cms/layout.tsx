'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    FileText,
    Newspaper,
    Image as ImageIcon,
    Menu as MenuIcon,
    Settings,
    Megaphone
} from 'lucide-react';

const navItems = [
    { href: '/dashboard/cms', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/cms/pages', label: 'Pages', icon: FileText },
    { href: '/dashboard/cms/news', label: 'News', icon: Newspaper },
    { href: '/dashboard/cms/banners', label: 'Banners', icon: Megaphone },
    { href: '/dashboard/cms/gallery', label: 'Gallery', icon: ImageIcon },
    { href: '/dashboard/cms/menus', label: 'Menus', icon: MenuIcon },
    { href: '/dashboard/cms/settings', label: 'Settings', icon: Settings },
];

export default function CMSLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white">Content Management</h1>
                <p className="text-slate-400">Manage your website content, news, and media</p>
            </div>

            <div className="border-b border-slate-700">
                <nav className="flex gap-4 overflow-x-auto pb-2">
                    {navItems.map((item) => {
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="min-h-[calc(100vh-200px)]">
                {children}
            </div>
        </div>
    );
}
