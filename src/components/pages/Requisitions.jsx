import { motion } from 'framer-motion';
import RequisitionsList from '@/components/organisms/RequisitionsList';

const Requisitions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Requisitions</h1>
        <p className="text-gray-600 mt-2">Track contractor requests from creation to fulfillment.</p>
      </div>

      <RequisitionsList />
    </motion.div>
  );
};

export default Requisitions;