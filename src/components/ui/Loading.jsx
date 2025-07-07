import { motion } from 'framer-motion';

const Loading = ({ variant = 'table' }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (variant === 'table') {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <motion.div variants={item} className="animate-pulse">
          <div className="h-6 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded-lg w-1/4"></div>
        </motion.div>
        <motion.div variants={item} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-surface px-6 py-4">
            <div className="flex space-x-4">
              <div className="h-4 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-20"></div>
              <div className="h-4 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-32"></div>
              <div className="h-4 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-24"></div>
              <div className="h-4 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-16"></div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-8 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-1/3"></div>
                    <div className="h-3 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (variant === 'cards') {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            variants={item}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-12 w-12 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-full"></div>
              <div className="h-3 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-2/3"></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <motion.div variants={item} className="animate-pulse">
        <div className="h-6 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded-lg w-1/4"></div>
      </motion.div>
      <motion.div variants={item} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-1/2"></div>
          <div className="h-4 bg-gradient-to-r from-surface via-gray-200 to-surface bg-[length:200px_100%] animate-shimmer rounded w-5/6"></div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Loading;