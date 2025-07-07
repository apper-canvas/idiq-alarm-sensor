import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import Label from "@/components/atoms/Label";
import Button from "@/components/atoms/Button";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import FileUpload from "@/components/atoms/FileUpload";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import { cvSubmissionService } from "@/services/api/cvSubmissionService";
import { ticketService } from "@/services/api/ticketService";
const AgencyPortal = () => {
  const [tickets, setTickets] = useState([]);
  const [cvSubmissions, setCvSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [formData, setFormData] = useState({
    currentCompany: '',
    rate: '',
    availability: '',
    files: []
  });
const loadTickets = async () => {
    try {
      setTicketsLoading(true);
      setError('');
      const data = await ticketService.getAll();
      // Only show posted tickets that are available for CV submission
      const availableTickets = data.filter(ticket => ticket.status === 'posted');
      setTickets(availableTickets);
    } catch (err) {
      setError('Failed to load available tickets. Please try again.');
      console.error('Error loading tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await cvSubmissionService.getAll();
      setCvSubmissions(data);
    } catch (err) {
      setError('Failed to load CV submissions. Please try again.');
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([loadTickets(), loadSubmissions()]);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = async (file) => {
    // Add file to form data
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, file]
    }));
    
    toast.success(`${file.name} added to submission`);
    return { success: true };
  };

const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setShowSubmissionForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTicket) {
      toast.error('Please select a ticket first');
      return;
    }
    
    if (!formData.currentCompany || !formData.rate || !formData.availability || formData.files.length === 0) {
      toast.error('Please fill in all fields and upload at least one CV');
      return;
    }

    try {
      setSubmitting(true);
      
      // Create submissions for each CV file with ticket association
      const submissions = await Promise.all(
        formData.files.map(file => 
          cvSubmissionService.create({
            ticketId: selectedTicket.Id,
            ticketTitle: selectedTicket.title,
            fileName: file.name,
            fileSize: file.size,
            currentCompany: formData.currentCompany,
            rate: parseFloat(formData.rate),
            availability: formData.availability,
            fileType: file.name.split('.').pop().toLowerCase(),
            uploadDate: new Date().toISOString(),
            status: 'submitted'
          })
        )
      );

      toast.success(`Successfully submitted ${submissions.length} CV(s) for ${selectedTicket.title}`);
      
      // Reset form and close modal
      setFormData({
        currentCompany: '',
        rate: '',
        availability: '',
        files: []
      });
      setShowSubmissionForm(false);
      setSelectedTicket(null);
      
      // Reload submissions
      await loadSubmissions();
      
    } catch (err) {
      toast.error('Failed to submit CVs. Please try again.');
      console.error('Error submitting CVs:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this CV submission?')) {
      return;
    }

    try {
      await cvSubmissionService.delete(id);
      toast.success('CV submission deleted successfully');
      await loadSubmissions();
    } catch (err) {
      toast.error('Failed to delete CV submission');
      console.error('Error deleting submission:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'info';
      case 'reviewing': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'secondary';
    }
  };

  const getQualificationColor = (status) => {
    switch (status) {
      case 'qualified': return 'success';
      case 'partially-qualified': return 'warning';
      case 'not-qualified': return 'error';
      case 'pending': return 'info';
      default: return 'secondary';
    }
  };

if (ticketsLoading || loading) {
    return <Loading variant="cards" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load data"
        message={error}
        onRetry={() => Promise.all([loadTickets(), loadSubmissions()])}
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
        <h1 className="text-3xl font-bold text-gray-900">Agency CV Submission Portal</h1>
        <p className="text-gray-600 mt-2">Select tickets and submit CVs for specific positions. Only posted tickets are available for CV submission.</p>
      </div>

{/* Available Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Available Tickets</h2>
              <p className="text-sm text-gray-600">Select a ticket to submit CVs for specific positions</p>
            </div>
            <Badge variant="info">{tickets.length} Available</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <Empty
              title="No tickets available"
              message="No posted tickets are currently available for CV submission"
              icon="Ticket"
              showAction={false}
            />
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <motion.div
                  key={ticket.Id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <ApperIcon name="Ticket" className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{ticket.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{ticket.category}</span>
                            <span>•</span>
                            <span>{ticket.project}</span>
                            <span>•</span>
                            <span>{ticket.workArrangement}</span>
                          </div>
                        </div>
                      </div>
                      
                      {ticket.positions && ticket.positions.length > 0 && (
                        <div className="ml-13 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Positions ({ticket.positions.length}):</p>
                          {ticket.positions.map((position, idx) => (
                            <div key={position.Id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{position.title}</p>
                                  <p className="text-sm text-gray-600">
                                    Budget: ${position.budgetRange?.min || 0}-${position.budgetRange?.max || 0}/hr
                                  </p>
                                  {position.skillsRequired && position.skillsRequired.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {position.skillsRequired.slice(0, 3).map((skill, skillIdx) => (
                                        <Badge key={skillIdx} variant="secondary" size="sm">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {position.skillsRequired.length > 3 && (
                                        <Badge variant="secondary" size="sm">
                                          +{position.skillsRequired.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleTicketSelect(ticket)}
                        className="flex items-center gap-2"
                      >
                        <ApperIcon name="Upload" className="w-4 h-4" />
                        Submit CV
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-400">
                    Created: {new Date(ticket.createdDate).toLocaleDateString()} • 
                    Supervisor: {ticket.supervisor}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CV Submission Modal/Form */}
      {showSubmissionForm && selectedTicket && (
        <Card className="border-secondary border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Submit CVs for: {selectedTicket.title}</h2>
                <p className="text-sm text-gray-600">Upload CVs using ADB template format</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSubmissionForm(false);
                  setSelectedTicket(null);
                  setFormData({
                    currentCompany: '',
                    rate: '',
                    availability: '',
                    files: []
                  });
                }}
              >
                <ApperIcon name="X" className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentCompany">Current Company</Label>
                  <Input
                    id="currentCompany"
                    type="text"
                    value={formData.currentCompany}
                    onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                    placeholder="Enter current company"
                    disabled={submitting}
                  />
                </div>
                
                <div>
                  <Label htmlFor="rate">Rate (per hour)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    placeholder="Enter hourly rate"
                    disabled={submitting}
                  />
                </div>
                
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">Select availability</option>
                    <option value="immediate">Immediate</option>
                    <option value="1-week">1 Week Notice</option>
                    <option value="2-weeks">2 Weeks Notice</option>
                    <option value="1-month">1 Month Notice</option>
                    <option value="negotiable">Negotiable</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label>CV Files (ADB Template)</Label>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept=".pdf,.doc,.docx"
                  multiple={true}
                  maxSize={10 * 1024 * 1024} // 10MB
                  disabled={submitting}
                >
                  <p className="text-sm text-gray-600 mb-2">
                    Upload CV files in ADB template format
                  </p>
                  <p className="text-xs text-gray-400">
                    Supported formats: PDF, DOC, DOCX
                    <br />
                    Max size: 10MB per file
                  </p>
                </FileUpload>
              </div>

              {formData.files.length > 0 && (
                <div>
                  <Label>Selected Files ({formData.files.length})</Label>
                  <div className="mt-2 space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <ApperIcon name="FileText" className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              files: prev.files.filter((_, i) => i !== index)
                            }));
                          }}
                          disabled={submitting}
                        >
                          <ApperIcon name="X" className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowSubmissionForm(false);
                    setSelectedTicket(null);
                    setFormData({
                      currentCompany: '',
                      rate: '',
                      availability: '',
                      files: []
                    });
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || formData.files.length === 0}
                  className="flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Upload" className="w-4 h-4" />
                      Submit CVs ({formData.files.length})
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

{/* CV Submissions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">CV Submissions</h2>
              <p className="text-sm text-gray-600">Track your submitted CVs by ticket and their status</p>
            </div>
            <Badge variant="info">{cvSubmissions.length} Total</Badge>
          </div>
        </CardHeader>
        <CardContent>
{cvSubmissions.length === 0 ? (
            <Empty
              title="No CV submissions"
              message="Select a ticket and submit your first CV to get started"
              icon="FileText"
              showAction={false}
            />
          ) : (
            <div className="space-y-4">
{cvSubmissions.map((submission) => (
                <motion.div
                  key={submission.Id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <ApperIcon name="FileText" className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{submission.fileName}</h4>
                        {submission.ticketTitle && (
                          <p className="text-sm font-medium text-secondary mb-1">
                            Ticket: {submission.ticketTitle}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{submission.currentCompany}</span>
                          <span>•</span>
                          <span>${submission.rate}/hr</span>
                          <span>•</span>
                          <span>{submission.availability}</span>
                          <span>•</span>
                          <span>{formatFileSize(submission.fileSize)}</span>
                        </div>
                        
                        {/* Qualification Analysis Section */}
                        {submission.qualificationAnalysis && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <ApperIcon name="CheckCircle" className="w-4 h-4 text-secondary" />
                                <span className="text-sm font-medium text-gray-700">Qualification Analysis</span>
                              </div>
                              <Badge variant={getQualificationColor(submission.qualificationAnalysis.status)} size="sm">
                                {submission.qualificationAnalysis.status}
                              </Badge>
                            </div>
                            
                            {submission.qualificationAnalysis.torComparison && (
                              <div className="mb-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <span className="text-gray-600">TOR Match:</span>
                                  <span className="font-medium text-gray-900">
                                    {submission.qualificationAnalysis.torComparison.matchPercentage}%
                                  </span>
                                  <span className="text-gray-500">
                                    ({submission.qualificationAnalysis.torComparison.matchedSkills.length}/{submission.qualificationAnalysis.torComparison.totalRequired} skills)
                                  </span>
                                </div>
                                
                                {submission.qualificationAnalysis.torComparison.matchedSkills.length > 0 && (
                                  <div className="mt-1">
                                    <span className="text-xs text-gray-500">Matched: </span>
                                    <div className="inline-flex flex-wrap gap-1 mt-1">
                                      {submission.qualificationAnalysis.torComparison.matchedSkills.slice(0, 3).map((skill, idx) => (
                                        <Badge key={idx} variant="success" size="sm">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {submission.qualificationAnalysis.torComparison.matchedSkills.length > 3 && (
                                        <Badge variant="success" size="sm">
                                          +{submission.qualificationAnalysis.torComparison.matchedSkills.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {submission.qualificationAnalysis.torComparison.missingSkills.length > 0 && (
                                  <div className="mt-1">
                                    <span className="text-xs text-gray-500">Missing: </span>
                                    <div className="inline-flex flex-wrap gap-1 mt-1">
                                      {submission.qualificationAnalysis.torComparison.missingSkills.slice(0, 2).map((skill, idx) => (
                                        <Badge key={idx} variant="warning" size="sm">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {submission.qualificationAnalysis.torComparison.missingSkills.length > 2 && (
                                        <Badge variant="warning" size="sm">
                                          +{submission.qualificationAnalysis.torComparison.missingSkills.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-600 mt-2 border-t pt-2">
                              <strong>Summary:</strong> {submission.qualificationAnalysis.checkpoint}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusColor(submission.status)}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(submission.Id)}
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-400">
                    Submitted: {new Date(submission.uploadDate).toLocaleDateString()}
                    {submission.qualificationAnalysis && (
                      <span> • Analyzed: {new Date(submission.qualificationAnalysis.analyzedDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AgencyPortal;