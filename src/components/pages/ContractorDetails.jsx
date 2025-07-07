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

      {/* Financial Information Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Financial Information</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('View Invoice System', 'info')}
            >
              <ApperIcon name="FileText" size={16} className="mr-2" />
              View Invoices
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(contractor.hourlyRate)}
                </span>
                <span className="text-sm text-gray-600">/hour</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Value
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(contractor.hourlyRate * 40 * 12)}
                </span>
                <span className="text-sm text-gray-600">total</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remaining Value
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl font-bold text-accent">
                  {formatCurrency((contractor.hourlyRate * 40 * contractor.daysRemaining) / 7)}
                </span>
                <span className="text-sm text-gray-600">approx.</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">Current</span>
                </div>
                <span className="text-xs text-gray-600">Last payment: 2 days ago</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position History Section */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Position History</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Position */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {contractor.workplanName || 'Current Assignment'}
                  </h3>
                  <p className="text-sm text-gray-600">{contractor.department}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={contractor.status} />
                  <p className="text-sm text-gray-600 mt-1">Current</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Start Date
                  </label>
                  <span className="text-sm text-gray-900">{formatDate(contractor.startDate)}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    End Date
                  </label>
                  <span className="text-sm text-gray-900">{formatDate(contractor.endDate)}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Duration
                  </label>
                  <span className="text-sm text-gray-900">
                    {Math.ceil((new Date(contractor.endDate) - new Date(contractor.startDate)) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Reporting Manager
                </label>
                <span className="text-sm text-gray-900">{contractor.manager}</span>
              </div>
            </div>

            {/* Previous Positions Placeholder */}
            <div className="border-l-4 border-gray-300 pl-4 opacity-60">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-600">Previous Assignments</h3>
                  <p className="text-sm text-gray-500">No previous positions on record</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">Historical</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment & Access Section */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Equipment & Access</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* System Access */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ApperIcon name="Shield" size={20} className="text-blue-600 mr-2" />
                      <span className="font-medium text-gray-900">Active Directory</span>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-sm text-gray-600">Domain access granted</p>
                  <p className="text-xs text-gray-500 mt-1">Last login: 2 hours ago</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ApperIcon name="Mail" size={20} className="text-green-600 mr-2" />
                      <span className="font-medium text-gray-900">Email System</span>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-sm text-gray-600">Exchange Online access</p>
                  <p className="text-xs text-gray-500 mt-1">Account: {contractor.email}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ApperIcon name="Database" size={20} className="text-purple-600 mr-2" />
                      <span className="font-medium text-gray-900">Project Database</span>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-sm text-gray-600">Read/Write permissions</p>
                  <p className="text-xs text-gray-500 mt-1">Last access: 1 day ago</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ApperIcon name="Cloud" size={20} className="text-orange-600 mr-2" />
                      <span className="font-medium text-gray-900">AWS Console</span>
                    </div>
                    <StatusBadge status="pending" />
                  </div>
                  <p className="text-sm text-gray-600">Access request submitted</p>
                  <p className="text-xs text-gray-500 mt-1">Pending IT approval</p>
                </div>
              </div>
            </div>

            {/* Equipment Assignment */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ApperIcon name="Laptop" size={20} className="text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">Laptop</span>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-sm text-gray-600">Dell Latitude 5520</p>
                  <p className="text-xs text-gray-500 mt-1">Asset ID: LAP-2024-0156</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ApperIcon name="Smartphone" size={20} className="text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">Mobile Device</span>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-sm text-gray-600">iPhone 14 Pro</p>
                  <p className="text-xs text-gray-500 mt-1">Phone: {contractor.phone}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ApperIcon name="CreditCard" size={20} className="text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">Access Card</span>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-sm text-gray-600">Building access granted</p>
                  <p className="text-xs text-gray-500 mt-1">Card ID: AC-{contractor.Id.toString().padStart(4, '0')}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ApperIcon name="Key" size={20} className="text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">VPN Access</span>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-sm text-gray-600">Remote access enabled</p>
                  <p className="text-xs text-gray-500 mt-1">Certificate expires: 90 days</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContractorDetails;