import torData from '@/services/mockData/tors.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let tors = [...torData];

export const torService = {
  async getAll() {
    await delay(300);
    return [...tors];
  },

  async getById(id) {
    await delay(200);
    const tor = tors.find(t => t.Id === parseInt(id));
    if (!tor) throw new Error('TOR not found');
    return { ...tor };
  },

  async create(torData) {
    await delay(400);
    const newTor = {
      ...torData,
      Id: Math.max(...tors.map(t => t.Id), 0) + 1,
      createdDate: new Date().toISOString(),
      status: 'draft',
      lastModified: new Date().toISOString()
    };
    tors.unshift(newTor);
    return { ...newTor };
  },

  async update(id, updateData) {
    await delay(350);
    const index = tors.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('TOR not found');
    
    tors[index] = { 
      ...tors[index], 
      ...updateData, 
      lastModified: new Date().toISOString() 
    };
    return { ...tors[index] };
  },

  async delete(id) {
    await delay(250);
    const index = tors.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('TOR not found');
    
    tors.splice(index, 1);
    return { success: true };
  }
};