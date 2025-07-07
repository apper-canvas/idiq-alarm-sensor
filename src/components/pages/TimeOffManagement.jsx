import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { timeOffService } from '@/services/api/timeOffService';
import { Card, CardContent, CardHeader } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import { Label } from '@/components/atoms/Label';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { cn } from '@/utils/cn';

const TimeOffManagement = () => {
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: '',
    startDate: '',
    endDate: '',
    reason: '',
    hours: '',
    type: 'Pre-facto',
    notifications: {
      userUnit: true,
      agency: true
    }
  });

  useEffect(() => {
    fetchTimeOffRequests();
  }, []);

  const fetchTimeOffRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await timeOffService.getAll();
      setTimeOffRequests(data);
    } catch (err) {
      setError('Failed to load time off requests');
      toast.error('Failed to load time off requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRequest) {
        await timeOffService.update(editingRequest.Id, formData);
        toast.success('Time off request updated successfully');
      } else {
        await timeOffService.create(formData);
        toast.success('Time off request submitted successfully');
      }
      
      resetForm();
      fetchTimeOffRequests();
    } catch (err) {
      toast.error(editingRequest ? 'Failed to update request' : 'Failed to submit request');
    }
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setFormData({
      employeeName: request.employeeName,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason,
      hours: request.hours,
      type: request.type,
      notifications: request.notifications
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this time off request?')) {
      try {
        await timeOffService.delete(id);
        toast.success('Time off request deleted successfully');
        fetchTimeOffRequests();
      } catch (err) {
        toast.error('Failed to delete request');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeName: '',
      startDate: '',
      endDate: '',
      reason: '',
      hours: '',
      type: 'Pre-facto',
      notifications: {
        userUnit: true,
        agency: true
      }
    });
    setEditingRequest(null);
    setShowForm(false);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('notifications.')) {
      const notificationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchTimeOffRequests} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Off Management</h1>
          <p className="text-gray-600 mt-1">Manage time off requests and approvals</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          New Request
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingRequest ? 'Edit Time Off Request' : 'New Time Off Request'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Employee Name"
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                  <FormField
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Total Hours"
                    type="number"
                    value={formData.hours}
                    onChange={(e) => handleInputChange('hours', e.target.value)}
                    required
                  />
                  <div className="space-y-2">
                    <Label>Request Type</Label>
                    <Select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <option value="Pre-facto">Pre-facto</option>
                      <option value="Post-facto">Post-facto</option>
                    </Select>
                  </div>
                </div>

                <FormField
                  label="Reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  required
                />

                <div className="space-y-3">
                  <Label>FYI Notifications</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.notifications.userUnit}
                        onChange={(e) => handleInputChange('notifications.userUnit', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">Notify User Unit</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.notifications.agency}
                        onChange={(e) => handleInputChange('notifications.agency', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">Notify Agency</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRequest ? 'Update Request' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Time Off Requests</h2>
        </CardHeader>
        <CardContent>
          {timeOffRequests.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Calendar" size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No time off requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Reason</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timeOffRequests.map((request) => (
                    <tr key={request.Id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{request.employeeName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(request.submittedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">{request.hours}h</td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          request.type === 'Pre-facto' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        )}>
                          {request.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getStatusColor(request.status)
                        )}>
                          {request.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(request)}
                          >
                            <ApperIcon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(request.Id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeOffManagement;