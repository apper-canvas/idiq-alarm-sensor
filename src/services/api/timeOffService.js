import timeOffData from '@/services/mockData/timeOff.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const timeOffService = {
  async getAll() {
    await delay(300);
    return [...timeOffData];
  },

  async getById(id) {
    await delay(200);
    const request = timeOffData.find(t => t.Id === parseInt(id));
    if (!request) throw new Error('Time off request not found');
    return { ...request };
  },

  async create(requestData) {
    await delay(400);
    const newRequest = {
      ...requestData,
      Id: Math.max(...timeOffData.map(t => t.Id)) + 1,
      status: 'Pending',
      submittedDate: new Date().toISOString(),
      submittedBy: 'Current User'
    };
    timeOffData.push(newRequest);
    return { ...newRequest };
  },

  async update(id, updateData) {
    await delay(350);
    const index = timeOffData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Time off request not found');
    
    timeOffData[index] = { ...timeOffData[index], ...updateData };
    return { ...timeOffData[index] };
  },

  async delete(id) {
    await delay(250);
    const index = timeOffData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Time off request not found');
    
    timeOffData.splice(index, 1);
    return { success: true };
  }
};