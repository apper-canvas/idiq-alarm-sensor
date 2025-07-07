import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { agencyService } from '@/services/api/agencyService';

const Agencies = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadAgencies = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await agencyService.getAll();
      setAgencies(data);
    } catch (err) {
      setError('Failed to load agencies. Please try again.');
      console.error('Error loading agencies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading variant="cards" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load agencies"
        message={error}
        onRetry={loadAgencies}
      />
    );
  }

  if (agencies.length === 0) {
    return (
      <Empty
        title="No agencies found"
        message="Add your first staffing agency to start managing contractors."
        icon="Building2"
        actionLabel="Add Agency"
        onAction={() => console.log('Add agency clicked')}
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
        <h1 className="text-3xl font-bold text-gray-900">Agencies</h1>
        <p className="text-gray-600 mt-2">Manage relationships with staffing agencies and track performance.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search agencies..."
          className="w-full md:w-96"
        />
        
        <Button variant="primary" className="flex items-center gap-2">
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Agency
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgencies.map((agency) => (
          <motion.div
            key={agency.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-full flex items-center justify-center">
                      <ApperIcon name="Building2" className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{agency.name}</h3>
                      <p className="text-sm text-gray-500">{agency.contactEmail}</p>
                    </div>
                  </div>
                  <Badge variant="primary">{agency.activeContractors} Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Contractors</p>
                      <p className="text-lg font-semibold text-gray-900">{agency.totalContractors}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Success Rate</p>
                      <p className="text-lg font-semibold text-gray-900">{agency.successRate}%</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Contract Rating</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <ApperIcon
                            key={i}
                            name="Star"
                            className={`w-4 h-4 ${
                              i < agency.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ApperIcon name="Mail" className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ApperIcon name="Phone" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredAgencies.length === 0 && agencies.length > 0 && (
        <Empty
          title="No agencies match your search"
          message="Try adjusting your search criteria."
          icon="Search"
          showAction={false}
        />
      )}
    </motion.div>
  );
};

export default Agencies;