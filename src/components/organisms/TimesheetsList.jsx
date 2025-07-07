import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import StatusBadge from '@/components/molecules/StatusBadge';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { timesheetService } from '@/services/api/timesheetService';

const TimesheetsList = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await timesheetService.getAll();
      setTimesheets(data);
    } catch (err) {
      setError('Failed to load timesheets. Please try again.');
      console.error('Error loading timesheets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimesheets();
  }, []);

  const filteredTimesheets = timesheets.filter(timesheet => {
    const matchesSearch = timesheet.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timesheet.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || timesheet.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatWeekRange = (weekStartDate) => {
    const start = new Date(weekStartDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  if (loading) {
    return <Loading variant="table" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load timesheets"
        message={error}
        onRetry={loadTimesheets}
      />
    );
  }

  if (timesheets.length === 0) {
    return (
      <Empty
        title="No timesheets found"
        message="Timesheets will appear here once contractors start submitting their hours."
        icon="Clock"
        showAction={false}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search timesheets..."
          className="w-full md:w-96"
        />
        
        <div className="flex items-center gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
          </select>
          
          <Button variant="primary" className="flex items-center gap-2">
            <ApperIcon name="Download" className="w-4 h-4" />
            Export Timesheets
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Contractor</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Week Period</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Total Hours</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Overtime Hours</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Approver</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTimesheets.map((timesheet) => (
                  <motion.tr
                    key={timesheet.Id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    transition={{ duration: 0.15 }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-full flex items-center justify-center">
                          <ApperIcon name="User" className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{timesheet.contractorName}</p>
                          <p className="text-sm text-gray-500">{timesheet.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{formatWeekRange(timesheet.weekStartDate)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-900">{timesheet.totalHours} hrs</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{timesheet.overtimeHours} hrs</p>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={timesheet.status} type="timesheet" />
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{timesheet.approverName}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="Eye" className="w-4 h-4" />
                        </Button>
                        {timesheet.status === 'submitted' && (
                          <>
                            <Button variant="accent" size="sm">
                              <ApperIcon name="Check" className="w-4 h-4" />
                            </Button>
                            <Button variant="danger" size="sm">
                              <ApperIcon name="X" className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="MoreHorizontal" className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredTimesheets.length === 0 && timesheets.length > 0 && (
        <Empty
          title="No timesheets match your search"
          message="Try adjusting your search criteria or status filter."
          icon="Search"
          showAction={false}
        />
      )}
    </motion.div>
  );
};

export default TimesheetsList;