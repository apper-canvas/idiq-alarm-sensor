import requisitionsData from '@/services/mockData/requisitions.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const requisitionService = {
  async getAll() {
    await delay(300);
    return [...requisitionsData];
  },

  async getById(id) {
    await delay(200);
    const requisition = requisitionsData.find(r => r.Id === parseInt(id));
    if (!requisition) throw new Error('Requisition not found');
    return { ...requisition };
  },

  async create(requisitionData) {
    await delay(400);
    const newRequisition = {
      ...requisitionData,
      Id: Math.max(...requisitionsData.map(r => r.Id)) + 1,
      createdDate: new Date().toISOString(),
      status: 'open'
    };
    requisitionsData.push(newRequisition);
    return { ...newRequisition };
  },

  async update(id, updateData) {
    await delay(350);
    const index = requisitionsData.findIndex(r => r.Id === parseInt(id));
    if (index === -1) throw new Error('Requisition not found');
    
    requisitionsData[index] = { ...requisitionsData[index], ...updateData };
    return { ...requisitionsData[index] };
  },

  async delete(id) {
    await delay(250);
    const index = requisitionsData.findIndex(r => r.Id === parseInt(id));
    if (index === -1) throw new Error('Requisition not found');
    
    requisitionsData.splice(index, 1);
    return { success: true };
  }
};