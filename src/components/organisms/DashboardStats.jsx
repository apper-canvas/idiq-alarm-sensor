import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatsCard from '@/components/molecules/StatsCard';
import { dashboardService } from '@/services/api/dashboardService';

const DashboardStats = () => {
  const [stats, setStats] = useState({});
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardService.getStats();
        const reports = await dashboardService.getReportData();
        setStats(data);
        setReportData(reports);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

const statsData = [
    {
      title: 'Active Contractors',
      value: stats.activeContractors || 0,
      change: '+12% from last month',
      icon: 'Users',
      trend: 'up'
    },
    {
      title: 'Inactive Contractors',
      value: stats.inactiveContractors || 0,
      change: '2 contracts ended',
      icon: 'UserX',
      trend: 'neutral'
    },
    {
      title: 'Pending Requisitions',
      value: stats.pendingRequisitions || 0,
      change: '3 new this week',
      icon: 'FileText',
      trend: 'neutral'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals || 0,
      change: '2 urgent',
      icon: 'Clock',
      trend: 'down'
    },
    {
      title: 'Monthly Budget',
      value: `$${(stats.monthlyBudget || 0).toLocaleString()}`,
      change: '+8% from last month',
      icon: 'DollarSign',
      trend: 'up'
    }
  ];

  return (
<motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
    >
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatsCard
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            trend={stat.trend}
            loading={loading}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardStats;