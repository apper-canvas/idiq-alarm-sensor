import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Select from '@/components/atoms/Select';
import Label from '@/components/atoms/Label';
import Button from '@/components/atoms/Button';
import { Card, CardContent, CardHeader } from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Error from '@/components/ui/Error';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import StatusBadge from '@/components/molecules/StatusBadge';
import SearchBar from '@/components/molecules/SearchBar';
import { overtimeService } from '@/services/api/overtimeService';
import { contractorService } from '@/services/api/contractorService';

const OvertimeManagement = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Form states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalAction, setApprovalAction] = useState('');
  const [approvalComments, setApprovalComments] = useState('');
  const [formData, setFormData] = useState({
    contractorId: '',
    date: '',
    startTime: '',
    endTime: '',
    hours: 0,
    reason: '',
    description: ''
  });

  const loadOvertimeRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const [requestsData, contractorsData] = await Promise.all([
        overtimeService.getAll(),
        contractorService.getAll()
      ]);
      setOvertimeRequests(requestsData);
      setContractors(contractorsData);
    } catch (err) {
      setError('Failed to load overtime requests. Please try again.');
      console.error('Error loading overtime requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlySummary = async () => {
    try {
      setLoading(true);
      const summaryData = await overtimeService.getMonthlySummary(selectedYear, selectedMonth);
      setMonthlySummary(summaryData);
    } catch (err) {
      setError('Failed to load monthly summary. Please try again.');
      console.error('Error loading monthly summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') {
      loadOvertimeRequests();
    } else if (activeTab === 'summary') {
      loadMonthlySummary();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  const filteredRequests = overtimeRequests.filter(request => {
    const matchesSearch = request.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || request.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleCreateRequest = async () => {
    try {
      const contractor = contractors.find(c => c.Id === parseInt(formData.contractorId));
      if (!contractor) {
        toast.error('Please select a contractor');
        return;
      }

      const newRequest = {
        ...formData,
        contractorId: parseInt(formData.contractorId),
        contractorName: contractor.name,
        department: contractor.department,
        hours: parseFloat(formData.hours),
        status: 'pending',
        submittedDate: new Date().toISOString()
      };

      await overtimeService.create(newRequest);
      toast.success('Overtime request submitted successfully');
      setShowRequestModal(false);
      resetForm();
      loadOvertimeRequests();
    } catch (err) {
      toast.error('Failed to submit overtime request');
      console.error('Error creating overtime request:', err);
    }
  };

  const handleApprovalAction = async () => {
    if (!selectedRequest) return;

    try {
      if (approvalAction === 'approve') {
        await overtimeService.approve(selectedRequest.Id, approvalComments);
        toast.success('Overtime request approved successfully');
      } else if (approvalAction === 'reject') {
        await overtimeService.reject(selectedRequest.Id, approvalComments);
        toast.success('Overtime request rejected');
      }
      
      setShowApprovalModal(false);
      setApprovalComments('');
      setSelectedRequest(null);
      setApprovalAction('');
      loadOvertimeRequests();
    } catch (err) {
      toast.error(`Failed to ${approvalAction} overtime request`);
      console.error(`Error ${approvalAction}ing overtime request:`, err);
    }
  };

  const openApprovalModal = (request, action) => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const resetForm = () => {
    setFormData({
      contractorId: '',
      date: '',
      startTime: '',
      endTime: '',
      hours: 0,
      reason: '',
      description: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateHours = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours > 0) {
        handleInputChange('hours', diffHours);
      }
    }
  };

  useEffect(() => {
    calculateHours();
  }, [formData.startTime, formData.endTime]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading && activeTab === 'requests') {
    return <Loading variant="table" />;
  }

  if (error && activeTab === 'requests') {
    return (
      <Error
        title="Failed to load overtime requests"
        message={error}
        onRetry={loadOvertimeRequests}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Overtime Management</h1>
        <p className="text-gray-600 mt-2">Manage overtime requests, approvals, and monthly summaries.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ApperIcon name="Timer" className="w-4 h-4 inline mr-2" />
            Overtime Requests
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'summary'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ApperIcon name="BarChart3" className="w-4 h-4 inline mr-2" />
            Monthly Summary
          </button>
        </nav>
      </div>

      {/* Overtime Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search overtime requests..."
              className="w-full md:w-96"
            />
            <div className="flex items-center gap-4">
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
              <Button
                variant="primary"
                className="flex items-center gap-2"
                onClick={() => setShowRequestModal(true)}
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                Submit Request
              </Button>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <Empty
              title="No overtime requests found"
              message="Overtime requests will appear here once contractors start submitting them."
              icon="Timer"
              showAction={false}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface border-b border-gray-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Contractor</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Date</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Time Period</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Hours</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Reason</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRequests.map(request => (
                        <motion.tr
                          key={request.Id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ backgroundColor: "#f9fafb" }}
                          transition={{ duration: 0.15 }}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-warning/10 to-warning/20 rounded-full flex items-center justify-center">
                                <ApperIcon name="User" className="w-5 h-5 text-warning" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{request.contractorName}</p>
                                <p className="text-sm text-gray-500">{request.department}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-900">{formatDate(request.date)}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-900">
                              {formatTime(request.startTime)} - {formatTime(request.endTime)}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-medium text-warning">{request.hours}hrs</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-900 max-w-xs truncate" title={request.reason}>
                              {request.reason}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={request.status} type="overtime" />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" title="View Details">
                                <ApperIcon name="Eye" className="w-4 h-4" />
                              </Button>
                              {request.status === "pending" && (
                                <>
                                  <Button
                                    variant="accent"
                                    size="sm"
                                    onClick={() => openApprovalModal(request, "approve")}
                                    title="Approve"
                                  >
                                    <ApperIcon name="Check" className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => openApprovalModal(request, "reject")}
                                    title="Reject"
                                  >
                                    <ApperIcon name="X" className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Monthly Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Monthly Overtime Summary</h2>
            <div className="flex items-center gap-4">
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                  </option>
                ))}
              </Select>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>{year}</option>
                  );
                })}
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <ApperIcon name="Loader2" className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading monthly summary...</p>
            </div>
          ) : monthlySummary ? (
            <div className="grid gap-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Clock" className="w-6 h-6 text-warning" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Hours</p>
                        <p className="text-2xl font-bold text-gray-900">{monthlySummary.totalHours}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <ApperIcon name="CheckCircle" className="w-6 h-6 text-accent" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Approved</p>
                        <p className="text-2xl font-bold text-gray-900">{monthlySummary.approvedRequests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Users" className="w-6 h-6 text-info" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Contractors</p>
                        <p className="text-2xl font-bold text-gray-900">{monthlySummary.uniqueContractors}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <ApperIcon name="DollarSign" className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Est. Cost</p>
                        <p className="text-2xl font-bold text-gray-900">${monthlySummary.estimatedCost.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Department Breakdown */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Department Breakdown</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlySummary.departmentBreakdown.map(dept => (
                      <div key={dept.department} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{dept.department}</p>
                          <p className="text-sm text-gray-600">{dept.contractors} contractors</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{dept.hours}hrs</p>
                          <p className="text-sm text-gray-600">${dept.cost.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Empty
              title="No overtime data found"
              message={`No overtime requests found for ${new Date(0, selectedMonth - 1).toLocaleString('en-US', { month: 'long' })} ${selectedYear}.`}
              icon="BarChart3"
              showAction={false}
            />
          )}
        </div>
      )}

      {/* Submit Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Submit Overtime Request</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRequestModal(false);
                  resetForm();
                }}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="contractor">Contractor *</Label>
                <Select
                  value={formData.contractorId}
                  onChange={(e) => handleInputChange('contractorId', e.target.value)}
                >
                  <option value="">Select Contractor</option>
                  {contractors.filter(c => c.status === "active").map(contractor => (
                    <option key={contractor.Id} value={contractor.Id}>
                      {contractor.name} - {contractor.department}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hours">Total Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.hours}
                  onChange={(e) => handleInputChange('hours', e.target.value)}
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Select
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                >
                  <option value="">Select Reason</option>
                  <option value="Project Deadline">Project Deadline</option>
                  <option value="System Maintenance">System Maintenance</option>
                  <option value="Emergency Support">Emergency Support</option>
                  <option value="Client Request">Client Request</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                  placeholder="Provide additional details about the overtime work..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRequestModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateRequest}
                  disabled={!formData.contractorId || !formData.date || !formData.startTime || !formData.endTime || !formData.reason}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {approvalAction === "approve" ? "Approve" : "Reject"} Overtime Request
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalComments("");
                }}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Are you sure you want to {approvalAction} this overtime request for {selectedRequest?.contractorName}?
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">
                    Date: {selectedRequest && formatDate(selectedRequest.date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Hours: {selectedRequest?.hours}hrs
                  </p>
                  <p className="text-sm text-gray-600">
                    Reason: {selectedRequest?.reason}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="comments">
                  Comments {approvalAction === "reject" && <span className="text-red-500">*</span>}
                </Label>
                <textarea
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                  placeholder={`Add ${approvalAction === "approve" ? "approval" : "rejection"} comments...`}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalComments("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant={approvalAction === "approve" ? "accent" : "danger"}
                  onClick={handleApprovalAction}
                  disabled={approvalAction === "reject" && !approvalComments.trim()}
                >
                  {approvalAction === "approve" ? "Approve" : "Reject"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OvertimeManagement;