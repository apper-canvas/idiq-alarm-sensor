import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import Chart from 'react-apexcharts';

const MonthlyTrends = ({ data, loading }) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const chartOptions = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    colors: ['#00AA44', '#FF9500'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.1
      }
    },
    xaxis: {
      categories: data.monthlyTrends?.map(trend => trend.month) || [],
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: [
      {
        title: {
          text: 'Contractors'
        },
        labels: {
          style: {
            colors: '#00AA44'
          }
        }
      },
      {
        opposite: true,
        title: {
          text: 'Spend ($)'
        },
        labels: {
          style: {
            colors: '#FF9500'
          },
          formatter: function (val) {
            return '$' + (val / 1000).toFixed(0) + 'K';
          }
        }
      }
    ],
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    },
    grid: {
      borderColor: '#e7e7e7',
      strokeDashArray: 3
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (val, { seriesIndex }) {
          if (seriesIndex === 1) {
            return '$' + (val / 1000).toFixed(0) + 'K';
          }
          return val;
        }
      }
    }
  };

  const chartSeries = [
    {
      name: 'Contractors',
      data: data.monthlyTrends?.map(trend => trend.contractors) || []
    },
    {
      name: 'Spend',
      data: data.monthlyTrends?.map(trend => trend.spend) || []
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
              <p className="text-sm text-gray-500">Contractor and spending trends over time</p>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height="100%"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-accent">
              {data.contractorStatus?.active || 0}
            </div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-warning">
              {data.contractorStatus?.onboarding || 0}
            </div>
            <div className="text-xs text-gray-600">Onboarding</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-info">
              {data.contractorStatus?.pending || 0}
            </div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MonthlyTrends;