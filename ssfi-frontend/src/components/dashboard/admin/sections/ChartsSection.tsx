import {
    ChartCard,
    SimpleBarChart,
    DonutChart,
} from '../../shared/DashboardComponents';
import { DashboardStatistics } from '@/types/dashboard';

interface ChartsSectionProps {
    statistics: DashboardStatistics | undefined;
}

export function ChartsSection({ statistics }: ChartsSectionProps) {
    // CRITICAL FIX: Safe access for object/record types coming from backend
    const genderStats = statistics?.studentsByGender || {};
    const statusStats = statistics?.studentsByStatus || {};

    const genderChartData = [
        { label: 'Male', value: genderStats['MALE'] || 0, color: '#3b82f6' },
        { label: 'Female', value: genderStats['FEMALE'] || 0, color: '#ec4899' },
        { label: 'Other', value: genderStats['OTHER'] || 0, color: '#8b5cf6' },
    ];

    const statusChartData = [
        { label: 'Approved', value: statusStats['APPROVED'] || 0, color: 'bg-green-500' },
        { label: 'Pending', value: statusStats['PENDING'] || 0, color: 'bg-amber-500' },
        { label: 'Rejected', value: statusStats['REJECTED'] || 0, color: 'bg-red-500' },
    ];

    const registrationData = (statistics?.registrationsByMonth || []).map((item) => ({
        label: new Date(item.month).toLocaleDateString('en-IN', { month: 'short' }),
        value: item.count,
        color: 'bg-blue-500',
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Registration Trend */}
            <ChartCard title="Student Registrations (6 months)" delay={0.6}>
                <div className="h-48">
                    <SimpleBarChart data={registrationData} />
                </div>
            </ChartCard>

            {/* Students by Gender */}
            <ChartCard title="Students by Gender" delay={0.7}>
                <DonutChart data={genderChartData} />
            </ChartCard>

            {/* Students by Status */}
            <ChartCard title="Students by Status" delay={0.8}>
                <SimpleBarChart data={statusChartData} />
            </ChartCard>
        </div>
    );
}
