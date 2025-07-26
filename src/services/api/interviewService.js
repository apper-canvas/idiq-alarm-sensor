// Mock data storage for interview scheduling
let interviews = [
  {
    Id: 1,
    requisitionId: 1,
    candidateId: 1,
    candidateName: "Ahmed Hassan",
    agencyName: "TechStaff Solutions",
    status: "scheduled",
    scheduledDate: "2024-01-25",
    scheduledTime: "10:00",
    notes: "Technical interview with development team",
    createdDate: "2024-01-22T16:00:00Z",
    updatedDate: "2024-01-22T16:00:00Z"
  },
  {
    Id: 2,
    requisitionId: 1,
    candidateId: 4,
    candidateName: "John Miller",
    agencyName: "Global Recruiters",
    status: "scheduled",
    scheduledDate: "2024-01-26",
    scheduledTime: "14:30",
    notes: "Initial screening interview",
    createdDate: "2024-01-22T17:00:00Z",
    updatedDate: "2024-01-22T17:00:00Z"
  },
  {
    Id: 3,
    requisitionId: 1,
    candidateId: 5,
    candidateName: "Robert Chen",
    agencyName: "IT Professionals",
    status: "scheduled",
    scheduledDate: "2024-01-27",
    scheduledTime: "11:00",
    notes: "Technical assessment and team fit",
    createdDate: "2024-01-23T09:00:00Z",
    updatedDate: "2024-01-23T09:00:00Z"
  }
];

// Track the last used ID
let lastId = Math.max(...interviews.map(i => i.Id), 0);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const interviewService = {
  async getAll() {
    await delay(300);
    return [...interviews];
  },

  async getByRequisition(requisitionId) {
    await delay(300);
    const requisitionInterviews = interviews.filter(i => i.requisitionId === parseInt(requisitionId));
    return [...requisitionInterviews];
  },

  async getById(id) {
    await delay(200);
    const interview = interviews.find(i => i.Id === parseInt(id));
    if (!interview) throw new Error('Interview not found');
    return { ...interview };
  },

  async create(interviewData) {
    await delay(400);
    
    // Auto-generate integer ID
    lastId += 1;
    const newInterview = {
      ...interviewData,
      Id: lastId,
      status: interviewData.status || 'pending',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };
    
    interviews.push(newInterview);
    return { ...newInterview };
  },

  async update(id, updateData) {
    await delay(350);
    const index = interviews.findIndex(i => i.Id === parseInt(id));
    if (index === -1) throw new Error('Interview not found');
    
    // Prevent updating the Id field
    const { Id, ...dataToUpdate } = updateData;
    interviews[index] = { 
      ...interviews[index], 
      ...dataToUpdate,
      updatedDate: new Date().toISOString()
    };
    return { ...interviews[index] };
  },

  async delete(id) {
    await delay(300);
    const index = interviews.findIndex(i => i.Id === parseInt(id));
    if (index === -1) throw new Error('Interview not found');
    
    interviews.splice(index, 1);
    return { success: true };
  },

  async scheduleInterview(requisitionId, candidateId, scheduleData) {
    await delay(400);
    
    // Check if interview already exists for this candidate
    const existingIndex = interviews.findIndex(i => 
      i.requisitionId === parseInt(requisitionId) && 
      i.candidateId === parseInt(candidateId)
    );
    
    if (existingIndex !== -1) {
      // Update existing interview
      interviews[existingIndex] = {
        ...interviews[existingIndex],
        ...scheduleData,
        status: 'scheduled',
        updatedDate: new Date().toISOString()
      };
      return { ...interviews[existingIndex] };
    } else {
      // Create new interview record
      lastId += 1;
      const newInterview = {
        Id: lastId,
        requisitionId: parseInt(requisitionId),
        candidateId: parseInt(candidateId),
        ...scheduleData,
        status: 'scheduled',
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
      };
      
      interviews.push(newInterview);
      return { ...newInterview };
    }
  },

  async updateStatus(id, status) {
    await delay(250);
    const index = interviews.findIndex(i => i.Id === parseInt(id));
    if (index === -1) throw new Error('Interview not found');
    
    interviews[index] = {
      ...interviews[index],
      status,
      updatedDate: new Date().toISOString()
    };
    return { ...interviews[index] };
  }
};