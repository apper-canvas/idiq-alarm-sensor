import { motion } from 'framer-motion';
import DashboardStats from '@/components/organisms/DashboardStats';
import RecentActivity from '@/components/organisms/RecentActivity';
import PendingApprovals from '@/components/organisms/PendingApprovals';

const Dashboard = () => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <PendingApprovals />
      </div>
    </motion.div>
  );
};

export default Dashboard;