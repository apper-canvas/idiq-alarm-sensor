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
import { requisitionService } from '@/services/api/requisitionService';

const RequisitionsList = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await requisitionService.getAll();
      setRequisitions(data);
    } catch (err) {
      setError('Failed to load requisitions. Please try again.');
      console.error('Error loading requisitions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequisitions();
  }, []);

  const filteredRequisitions = requisitions.filter(requisition => {
    const matchesSearch = requisition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         requisition.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         requisition.requester.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || requisition.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Loading variant="table" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load requisitions"
        message={error}
        onRetry={loadRequisitions}
      />
    );
  }

  if (requisitions.length === 0) {
    return (
      <Empty
        title="No requisitions found"
        message="Get started by creating your first contractor requisition."
        icon="FileText"
        actionLabel="Create Requisition"
        onAction={() => console.log('Create requisition clicked')}
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
          placeholder="Search requisitions..."
          className="w-full md:w-96"
        />
        
        <div className="flex items-center gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="filled">Filled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <Button variant="primary" className="flex items-center gap-2">
            <ApperIcon name="Plus" className="w-4 h-4" />
            Create Requisition
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Requisition</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Department</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Requester</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Skills Required</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Budget Range</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequisitions.map((requisition) => (
                  <motion.tr
                    key={requisition.Id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    transition={{ duration: 0.15 }}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{requisition.title}</p>
                        <p className="text-sm text-gray-500">Created {formatDate(requisition.createdDate)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{requisition.department}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{requisition.requester}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {requisition.skillsRequired.slice(0, 3).map((skill, index) => (
                          <span key={index} className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                        {requisition.skillsRequired.length > 3 && (
                          <span className="text-xs text-gray-500">+{requisition.skillsRequired.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">${requisition.budgetRange.min} - ${requisition.budgetRange.max}</p>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={requisition.status} type="requisition" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="Eye" className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="Edit" className="w-4 h-4" />
                        </Button>
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

      {filteredRequisitions.length === 0 && requisitions.length > 0 && (
        <Empty
          title="No requisitions match your search"
          message="Try adjusting your search criteria or status filter."
          icon="Search"
          showAction={false}
        />
      )}
    </motion.div>
  );
};

export default RequisitionsList;