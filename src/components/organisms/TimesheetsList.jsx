import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import StatusBadge from "@/components/molecules/StatusBadge";
import SearchBar from "@/components/molecules/SearchBar";
import { contractorService } from "@/services/api/contractorService";
import { timesheetService } from "@/services/api/timesheetService";

const TimesheetsList = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWorkplan, setSelectedWorkplan] = useState('all');
  const [workplans, setWorkplans] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [approvalAction, setApprovalAction] = useState('');
  const [approvalComments, setApprovalComments] = useState('');
  const [dailyHours, setDailyHours] = useState({
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0
  });
  const [selectedContractor, setSelectedContractor] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [timesheetNotes, setTimesheetNotes] = useState('');
const loadTimesheets = async () => {
    try {
      setLoading(true);
      setError('');
      const [timesheetData, workplanData, contractorData] = await Promise.all([
        timesheetService.getAll(),
        timesheetService.getWorkplans(),
        contractorService.getAll()
      ]);
      setTimesheets(timesheetData);
      setWorkplans(workplanData);
      setContractors(contractorData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
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
    const matchesWorkplan = selectedWorkplan === 'all' || timesheet.workplanId === parseInt(selectedWorkplan);
    return matchesSearch && matchesStatus && matchesWorkplan;
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

  const handleCreateTimesheet = async () => {
    try {
      const totalHours = Object.values(dailyHours).reduce((sum, hours) => sum + hours, 0);
      const overtimeHours = Math.max(0, totalHours - 40);
      
      const newTimesheet = {
        contractorId: parseInt(selectedContractor),
        contractorName: contractors.find(c => c.Id === parseInt(selectedContractor))?.name || '',
        department: contractors.find(c => c.Id === parseInt(selectedContractor))?.department || '',
        weekStartDate,
        dailyHours,
        totalHours,
        overtimeHours,
        status: 'draft',
        notes: timesheetNotes,
        workplanId: contractors.find(c => c.Id === parseInt(selectedContractor))?.workplanId || null,
        workplanName: contractors.find(c => c.Id === parseInt(selectedContractor))?.workplanName || ''
      };

      await timesheetService.create(newTimesheet);
      toast.success('Timesheet created successfully');
      setShowTimesheetModal(false);
      resetTimesheetForm();
      loadTimesheets();
    } catch (err) {
      toast.error('Failed to create timesheet');
      console.error('Error creating timesheet:', err);
    }
  };

  const resetTimesheetForm = () => {
    setDailyHours({
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0
    });
    setSelectedContractor('');
    setWeekStartDate('');
    setTimesheetNotes('');
  };

  const handleApprovalAction = async () => {
    if (!selectedTimesheet) return;

    try {
      if (approvalAction === 'approve') {
        await timesheetService.approveTimesheet(selectedTimesheet.Id, approvalComments);
        toast.success('Timesheet approved successfully');
      } else if (approvalAction === 'reject') {
        await timesheetService.rejectTimesheet(selectedTimesheet.Id, approvalComments);
        toast.success('Timesheet rejected');
      }
      
      setShowApprovalModal(false);
      setApprovalComments('');
      setSelectedTimesheet(null);
      setApprovalAction('');
      loadTimesheets();
    } catch (err) {
      toast.error(`Failed to ${approvalAction} timesheet`);
      console.error(`Error ${approvalAction}ing timesheet:`, err);
    }
  };

  const openApprovalModal = (timesheet, action) => {
    setSelectedTimesheet(timesheet);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const handleViewTimesheet = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setDailyHours(timesheet.dailyHours);
    setTimesheetNotes(timesheet.notes || '');
    setShowTimesheetModal(true);
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
    initial={{
        opacity: 0,
        y: 20
    }}
    animate={{
        opacity: 1,
        y: 0
    }}
    className="space-y-6">
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar
            onSearch={setSearchTerm}
            placeholder="Search timesheets..."
            className="w-full md:w-96" />
        <div className="flex items-center gap-4">
            <select
                value={selectedWorkplan}
                onChange={e => setSelectedWorkplan(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary">
                <option value="all">All Workplans</option>
                {workplans.map(
                    workplan => <option key={workplan.Id} value={workplan.Id}>{workplan.name}</option>
                )}
            </select>
            <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary">
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
            </select>
            <Button
                variant="primary"
                className="flex items-center gap-2"
                onClick={() => setShowTimesheetModal(true)}>
                <ApperIcon name="Plus" className="w-4 h-4" />Create Timesheet
                          </Button>
            <Button variant="secondary" className="flex items-center gap-2">
                <ApperIcon name="Download" className="w-4 h-4" />Export
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
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Workplan</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Week Period</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Total Hours</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Overtime Hours</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Status</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredTimesheets.map(timesheet => <motion.tr
                            key={timesheet.Id}
                            initial={{
                                opacity: 0
                            }}
                            animate={{
                                opacity: 1
                            }}
                            whileHover={{
                                backgroundColor: "#f9fafb"
                            }}
                            transition={{
                                duration: 0.15
                            }}>
                            <td className="py-4 px-6">
                                <div className="flex items-center">
                                    <div
                                        className="w-10 h-10 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-full flex items-center justify-center">
                                        <ApperIcon name="User" className="w-5 h-5 text-secondary" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{timesheet.contractorName}</p>
                                        <p className="text-sm text-gray-500">{timesheet.department}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <p className="text-sm text-gray-900 font-medium">{timesheet.workplanName || "Unassigned"}</p>
                                <p className="text-sm text-gray-500">{timesheet.department}</p>
                            </td>
                            <td className="py-4 px-6">
                                <p className="text-sm text-gray-900">{formatWeekRange(timesheet.weekStartDate)}</p>
                            </td>
                            <td className="py-4 px-6">
                                <p className="text-sm font-medium text-gray-900">{timesheet.totalHours}hrs</p>
                            </td>
                            <td className="py-4 px-6">
                                <p className="text-sm text-gray-900">{timesheet.overtimeHours}hrs</p>
                            </td>
                            <td className="py-4 px-6">
                                <StatusBadge status={timesheet.status} type="timesheet" />
                            </td>
<td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleViewTimesheet(timesheet)}>
                                        <ApperIcon name="Eye" className="w-4 h-4" />
                                    </Button>
                                    {timesheet.status === "submitted" && <>
                                        <Button
                                            variant="accent"
                                            size="sm"
                                            onClick={() => openApprovalModal(timesheet, "approve")}>
                                            <ApperIcon name="Check" className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => openApprovalModal(timesheet, "reject")}>
                                            <ApperIcon name="X" className="w-4 h-4" />
                                        </Button>
                                    </>}
                                </div>
                            </td>
                        </motion.tr>)}
                    </tbody>
                </table>
            </div>
        </CardContent>
    </Card>
{filteredTimesheets.length === 0 && timesheets.length > 0 && <Empty
        title="No timesheets match your search"
        message="Try adjusting your search criteria or status filter."
        icon="Search"
        showAction={false} />}

          {/* Timesheet Entry Modal */}
    {showTimesheetModal && <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {selectedTimesheet ? "View Timesheet" : "Create Timesheet"}
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setShowTimesheetModal(false);
                        setSelectedTimesheet(null);
                        resetTimesheetForm();
                    }}>
                    <ApperIcon name="X" className="w-5 h-5" />
                </Button>
            </div>
            <div className="space-y-6">
                {!selectedTimesheet && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contractor
                                                </label>
                        <select
                            value={selectedContractor}
                            onChange={e => setSelectedContractor(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary">
                            <option value="">Select Contractor</option>
                            {contractors.filter(c => c.status === "active").map(contractor => <option key={contractor.Id} value={contractor.Id}>
                                {contractor.name}- {contractor.department}
                            </option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Week Start Date
                                                </label>
                        <Input
                            type="date"
                            value={weekStartDate}
                            onChange={e => setWeekStartDate(e.target.value)} />
                    </div>
                </div>}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                        {Object.entries(dailyHours).map(([day, hours]) => <div key={day} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 capitalize">
                                {day}
                            </label>
                            <Input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={hours}
                                onChange={e => setDailyHours(prev => ({
                                    ...prev,
                                    [day]: parseFloat(e.target.value) || 0
                                }))}
                                disabled={selectedTimesheet && selectedTimesheet.status !== "draft"} />
                        </div>)}
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Total Hours:</span>
                            <span className="text-lg font-bold text-gray-900">
                                {Object.values(dailyHours).reduce((sum, hours) => sum + hours, 0)}hrs
                                                    </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-gray-700">Overtime Hours:</span>
                            <span className="text-lg font-bold text-warning">
                                {Math.max(0, Object.values(dailyHours).reduce((sum, hours) => sum + hours, 0) - 40)}hrs
                                                    </span>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes
                                        </label>
                    <textarea
                        value={timesheetNotes}
                        onChange={e => setTimesheetNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                        placeholder="Add any notes about this timesheet..."
                        disabled={selectedTimesheet && selectedTimesheet.status !== "draft"} />
                </div>
                {!selectedTimesheet && <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowTimesheetModal(false);
                            resetTimesheetForm();
                        }}>Cancel
                                          </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateTimesheet}
                        disabled={!selectedContractor || !weekStartDate}>Create Timesheet
                                          </Button>
                </div>}
            </div>
        </div>
    </div>}
    {/* Approval Modal */}
    {showApprovalModal && <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                    {approvalAction === "approve" ? "Approve" : "Reject"}Timesheet
                                  </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setShowApprovalModal(false);
                        setApprovalComments("");
                    }}>
                    <ApperIcon name="X" className="w-5 h-5" />
                </Button>
            </div>
            <div className="space-y-4">
                <div>
<p className="text-sm text-gray-600 mb-2">Are you sure you want to {approvalAction} this timesheet for {selectedTimesheet?.contractorName}?
                                        </p>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">Week: {selectedTimesheet && formatWeekRange(selectedTimesheet.weekStartDate)}
                        </p>
                        <p className="text-sm text-gray-600">Total Hours: {selectedTimesheet?.totalHours}hrs
                                              </p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comments {approvalAction === "reject" && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                        value={approvalComments}
                        onChange={e => setApprovalComments(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                        placeholder={`Add ${approvalAction === "approve" ? "approval" : "rejection"} comments...`} />
                </div>
                <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowApprovalModal(false);
                            setApprovalComments("");
                        }}>Cancel
                                        </Button>
                    <Button
                        variant={approvalAction === "approve" ? "accent" : "danger"}
                        onClick={handleApprovalAction}
                        disabled={approvalAction === "reject" && !approvalComments.trim()}>
                        {approvalAction === "approve" ? "Approve" : "Reject"}
                    </Button>
                </div>
            </div>
        </div>
</div>}
</motion.div>
  );
};

export default TimesheetsList;