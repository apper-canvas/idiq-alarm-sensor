import Badge from '@/components/atoms/Badge';

const StatusBadge = ({ status, type = 'contractor' }) => {
  const getStatusConfig = () => {
    if (type === 'contractor') {
      switch (status?.toLowerCase()) {
        case 'active':
          return { variant: 'success', label: 'Active' };
        case 'pending':
          return { variant: 'warning', label: 'Pending' };
        case 'inactive':
          return { variant: 'error', label: 'Inactive' };
        case 'onboarding':
          return { variant: 'info', label: 'Onboarding' };
        default:
          return { variant: 'default', label: status || 'Unknown' };
      }
    }
    
    if (type === 'requisition') {
      switch (status?.toLowerCase()) {
        case 'open':
          return { variant: 'info', label: 'Open' };
        case 'in_progress':
          return { variant: 'warning', label: 'In Progress' };
        case 'filled':
          return { variant: 'success', label: 'Filled' };
        case 'cancelled':
          return { variant: 'error', label: 'Cancelled' };
        default:
          return { variant: 'default', label: status || 'Unknown' };
      }
    }
    
    if (type === 'timesheet') {
      switch (status?.toLowerCase()) {
        case 'submitted':
          return { variant: 'warning', label: 'Submitted' };
        case 'approved':
          return { variant: 'success', label: 'Approved' };
        case 'rejected':
          return { variant: 'error', label: 'Rejected' };
        case 'draft':
          return { variant: 'default', label: 'Draft' };
        default:
          return { variant: 'default', label: status || 'Unknown' };
      }
}
    
    if (type === 'ticket') {
      switch (status?.toLowerCase()) {
        case 'draft':
          return { variant: 'default', label: 'Draft' };
        case 'submitted':
          return { variant: 'warning', label: 'Submitted' };
        case 'validated':
          return { variant: 'info', label: 'Validated' };
        case 'posted':
          return { variant: 'info', label: 'Posted' };
        case 'in_progress':
          return { variant: 'warning', label: 'In Progress' };
        case 'closed':
          return { variant: 'success', label: 'Closed' };
        default:
          return { variant: 'default', label: status || 'Unknown' };
      }
    }
    
    return { variant: 'default', label: status || 'Unknown' };
  };

  const { variant, label } = getStatusConfig();
  
  return <Badge variant={variant}>{label}</Badge>;
};

export default StatusBadge;