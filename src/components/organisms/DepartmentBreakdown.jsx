import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import Chart from 'react-apexcharts';

const DepartmentBreakdown = ({ data, loading }) => {
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
      type: 'bar',
      height: 300,
      toolbar: {
        show: false
      }
    },
    colors: ['#003366', '#0066CC'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth'
    },
    xaxis: {
      categories: data.departmentBreakdown?.map(dept => dept.department) || [],
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
            colors: '#003366'
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
            colors: '#0066CC'
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
    }
  };

  const chartSeries = [
    {
      name: 'Contractors',
      type: 'column',
      data: data.departmentBreakdown?.map(dept => dept.contractors) || []
    },
    {
      name: 'Spend',
      type: 'line',
      yAxisIndex: 1,
      data: data.departmentBreakdown?.map(dept => dept.spend) || []
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ApperIcon name="BarChart3" className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Department Breakdown</h3>
              <p className="text-sm text-gray-500">Contractors and spending by department</p>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height="100%"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{data.totalContractors}</div>
            <div className="text-sm text-gray-600">Total Contractors</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-secondary">
              ${(data.monthlySpend / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-gray-600">Monthly Spend</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DepartmentBreakdown;