import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { assetService } from "@/services/api/contractorService";
import ApperIcon from "@/components/ApperIcon";
import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const AssetsList = () => {
  const navigate = useNavigate();
const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

const loadAssets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await assetService.getAll();
      setAssets(data);
    } catch (err) {
      setError('Failed to load assets. Please try again.');
      console.error('Error loading assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (selectedStatus === 'expiring') {
      matchesStatus = asset.daysRemaining <= 30 && asset.daysRemaining > 0;
    } else if (selectedStatus !== 'all') {
      matchesStatus = asset.status.toLowerCase() === selectedStatus.toLowerCase();
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

const handleViewAsset = (assetId) => {
    navigate(`/assets/${assetId}`);
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
        title="Failed to load assets"
        message={error}
        onRetry={loadAssets}
      />
    );
  }

if (assets.length === 0) {
    return (
      <Empty
        title="No assets found"
        message="Get started by adding your first asset to the system."
        icon="Users"
        actionLabel="Add Asset"
        onAction={() => console.log('Add asset clicked')}
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
placeholder="Search assets..."
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
            Add Asset
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-gray-200">
                <tr>
<th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Asset</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Department</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Manager</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Contract Period</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
{filteredAssets.map((asset) => (
                  <motion.tr
                    key={asset.Id}
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
                          <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                          <p className="text-sm text-gray-500">{asset.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{asset.department}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{asset.manager}</p>
                    </td>
<td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        <p>{formatDate(asset.startDate)} - {formatDate(asset.endDate)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const expiryStatus = getExpiryStatus(asset.daysRemaining);
                            const alertColor = getExpiryAlertColor(expiryStatus);
                            const alertIcon = getExpiryIcon(expiryStatus);
                            
                            return (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${alertColor}`}>
                                {alertIcon && <ApperIcon name={alertIcon} className="w-3 h-3" />}
                                <span>
                                  {asset.daysRemaining <= 0 
                                    ? 'Expired' 
                                    : `${asset.daysRemaining} days remaining`}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={asset.status} type="asset" />
                    </td>
<td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewAsset(asset.Id)}
                        >
                          <ApperIcon name="Eye" className="w-4 h-4" />
                        </Button>
<Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditContractor(asset.Id)}
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

{filteredAssets.length === 0 && assets.length > 0 && (
        <Empty
          title="No assets match your search"
          message="Try adjusting your search criteria or status filter."
          icon="Search"
          showAction={false}
        />
      )}
    </motion.div>
  );
};
export default AssetsList;