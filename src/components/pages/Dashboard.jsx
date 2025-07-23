import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardStats from '@/components/organisms/DashboardStats';
import RecentActivity from '@/components/organisms/RecentActivity';
import PendingApprovals from '@/components/organisms/PendingApprovals';
import DepartmentBreakdown from '@/components/organisms/DepartmentBreakdown';
import MonthlyTrends from '@/components/organisms/MonthlyTrends';
import { dashboardService } from '@/services/api/dashboardService';
const Dashboard = () => {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const data = await dashboardService.getReportData();
        setReportData(data);
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your contractors.</p>
      </div>

      <DashboardStats />

      {/* Report Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DepartmentBreakdown data={reportData} loading={loading} />
        <MonthlyTrends data={reportData} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <PendingApprovals />
      </div>
    </motion.div>
  );
};

export default Dashboard;