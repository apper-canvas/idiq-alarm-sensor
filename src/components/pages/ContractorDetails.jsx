import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import StatusBadge from '@/components/molecules/StatusBadge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { contractorService } from '@/services/api/contractorService';

const ContractorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContractor();
  }, [id]);

  const loadContractor = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractorService.getById(id);
      setContractor(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (actionName, actionType = 'info') => {
    const messages = {
      'View Profile': 'Profile view functionality coming soon',
      'Edit Details': 'Edit contractor details functionality coming soon',
      'View Timesheet': 'Timesheet view functionality coming soon',
      'Approve Overtime': 'Overtime approval functionality coming soon',
      'Request Extension': 'Contract extension request functionality coming soon',
      'View Performance': 'Performance review functionality coming soon',
      'Update Status': 'Status update functionality coming soon',
      'View Assignment': 'Assignment details functionality coming soon',
      'Submit Timesheet': 'Timesheet submission functionality coming soon',
      'Request Time Off': 'Time off request functionality coming soon',
      'View Schedule': 'Schedule view functionality coming soon',
      'Update Profile': 'Profile update functionality coming soon'
    };

    const message = messages[actionName] || `${actionName} functionality coming soon`;
    
    if (actionType === 'success') {
      toast.success(message);
    } else if (actionType === 'warning') {
      toast.warning(message);
    } else if (actionType === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) return <Loading />;
  if (error) return <Error title="Error Loading Contractor" message={error} onRetry={loadContractor} />;
  if (!contractor) return <Error title="Contractor Not Found" message="The requested contractor could not be found." />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/contractors')}
            className="mb-4 p-0 h-auto font-medium text-secondary hover:text-primary"
          >
            <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
            Back to Contractors
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{contractor.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={contractor.status} />
            <span className="text-gray-600">{contractor.department}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('View Profile')}
          >
            <ApperIcon name="User" size={16} className="mr-2" />
            View Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('Edit Details')}
          >
            <ApperIcon name="Edit" size={16} className="mr-2" />
            Edit Details
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{contractor.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{contractor.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{contractor.phone}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{contractor.department}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Direct Manager
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{contractor.manager}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{formatCurrency(contractor.hourlyRate)}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills & Expertise
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {contractor.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Assignment Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Current Assignment</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workplan
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">
                    {contractor.workplanName || 'No workplan assigned'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{formatDate(contractor.startDate)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{formatDate(contractor.endDate)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days Remaining
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className={`font-medium ${
                    contractor.daysRemaining <= 30 ? 'text-red-600' : 
                    contractor.daysRemaining <= 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {contractor.daysRemaining} days
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-Based Actions Panel */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resource Team Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Resource Team</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAction('View Timesheet')}
                  >
                    <ApperIcon name="Clock" size={16} className="mr-2" />
                    View Timesheet
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAction('Approve Overtime')}
                  >
                    <ApperIcon name="CheckCircle" size={16} className="mr-2" />
                    Approve Overtime
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAction('Request Extension')}
                  >
                    <ApperIcon name="Calendar" size={16} className="mr-2" />
                    Request Extension
                  </Button>
                </div>
              </div>

              {/* Supervisor Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Supervisor</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAction('View Performance')}
                  >
                    <ApperIcon name="TrendingUp" size={16} className="mr-2" />
                    View Performance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAction('Update Status')}
                  >
                    <ApperIcon name="Settings" size={16} className="mr-2" />
                    Update Status
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAction('View Assignment')}
                  >
                    <ApperIcon name="Briefcase" size={16} className="mr-2" />
                    View Assignment
                  </Button>
                </div>
              </div>

              {/* Contractor Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Contractor</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAction('Submit Timesheet')}
                  >
                    <ApperIcon name="FileText" size={16} className="mr-2" />
                    Submit Timesheet
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAction('Request Time Off')}
                  >
                    <ApperIcon name="Calendar" size={16} className="mr-2" />
                    Request Time Off
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAction('View Schedule')}
                  >
                    <ApperIcon name="CalendarDays" size={16} className="mr-2" />
                    View Schedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAction('Update Profile')}
                  >
                    <ApperIcon name="User" size={16} className="mr-2" />
                    Update Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default ContractorDetails;