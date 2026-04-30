// Comprehensive test for transferToMultipleUsers function using manual mocking
// This test follows the same pattern as the transferToUser comprehensive test

// Mock the firebase module completely
const mockAuth = {
  currentUser: {
    uid: 'sender-user-id',
    email: 'sender@example.com'
  }
};

const mockDb = {
  collection: jest.fn(),
  writeBatch: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    commit: jest.fn().mockResolvedValue()
  }))
};

// Mock implementations for the functions we need to test
const mockFindUserByEmail = async (email) => {
  if (email === 'recipient1@example.com') {
    return {
      id: 'recipient1-user-id',
      email: 'recipient1@example.com',
      name: 'Recipient One'
    };
  }
  if (email === 'recipient2@example.com') {
    return {
      id: 'recipient2-user-id',
      email: 'recipient2@example.com',
      name: 'Recipient Two'
    };
  }
  if (email === 'nonexistent@example.com') {
    return null;
  }
  return null;
};

const mockFindUserByIBAN = async (iban) => {
  if (iban === 'PK36HABB0000987654321098') {
    return {
      id: 'recipient1-user-id',
      email: 'recipient1@example.com',
      name: 'Recipient One'
    };
  }
  if (iban === 'PK36MUCB0000555555555555') {
    return {
      id: 'recipient2-user-id',
      email: 'recipient2@example.com',
      name: 'Recipient Two'
    };
  }
  return null;
};

const mockGetAccounts = async (userId) => {
  if (userId === 'sender-user-id') {
    return [{
      id: 'sender-account-id',
      ibanNumber: 'PK36FNVT0000001234567890',
      accountNumber: '0012345678',
      balance: 1000,
      isPrimary: true,
      isActive: true
    }];
  }
  if (userId === 'recipient1-user-id' || userId === 'recipient2-user-id') {
    return [{
      id: `${userId}-account-id`,
      ibanNumber: userId === 'recipient1-user-id' ? 'PK36HABB0000987654321098' : 'PK36MUCB0000555555555555',
      accountNumber: userId === 'recipient1-user-id' ? '0098765432' : '0055555555',
      balance: 500,
      isPrimary: true,
      isActive: true
    }];
  }
  return [];
};

// Replace the actual implementations with our mocks for testing
jest.mock('../../firebase.js', () => ({
  auth: mockAuth,
  db: mockDb
}));

// We need to mock the internal functions that transferToMultipleUsers uses
jest.mock('../../api.js', () => {
  const actualApi = jest.requireActual('../../api.js');
  return {
    ...actualApi,
    findUserByEmail: mockFindUserByEmail,
    findUserByIBAN: mockFindUserByIBAN,
    getAccounts: mockGetAccounts
  };
});

// Now import the functions we want to test
const { transferToMultipleUsers } = require('../../api.js');

describe('transferToMultipleUsers - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockDb.collection.mockImplementation((path) => {
      if (path.includes('users/sender-user-id/accounts')) {
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

      if (path.includes('users/recipient1-user-id/accounts') ||
          path.includes('users/recipient2-user-id/accounts')) {
        const isRecipient1 = path.includes('recipient1');
        return {
          getDocs: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{
              id: isRecipient1 ? 'recipient1-account-id' : 'recipient2-account-id',
              data: () => ({
                ibanNumber: isRecipient1 ? 'PK36HABB0000987654321098' : 'PK36MUCB0000555555555555',
                accountNumber: isRecipient1 ? '0098765432' : '0055555555',
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
  });

  test('should transfer funds successfully to multiple users by email', async () => {
    const transfers = [
      { identifier: 'recipient1@example.com', amount: 100, description: 'Transfer 1' },
      { identifier: 'recipient2@example.com', amount: 50, description: 'Transfer 2' }
    ];

    const result = await transferToMultipleUsers(transfers);

    expect(result.success).toBe(true);
    expect(result.message).toContain('Bulk transfer completed successfully');
    expect(result.totalAmount).toBe(150);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].identifier).toBe('recipient1@example.com');
    expect(result.results[1].identifier).toBe('recipient2@example.com');

    // Verify that writeBatch was called and commit was invoked
    expect(mockDb.writeBatch).toHaveBeenCalled();
    expect(mockDb.writeBatch().commit).toHaveBeenCalled();
  });

  test('should transfer funds successfully to multiple users by IBAN', async () => {
    const transfers = [
      { identifier: 'PK36HABB0000987654321098', amount: 100, description: 'Transfer 1', identifierType: 'iban' },
      { identifier: 'PK36MUCB0000555555555555', amount: 50, description: 'Transfer 2', identifierType: 'iban' }
    ];

    const result = await transferToMultipleUsers(transfers);

    expect(result.success).toBe(true);
    expect(result.message).toContain('Bulk transfer completed successfully');
    expect(result.totalAmount).toBe(150);
    expect(result.results).toHaveLength(2);
  });

  test('should return error for invalid transfers array', async () => {
    // Test null transfers
    let result = await transferToMultipleUsers(null);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid transfers array');

    // Test empty array
    result = await transferToMultipleUsers([]);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid transfers array');

    // Test non-array
    result = await transferToMultipleUsers('not-an-array');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid transfers array');
  });

  test('should return error for invalid transfer parameters', async () => {
    const transfers = [
      { identifier: 'recipient1@example.com', amount: 100, description: 'Transfer 1' },
      { identifier: '', amount: 50, description: 'Transfer 2' } // Missing identifier
    ];

    const result = await transferToMultipleUsers(transfers);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid transfer parameters');
  });

  test('should return error for non-existent user', async () => {
    const transfers = [
      { identifier: 'recipient1@example.com', amount: 100, description: 'Transfer 1' },
      { identifier: 'nonexistent@example.com', amount: 50, description: 'Transfer 2' }
    ];

    const result = await transferToMultipleUsers(transfers);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Recipient not found: nonexistent@example.com');
  });

  test('should prevent self-transfer', async () => {
    // Mock findUserByEmail to return the sender's own user for one of the transfers
    const originalFindUserByEmail = mockFindUserByEmail;
    mockFindUserByEmail = async (email) => {
      if (email === 'sender@example.com') {
        return {
          id: 'sender-user-id',
          email: 'sender@example.com',
          name: 'Sender User'
        };
      }
      return originalFindUserByEmail(email);
    };

    try {
      const transfers = [
        { identifier: 'sender@example.com', amount: 100, description: 'Self transfer' }
      ];

      const result = await transferToMultipleUsers(transfers);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot transfer to yourself');
    } finally {
      mockFindUserByEmail = originalFindUserByEmail;
    }
  });

  test('should handle invalid identifier type', async () => {
    const transfers = [
      { identifier: 'some-value', amount: 100, description: 'Test transfer', identifierType: 'invalid-type' }
    ];

    const result = await transferToMultipleUsers(transfers);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid identifier type');
  });

  test('should return error when not authenticated', async () => {
    // Temporarily mock auth to return null
    const originalAuth = mockAuth.currentUser;
    mockAuth.currentUser = null;

    try {
      const transfers = [
        { identifier: 'recipient1@example.com', amount: 100, description: 'Test transfer' }
      ];

      const result = await transferToMultipleUsers(transfers);
      expect(result.success).toBe(false);
      expect(result.message).toBe('User not authenticated');
    } finally {
      mockAuth.currentUser = originalAuth;
    }
  });

  test('should return error for insufficient funds', async () => {
    // Set sender balance to less than total transfer amount
    // We need to mock the getAccounts to return a low balance
    const originalGetAccounts = mockGetAccounts;
    mockGetAccounts = async (userId) => {
      if (userId === 'sender-user-id') {
        return [{
          id: 'sender-account-id',
          ibanNumber: 'PK36FNVT0000001234567890',
          accountNumber: '0012345678',
          balance: 100, // Only 100 balance
          isPrimary: true,
          isActive: true
        }];
      }
      return originalGetAccounts(userId);
    };

    try {
      const transfers = [
        { identifier: 'recipient1@example.com', amount: 100, description: 'Transfer 1' },
        { identifier: 'recipient2@example.com', amount: 50, description: 'Transfer 2' } // Total 150 > 100 balance
      ];

      const result = await transferToMultipleUsers(transfers);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient funds for bulk transfer');
    } finally {
      mockGetAccounts = originalGetAccounts;
    }
  });

  test('should create proper transaction and history records', async () => {
    const transfers = [
      { identifier: 'recipient1@example.com', amount: 100, description: 'Transfer 1' },
      { identifier: 'recipient2@example.com', amount: 50, description: 'Transfer 2' }
    ];

    const result = await transferToMultipleUsers(transfers);

    expect(result.success).toBe(true);

    // Verify that we called set on the transaction collections (2 transfers * 2 records each = 4)
    const writeBatchInstance = mockDb.writeBatch();
    expect(writeBatchInstance.set).toHaveBeenCalledTimes(8); // 2 transfers * (sender transaction + recipient transaction + sender history + recipient history)

    // Verify that we called update on account collections (recipient accounts + sender account)
    // 2 recipient account updates + 1 sender account update = 3
    expect(writeBatchInstance.update).toHaveBeenCalledTimes(3);
  });
});

console.log('TransferToMultipleUsers test suite defined successfully. To run: npx jest src/api/__tests__/transferToMultipleUsers.comprehensive.test.js');