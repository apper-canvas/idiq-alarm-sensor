import dashboardData from '@/services/mockData/dashboard.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
async getStats() {
    await delay(400);
    
// Note: contractors.json not available, using default value
    // TODO: Add contractors data source when available
    const inactiveContractors = 0;
    
    return { 
      ...dashboardData.stats,
      inactiveContractors
    };
  },

  async getRecentActivity() {
    await delay(350);
    return [...dashboardData.recentActivity];
  },

  async getPendingApprovals() {
    await delay(300);
    return [...dashboardData.pendingApprovals];
  },

  async getReportData() {
    await delay(500);
    const { default: reportData } = await import('@/services/mockData/reports.json');
    return { ...reportData };
  }
};