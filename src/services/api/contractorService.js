import assetsData from '@/services/mockData/assets.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const assetService = {
  async getAll() {
    await delay(300);
    return [...assetsData];
  },

  async getById(id) {
    await delay(200);
    const asset = assetsData.find(c => c.Id === parseInt(id));
    if (!asset) throw new Error('Asset not found');
    return { ...asset };
  },

  async create(assetData) {
    await delay(400);
    const newAsset = {
      ...assetData,
      Id: Math.max(...assetsData.map(c => c.Id)) + 1,
      createdDate: new Date().toISOString()
    };
    assetsData.push(newAsset);
    return { ...newAsset };
  },

  async update(id, updateData) {
    await delay(350);
    const index = assetsData.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('Asset not found');
    
    assetsData[index] = { ...assetsData[index], ...updateData };
    return { ...assetsData[index] };
  },

  async delete(id) {
    await delay(250);
    const index = assetsData.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('Asset not found');
    
    assetsData.splice(index, 1);
return { success: true };
  },

  async getExpiringContracts() {
    await delay(250);
    const expiringAssets = assetsData.filter(asset => 
      asset.daysRemaining <= 30 && asset.daysRemaining > 0
    );
    return [...expiringAssets];
  }
};

// Re-export timeOffService and overtimeService for convenience
export { timeOffService } from './timeOffService';
export { overtimeService } from './overtimeService';