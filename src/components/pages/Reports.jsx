import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import StatsCard from '@/components/molecules/StatsCard';
import ApperIcon from '@/components/ApperIcon';
import { reportService } from '@/services/api/reportService';

const Reports = () => {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await reportService.getReportData();
        setReports(data);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const reportStats = [
    {
      title: 'Total Contractors',
      value: reports.totalContractors || 0,
      change: '+5 this month',
      icon: 'Users',
      trend: 'up'
    },
    {
      title: 'Active Departments',
      value: reports.activeDepartments || 0,
      change: '12 departments',
      icon: 'Building2',
      trend: 'neutral'
    },
    {
      title: 'Monthly Spend',
      value: `$${(reports.monthlySpend || 0).toLocaleString()}`,
      change: '+12% vs last month',
      icon: 'DollarSign',
      trend: 'up'
    },
    {
      title: 'Avg. Contract Length',
      value: `${reports.avgContractLength || 0} days`,
      change: '180 days average',
      icon: 'Calendar',
      trend: 'neutral'
    }
  ];

  const quickReports = [
    {
      title: 'Contractor Summary',
      description: 'Active contractors by department and status',
      icon: 'Users',
      action: 'Generate'
    },
    {
      title: 'Budget Analysis',
      description: 'Monthly spending and budget utilization',
      icon: 'DollarSign',
      action: 'Generate'
    },
    {
      title: 'Timesheet Report',
      description: 'Hours worked and overtime analysis',
      icon: 'Clock',
      action: 'Generate'
    },
    {
      title: 'Performance Metrics',
      description: 'KPIs and contractor performance data',
      icon: 'BarChart3',
      action: 'Generate'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Generate and analyze contractor management reports and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportStats.map((stat, index) => (
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Quick Reports</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickReports.map((report) => (
                <motion.div
                  key={report.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <ApperIcon name={report.icon} className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{report.title}</h4>
                      <p className="text-xs text-gray-500">{report.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {report.action}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Recent Downloads</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <ApperIcon name="FileText" className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Monthly Report {i + 1}</p>
                      <p className="text-xs text-gray-500">Downloaded 2 hours ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ApperIcon name="Download" className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Reports;