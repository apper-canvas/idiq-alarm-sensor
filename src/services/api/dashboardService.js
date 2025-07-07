import dashboardData from '@/services/mockData/dashboard.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
  async getStats() {
    await delay(400);
    return { ...dashboardData.stats };
  },

  async getRecentActivity() {
    await delay(350);
    return [...dashboardData.recentActivity];
  },

  async getPendingApprovals() {
    await delay(300);
    return [...dashboardData.pendingApprovals];
  }
};