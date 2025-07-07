import ticketsData from '@/services/mockData/tickets.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for dropdown options
const mockCategories = [
  { Id: 1, name: 'Technical', description: 'Software development and IT roles' },
  { Id: 2, name: 'Finance', description: 'Financial analysis and accounting roles' },
  { Id: 3, name: 'Operations', description: 'Business operations and management' },
  { Id: 4, name: 'Marketing', description: 'Marketing and communications roles' },
  { Id: 5, name: 'Legal', description: 'Legal and compliance positions' },
  { Id: 6, name: 'HR', description: 'Human resources and talent management' }
];

const mockBudgetSources = [
  { Id: 1, name: 'Capital Projects', code: 'CAP', available: true },
  { Id: 2, name: 'Operational Budget', code: 'OPS', available: true },
  { Id: 3, name: 'Special Projects', code: 'SPE', available: true },
  { Id: 4, name: 'Training Budget', code: 'TRA', available: false },
  { Id: 5, name: 'Digital Transformation', code: 'DIG', available: true },
  { Id: 6, name: 'Infrastructure', code: 'INF', available: true }
];

const mockProjects = [
  { Id: 1, name: 'Core Banking Modernization', status: 'active', manager: 'John Smith' },
  { Id: 2, name: 'Digital Transformation Initiative', status: 'active', manager: 'Lisa Anderson' },
  { Id: 3, name: 'Risk Assessment Initiative', status: 'active', manager: 'Sarah Johnson' },
  { Id: 4, name: 'Mobile Banking Enhancement', status: 'planning', manager: 'Michael Chen' },
  { Id: 5, name: 'Cybersecurity Upgrade', status: 'active', manager: 'Jennifer Williams' },
  { Id: 6, name: 'Data Analytics Platform', status: 'planning', manager: 'David Rodriguez' }
];

const mockWorkArrangements = [
  { Id: 1, name: 'On-site', description: 'Full-time office presence required' },
  { Id: 2, name: 'Remote', description: 'Work from home with occasional office visits' },
  { Id: 3, name: 'Hybrid', description: '2-3 days in office, 2-3 days remote' },
  { Id: 4, name: 'Flexible', description: 'Arrangement based on project needs' }
];

let nextTicketId = Math.max(...ticketsData.map(t => t.Id), 0) + 1;
let nextPositionId = Math.max(...ticketsData.flatMap(t => t.positions.map(p => p.Id)), 0) + 1;
let nextAttachmentId = Math.max(...ticketsData.flatMap(t => t.attachments.map(a => a.Id)), 0) + 1;

export const ticketService = {
  async getAll() {
    await delay(300);
    return [...ticketsData];
  },

  async getById(id) {
    await delay(200);
    const ticket = ticketsData.find(t => t.Id === parseInt(id));
    if (!ticket) throw new Error('Ticket not found');
    return { ...ticket };
  },

  async create(ticketData) {
    await delay(400);
    
    // Process positions with auto-generated IDs
    const positions = ticketData.positions.map(position => ({
      ...position,
      Id: nextPositionId++
    }));

    // Process attachments with auto-generated IDs
    const attachments = (ticketData.attachments || []).map(attachment => ({
      ...attachment,
      Id: nextAttachmentId++,
      uploadDate: new Date().toISOString().split('T')[0]
    }));

    const newTicket = {
      ...ticketData,
      Id: nextTicketId++,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'open',
      positions,
      attachments
    };
    
    ticketsData.push(newTicket);
    return { ...newTicket };
  },

  async update(id, updateData) {
    await delay(350);
    const index = ticketsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Ticket not found');
    
    // Handle position updates
    if (updateData.positions) {
      updateData.positions = updateData.positions.map(position => 
        position.Id ? position : { ...position, Id: nextPositionId++ }
      );
    }

    // Handle attachment updates
    if (updateData.attachments) {
      updateData.attachments = updateData.attachments.map(attachment => 
        attachment.Id ? attachment : { 
          ...attachment, 
          Id: nextAttachmentId++,
          uploadDate: new Date().toISOString().split('T')[0]
        }
      );
    }
    
    ticketsData[index] = { ...ticketsData[index], ...updateData };
    return { ...ticketsData[index] };
  },

  async delete(id) {
    await delay(250);
    const index = ticketsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Ticket not found');
    
    ticketsData.splice(index, 1);
    return { success: true };
  },

  // Dropdown data methods
  async getCategories() {
    await delay(150);
    return [...mockCategories];
  },

  async getBudgetSources() {
    await delay(150);
    return [...mockBudgetSources.filter(b => b.available)];
  },

  async getProjects() {
    await delay(150);
    return [...mockProjects.filter(p => p.status === 'active')];
  },

  async getWorkArrangements() {
    await delay(150);
    return [...mockWorkArrangements];
  },

  // File upload simulation
  async uploadFile(file, type) {
    await delay(1000); // Simulate upload time
    return {
      Id: nextAttachmentId++,
      name: file.name,
      type: type,
      size: file.size,
      uploadDate: new Date().toISOString().split('T')[0],
      url: `uploads/${file.name}` // Mock URL
    };
  }
};