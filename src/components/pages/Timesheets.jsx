import { motion } from 'framer-motion';
import TimesheetsList from '@/components/organisms/TimesheetsList';

const Timesheets = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Timesheets</h1>
        <p className="text-gray-600 mt-2">Review and approve contractor timesheets and overtime requests.</p>
      </div>

      <TimesheetsList />
    </motion.div>
  );
};

export default Timesheets;