import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { contractorService } from "@/services/api/contractorService";
import ApperIcon from "@/components/ApperIcon";
import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const ContractorsList = () => {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadContractors = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contractorService.getAll();
      setContractors(data);
    } catch (err) {
      setError('Failed to load contractors. Please try again.');
      console.error('Error loading contractors:', err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadContractors();
  }, []);

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor?.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (selectedStatus === 'expiring') {
      matchesStatus = contractor?.daysRemaining <= 30 && contractor?.daysRemaining > 0;
    } else if (selectedStatus !== 'all') {
      matchesStatus = contractor?.status?.toLowerCase() === selectedStatus.toLowerCase();
    }
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
};

  const getExpiryStatus = (daysRemaining) => {
    if (daysRemaining <= 0) return 'expired';
    if (daysRemaining <= 30) return 'expiring';
    return 'active';
  };

  const getExpiryAlertColor = (status) => {
    switch (status) {
      case 'expired': return 'text-error bg-error/10';
      case 'expiring': return 'text-warning bg-warning/10';
      default: return 'text-gray-600';
    }
  };

  const getExpiryIcon = (status) => {
    switch (status) {
      case 'expired': return 'AlertTriangle';
      case 'expiring': return 'Clock';
      default: return null;
}
  };

const handleViewContractor = (contractorId) => {
    navigate(`/contractors/${contractorId}`);
  };

  const handleEditContractor = (contractorId) => {
    navigate(`/contractors/${contractorId}`);
  };

  if (loading) {
    return <Loading variant="table" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load contractors"
        message={error}
        onRetry={loadContractors}
      />
    );
  }

if (contractors.length === 0) {
    return (
      <Empty
        title="No contractors found"
        message="Get started by adding your first contractor to the system."
        icon="Users"
        actionLabel="Add Contractor"
        onAction={() => console.log('Add contractor clicked')}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search contractors..."
          className="w-full md:w-96"
        />
        
        <div className="flex items-center gap-4">
<select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="onboarding">Onboarding</option>
            <option value="expiring">Expiring Soon</option>
          </select>
          
<Button variant="primary" className="flex items-center gap-2">
            <ApperIcon name="Plus" className="w-4 h-4" />
            Add Contractor
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
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Department</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Manager</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Contract Period</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
{filteredContractors.map((contractor) => (
                  <motion.tr
                    key={contractor.Id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    transition={{ duration: 0.15 }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-full flex items-center justify-center">
                          <ApperIcon name="User" className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{contractor?.name}</p>
                          <p className="text-sm text-gray-500">{contractor?.email}</p>
                        </div>
                      </div>
                    </td>
<td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{contractor?.department}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{contractor?.manager}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        <p>{formatDate(contractor?.startDate)} - {formatDate(contractor?.endDate)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const expiryStatus = getExpiryStatus(contractor?.daysRemaining);
                            const alertColor = getExpiryAlertColor(expiryStatus);
                            const alertIcon = getExpiryIcon(expiryStatus);
                            
                            return (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${alertColor}`}>
                                {alertIcon && <ApperIcon name={alertIcon} className="w-3 h-3" />}
                                <span>
                                  {contractor?.daysRemaining <= 0 
                                    ? 'Expired' 
                                    : `${contractor?.daysRemaining} days remaining`}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
<td className="py-4 px-6">
                      <StatusBadge status={contractor?.status} type="contractor" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewContractor(contractor.Id)}
                        >
                          <ApperIcon name="Eye" className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditContractor(contractor.Id)}
                        >
                          <ApperIcon name="Edit" className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="MoreHorizontal" className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

{filteredContractors.length === 0 && contractors.length > 0 && (
        <Empty
          title="No contractors match your search"
          message="Try adjusting your search criteria or status filter."
          icon="Search"
          showAction={false}
        />
      )}
    </motion.div>
  );
};
export default ContractorsList;