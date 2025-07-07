import { useState } from 'react';
import { motion } from 'framer-motion';
import TimesheetsList from '@/components/organisms/TimesheetsList';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { timesheetService } from '@/services/api/timesheetService';
import { contractorService } from '@/services/api/contractorService';
import { toast } from 'react-toastify';

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

          <div className="text-center py-12">
            <ApperIcon name="Briefcase" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Workplan Management</h3>
            <p className="text-gray-600 mb-4">
              Create workplans with designated approvers and assign contractors to manage timesheet workflows.
            </p>
            <Button 
              variant="primary"
              onClick={() => setShowWorkplanModal(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              Create Your First Workplan
            </Button>
          </div>
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
    </motion.div>
  );
};

export default Timesheets;