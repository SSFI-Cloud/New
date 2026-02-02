import {
    Globe,
    MapPin,
    Building2,
    Users,
    Trophy,
} from 'lucide-react';
import { StatCard } from '../../shared/DashboardComponents';
import { DashboardOverview } from '@/types/dashboard';

interface StatsSectionProps {
    overview: DashboardOverview;
}

export function StatsSection({ overview }: StatsSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
                title="Total States"
                value={overview.totalStates || 0}
                icon={Globe}
                color="blue"
                href="/dashboard/states"
                delay={0}
            />
            <StatCard
                title="Total Districts"
                value={overview.totalDistricts || 0}
                icon={MapPin}
                color="green"
                href="/dashboard/districts"
                delay={0.1}
            />
            <StatCard
                title="Total Clubs"
                value={overview.totalClubs || 0}
                icon={Building2}
                color="purple"
                href="/dashboard/clubs"
                delay={0.2}
            />
            <StatCard
                title="Total Students"
                value={overview.totalStudents || 0}
                icon={Users}
                color="amber"
                href="/dashboard/students"
                delay={0.3}
            />
            <StatCard
                title="Total Events"
                value={overview.totalEvents || 0}
                icon={Trophy}
                color="red"
                href="/dashboard/events"
                delay={0.4}
            />
        </div>
    );
}
