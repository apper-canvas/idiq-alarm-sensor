// Mock data storage for CV submissions
let cvSubmissions = [
  {
    Id: 1,
    fileName: "john_doe_cv.pdf",
    fileSize: 2048576,
    fileType: "pdf",
    currentCompany: "Tech Solutions Inc",
    rate: 75.00,
    availability: "2-weeks",
    uploadDate: "2024-01-15T10:30:00Z",
    status: "submitted"
  },
  {
    Id: 2,
    fileName: "jane_smith_resume.docx",
    fileSize: 1536000,
    fileType: "docx",
    currentCompany: "Digital Innovations LLC",
    rate: 80.50,
    availability: "immediate",
    uploadDate: "2024-01-14T14:20:00Z",
    status: "reviewing"
  }
];

// Track the last used ID
let lastId = Math.max(...cvSubmissions.map(c => c.Id), 0);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const cvSubmissionService = {
  async getAll() {
    await delay(400);
    return [...cvSubmissions];
  },

  async getById(id) {
    await delay(300);
    const submission = cvSubmissions.find(c => c.Id === parseInt(id));
    if (!submission) throw new Error('CV submission not found');
    return { ...submission };
  },

  async create(submissionData) {
    await delay(500);
    
    // Auto-generate integer ID
    lastId += 1;
    const newSubmission = {
      ...submissionData,
      Id: lastId,
      uploadDate: submissionData.uploadDate || new Date().toISOString(),
      status: submissionData.status || 'submitted'
    };
    
    cvSubmissions.push(newSubmission);
    return { ...newSubmission };
  },

  async update(id, updateData) {
    await delay(400);
    const index = cvSubmissions.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('CV submission not found');
    
    // Prevent updating the Id field
    const { Id, ...dataToUpdate } = updateData;
    cvSubmissions[index] = { ...cvSubmissions[index], ...dataToUpdate };
    return { ...cvSubmissions[index] };
  },

  async delete(id) {
    await delay(350);
    const index = cvSubmissions.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('CV submission not found');
    
    cvSubmissions.splice(index, 1);
    return { success: true };
  },

  async bulkCreate(submissionsData) {
    await delay(600);
    
    const createdSubmissions = submissionsData.map(data => {
      lastId += 1;
      const newSubmission = {
        ...data,
        Id: lastId,
        uploadDate: data.uploadDate || new Date().toISOString(),
        status: data.status || 'submitted'
      };
      cvSubmissions.push(newSubmission);
      return { ...newSubmission };
    });
    
    return createdSubmissions;
  },

  async updateStatus(id, status) {
    await delay(300);
    const index = cvSubmissions.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('CV submission not found');
    
    cvSubmissions[index].status = status;
    return { ...cvSubmissions[index] };
  }
};