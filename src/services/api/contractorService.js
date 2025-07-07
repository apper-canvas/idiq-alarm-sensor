import contractorsData from '@/services/mockData/contractors.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const contractorService = {
  async getAll() {
    await delay(300);
    return [...contractorsData];
  },

  async getById(id) {
    await delay(200);
    const contractor = contractorsData.find(c => c.Id === parseInt(id));
    if (!contractor) throw new Error('Contractor not found');
    return { ...contractor };
  },

  async create(contractorData) {
    await delay(400);
    const newContractor = {
      ...contractorData,
      Id: Math.max(...contractorsData.map(c => c.Id)) + 1,
      createdDate: new Date().toISOString()
    };
    contractorsData.push(newContractor);
    return { ...newContractor };
  },

  async update(id, updateData) {
    await delay(350);
    const index = contractorsData.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('Contractor not found');
    
    contractorsData[index] = { ...contractorsData[index], ...updateData };
    return { ...contractorsData[index] };
  },

  async delete(id) {
    await delay(250);
    const index = contractorsData.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('Contractor not found');
    
    contractorsData.splice(index, 1);
return { success: true };
  }
};

// Re-export timeOffService for convenience
export { timeOffService } from './timeOffService';