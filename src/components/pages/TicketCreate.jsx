import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import FileUpload from '@/components/atoms/FileUpload';
import ApperIcon from '@/components/ApperIcon';
import { ticketService } from '@/services/api/ticketService';
import { torService } from '@/services/api/torService';
import { cn } from '@/utils/cn';

const TicketCreate = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    supervisor: '',
    budgetSource: '',
    project: '',
    workArrangement: '',
    // Offboarding specific fields
    employeeId: '',
    reason: '',
    lastWorkingDay: '',
    handoverDetails: '',
    clearanceChecklist: {
      equipment: false,
      access: false,
      documents: false,
      knowledge: false
    }
  });

  const [positions, setPositions] = useState([{
    id: Date.now(),
    title: '',
    category: '',
    supervisor: '',
    budgetSource: '',
    project: '',
    workArrangement: '',
    skillsRequired: '',
    budgetMin: '',
    budgetMax: '',
    description: ''
  }]);

const [attachments, setAttachments] = useState({
    tor: [],
    correspondence: []
  });

const [selectedTor, setSelectedTor] = useState(null);
  const [contractors, setContractors] = useState([]);
  // Dropdown options
  const [dropdownData, setDropdownData] = useState({
    categories: [],
    budgetSources: [],
    projects: [],
    workArrangements: [],
    tors: []
  });
  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

useEffect(() => {
    loadDropdownData();
    loadContractors();
  }, []);

const loadContractors = async () => {
    try {
      const { contractorService } = await import('@/services/api/contractorService');
      const contractorsData = await contractorService.getAll();
      setContractors(contractorsData.filter(c => c.status === 'active'));
    } catch (error) {
      console.error('Error loading contractors:', error);
    }
  };

  const loadDropdownData = async () => {
    try {
      setLoading(true);
      const [categories, budgetSources, projects, workArrangements, tors] = await Promise.all([
        ticketService.getCategories(),
        ticketService.getBudgetSources(),
        ticketService.getProjects(),
        ticketService.getWorkArrangements(),
        ticketService.getTors()
      ]);

      setDropdownData({
        categories,
        budgetSources,
        projects,
        workArrangements,
        tors
      });

      // Check for pre-selected TOR from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const torId = urlParams.get('torId');
      if (torId) {
        const preSelectedTor = tors.find(tor => tor.Id === parseInt(torId));
        if (preSelectedTor) {
          setSelectedTor(preSelectedTor);
          toast.info(`TOR "${preSelectedTor.title}" pre-selected for this ticket`);
        }
      }
    } catch (error) {
      toast.error('Failed to load form data');
      console.error('Error loading dropdown data:', error);
    } finally {
      setLoading(false);
    }
  };

const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleChecklistChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      clearanceChecklist: {
        ...prev.clearanceChecklist,
        [field]: value
      }
    }));
  };

  const isOffboarding = formData.category === 'Offboarding';

  const handlePositionChange = (index, field, value) => {
    setPositions(prev => prev.map((position, i) => 
      i === index ? { ...position, [field]: value } : position
    ));
  };

  const addPosition = () => {
    const newPosition = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      supervisor: formData.supervisor,
      budgetSource: formData.budgetSource,
      project: formData.project,
      workArrangement: formData.workArrangement,
      skillsRequired: '',
      budgetMin: '',
      budgetMax: '',
      description: ''
    };
    setPositions(prev => [...prev, newPosition]);
  };

  const removePosition = (index) => {
    if (positions.length > 1) {
      setPositions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = async (file, type) => {
    try {
      const uploadResult = await ticketService.uploadFile(file, type);
      setAttachments(prev => ({
        ...prev,
        [type]: [...prev[type], uploadResult]
      }));
      toast.success(`${file.name} uploaded successfully`);
      return uploadResult;
    } catch (error) {
      toast.error(`Failed to upload ${file.name}`);
      throw error;
    }
  };

const validateForm = () => {
    const newErrors = {};

    // Common required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.supervisor.trim()) newErrors.supervisor = 'Supervisor is required';

    if (isOffboarding) {
      // Offboarding specific validation
      if (!formData.employeeId) newErrors.employeeId = 'Employee selection is required';
      if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
      if (!formData.lastWorkingDay) newErrors.lastWorkingDay = 'Last working day is required';
      if (!formData.handoverDetails.trim()) newErrors.handoverDetails = 'Handover details are required';
    } else {
      // Hiring requisition validation
      if (!formData.budgetSource) newErrors.budgetSource = 'Budget source is required';
      if (!formData.project) newErrors.project = 'Project is required';
      if (!formData.workArrangement) newErrors.workArrangement = 'Work arrangement is required';

      // Validate positions for hiring
      positions.forEach((position, index) => {
        if (!position.title.trim()) {
          newErrors[`position_${index}_title`] = 'Position title is required';
        }
        if (!position.description.trim()) {
          newErrors[`position_${index}_description`] = 'Position description is required';
        }
        if (position.budgetMin && position.budgetMax) {
          if (parseFloat(position.budgetMin) >= parseFloat(position.budgetMax)) {
            newErrors[`position_${index}_budget`] = 'Minimum budget must be less than maximum';
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);

const ticketData = {
        ...formData,
        selectedTor,
        positions: positions.map(position => ({
          title: position.title,
          category: position.category || formData.category,
          supervisor: position.supervisor || formData.supervisor,
          budgetSource: position.budgetSource || formData.budgetSource,
          project: position.project || formData.project,
          workArrangement: position.workArrangement || formData.workArrangement,
          skillsRequired: position.skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
          budgetRange: position.budgetMin && position.budgetMax ? {
            min: parseFloat(position.budgetMin),
            max: parseFloat(position.budgetMax)
          } : null,
          description: position.description
        })),
        attachments: [
          ...attachments.tor.map(att => ({ ...att, type: 'tor' })),
          ...attachments.correspondence.map(att => ({ ...att, type: 'correspondence' }))
        ]
      };

      await ticketService.create(ticketData);
      toast.success('Ticket created successfully!');
      navigate('/requisitions');
    } catch (error) {
      toast.error('Failed to create ticket');
      console.error('Error creating ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ApperIcon name="Loader2" className="w-8 h-8 text-secondary mx-auto mb-2" />
          </motion.div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
<div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isOffboarding ? 'Create Offboarding Ticket' : 'Create New Ticket'}
          </h1>
          <p className="text-gray-600">
            {isOffboarding 
              ? 'Process employee resignation or termination with required documentation'
              : 'Create a hiring requisition with TOR attachment and position details'
            }
          </p>
        </div>
<Button
          variant="outline"
          onClick={() => navigate('/requisitions')}
          disabled={submitting}
        >
          <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
          Back to Requisitions
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <p className="text-sm text-gray-600">General ticket information that applies to all positions</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Ticket Title"
                required
                placeholder="e.g., Backend Development Team"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={errors.title}
              />

              <FormField
                label="Category"
                required
                error={errors.category}
              >
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  error={!!errors.category}
                >
                  <option value="">Select Category</option>
                  {dropdownData.categories.map(category => (
                    <option key={category.Id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Supervisor"
                required
                placeholder="e.g., John Smith"
                value={formData.supervisor}
                onChange={(e) => handleInputChange('supervisor', e.target.value)}
                error={errors.supervisor}
              />

              <FormField
                label="Budget Source"
                required
                error={errors.budgetSource}
              >
                <Select
                  value={formData.budgetSource}
                  onChange={(e) => handleInputChange('budgetSource', e.target.value)}
                  error={!!errors.budgetSource}
                >
                  <option value="">Select Budget Source</option>
                  {dropdownData.budgetSources.map(source => (
                    <option key={source.Id} value={source.name}>
                      {source.name} ({source.code})
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Project"
                required
                error={errors.project}
              >
                <Select
                  value={formData.project}
                  onChange={(e) => handleInputChange('project', e.target.value)}
                  error={!!errors.project}
                >
                  <option value="">Select Project</option>
                  {dropdownData.projects.map(project => (
                    <option key={project.Id} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Work Arrangement"
                required
                error={errors.workArrangement}
              >
                <Select
                  value={formData.workArrangement}
                  onChange={(e) => handleInputChange('workArrangement', e.target.value)}
                  error={!!errors.workArrangement}
                >
                  <option value="">Select Work Arrangement</option>
                  {dropdownData.workArrangements.map(arrangement => (
                    <option key={arrangement.Id} value={arrangement.name}>
                      {arrangement.name}
                    </option>
                  ))}
                </Select>
              </FormField>
</div>
          </CardContent>
        </Card>

        {/* Offboarding Specific Fields */}
        {isOffboarding && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Offboarding Details</h3>
              <p className="text-sm text-gray-600">Employee information and offboarding specifics</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Employee"
                  required
                  error={errors.employeeId}
                >
                  <Select
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    error={!!errors.employeeId}
                  >
                    <option value="">Select Employee</option>
                    {contractors.map(contractor => (
                      <option key={contractor.Id} value={contractor.Id}>
                        {contractor.name} - {contractor.department}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  label="Reason"
                  required
                  error={errors.reason}
                >
                  <Select
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    error={!!errors.reason}
                  >
                    <option value="">Select Reason</option>
                    <option value="resignation">Resignation</option>
                    <option value="termination">Termination</option>
                    <option value="contract_end">Contract End</option>
                    <option value="mutual_agreement">Mutual Agreement</option>
                  </Select>
                </FormField>

                <FormField
                  label="Last Working Day"
                  required
                  type="date"
                  value={formData.lastWorkingDay}
                  onChange={(e) => handleInputChange('lastWorkingDay', e.target.value)}
                  error={errors.lastWorkingDay}
                />

                <div className="md:col-span-2">
                  <FormField
                    label="Handover Details"
                    required
                    error={errors.handoverDetails}
                  >
                    <textarea
                      className="flex min-h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-secondary focus:ring-secondary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      placeholder="Describe handover responsibilities, pending tasks, and knowledge transfer details"
                      value={formData.handoverDetails}
                      onChange={(e) => handleInputChange('handoverDetails', e.target.value)}
                      disabled={submitting}
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3">Clearance Checklist</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.clearanceChecklist.equipment}
                        onChange={(e) => handleChecklistChange('equipment', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Equipment Return</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.clearanceChecklist.access}
                        onChange={(e) => handleChecklistChange('access', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Access Revocation</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.clearanceChecklist.documents}
                        onChange={(e) => handleChecklistChange('documents', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Document Handover</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.clearanceChecklist.knowledge}
                        onChange={(e) => handleChecklistChange('knowledge', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Knowledge Transfer</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

{/* Positions - Only for hiring requisitions */}
        {!isOffboarding && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Positions</h3>
                  <p className="text-sm text-gray-600">Define specific positions for this ticket</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPosition}
                  disabled={submitting}
                >
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Add Position
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {positions.map((position, index) => (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Position {index + 1}</h4>
                      {positions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePosition(index)}
                          disabled={submitting}
                        >
                          <ApperIcon name="X" className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Position Title"
                        required
                        placeholder="e.g., Senior Backend Developer"
                        value={position.title}
                        onChange={(e) => handlePositionChange(index, 'title', e.target.value)}
                        error={errors[`position_${index}_title`]}
                      />

                      <FormField
                        label="Skills Required"
                        placeholder="e.g., Java, Spring Boot, Docker (comma-separated)"
                        value={position.skillsRequired}
                        onChange={(e) => handlePositionChange(index, 'skillsRequired', e.target.value)}
                      />

                      <FormField
                        label="Min Budget (USD)"
                        type="number"
                        placeholder="80000"
                        value={position.budgetMin}
                        onChange={(e) => handlePositionChange(index, 'budgetMin', e.target.value)}
                        error={errors[`position_${index}_budget`]}
                      />

                      <FormField
                        label="Max Budget (USD)"
                        type="number"
                        placeholder="120000"
                        value={position.budgetMax}
                        onChange={(e) => handlePositionChange(index, 'budgetMax', e.target.value)}
                      />

                      <div className="md:col-span-2">
                        <FormField
                          label="Description"
                          required
                          error={errors[`position_${index}_description`]}
                        >
                          <textarea
                            className="flex min-h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-secondary focus:ring-secondary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            placeholder="Detailed description of the position responsibilities and requirements"
                            value={position.description}
                            onChange={(e) => handlePositionChange(index, 'description', e.target.value)}
                            disabled={submitting}
                          />
                        </FormField>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
{/* TOR Selection */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Terms of Reference (TOR)</h3>
            <p className="text-sm text-gray-600">Select or attach TOR document for this ticket</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <FormField
                label="Select TOR Template"
                error={errors.selectedTor}
              >
                <Select
                  value={selectedTor?.Id || ''}
                  onChange={(e) => {
                    const torId = parseInt(e.target.value);
                    const tor = dropdownData.tors.find(t => t.Id === torId);
                    setSelectedTor(tor || null);
                  }}
                  error={!!errors.selectedTor}
                >
                  <option value="">Select TOR Template</option>
                  {dropdownData.tors.map(tor => (
                    <option key={tor.Id} value={tor.Id}>
                      {tor.title} - {tor.category}
                    </option>
                  ))}
                </Select>
              </FormField>

              {selectedTor && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Selected TOR: {selectedTor.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedTor.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Duration: {selectedTor.duration}</span>
                    <span>Budget: {selectedTor.budget}</span>
                    <span>Category: {selectedTor.category}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File Attachments */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Additional File Attachments</h3>
            <p className="text-sm text-gray-600">Upload correspondence and supporting documents</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Additional TOR Documents</h4>
                <FileUpload
                  onFileSelect={(file) => handleFileUpload(file, 'tor')}
                  accept=".pdf,.doc,.docx"
                  multiple={true}
                  disabled={submitting}
                >
                  <p className="text-sm text-gray-600 mb-2">
                    Upload additional TOR files
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, DOC, DOCX files only
                  </p>
                </FileUpload>
              </div>

              <div>
                <h4 className="font-medium mb-3">Correspondence</h4>
                <FileUpload
                  onFileSelect={(file) => handleFileUpload(file, 'correspondence')}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple={true}
                  disabled={submitting}
                >
                  <p className="text-sm text-gray-600 mb-2">
                    Upload correspondence files
                  </p>
                  <p className="text-xs text-gray-400">
                    Documents and images
                  </p>
                </FileUpload>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/requisitions')}
            disabled={submitting}
          >
            Cancel
          </Button>
<Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                {isOffboarding ? 'Creating Offboarding Ticket...' : 'Creating Ticket...'}
              </>
            ) : (
              <>
                <ApperIcon name="Check" className="w-4 h-4 mr-2" />
                {isOffboarding ? 'Create Offboarding Ticket' : 'Create Ticket'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TicketCreate;