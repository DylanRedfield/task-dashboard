import { DashboardStats } from '@/lib/api';
import { FiCheckCircle, FiClock, FiAlertCircle, FiList } from 'react-icons/fi';

interface StatsPanelProps {
  stats: DashboardStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total_tasks,
      icon: FiList,
      color: 'blue',
    },
    {
      label: 'In Progress',
      value: stats.in_progress_tasks,
      icon: FiClock,
      color: 'yellow',
    },
    {
      label: 'Completed',
      value: stats.completed_tasks,
      icon: FiCheckCircle,
      color: 'green',
    },
    {
      label: 'Blocked',
      value: stats.blocked_tasks,
      icon: FiAlertCircle,
      color: 'red',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${colorMap[stat.color]}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
