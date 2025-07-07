import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import TimesheetsList from "@/components/organisms/TimesheetsList";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Contractors from "@/components/pages/Contractors";
import { contractorService } from "@/services/api/contractorService";
import { timesheetService } from "@/services/api/timesheetService";

const Timesheets = () => {
  const [activeTab, setActiveTab] = useState('timesheets');
  const [showWorkplanModal, setShowWorkplanModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [workplanName, setWorkplanName] = useState('');
  const [workplanDescription, setWorkplanDescription] = useState('');
  const [approverName, setApproverName] = useState('');
  const [approverEmail, setApproverEmail] = useState('');
  const [selectedWorkplan, setSelectedWorkplan] = useState(null);
const [selectedContractors, setSelectedContractors] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [workplans, setWorkplans] = useState([]);
  const [workplansLoading, setWorkplansLoading] = useState(false);
  const [workplansError, setWorkplansError] = useState(null);
  const [workplanSearch, setWorkplanSearch] = useState('');
const loadWorkplans = async () => {
    try {
      setWorkplansLoading(true);
      setWorkplansError(null);
      const data = await timesheetService.getWorkplans();
      setWorkplans(data);
    } catch (err) {
      setWorkplansError('Failed to load workplans');
      console.error('Error loading workplans:', err);
    } finally {
      setWorkplansLoading(false);
    }
  };

  const handleCreateWorkplan = async () => {
    try {
      const newWorkplan = {
        name: workplanName,
        description: workplanDescription,
        approverName,
        approverEmail,
        status: 'active'
      };

      await timesheetService.createWorkplan(newWorkplan);
      toast.success('Workplan created successfully');
      setShowWorkplanModal(false);
      resetWorkplanForm();
      loadWorkplans(); // Refresh workplans list
    } catch (err) {
      toast.error('Failed to create workplan');
      console.error('Error creating workplan:', err);
    }
  };

  const resetWorkplanForm = () => {
    setWorkplanName('');
    setWorkplanDescription('');
    setApproverName('');
    setApproverEmail('');
  };

  const handleAssignContractors = async () => {
    if (!selectedWorkplan || selectedContractors.length === 0) return;

    try {
      for (const contractorId of selectedContractors) {
        await timesheetService.assignContractor(selectedWorkplan.Id, contractorId);
      }
      toast.success('Contractors assigned successfully');
      setShowAssignModal(false);
      setSelectedContractors([]);
      setSelectedWorkplan(null);
    } catch (err) {
      toast.error('Failed to assign contractors');
      console.error('Error assigning contractors:', err);
    }
};

  const handleDeleteWorkplan = async (workplanId) => {
    if (!confirm('Are you sure you want to delete this workplan?')) return;
    
    try {
      await timesheetService.deleteWorkplan(workplanId);
      toast.success('Workplan deleted successfully');
      loadWorkplans();
    } catch (err) {
      toast.error('Failed to delete workplan');
      console.error('Error deleting workplan:', err);
    }
};
  // Load workplans when component mounts or workplans tab is active
  useEffect(() => {
    if (activeTab === 'workplans') {
      loadWorkplans();
    }
  }, [activeTab]);

  // Filter workplans based on search
  const filteredWorkplans = workplans.filter(workplan =>
    workplan.name.toLowerCase().includes(workplanSearch.toLowerCase()) ||
    workplan.description.toLowerCase().includes(workplanSearch.toLowerCase()) ||
    workplan.approverName.toLowerCase().includes(workplanSearch.toLowerCase())
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Timesheet Management</h1>
        <p className="text-gray-600 mt-2">Manage workplans, assign contractors, and review timesheets.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('timesheets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timesheets'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ApperIcon name="Clock" className="w-4 h-4 inline mr-2" />
            Timesheets
          </button>
          <button
            onClick={() => setActiveTab('workplans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workplans'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ApperIcon name="Briefcase" className="w-4 h-4 inline mr-2" />
            Workplan Management
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'timesheets' && <TimesheetsList />}
      
{activeTab === 'workplans' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Workplan Management</h2>
            <Button 
              variant="primary"
              onClick={() => setShowWorkplanModal(true)}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              Create Workplan
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search workplans..."
                value={workplanSearch}
                onChange={(e) => setWorkplanSearch(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Workplans Content */}
          {workplansLoading ? (
            <div className="text-center py-12">
              <ApperIcon name="Loader2" className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading workplans...</p>
            </div>
          ) : workplansError ? (
            <div className="text-center py-12">
              <ApperIcon name="AlertCircle" className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Workplans</h3>
              <p className="text-gray-600 mb-4">{workplansError}</p>
              <Button 
                variant="primary"
                onClick={loadWorkplans}
                className="flex items-center gap-2 mx-auto"
              >
                <ApperIcon name="RefreshCw" className="w-4 h-4" />
                Retry
              </Button>
            </div>
          ) : filteredWorkplans.length === 0 ? (
            <div className="text-center py-12">
              <ApperIcon name="Briefcase" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {workplanSearch ? 'No workplans found' : 'No workplans yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {workplanSearch 
                  ? 'Try adjusting your search terms to find workplans.'
                  : 'Create workplans with designated approvers and assign contractors to manage timesheet workflows.'
                }
              </p>
              {!workplanSearch && (
                <Button 
                  variant="primary"
                  onClick={() => setShowWorkplanModal(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <ApperIcon name="Plus" className="w-4 h-4" />
                  Create Your First Workplan
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredWorkplans.map(workplan => (
                <div key={workplan.Id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{workplan.name}</h3>
                      <p className="text-gray-600 mb-3">{workplan.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <ApperIcon name="User" className="w-4 h-4" />
                          <span>Approver: {workplan.approverName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Mail" className="w-4 h-4" />
                          <span>{workplan.approverEmail}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Calendar" className="w-4 h-4" />
                          <span>Created: {new Date(workplan.createdDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        workplan.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workplan.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        setSelectedWorkplan(workplan);
                        setShowAssignModal(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <ApperIcon name="Users" className="w-4 h-4" />
                      Assign Contractors
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <ApperIcon name="Edit" className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleDeleteWorkplan(workplan.Id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

{/* Create Workplan Modal */}
      {showWorkplanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Workplan</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowWorkplanModal(false);
                  resetWorkplanForm();
                }}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workplan Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={workplanName}
                  onChange={(e) => setWorkplanName(e.target.value)}
                  placeholder="Enter workplan name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={workplanDescription}
                  onChange={(e) => setWorkplanDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                  placeholder="Describe the workplan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approver Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  placeholder="Enter approver name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approver Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                  placeholder="Enter approver email..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowWorkplanModal(false);
                    resetWorkplanForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleCreateWorkplan}
                  disabled={!workplanName || !approverName || !approverEmail}
                >
                  Create Workplan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Contractors Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Assign Contractors</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedContractors([]);
                  setSelectedWorkplan(null);
                }}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workplan: {selectedWorkplan?.name}
                </label>
                <p className="text-sm text-gray-600">{selectedWorkplan?.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Contractors
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Choose contractors to assign to this workplan
                </p>
                <div className="text-center py-8">
                  <ApperIcon name="Users" className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Contractor selection interface would go here</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedContractors([]);
                    setSelectedWorkplan(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleAssignContractors}
                  disabled={selectedContractors.length === 0}
                >
                  Assign Contractors
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Timesheets;