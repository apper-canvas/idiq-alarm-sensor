import reportsData from '@/services/mockData/reports.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const reportService = {
  async getReportData() {
    await delay(400);
    return { ...reportsData };
  },

  async generateReport(type, params) {
    await delay(500);
    return {
      success: true,
      reportId: Math.random().toString(36).substr(2, 9),
      downloadUrl: `/api/reports/download/${type}`,
      generatedAt: new Date().toISOString()
    };
  }
};