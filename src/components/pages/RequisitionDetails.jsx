import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { requisitionService } from '@/services/api/requisitionService';

const RequisitionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [agencyFilters, setAgencyFilters] = useState({
    location: '',
    specialization: '',
    rating: ''
  });

  // Mock agency data for the management panel
  const mockAgencies = [
    { Id: 1, name: "TechStaff Solutions", location: "New York", specialization: "Technology", rating: 4.8, status: "Active", lastContact: "2024-02-20" },
    { Id: 2, name: "Finance Experts", location: "London", specialization: "Finance", rating: 4.6, status: "Pending", lastContact: "2024-02-18" },
    { Id: 3, name: "Creative Minds", location: "San Francisco", specialization: "Design", rating: 4.9, status: "Active", lastContact: "2024-02-15" }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'filled', label: 'Filled' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    loadRequisition();
  }, [id]);

  const loadRequisition = async () => {
    try {
      setLoading(true);
      const data = await requisitionService.getById(id);
      setRequisition(data);
      setStatus(data.status);
    } catch (error) {
      console.error('Error loading requisition:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    // In a real implementation, this would update the backend
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Requisition not found</p>
        <Button onClick={() => navigate('/requisitions')} className="mt-4">
          Back to Requisitions
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/requisitions')}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Requisitions
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{requisition.title}</h1>
            <p className="text-gray-600">Requisition #{requisition.Id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={status}
            onValueChange={handleStatusChange}
            className="w-48"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button variant="outline" size="sm">
            <ApperIcon name="Edit" size={16} />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Information Panel */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ApperIcon name="Info" size={20} />
                Basic Information
              </h2>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Department</label>
                <p className="text-gray-900">{requisition.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Requester</label>
                <p className="text-gray-900">{requisition.requester}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Budget Range</label>
                <p className="text-gray-900">${requisition.budgetRange.min}k - ${requisition.budgetRange.max}k</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Urgency</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  requisition.urgency === 'high' ? 'bg-red-100 text-red-800' :
                  requisition.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {requisition.urgency.charAt(0).toUpperCase() + requisition.urgency.slice(1)}
                </span>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 mt-1">{requisition.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: People Involved */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ApperIcon name="Users" size={20} />
                People Involved
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <ApperIcon name="User" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{requisition.requester}</p>
                      <p className="text-sm text-gray-600">Hiring Manager</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <ApperIcon name="UserCheck" size={20} className="text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">Sarah Wilson</p>
                      <p className="text-sm text-gray-600">HR Representative</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Attached Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ApperIcon name="FileText" size={20} />
                  Attached Documents
                </h2>
                <Button size="sm" variant="outline">
                  <ApperIcon name="Upload" size={16} />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ApperIcon name="File" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No documents uploaded yet</p>
                <p className="text-sm text-gray-500">Drag and drop files here or click to browse</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Position Requirements Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ApperIcon name="CheckSquare" size={20} />
                Position Requirements
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Required Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {requisition.skillsRequired.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Additional Requirements</label>
                  <p className="text-gray-900">5+ years of experience in enterprise software development. Strong communication skills and ability to work in a fast-paced environment.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Section 5: Timeline & Key Dates */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ApperIcon name="Calendar" size={20} />
                Timeline & Key Dates
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-gray-600">{requisition.createdDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Approval Target</p>
                    <p className="text-xs text-gray-600">2024-03-01</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-xs text-gray-600">2024-03-15</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Agency Management Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ApperIcon name="Building" size={20} />
                  Agency Management
                </h2>
                <Button
                  size="sm"
                  onClick={() => setShowAgencyModal(true)}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Plus" size={16} />
                  Invite
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAgencies.map((agency) => (
                  <div key={agency.Id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{agency.name}</p>
                        <p className="text-xs text-gray-600">{agency.location}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        agency.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {agency.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <ApperIcon name="Star" size={12} className="text-yellow-500" />
                        <span className="text-xs text-gray-600">{agency.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">{agency.lastContact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agency Invitation Modal */}
      {showAgencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Invite Agencies</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAgencyModal(false)}
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>
            </div>

            <div className="p-6">
              {/* Quick Stats Widget */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">24</p>
                  <p className="text-sm text-gray-600">Available Agencies</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">18</p>
                  <p className="text-sm text-gray-600">Qualified</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">4.2</p>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                </div>
              </div>

              {/* Filters and Sorting Options */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Select
                    value={agencyFilters.location}
                    onValueChange={(value) => setAgencyFilters(prev => ({ ...prev, location: value }))}
                    className="w-full"
                  >
                    <option value="">All Locations</option>
                    <option value="new-york">New York</option>
                    <option value="london">London</option>
                    <option value="san-francisco">San Francisco</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <Select
                    value={agencyFilters.specialization}
                    onValueChange={(value) => setAgencyFilters(prev => ({ ...prev, specialization: value }))}
                    className="w-full"
                  >
                    <option value="">All Specializations</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="design">Design</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <Select
                    value={agencyFilters.rating}
                    onValueChange={(value) => setAgencyFilters(prev => ({ ...prev, rating: value }))}
                    className="w-full"
                  >
                    <option value="">All Ratings</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <Input
                    placeholder="Search agencies..."
                    className="w-full"
                  />
                </div>
              </div>

              {/* Agency List (Basic Structure) */}
              <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-700">
                    <div>Agency Name</div>
                    <div>Location</div>
                    <div>Rating</div>
                    <div>Actions</div>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {mockAgencies.map((agency) => (
                    <div key={agency.Id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <div>
                          <p className="font-medium">{agency.name}</p>
                          <p className="text-sm text-gray-600">{agency.specialization}</p>
                        </div>
                        <div className="text-sm text-gray-600">{agency.location}</div>
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Star" size={16} className="text-yellow-500" />
                          <span className="text-sm">{agency.rating}</span>
                        </div>
                        <div>
                          <Button size="sm" variant="outline">
                            Invite
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAgencyModal(false)}>
                Cancel
              </Button>
              <Button>
                Send Invitations
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default RequisitionDetails;