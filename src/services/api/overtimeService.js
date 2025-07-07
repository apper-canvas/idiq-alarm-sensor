import overtimeData from '@/services/mockData/overtime.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const overtimeService = {
  async getAll() {
    await delay(300);
    return [...overtimeData];
  },

  async getById(id) {
    await delay(200);
    const request = overtimeData.find(r => r.Id === parseInt(id));
    if (!request) throw new Error('Overtime request not found');
    return { ...request };
  },

  async create(requestData) {
    await delay(400);
    const newRequest = {
      ...requestData,
      Id: Math.max(...overtimeData.map(r => r.Id)) + 1,
      submittedDate: new Date().toISOString(),
      status: 'pending'
    };
    overtimeData.push(newRequest);
    return { ...newRequest };
  },

  async update(id, updateData) {
    await delay(350);
    const index = overtimeData.findIndex(r => r.Id === parseInt(id));
    if (index === -1) throw new Error('Overtime request not found');
    
    overtimeData[index] = { ...overtimeData[index], ...updateData };
    return { ...overtimeData[index] };
  },

  async delete(id) {
    await delay(250);
    const index = overtimeData.findIndex(r => r.Id === parseInt(id));
    if (index === -1) throw new Error('Overtime request not found');
    
    overtimeData.splice(index, 1);
    return { success: true };
  },

  async approve(id, comments) {
    await delay(350);
    const index = overtimeData.findIndex(r => r.Id === parseInt(id));
    if (index === -1) throw new Error('Overtime request not found');
    
    overtimeData[index] = {
      ...overtimeData[index],
      status: 'approved',
      approvedDate: new Date().toISOString(),
      approvalComments: comments,
      approvedBy: 'Current User' // In real app, this would be the logged-in user
    };
    
    return { ...overtimeData[index] };
  },

  async reject(id, comments) {
    await delay(350);
    const index = overtimeData.findIndex(r => r.Id === parseInt(id));
    if (index === -1) throw new Error('Overtime request not found');
    
    overtimeData[index] = {
      ...overtimeData[index],
      status: 'rejected',
      rejectedDate: new Date().toISOString(),
      rejectionComments: comments,
      rejectedBy: 'Current User' // In real app, this would be the logged-in user
    };
    
    return { ...overtimeData[index] };
  },

  async getMonthlySummary(year, month) {
    await delay(400);
    
    // Filter requests for the specified month and year
    const monthlyRequests = overtimeData.filter(request => {
      const requestDate = new Date(request.date);
      return requestDate.getFullYear() === year && requestDate.getMonth() + 1 === month;
    });

    if (monthlyRequests.length === 0) {
      return null;
    }

    const approvedRequests = monthlyRequests.filter(r => r.status === 'approved');
    const totalHours = approvedRequests.reduce((sum, r) => sum + r.hours, 0);
    const uniqueContractors = new Set(approvedRequests.map(r => r.contractorId)).size;
    
    // Calculate estimated cost (assuming $50/hour average overtime rate)
    const estimatedCost = totalHours * 50;

    // Department breakdown
    const departmentMap = new Map();
    approvedRequests.forEach(request => {
      const dept = request.department;
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          department: dept,
          hours: 0,
          contractors: new Set(),
          cost: 0
        });
      }
      const deptData = departmentMap.get(dept);
      deptData.hours += request.hours;
      deptData.contractors.add(request.contractorId);
      deptData.cost += request.hours * 50;
    });

    const departmentBreakdown = Array.from(departmentMap.values()).map(dept => ({
      ...dept,
      contractors: dept.contractors.size
    }));

    return {
      totalHours,
      approvedRequests: approvedRequests.length,
      uniqueContractors,
      estimatedCost,
      departmentBreakdown
    };
  },

  async getPendingRequests() {
    await delay(200);
    return overtimeData.filter(r => r.status === 'pending');
  },

  async getRequestsByContractor(contractorId) {
    await delay(250);
    return overtimeData.filter(r => r.contractorId === parseInt(contractorId));
  },

  async getRequestsByStatus(status) {
    await delay(200);
    return overtimeData.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }
};