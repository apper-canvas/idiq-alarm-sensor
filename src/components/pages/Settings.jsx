import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';

const Settings = () => {
  const settingsCategories = [
    {
      title: 'General Settings',
      icon: 'Settings',
      items: [
        { label: 'Company Name', value: 'Bank of Excellence', type: 'text' },
        { label: 'Default Currency', value: 'USD', type: 'select' },
        { label: 'Time Zone', value: 'EST', type: 'select' },
        { label: 'Date Format', value: 'MM/DD/YYYY', type: 'select' }
      ]
    },
    {
      title: 'Contractor Management',
      icon: 'Users',
      items: [
        { label: 'Default Contract Length (Days)', value: '90', type: 'number' },
        { label: 'Auto-reminder Before Expiry (Days)', value: '7', type: 'number' },
        { label: 'Require Manager Approval', value: 'true', type: 'checkbox' },
        { label: 'Enable Overtime Tracking', value: 'true', type: 'checkbox' }
      ]
    },
    {
      title: 'Notifications',
      icon: 'Bell',
      items: [
        { label: 'Email Notifications', value: 'true', type: 'checkbox' },
        { label: 'SMS Alerts', value: 'false', type: 'checkbox' },
        { label: 'Weekly Summary Reports', value: 'true', type: 'checkbox' },
        { label: 'Critical Alerts Only', value: 'false', type: 'checkbox' }
      ]
    },
    {
      title: 'Security',
      icon: 'Shield',
      items: [
        { label: 'Two-Factor Authentication', value: 'enabled', type: 'status' },
        { label: 'Session Timeout (Minutes)', value: '30', type: 'number' },
        { label: 'Password Policy', value: 'strong', type: 'select' },
        { label: 'Access Log Retention (Days)', value: '90', type: 'number' }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure system preferences and manage application settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsCategories.map((category) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <ApperIcon name={category.icon} className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 flex-1">
                        {item.label}
                      </label>
                      <div className="w-48">
                        {item.type === 'text' || item.type === 'number' ? (
                          <Input
                            type={item.type}
                            defaultValue={item.value}
                            className="w-full"
                          />
                        ) : item.type === 'select' ? (
                          <Select defaultValue={item.value} className="w-full">
                            <option value={item.value}>{item.value}</option>
                          </Select>
                        ) : item.type === 'checkbox' ? (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              defaultChecked={item.value === 'true'}
                              className="rounded border-gray-300 text-secondary focus:ring-secondary"
                            />
                          </div>
                        ) : item.type === 'status' ? (
                          <span className="text-sm text-accent font-medium">
                            {item.value}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          Reset to Defaults
        </Button>
        <Button variant="primary">
          Save Settings
        </Button>
      </div>
    </motion.div>
  );
};

export default Settings;