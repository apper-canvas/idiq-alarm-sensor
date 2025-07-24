import { motion } from 'framer-motion';
import AssetsList from '@/components/organisms/ContractorsList';

const Assets = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
<h1 className="text-3xl font-bold text-gray-900">Assets</h1>
        <p className="text-gray-600 mt-2">Manage and track all asset personnel across departments.</p>
      </div>

<AssetsList />
    </motion.div>
  );
};

export default Assets;