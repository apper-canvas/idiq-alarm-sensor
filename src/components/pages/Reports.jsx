import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import StatsCard from '@/components/molecules/StatsCard';
import ApperIcon from '@/components/ApperIcon';
import { reportService } from '@/services/api/reportService';
import { cvSubmissionService } from '@/services/api/cvSubmissionService';

const Reports = () => {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
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

    const loadSubmissions = async () => {
      try {
        const data = await cvSubmissionService.getAll();
        setSubmissions(data);
      } catch (error) {
        console.error('Error loading submissions:', error);
      } finally {
        setSubmissionsLoading(false);
      }
    };

    Promise.all([loadReports(), loadSubmissions()]);
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

  // Group submissions by agency (currentCompany)
  const submissionsByAgency = submissions.reduce((acc, submission) => {
    const agency = submission.currentCompany || 'Unknown Agency';
    if (!acc[agency]) {
      acc[agency] = [];
    }
    acc[agency].push(submission);
    return acc;
  }, {});

  const agencyStats = Object.entries(submissionsByAgency).map(([agency, agencySubmissions]) => {
    const statusCounts = agencySubmissions.reduce((counts, sub) => {
      counts[sub.status] = (counts[sub.status] || 0) + 1;
      return counts;
    }, {});

    return {
      agency,
      totalSubmissions: agencySubmissions.length,
      statusCounts,
      avgRate: agencySubmissions.reduce((sum, sub) => sum + (sub.rate || 0), 0) / agencySubmissions.length,
      submissions: agencySubmissions
    };
  }).sort((a, b) => b.totalSubmissions - a.totalSubmissions);

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'info';
      case 'reviewing': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'secondary';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

      {/* Section 7: Submissions by Agency */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Submissions by Agency</h2>
              <p className="text-sm text-gray-600 mt-1">CV submissions grouped by agency with status breakdown</p>
            </div>
            <Badge variant="info">{Object.keys(submissionsByAgency).length} Agencies</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {submissionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Loader2" className="w-4 h-4 animate-spin text-secondary" />
                <span className="text-sm text-gray-600">Loading submissions...</span>
              </div>
            </div>
          ) : agencyStats.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Building2" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Agency Submissions</h3>
              <p className="text-gray-600">No CV submissions from agencies have been received yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {agencyStats.map((agencyStat, index) => (
                <motion.div
                  key={agencyStat.agency}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Building2" className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{agencyStat.agency}</h3>
                        <p className="text-sm text-gray-600">
                          {agencyStat.totalSubmissions} submissions • Avg rate: ${agencyStat.avgRate.toFixed(2)}/hr
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {Object.entries(agencyStat.statusCounts).map(([status, count]) => (
                        <Badge key={status} variant={getStatusColor(status)} size="sm">
                          {status}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {agencyStat.submissions.map((submission) => (
                      <motion.div
                        key={submission.Id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <ApperIcon name="FileText" className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {submission.fileName}
                            </span>
                          </div>
                          <Badge variant={getStatusColor(submission.status)} size="sm">
                            {submission.status}
                          </Badge>
                        </div>
                        
                        {submission.ticketTitle && (
                          <p className="text-xs text-secondary font-medium mb-2 truncate">
                            {submission.ticketTitle}
                          </p>
                        )}
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Rate:</span>
                            <span className="font-medium">${submission.rate}/hr</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Availability:</span>
                            <span className="font-medium">{submission.availability}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Size:</span>
                            <span className="font-medium">{formatFileSize(submission.fileSize)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Submitted:</span>
                            <span className="font-medium">
                              {new Date(submission.uploadDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {submission.qualificationAnalysis && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">TOR Match:</span>
                              <span className="text-xs font-medium text-gray-900">
                                {submission.qualificationAnalysis.torComparison?.matchPercentage || 0}%
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Reports;