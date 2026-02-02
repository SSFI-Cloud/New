'use client';
import { useState, useCallback } from 'react';
import { api } from '@/lib/api/client';

export interface DashboardStats {
    totalStates?: number;
    totalDistricts?: number;
    totalClubs?: number;
    totalStudents?: number;
    totalEvents?: number;
}

export interface PendingApprovals {
    stateSecretaries?: number;
    districtSecretaries?: number;
    clubs?: number;
    students?: number;
    total?: number;
}

export interface RecentActivity {
    students?: any[];
    clubs?: any[];
    events?: any[];
}

export interface Statistics {
    studentsByStatus?: Record<string, number>;
    studentsByGender?: Record<string, number>;
    eventsByStatus?: Record<string, number>;
    registrationsByMonth?: Array<{ month: string; count: number }>;
}

export interface DashboardData {
    role?: string;
    overview?: DashboardStats;
    pendingApprovals?: PendingApprovals;
    recentActivity?: RecentActivity;
    statistics?: Statistics;
    upcomingEvents?: any[];
    club?: any;
    profile?: any;
    membership?: any;
    eventRegistrations?: any[];
    stats?: any;
}

export const useDashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.get('/dashboard');
            if (response.data?.success) {
                setData(response.data.data);
            } else {
                setError(response.data?.message || 'Failed to load dashboard');
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        data,
        isLoading,
        error,
        fetchDashboard,
        refetch: fetchDashboard,
    };
};

export default useDashboard;
