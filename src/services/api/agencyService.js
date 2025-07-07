import agenciesData from '@/services/mockData/agencies.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const agencyService = {
  async getAll() {
    await delay(300);
    return [...agenciesData];
  },

  async getById(id) {
    await delay(200);
    const agency = agenciesData.find(a => a.Id === parseInt(id));
    if (!agency) throw new Error('Agency not found');
    return { ...agency };
  },

  async create(agencyData) {
    await delay(400);
    const newAgency = {
      ...agencyData,
      Id: Math.max(...agenciesData.map(a => a.Id)) + 1,
      createdDate: new Date().toISOString()
    };
    agenciesData.push(newAgency);
    return { ...newAgency };
  },

  async update(id, updateData) {
    await delay(350);
    const index = agenciesData.findIndex(a => a.Id === parseInt(id));
    if (index === -1) throw new Error('Agency not found');
    
    agenciesData[index] = { ...agenciesData[index], ...updateData };
    return { ...agenciesData[index] };
  },

  async delete(id) {
    await delay(250);
    const index = agenciesData.findIndex(a => a.Id === parseInt(id));
    if (index === -1) throw new Error('Agency not found');
    
    agenciesData.splice(index, 1);
    return { success: true };
  }
};