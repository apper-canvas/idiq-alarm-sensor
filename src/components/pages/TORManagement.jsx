import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardContent } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Label from '@/components/atoms/Label';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import FormField from '@/components/molecules/FormField';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { torService } from '@/services/api/torService';

const TORManagement = () => {
  const [tors, setTors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTor, setSelectedTor] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [newTor, setNewTor] = useState({
    title: '',
    category: 'consulting',
    description: '',
    duration: '',
    budget: '',
    sections: {
      executiveSummary: '',
      background: '',
      objectives: '',
      scopeOfWork: '',
      deliverables: '',
      timeline: '',
      qualifications: '',
      budget: '',
      termsConditions: ''
    }
  });

  useEffect(() => {
    fetchTors();
  }, []);

  const fetchTors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await torService.getAll();
      setTors(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load TORs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTor = async (e) => {
    e.preventDefault();
    if (!newTor.title.trim()) {
      toast.error('TOR title is required');
      return;
    }

    try {
      setIsCreating(true);
      const createdTor = await torService.create(newTor);
      setTors(prev => [createdTor, ...prev]);
      setShowCreateModal(false);
      setNewTor({
        title: '',
        category: 'consulting',
        description: '',
        duration: '',
        budget: '',
        sections: {
          executiveSummary: '',
          background: '',
          objectives: '',
          scopeOfWork: '',
          deliverables: '',
          timeline: '',
          qualifications: '',
          budget: '',
          termsConditions: ''
        }
      });
      toast.success('TOR created successfully');
    } catch (err) {
      toast.error('Failed to create TOR');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTor = async (id) => {
    if (!confirm('Are you sure you want to delete this TOR?')) return;

    try {
      await torService.delete(id);
      setTors(prev => prev.filter(tor => tor.Id !== id));
      toast.success('TOR deleted successfully');
    } catch (err) {
      toast.error('Failed to delete TOR');
    }
  };

  const handleUseTorTemplate = (tor) => {
    setNewTor({
      title: `${tor.title} (Copy)`,
      category: tor.category,
      description: tor.description,
      duration: tor.duration,
      budget: tor.budget,
      sections: { ...tor.sections }
    });
    setShowCreateModal(true);
    toast.info('Template loaded - customize as needed');
  };

  const filteredTors = tors.filter(tor => {
    const matchesSearch = tor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || tor.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'consulting', label: 'Consulting Services' },
    { value: 'technical', label: 'Technical Assistance' },
    { value: 'procurement', label: 'Procurement Support' },
    { value: 'capacity', label: 'Capacity Building' },
    { value: 'advisory', label: 'Advisory Services' }
  ];

  const statusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'info';
    }
  };

  const tabs = [
    { id: 'library', label: 'TOR Library', icon: 'Library' },
    { id: 'templates', label: 'Templates', icon: 'FileTemplate' },
    { id: 'wizard', label: 'Creation Wizard', icon: 'Wand2' }
  ];

  if (loading) return <Loading variant="table" />;
  if (error) return <Error title="Failed to load TORs" message={error} onRetry={fetchTors} />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TOR Management</h1>
            <p className="text-gray-600 mt-2">Manage Terms of Reference templates and create new TORs</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            Create TOR
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ApperIcon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search TORs by title or description..."
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {filteredTors.length === 0 ? (
              <Empty
                title="No TORs found"
                message="Start by creating your first TOR or adjust your search criteria."
                icon="FileText"
                actionLabel="Create First TOR"
                onAction={() => setShowCreateModal(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTors.map((tor) => (
                  <motion.div
                    key={tor.Id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                              {tor.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant={statusBadgeVariant(tor.status)}>
                                {tor.status}
                              </Badge>
                              <Badge variant="secondary">
                                {categories.find(c => c.value === tor.category)?.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {tor.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <ApperIcon name="Clock" size={14} className="mr-2" />
                            Duration: {tor.duration}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <ApperIcon name="DollarSign" size={14} className="mr-2" />
                            Budget: {tor.budget}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <ApperIcon name="Calendar" size={14} className="mr-2" />
                            Created: {new Date(tor.createdDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTor(tor);
                              setShowDetailsModal(true);
                            }}
                            className="flex-1"
                          >
                            <ApperIcon name="Eye" size={14} className="mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUseTorTemplate(tor)}
                          >
                            <ApperIcon name="Copy" size={14} className="mr-1" />
                            Use Template
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTor(tor.Id)}
                            className="text-error hover:text-error"
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(1).map((category) => (
                <Card key={category.value} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ApperIcon name="FileTemplate" className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.label}</h3>
                        <p className="text-sm text-gray-500">ADB Standard Template</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      Pre-configured template following ADB standards for {category.label.toLowerCase()}.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setNewTor(prev => ({ ...prev, category: category.value }));
                        setShowCreateModal(true);
                      }}
                      className="w-full"
                    >
                      <ApperIcon name="Plus" size={14} className="mr-1" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'wizard' && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">TOR Creation Wizard</h3>
                <p className="text-gray-600">Follow the guided process to create a comprehensive TOR</p>
              </CardHeader>
              <CardContent>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowCreateModal(true)}
                  className="w-full md:w-auto"
                >
                  <ApperIcon name="Wand2" size={16} className="mr-2" />
                  Start Creation Wizard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create TOR Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Create New TOR</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <ApperIcon name="X" size={16} />
                  </Button>
                </div>
              </div>
              
              <form onSubmit={handleCreateTor} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <FormField
                    label="TOR Title"
                    required
                    value={newTor.title}
                    onChange={(e) => setNewTor(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter TOR title"
                  />
                  <FormField label="Category" required>
                    <Select
                      value={newTor.category}
                      onChange={(e) => setNewTor(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.slice(1).map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField
                    label="Duration"
                    value={newTor.duration}
                    onChange={(e) => setNewTor(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 6 months"
                  />
                  <FormField
                    label="Budget"
                    value={newTor.budget}
                    onChange={(e) => setNewTor(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="e.g., $50,000"
                  />
                </div>

                <FormField
                  label="Description"
                  className="mb-6"
                >
                  <textarea
                    className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                    value={newTor.description}
                    onChange={(e) => setNewTor(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the TOR"
                  />
                </FormField>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    TOR Sections (ADB Format)
                  </h3>
                  
                  {Object.entries({
                    executiveSummary: 'Executive Summary',
                    background: 'Background',
                    objectives: 'Objectives',
                    scopeOfWork: 'Scope of Work',
                    deliverables: 'Deliverables',
                    timeline: 'Timeline',
                    qualifications: 'Qualifications',
                    budget: 'Budget Details',
                    termsConditions: 'Terms & Conditions'
                  }).map(([key, label]) => (
                    <FormField key={key} label={label}>
                      <textarea
                        className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                        value={newTor.sections[key]}
                        onChange={(e) => setNewTor(prev => ({
                          ...prev,
                          sections: { ...prev.sections, [key]: e.target.value }
                        }))}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                      />
                    </FormField>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isCreating}
                    className="flex-1 md:flex-none"
                  >
                    Create TOR
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOR Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedTor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedTor.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={statusBadgeVariant(selectedTor.status)}>
                        {selectedTor.status}
                      </Badge>
                      <Badge variant="secondary">
                        {categories.find(c => c.value === selectedTor.category)?.label}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <ApperIcon name="X" size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <ApperIcon name="Clock" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{selectedTor.duration}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <ApperIcon name="DollarSign" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold">{selectedTor.budget}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <ApperIcon name="Calendar" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-semibold">{new Date(selectedTor.createdDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedTor.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedTor.description}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {Object.entries({
                    executiveSummary: 'Executive Summary',
                    background: 'Background',
                    objectives: 'Objectives',
                    scopeOfWork: 'Scope of Work',
                    deliverables: 'Deliverables',
                    timeline: 'Timeline',
                    qualifications: 'Qualifications',
                    budget: 'Budget Details',
                    termsConditions: 'Terms & Conditions'
                  }).map(([key, label]) => (
                    selectedTor.sections[key] && (
                      <div key={key}>
                        <h3 className="font-semibold text-gray-900 mb-2">{label}</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedTor.sections[key]}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    onClick={() => handleUseTorTemplate(selectedTor)}
                  >
                    <ApperIcon name="Copy" size={16} className="mr-2" />
                    Use as Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TORManagement;