import timesheetsData from '@/services/mockData/timesheets.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
      createdDate: new Date().toISOString()
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
  }
};