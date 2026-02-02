'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { getStatusColor } from '@/lib/utils/status';

// ==========================================
// STAT CARD
// ==========================================

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'slate';
  trend?: { value: number; isPositive: boolean };
  href?: string;
  delay?: number;
}

const colorVariants = {
  blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
  green: 'from-green-500/20 to-emerald-500/20 text-green-400',
  purple: 'from-purple-500/20 to-pink-500/20 text-purple-400',
  amber: 'from-amber-500/20 to-orange-500/20 text-amber-400',
  red: 'from-red-500/20 to-rose-500/20 text-red-400',
  slate: 'from-slate-500/20 to-slate-600/20 text-slate-400',
};

export function StatCard({ title, value, icon: Icon, color, trend, href, delay = 0 }: StatCardProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 ${href ? 'hover:border-slate-600 cursor-pointer transition-colors' : ''
        }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorVariants[color]} opacity-30`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value.toLocaleString()}</p>
          {trend && (
            <p className={`mt-1 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorVariants[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// ==========================================
// PENDING APPROVAL CARD
// ==========================================

interface PendingApprovalCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  href: string;
  delay?: number;
}

export function PendingApprovalCard({ title, count, icon: Icon, href, delay = 0 }: PendingApprovalCardProps) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors cursor-pointer"
      >
        <div className="p-2 rounded-lg bg-amber-500/20">
          <Icon className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-lg font-semibold text-white">{count} pending</p>
        </div>
        <div className="text-amber-400">→</div>
      </motion.div>
    </Link>
  );
}

// ==========================================
// RECENT LIST
// ==========================================

interface RecentListProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  href?: string;
  delay?: number;
}

export function RecentList<T>({
  title,
  items,
  renderItem,
  emptyMessage = 'No items to display',
  href,
  delay = 0,
}: RecentListProps<T>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <h3 className="font-semibold text-white">{title}</h3>
        {href && (
          <Link href={href} className="text-sm text-blue-400 hover:text-blue-300">
            View all →
          </Link>
        )}
      </div>
      <div className="divide-y divide-slate-700/50">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="p-4 hover:bg-slate-700/20 transition-colors">
              {renderItem(item, index)}
            </div>
          ))
        ) : (
          <p className="p-4 text-center text-slate-500">{emptyMessage}</p>
        )}
      </div>
    </motion.div>
  );
}

// ==========================================
// STATUS BADGE
// ==========================================

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colors = getStatusColor(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`rounded-full font-medium ${colors.bg} ${colors.text} ${sizeClasses}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ==========================================
// CHART CARD
// ==========================================

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

export function ChartCard({ title, children, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6"
    >
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

// ==========================================
// SIMPLE BAR CHART
// ==========================================

interface SimpleBarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}

export function SimpleBarChart({ data, maxValue }: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">{item.label}</span>
            <span className="text-white font-medium">{item.value}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`h-full rounded-full ${item.color || 'bg-blue-500'}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// DONUT CHART
// ==========================================

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function DonutChart({ data, size = 160 }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="20" />
        {data.map((item, index) => {
          const percentage = item.value / total;
          const strokeDasharray = `${percentage * 251.2} 251.2`;
          const strokeDashoffset = -currentAngle * 251.2 / 360;
          currentAngle += percentage * 360;

          return (
            <circle
              key={index}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={item.color}
              strokeWidth="20"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
              className="transition-all duration-500"
            />
          );
        })}
        <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-2xl font-bold fill-white">
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-slate-400">{item.label}</span>
            <span className="text-sm text-white font-medium ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// QUICK ACTION BUTTON
// ==========================================

interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'amber';
}

export function QuickAction({ title, description, icon: Icon, href, color }: QuickActionProps) {
  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 hover:border-green-500/40 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40 text-purple-400',
    amber: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40 text-amber-400',
  };

  return (
    <Link href={href}>
      <div className={`p-4 rounded-xl border ${colors[color]} transition-colors cursor-pointer`}>
        <Icon className="w-6 h-6 mb-2" />
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </Link>
  );
}
