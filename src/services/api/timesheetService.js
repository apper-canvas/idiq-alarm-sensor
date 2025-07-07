import timesheetsData from '@/services/mockData/timesheets.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock workplans data
let workplansData = [
  {
    Id: 1,
    name: "Technology Development",
    description: "Core system development and maintenance",
    approverName: "Sarah Johnson",
    approverEmail: "sarah.johnson@bank.com",
    status: "active",
    createdDate: "2024-01-15T00:00:00.000Z"
  },
  {
    Id: 2,
    name: "Risk Management Initiative",
    description: "Quarterly risk assessment and compliance",
    approverName: "Michael Chen",
    approverEmail: "michael.chen@bank.com",
    status: "active",
    createdDate: "2024-01-20T00:00:00.000Z"
  },
{
    Id: 3,
    name: "Operations Optimization",
    description: "Process improvement and operational efficiency",
    approverName: "Lisa Anderson",
    approverEmail: "lisa.anderson@bank.com",
    status: "active",
    createdDate: "2024-01-25T00:00:00.000Z"
  },
  {
    Id: 4,
    name: "Customer Experience Enhancement",
    description: "Digital transformation and customer service optimization",
    approverName: "Rachel Kim",
    approverEmail: "rachel.kim@bank.com",
    status: "active",
    createdDate: "2024-01-30T00:00:00.000Z"
  }
];

export const timesheetService = {
  async getAll() {
    await delay(300);
    return [...timesheetsData];
  },

  async getById(id) {
    await delay(200);
    const timesheet = timesheetsData.find(t => t.Id === parseInt(id));
    if (!timesheet) throw new Error('Timesheet not found');
    return { ...timesheet };
  },

  async create(timesheetData) {
    await delay(400);
    const newTimesheet = {
      ...timesheetData,
      Id: Math.max(...timesheetsData.map(t => t.Id)) + 1,
      createdDate: new Date().toISOString(),
      submittedDate: null
    };
    timesheetsData.push(newTimesheet);
    return { ...newTimesheet };
  },

  async update(id, updateData) {
    await delay(350);
    const index = timesheetsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Timesheet not found');
    
    timesheetsData[index] = { ...timesheetsData[index], ...updateData };
    return { ...timesheetsData[index] };
  },

  async delete(id) {
    await delay(250);
    const index = timesheetsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Timesheet not found');
    
    timesheetsData.splice(index, 1);
    return { success: true };
  },

  // Workplan management methods
  async getWorkplans() {
    await delay(300);
    return [...workplansData];
  },

  async getWorkplanById(id) {
    await delay(200);
    const workplan = workplansData.find(w => w.Id === parseInt(id));
    if (!workplan) throw new Error('Workplan not found');
    return { ...workplan };
  },

  async createWorkplan(workplanData) {
    await delay(400);
    const newWorkplan = {
      ...workplanData,
      Id: Math.max(...workplansData.map(w => w.Id)) + 1,
      createdDate: new Date().toISOString()
    };
    workplansData.push(newWorkplan);
    return { ...newWorkplan };
  },

  async updateWorkplan(id, updateData) {
    await delay(350);
    const index = workplansData.findIndex(w => w.Id === parseInt(id));
    if (index === -1) throw new Error('Workplan not found');
    
    workplansData[index] = { ...workplansData[index], ...updateData };
    return { ...workplansData[index] };
  },

  async deleteWorkplan(id) {
    await delay(250);
    const index = workplansData.findIndex(w => w.Id === parseInt(id));
    if (index === -1) throw new Error('Workplan not found');
    
    workplansData.splice(index, 1);
    return { success: true };
  },

  // Contractor assignment methods
  async assignContractor(workplanId, contractorId) {
    await delay(300);
    const workplan = workplansData.find(w => w.Id === parseInt(workplanId));
    if (!workplan) throw new Error('Workplan not found');
    
    // This would typically update the contractor's workplan assignment
    // For now, we'll just return success
    return { success: true, workplanId: parseInt(workplanId), contractorId: parseInt(contractorId) };
  },

  async unassignContractor(workplanId, contractorId) {
    await delay(250);
    // This would typically remove the contractor's workplan assignment
    return { success: true, workplanId: parseInt(workplanId), contractorId: parseInt(contractorId) };
  },

  // Approval workflow methods
  async approveTimesheet(timesheetId, comments) {
    await delay(350);
    const index = timesheetsData.findIndex(t => t.Id === parseInt(timesheetId));
    if (index === -1) throw new Error('Timesheet not found');
    
    timesheetsData[index] = {
      ...timesheetsData[index],
      status: 'approved',
      approvedDate: new Date().toISOString(),
      approvalComments: comments
    };
    
    return { ...timesheetsData[index] };
  },

  async rejectTimesheet(timesheetId, comments) {
    await delay(350);
    const index = timesheetsData.findIndex(t => t.Id === parseInt(timesheetId));
    if (index === -1) throw new Error('Timesheet not found');
    
    timesheetsData[index] = {
      ...timesheetsData[index],
      status: 'rejected',
      rejectedDate: new Date().toISOString(),
      rejectionComments: comments
    };
    
    return { ...timesheetsData[index] };
  },

  async submitTimesheet(timesheetId) {
    await delay(300);
    const index = timesheetsData.findIndex(t => t.Id === parseInt(timesheetId));
    if (index === -1) throw new Error('Timesheet not found');
    
    timesheetsData[index] = {
      ...timesheetsData[index],
      status: 'submitted',
      submittedDate: new Date().toISOString()
    };
    
    return { ...timesheetsData[index] };
  },

  // Notification methods
  async getPendingTimesheets() {
    await delay(200);
    return timesheetsData.filter(t => t.status === 'submitted');
  },

  async getTimesheetsByApprover(approverName) {
    await delay(250);
    return timesheetsData.filter(t => t.approverName === approverName);
  }
};