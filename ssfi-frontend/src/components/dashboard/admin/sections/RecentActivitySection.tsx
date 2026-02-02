import {
    Building2,
    Trophy,
} from 'lucide-react';
import {
    RecentList,
    StatusBadge,
} from '../../shared/DashboardComponents';
import { AdminDashboardData } from '@/types/dashboard';

interface RecentActivitySectionProps {
    recentActivity: AdminDashboardData['recentActivity'];
}

export function RecentActivitySection({ recentActivity }: RecentActivitySectionProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Students */}
            <RecentList
                title="Recent Students"
                items={recentActivity?.students || []}
                href="/dashboard/students"
                delay={0.9}
                renderItem={(student: any) => (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                            {student.name ? student.name.charAt(0) : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                                {student.name}
                            </p>
                            <p className="text-sm text-slate-500 truncate">
                                {student.club?.name || 'No club'}
                            </p>
                        </div>
                        <StatusBadge status={student.user?.approvalStatus || 'PENDING'} />
                    </div>
                )}
            />

            {/* Recent Clubs */}
            <RecentList
                title="Recent Clubs"
                items={recentActivity?.clubs || []}
                href="/dashboard/clubs"
                delay={1.0}
                renderItem={(club: any) => (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{club.name}</p>
                            <p className="text-sm text-slate-500 truncate">
                                {club.district?.name || 'Unknown district'}
                            </p>
                        </div>
                        <StatusBadge status={club.status} />
                    </div>
                )}
            />

            {/* Recent Events */}
            <RecentList
                title="Recent Events"
                items={recentActivity?.events || []}
                href="/dashboard/events"
                delay={1.1}
                renderItem={(event: any) => (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{event.name}</p>
                            <p className="text-sm text-slate-500">
                                {new Date(event.eventDate).toLocaleDateString('en-IN')} • {event._count?.registrations || 0} registered
                            </p>
                        </div>
                        <StatusBadge status={event.status} />
                    </div>
                )}
            />
        </div>
    );
}
