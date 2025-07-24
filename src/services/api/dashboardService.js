import dashboardData from '@/services/mockData/dashboard.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
async getStats() {
    await delay(400);
    
    // Import contractors data to calculate inactive count
    const contractorsData = await import('@/services/mockData/contractors.json');
    const contractors = contractorsData.default;
    
    // Count inactive contractors
    const inactiveContractors = contractors.filter(contractor => contractor.status === 'inactive').length;
    
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