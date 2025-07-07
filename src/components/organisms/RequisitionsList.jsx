import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import { Card, CardContent } from "@/components/atoms/Card";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import StatusBadge from "@/components/molecules/StatusBadge";
import SearchBar from "@/components/molecules/SearchBar";
import { ticketService } from "@/services/api/ticketService";
const RequisitionsList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [agencies, setAgencies] = useState([]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const [ticketsData, agenciesData] = await Promise.all([
        ticketService.getAll(),
        ticketService.getAvailableAgencies()
      ]);
      setTickets(ticketsData);
      setAgencies(agenciesData);
    } catch (err) {
      setError('Failed to load tickets. Please try again.');
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ticket.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleWorkflowAction = async (ticketId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [`${ticketId}_${action}`]: true }));
      
      let result;
      switch (action) {
        case 'submit':
          result = await ticketService.submitTicket(ticketId);
          toast.success('Ticket submitted successfully');
          break;
        case 'validate':
          result = await ticketService.validateTicket(ticketId);
          toast.success('Ticket validated by Resource Team');
          break;
        case 'post':
          result = await ticketService.postTicket(ticketId);
          toast.success('Ticket posted successfully');
          break;
        case 'start':
          result = await ticketService.startTicket(ticketId);
          toast.success('Ticket started');
          break;
        case 'close':
          if (confirm('Are you sure you want to close this ticket?')) {
            result = await ticketService.closeTicket(ticketId);
            toast.success('Ticket closed successfully');
          } else {
            return;
          }
          break;
        default:
          throw new Error('Invalid action');
      }
      
      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.Id === ticketId ? result : ticket
      ));
      
    } catch (err) {
      toast.error(`Failed to ${action} ticket: ${err.message}`);
      console.error(`Error ${action}ing ticket:`, err);
    } finally {
      setActionLoading(prev => ({ ...prev, [`${ticketId}_${action}`]: false }));
    }
  };

  const handleFloatToAgencies = async (ticketId) => {
    try {
      const selectedAgencyIds = [];
      let agencySelection = '';
      
      for (const agency of agencies) {
        const shouldInclude = confirm(`Float to ${agency.name}?`);
        if (shouldInclude) {
          selectedAgencyIds.push(agency.Id);
          agencySelection += agency.name + ', ';
        }
      }
      
      if (selectedAgencyIds.length === 0) {
        toast.info('No agencies selected');
        return;
      }
      
      setActionLoading(prev => ({ ...prev, [`${ticketId}_float`]: true }));
      
      const result = await ticketService.floatToAgencies(ticketId, selectedAgencyIds);
      toast.success(`Requirements floated to: ${result.floatedTo.join(', ')}`);
      
      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.Id === ticketId ? result.ticket : ticket
      ));
      
    } catch (err) {
      toast.error(`Failed to float requirements: ${err.message}`);
      console.error('Error floating to agencies:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [`${ticketId}_float`]: false }));
    }
  };

  const getWorkflowActions = (ticket) => {
    const actions = [];
    const status = ticket.status.toLowerCase();
    
    switch (status) {
      case 'draft':
        actions.push({ key: 'submit', label: 'Submit', icon: 'Send', variant: 'info' });
        break;
      case 'submitted':
        actions.push({ key: 'validate', label: 'Validate', icon: 'CheckCircle', variant: 'success' });
        break;
      case 'validated':
        actions.push({ key: 'post', label: 'Post', icon: 'Upload', variant: 'info' });
        break;
      case 'posted':
        actions.push({ key: 'start', label: 'Start', icon: 'Play', variant: 'warning' });
        actions.push({ key: 'float', label: 'Float to Agencies', icon: 'Share', variant: 'outline' });
        break;
      case 'in_progress':
        actions.push({ key: 'close', label: 'Close', icon: 'CheckSquare', variant: 'success' });
        break;
    }
    
    return actions;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

if (loading) {
    return <Loading variant="table" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load tickets"
        message={error}
        onRetry={loadTickets}
      />
    );
  }

if (tickets.length === 0) {
    return (
      <Empty
        title="No tickets found"
        message="Get started by creating your first ticket."
        icon="FileText"
        actionLabel="Create Ticket"
        onAction={() => window.location.href = '/tickets/create'}
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
      className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Search & Filter</h3>
                  <SearchBar
                    onSearch={setSearchTerm}
                    placeholder="Search tickets..."
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Filter
                  </label>
                  <Select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="validated">Validated</option>
                    <option value="posted">Posted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </Select>
                </div>
                
                <div className="pt-2">
                  <Button
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => window.location.href = "/tickets/create"}
                  >
                    <ApperIcon name="Plus" className="w-4 h-4" />
                    Create Ticket
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Area */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div className="overflow-x-auto h-full">
                <table className="w-full">
                  <thead className="bg-surface border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Ticket</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Category</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Supervisor</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Project</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Positions</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTickets.map(ticket => (
                      <motion.tr
                        key={ticket.Id}
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
                        }}
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                            <p className="text-sm text-gray-500">Created {formatDate(ticket.createdDate)}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{ticket.category}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{ticket.supervisor}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{ticket.project}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">
                              {ticket.positions?.length || 0} position{ticket.positions?.length !== 1 ? "s" : ""}
                            </span>
                            {ticket.positions?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {ticket.positions.slice(0, 2).map((position, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded"
                                  >
                                    {position.title}
                                  </span>
                                ))}
                                {ticket.positions.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{ticket.positions.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={ticket.status} type="ticket" />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" title="View Details">
                              <ApperIcon name="Eye" className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Edit">
                              <ApperIcon name="Edit" className="w-4 h-4" />
                            </Button>
                            {/* Workflow Actions */}
                            {getWorkflowActions(ticket).map(action => (
                              <Button
                                key={action.key}
                                variant={action.variant}
                                size="sm"
                                onClick={() => action.key === "float" ? handleFloatToAgencies(ticket.Id) : handleWorkflowAction(ticket.Id, action.key)}
                                disabled={actionLoading[`${ticket.Id}_${action.key}`]}
                                title={action.label}
                                className="flex items-center gap-1"
                              >
                                {actionLoading[`${ticket.Id}_${action.key}`] ? (
                                  <ApperIcon name="Loader2" className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ApperIcon name={action.icon} className="w-3 h-3" />
                                )}
                                <span className="hidden lg:inline text-xs">{action.label}</span>
                              </Button>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Empty state for filtered results */}
                {filteredTickets.length === 0 && tickets.length > 0 && (
                  <div className="p-8">
                    <Empty
                      title="No tickets match your search"
                      message="Try adjusting your search criteria or status filter."
                      icon="Search"
                      showAction={false}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default RequisitionsList;