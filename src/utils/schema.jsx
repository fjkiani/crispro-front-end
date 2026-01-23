// DISABLED: Schema definitions removed to prevent drizzle-orm initialization
// Database operations should be performed via backend API endpoints

// Mock schema objects for compatibility
export const Users = {
  id: { primaryKey: true },
  username: {},
  age: {},
  location: {},
  folders: {},
  treatmentCounts: {},
  createdBy: {}
};

export const Records = {
  id: { primaryKey: true },
  userId: {},
  recordName: {},
  analysisResult: {},
  kanbanRecords: {},
  createdBy: {}
};
