'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Globe,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Linkedin,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { useSiteSettings } from '@/lib/hooks/useCMS';
import { SiteSettings } from '@/types/cms';

export default function SettingsPage() {
    const { fetchSettings, updateSettings, isLoading } = useSiteSettings();
    const [settings, setSettings] = useState<SiteSettings>({});
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const data = await fetchSettings();
        if (data) setSettings(data);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            await updateSettings(settings);
            setMessage({ type: 'success', text: 'Settings updated successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update settings' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && !settings.siteName) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Site Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Configure general information and global contacts
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <div className="w-2 h-2 rounded-full bg-green-500" /> : <AlertTriangle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                {/* General Info */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">General Information</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Site Name</label>
                            <input
                                type="text"
                                value={settings.siteName || ''}
                                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tagline</label>
                            <input
                                type="text"
                                value={settings.siteTagline || ''}
                                onChange={e => setSettings({ ...settings, siteTagline: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <Mail className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Contact Details</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={settings.contactEmail || ''}
                                    onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={settings.contactPhone || ''}
                                    onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <textarea
                                    rows={3}
                                    value={settings.address || ''}
                                    onChange={e => setSettings({ ...settings, address: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <Facebook className="w-5 h-5 text-blue-800" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Social Media</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Facebook URL</label>
                            <input
                                type="text"
                                value={settings.socialLinks?.facebook || ''}
                                onChange={e => setSettings({
                                    ...settings,
                                    socialLinks: { ...settings.socialLinks, facebook: e.target.value }
                                })}
                                placeholder="https://facebook.com/..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Twitter (X) URL</label>
                            <input
                                type="text"
                                value={settings.socialLinks?.twitter || ''}
                                onChange={e => setSettings({
                                    ...settings,
                                    socialLinks: { ...settings.socialLinks, twitter: e.target.value }
                                })}
                                placeholder="https://twitter.com/..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Instagram URL</label>
                            <input
                                type="text"
                                value={settings.socialLinks?.instagram || ''}
                                onChange={e => setSettings({
                                    ...settings,
                                    socialLinks: { ...settings.socialLinks, instagram: e.target.value }
                                })}
                                placeholder="https://instagram.com/..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">LinkedIn URL</label>
                            <input
                                type="text"
                                value={settings.socialLinks?.linkedin || ''}
                                onChange={e => setSettings({
                                    ...settings,
                                    socialLinks: { ...settings.socialLinks, linkedin: e.target.value }
                                })}
                                placeholder="https://linkedin.com/..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>Save Settings</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
