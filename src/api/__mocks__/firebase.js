// Mock Firebase module for testing
export const auth = {
  currentUser: {
    uid: 'test-user-id',
    email: 'test@example.com'
  }
};

export const db = {
  collection: () => ({
    doc: () => ({
      set: jest.fn(),
      update: jest.fn(),
      get: jest.fn()
    }),
    addDoc: jest.fn(),
    getDocs: jest.fn(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis()
  }),
  writeBatch: () => ({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    commit: jest.fn()
  })
};