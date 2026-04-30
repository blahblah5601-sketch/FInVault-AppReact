// Test for transferToUser function
const { findUserByEmail, findUserByIBAN, transferToUser } = require('../../api.js');

// Mock the firebase module
jest.mock('../../firebase.js', () => ({
  auth: {
    currentUser: {
      uid: 'sender-user-id',
      email: 'sender@example.com'
    }
  },
  db: {
    collection: jest.fn(),
    writeBatch: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      commit: jest.fn()
    }))
  }
}));

const { auth, db } = require('../../firebase.js');

describe('transferToUser', () => {
  const mockSendDoc = {};
  const mockReceiveDoc = {};
  const mockSenderHistoryDoc = {};
  const mockReceiverHistoryDoc = {};
  const mockSenderTransactionDoc = {};
  const mockReceiverTransactionDoc = {};

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth
    auth.currentUser = {
      uid: 'sender-user-id',
      email: 'sender@example.com'
    };

    // Mock db.collection to return different mocks based on path
    db.collection.mockImplementation((path) => {
      if (path === 'users') {
        return {
          where: jest.fn().mockReturnThis(),
          getDocs: jest.fn()
        };
      }

      if (path.includes('sender-user-id/accounts')) {
        return {
          getDocs: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{
              id: 'sender-account-id',
              data: () => ({
                ibanNumber: 'PK36FNVT0000001234567890',
                accountNumber: '0012345678',
                balance: 1000,
                isPrimary: true,
                isActive: true
              })
            }]
          })
        };
      }

      if (path.includes('recipient-user-id/accounts')) {
        return {
          getDocs: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{
              id: 'recipient-account-id',
              data: () => ({
                ibanNumber: 'PK36HABB0000987654321098',
                accountNumber: '0098765432',
                balance: 500,
                isPrimary: true,
                isActive: true
              })
            }]
          })
        };
      }

      // For transactions, history, etc.
      return {
        doc: jest.fn().mockImplementation((collectionPath) => {
          if (collectionPath.includes('transactions')) {
            if (collectionPath.includes('sender-user-id')) {
              return mockSenderTransactionDoc;
            } else {
              return mockReceiverTransactionDoc;
            }
          }

          if (collectionPath.includes('history')) {
            if (collectionPath.includes('sender-user-id')) {
              return mockSenderHistoryDoc;
            } else {
              return mockReceiverHistoryDoc;
            }
          }

          return {};
        })
      };
    });

    // Mock writeBatch
    db.writeBatch.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      commit: jest.fn().mockResolvedValue()
    });
  });

  test('should transfer funds successfully to user by email', async () => {
    // Mock findUserByEmail to return a recipient user
    const mockUserSnapshot = {
      empty: false,
      docs: [{
        id: 'recipient-user-id',
        data: () => ({
          email: 'recipient@example.com',
          name: 'Recipient User'
        })
      }]
    };

    db.collection.mockImplementation((path) => {
      if (path === 'users') {
        return {
          where: jest.fn().mockReturnValue({
            getDocs: jest.fn().mockResolvedValue(mockUserSnapshot)
          }),
          getDocs: jest.fn()
        };
      }

      if (path.includes('sender-user-id/accounts')) {
        return {
          getDocs: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{
              id: 'sender-account-id',
              data: () => ({
                ibanNumber: 'PK36FNVT0000001234567890',
                accountNumber: '0012345678',
                balance: 1000,
                isPrimary: true,
                isActive: true
              })
            }]
          })
        };
      }

      if (path.includes('recipient-user-id/accounts')) {
        return {
          getDocs: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{
              id: 'recipient-account-id',
              data: () => ({
                ibanNumber: 'PK36HABB0000987654321098',
                accountNumber: '0098765432',
                balance: 500,
                isPrimary: true,
                isActive: true
              })
            }]
          })
        };
      }

      // For transactions, history, etc.
      return {
        doc: jest.fn().mockImplementation(() => ({}))
      };
    });

    const result = await transferToUser('recipient@example.com', 100, 'Test transfer', 'email');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Transfer completed successfully');

    // Verify that writeBatch was called and commit was invoked
    expect(db.writeBatch).toHaveBeenCalled();
    expect(db.writeBatch().commit).toHaveBeenCalled();
  });

  test('should return error for non-existent user by email', async () => {
    // Mock findUserByEmail to return empty result (user not found)
    const mockEmptySnapshot = {
      empty: true,
      docs: []
    };

    db.collection.mockImplementation((path) => {
      if (path === 'users') {
        return {
          where: jest.fn().mockReturnValue({
            getDocs: jest.fn().mockResolvedValue(mockEmptySnapshot)
          }),
          getDocs: jest.fn()
        };
      }

      return {
        getDocs: jest.fn(),
        doc: jest.fn().mockImplementation(() => ({}))
      };
    });

    const result = await transferToUser('nonexistent@example.com', 100, 'Test transfer', 'email');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Recipient not found');
  });

  test('should prevent self-transfer', async () => {
    // Mock findUserByEmail to return the sender's own user
    const mockUserSnapshot = {
      empty: false,
      docs: [{
        id: 'sender-user-id', // Same as current user
        data: () => ({
          email: 'sender@example.com',
          name: 'Sender User'
        })
      }]
    };

    db.collection.mockImplementation((path) => {
      if (path === 'users') {
        return {
          where: jest.fn().mockReturnValue({
            getDocs: jest.fn().mockResolvedValue(mockUserSnapshot)
          }),
          getDocs: jest.fn()
        };
      }

      return {
        getDocs: jest.fn(),
        doc: jest.fn().mockImplementation(() => ({}))
      };
    });

    const result = await transferToUser('sender@example.com', 100, 'Test transfer', 'email');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Cannot transfer to yourself');
  });

  test('should handle invalid identifier type', async () => {
    const result = await transferToUser('some-value', 100, 'Test transfer', 'invalid-type');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid identifier type');
  });

  test('should return error when not authenticated', async () => {
    // Mock auth to return null/currentUser
    auth.currentUser = null;

    const result = await transferToUser('recipient@example.com', 100, 'Test transfer', 'email');

    expect(result.success).toBe(false);
    expect(result.message).toBe('User not authenticated');
  });
});