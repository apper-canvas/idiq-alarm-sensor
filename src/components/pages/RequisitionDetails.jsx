import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { agencyService } from "@/services/api/agencyService";
import { requisitionService } from "@/services/api/requisitionService";
import { cvSubmissionService } from "@/services/api/cvSubmissionService";
import ApperIcon from "@/components/ApperIcon";
import Requisitions from "@/components/pages/Requisitions";
import Agencies from "@/components/pages/Agencies";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";

const RequisitionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [agencyFilters, setAgencyFilters] = useState({
    location: '',
    specialization: '',
    rating: ''
  });

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'filled', label: 'Filled' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    loadRequisition();
    loadAgencies();
  }, [id]);

  const loadRequisition = async () => {
    try {
      setLoading(true);
      const data = await requisitionService.getById(parseInt(id));
      setRequisition(data);
      setStatus(data.status);
    } catch (error) {
      console.error('Error loading requisition:', error);
      toast.error('Failed to load requisition details');
    } finally {
      setLoading(false);
    }
  };

  const loadAgencies = async () => {
    try {
      const data = await agencyService.getAll();
      setAgencies(data);
    } catch (error) {
      console.error('Error loading agencies:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await requisitionService.update(parseInt(id), { status: newStatus });
      setStatus(newStatus);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'selected': return { icon: 'Check', color: 'text-green-600' };
      case 'shortlisted': return { icon: 'Target', color: 'text-blue-600' };
      case 'interview_scheduled': return { icon: 'Calendar', color: 'text-purple-600' };
      case 'under_review': return { icon: 'Clock', color: 'text-yellow-600' };
      case 'rejected': return { icon: 'X', color: 'text-red-600' };
      default: return { icon: 'FileText', color: 'text-gray-600' };
    }
  };

  const getDaysOpen = (createdDate) => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateBudgetUsed = (requisition) => {
    if (!requisition.contractorAssignments || !requisition.budget) return 0;
    const monthlyTotal = requisition.contractorAssignments
      .filter(assignment => assignment.status === 'active')
      .reduce((sum, assignment) => sum + assignment.monthlyRate, 0);
    return (monthlyTotal / requisition.budget.estimated) * 100;
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
      className="space-y-6 max-w-7xl mx-auto p-4 lg:p-6"
    >
      {/* Header Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/requisitions')}
              className="flex items-center gap-2"
            >
              <ApperIcon name="ArrowLeft" size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{requisition.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span>Requisition #: REQ-2024-{String(requisition.Id).padStart(4, '0')}</span>
                <span>Created: {formatDate(requisition.createdDate)}</span>
                <span>Days Open: {getDaysOpen(requisition.createdDate)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
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
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Basic Information Panel */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ApperIcon name="Info" size={20} />
                Basic Information
              </h2>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Position Title</label>
                <p className="text-gray-900 font-medium">{requisition.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <p className="text-gray-900">{requisition.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Number of Positions</label>
                <p className="text-gray-900">{requisition.positions.total}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Positions Filled</label>
                <p className="text-gray-900">{requisition.positions.filled}/{requisition.positions.total}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Work Arrangement</label>
                <p className="text-gray-900">{requisition.workArrangement}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Contract Duration</label>
                <p className="text-gray-900">{requisition.contractDuration}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Department</label>
                <p className="text-gray-900">{requisition.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Project</label>
                <p className="text-gray-900">{requisition.project}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Cost Center</label>
                <p className="text-gray-900">{requisition.costCenter}</p>
              </div>
            </CardContent>
          </Card>

          {/* People Involved */}
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
                      <p className="font-medium">{requisition.requestor}</p>
                      <p className="text-sm text-gray-600">Requestor (User Unit)</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <ApperIcon name="UserCheck" size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{requisition.reportingSupervisor}</p>
                      <p className="text-sm text-gray-600">Reporting Supervisor</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ApperIcon name="Users" size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{requisition.resourceTeamHandler}</p>
                      <p className="text-sm text-gray-600">Resource Team Handler</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <ApperIcon name="Shield" size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Approvers</p>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Check" size={12} className="text-green-500" />
                          Budget: {requisition.approvers.budget.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Clock" size={12} className="text-yellow-500" />
                          Dept Head: {requisition.approvers.departmentHead.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attached Documents */}
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
              {requisition.documents && requisition.documents.length > 0 ? (
                <div className="space-y-3">
                  {requisition.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ApperIcon name="FileText" size={20} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-600">{doc.size}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ApperIcon name="Download" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ApperIcon name="File" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">No documents uploaded yet</p>
                  <p className="text-sm text-gray-500">Drag and drop files here or click to browse</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Position Requirements */}
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
                  <label className="text-sm font-medium text-gray-700 block mb-2">Key Skills Required</label>
                  <div className="flex flex-wrap gap-2">
                    {requisition.requirements.keySkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Education</label>
                    <p className="text-gray-900">{requisition.requirements.education}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Experience</label>
                    <p className="text-gray-900">{requisition.requirements.experience}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agency Management Panel */}
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
                  <ApperIcon name="Mail" size={16} />
                  Invite More Agencies
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{requisition.agencyStats.invited}</p>
                  <p className="text-sm text-gray-600">Agencies Invited</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{requisition.agencyStats.responded}</p>
                  <p className="text-sm text-gray-600">Responded</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{requisition.agencyStats.totalCVs}</p>
                  <p className="text-sm text-gray-600">Total CVs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{requisition.submissionStats.averageRate}</p>
                  <p className="text-sm text-gray-600">Avg Rate/hr</p>
                </div>
              </div>

              <div className="space-y-3">
                {requisition.agencySubmissions.map((agency) => (
                  <div key={agency.agencyId} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{agency.agencyName}</h3>
                          <Badge 
                            variant={agency.status === 'submitted' ? 'default' : 'secondary'}
                            className={agency.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {agency.status === 'submitted' ? '✓ Submitted' : '⏳ Pending'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Invited: {formatDate(agency.invitedDate)}</span>
                          <span>CVs: {agency.submissions.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <ApperIcon name="Eye" size={16} />
                          View
                        </Button>
                        <Button size="sm" variant="ghost">
                          <ApperIcon name="MessageSquare" size={16} />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submissions by Agency */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ApperIcon name="FolderOpen" size={20} />
                  Submissions by Agency
                </h2>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <ApperIcon name="Download" size={16} />
                    Export All CVs
                  </Button>
                  <Button size="sm" variant="outline">
                    <ApperIcon name="BarChart3" size={16} />
                    Compare
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {requisition.agencySubmissions.filter(agency => agency.submissions.length > 0).map((agency) => (
                  <div key={agency.agencyId} className="border rounded-lg">
                    <div className="p-4 bg-gray-50 border-b">
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Folder" size={20} className="text-blue-600" />
                        <span className="font-medium">{agency.agencyName}</span>
                        <span className="text-sm text-gray-600">({agency.submissions.length} CVs submitted)</span>
                      </div>
                    </div>
                    <div className="divide-y">
                      {agency.submissions.map((submission) => {
                        const statusInfo = getStatusIcon(submission.status);
                        return (
                          <div key={submission.candidateId} className="p-4 hover:bg-gray-50">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <ApperIcon 
                                  name={statusInfo.icon} 
                                  size={16} 
                                  className={statusInfo.color}
                                />
                                <div>
                                  <p className="font-medium">{submission.candidateName}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>${submission.hourlyRate}/hr</span>
                                    <span>{submission.status.replace('_', ' ')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setShowSubmissionModal(true);
                                  }}
                                >
                                  <ApperIcon name="Eye" size={16} />
                                  View Profile
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <ApperIcon name="Download" size={16} />
                                  CV
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Contractors */}
          {requisition.contractorAssignments && requisition.contractorAssignments.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ApperIcon name="UserCheck" size={20} />
                  Selected Contractors
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: requisition.positions.total }, (_, index) => {
                    const assignment = requisition.contractorAssignments.find(a => a.position === index + 1);
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Position {index + 1} of {requisition.positions.total}</h3>
                            {assignment ? (
                              <div className="mt-2 space-y-1">
                                <p className="text-sm"><span className="font-medium">Name:</span> {assignment.contractorName}</p>
                                <p className="text-sm"><span className="font-medium">Agency:</span> {assignment.agencyName}</p>
                                <p className="text-sm"><span className="font-medium">Start Date:</span> {formatDate(assignment.startDate)}</p>
                                <p className="text-sm"><span className="font-medium">Rate:</span> ${assignment.hourlyRate}/hour</p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">
                                {index < requisition.positions.filled ? 'Reviewing CVs' : 'Position Available'}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant={assignment?.status === 'active' ? 'default' : 'secondary'}
                            className={assignment?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {assignment?.status === 'active' ? '✓ Onboarded' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ApperIcon name="Activity" size={20} />
                Activity Log / Timeline
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requisition.activityLog.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{activity.date}</span>
                        <span className="text-gray-500">{activity.time}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Timeline & Key Dates */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ApperIcon name="Calendar" size={20} />
                Timeline & Key Dates
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requisition.timeline.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium">{item.milestone}</p>
                      <p className="text-xs text-gray-600">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ApperIcon name="DollarSign" size={20} />
                Financial Summary
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estimated Monthly Cost</span>
                  <span className="font-medium">${requisition.budget.monthlyEstimate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Budget Allocated</span>
                  <span className="font-medium">${requisition.budget.totalAllocated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Budget Utilized</span>
                  <span className="font-medium">${requisition.budget.utilized.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm text-gray-600">Remaining Budget</span>
                  <span className="font-medium text-green-600">
                    ${(requisition.budget.totalAllocated - requisition.budget.utilized).toLocaleString()}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget Usage</span>
                    <span>{Math.round(calculateBudgetUsed(requisition))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(calculateBudgetUsed(requisition), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Analytics */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ApperIcon name="BarChart3" size={20} />
                Analytics
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-2">Submission Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg time to submit</span>
                      <span>{requisition.submissionStats.avgTimeToSubmit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg CVs per agency</span>
                      <span>{requisition.submissionStats.avgCVsPerAgency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Qualification match rate</span>
                      <span>{requisition.submissionStats.qualificationMatch}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response rate</span>
                      <span>{requisition.submissionStats.responseRate}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm mb-2">By Rate Range</h3>
                  <div className="space-y-2 text-sm">
                    {requisition.submissionStats.rateRanges.map((range, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">{range.range}</span>
                        <span>{range.count} candidates</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance & Audit */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ApperIcon name="Shield" size={20} />
                Compliance & Audit
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requisition.compliance.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <ApperIcon 
                      name={item.status === 'completed' ? 'CheckCircle' : 'Clock'} 
                      size={16} 
                      className={item.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}
                    />
                    <span className="text-sm">{item.requirement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions Panel */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ApperIcon name="Settings" size={20} />
                Actions
              </h2>
            </CardHeader>
            <CardContent>
<div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <ApperIcon name="Mail" size={16} />
                  Send to More Agencies
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate(`/requisitions/${id}/interviews`)}
                >
                  <ApperIcon name="Calendar" size={16} />
                  Schedule Interviews
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ApperIcon name="Download" size={16} />
                  Download Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ApperIcon name="MessageSquare" size={16} />
                  Add Comment
                </Button>
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
                <h3 className="text-xl font-semibold">Select Additional Agencies to Invite</h3>
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
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <Input placeholder="Search agencies..." className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select className="w-full">
                    <option value="">All Categories</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="operations">Operations</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <Select className="w-full">
                    <option value="">All Ratings</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <ApperIcon name="Filter" size={16} />
                    Apply Filters
                  </Button>
                </div>
              </div>

              {/* Agency List */}
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Select agencies to invite</span>
                    <Button size="sm" variant="ghost">
                      <input type="checkbox" className="mr-2" />
                      Select All
                    </Button>
                  </div>
                </div>
                <div className="divide-y">
                  {agencies.slice(0, 5).map((agency) => (
                    <div key={agency.Id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" />
                          <div>
                            <p className="font-medium">{agency.name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{agency.specialties[0]}</span>
                              <div className="flex items-center gap-1">
                                <ApperIcon name="Star" size={12} className="text-yellow-500" />
                                <span>{agency.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {agency.activeContractors} active
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea 
                  className="w-full p-3 border rounded-lg resize-none"
                  rows="3"
                  placeholder="Urgent requirement - please submit CVs by specific date..."
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAgencyModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowAgencyModal(false);
                toast.success('Invitations sent successfully');
              }}>
                Send Invitations
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Submission Details Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Candidate Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubmissionModal(false)}
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-lg">{selectedSubmission.candidateName}</h4>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-600">Current Company:</span>
                      <p className="font-medium">{selectedSubmission.currentCompany}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Rate:</span>
                      <p className="font-medium">${selectedSubmission.hourlyRate}/hour</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Availability:</span>
                      <p className="font-medium">{selectedSubmission.availability}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Experience:</span>
                      <p className="font-medium">{selectedSubmission.experience}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Status Timeline</h4>
                  <div className="space-y-3">
                    {selectedSubmission.statusTimeline?.map((status, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <ApperIcon name="Check" size={16} className="text-green-600" />
                        <div>
                          <p className="text-sm font-medium">{status.status}</p>
                          <p className="text-xs text-gray-600">{status.date} {status.time}</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-600">No timeline available</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Attached Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <ApperIcon name="FileText" size={16} className="text-blue-600" />
                        <span className="text-sm">CV_{selectedSubmission.candidateName.replace(' ', '_')}.pdf</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <ApperIcon name="Download" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSubmissionModal(false)}>
                Close
              </Button>
              <Button>
                View Full Profile
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default RequisitionDetails;