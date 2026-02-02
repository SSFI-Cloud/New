import { motion } from 'framer-motion';
import {
    MapPin,
    Building2,
    Users,
    UserPlus,
    Bell,
} from 'lucide-react';
import { PendingApprovalCard } from '../../shared/DashboardComponents';
import { PendingApprovals } from '@/types/dashboard';

interface ApprovalsSectionProps {
    approvals: PendingApprovals | undefined;
}

export function ApprovalsSection({ approvals }: ApprovalsSectionProps) {
    if (!approvals || (approvals.total || 0) === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                Pending Approvals ({approvals.total})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(approvals.stateSecretaries || 0) > 0 && (
                    <PendingApprovalCard
                        title="State Secretaries"
                        count={approvals.stateSecretaries || 0}
                        icon={MapPin}
                        href="/dashboard/approvals/state-secretaries"
                        delay={0}
                    />
                )}
                {(approvals.districtSecretaries || 0) > 0 && (
                    <PendingApprovalCard
                        title="District Secretaries"
                        count={approvals.districtSecretaries || 0}
                        icon={Building2}
                        href="/dashboard/approvals/district-secretaries"
                        delay={0.1}
                    />
                )}
                {(approvals.clubs || 0) > 0 && (
                    <PendingApprovalCard
                        title="Clubs"
                        count={approvals.clubs || 0}
                        icon={Users}
                        href="/dashboard/approvals/clubs"
                        delay={0.2}
                    />
                )}
                {(approvals.students || 0) > 0 && (
                    <PendingApprovalCard
                        title="Students"
                        count={approvals.students || 0}
                        icon={UserPlus}
                        href="/dashboard/approvals/students"
                        delay={0.3}
                    />
                )}
            </div>
        </motion.div>
    );
}
