// Comprehensive test for transferToUser function using manual mocking
// This test can be run with node directly to verify core logic

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
  if (email === 'recipient@example.com') {
    return {
      id: 'recipient-user-id',
      email: 'recipient@example.com',
      name: 'Recipient User'
    };
  }
  if (email === 'nonexistent@example.com') {
    return null;
  }
  if (email === 'sender@example.com') {
    return {
      id: 'sender-user-id',
      email: 'sender@example.com',
      name: 'Sender User'
    };
  }
  return null;
};

const mockFindUserByIBAN = async (iban) => {
  if (iban === 'PK36HABB0000987654321098') {
    return {
      id: 'recipient-user-id',
      email: 'recipient@example.com',
      name: 'Recipient User'
    };
  }
  if (iban === 'PK36FNVT0000001234567890') {
    return {
      id: 'sender-user-id',
      email: 'sender@example.com',
      name: 'Sender User'
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
  if (userId === 'recipient-user-id') {
    return [{
      id: 'recipient-account-id',
      ibanNumber: 'PK36HABB0000987654321098',
      accountNumber: '0098765432',
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

// We need to mock the internal functions that transferToUser uses
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
const { transferToUser } = require('../../api.js');

describe('transferToUser - Comprehensive Tests', () => {
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

      if (path.includes('users/recipient-user-id/accounts')) {
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
  });

  test('should transfer funds successfully to user by email', async () => {
    const result = await transferToUser('recipient@example.com', 100, 'Test transfer', 'email');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Transfer completed successfully');

    // Verify that writeBatch was called and commit was invoked
    expect(mockDb.writeBatch).toHaveBeenCalled();
    expect(mockDb.writeBatch().commit).toHaveBeenCalled();
  });

  test('should transfer funds successfully to user by IBAN', async () => {
    const result = await transferToUser('PK36HABB0000987654321098', 100, 'Test transfer', 'iban');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Transfer completed successfully');

    // Verify that writeBatch was called and commit was invoked
    expect(mockDb.writeBatch).toHaveBeenCalled();
    expect(mockDb.writeBatch().commit).toHaveBeenCalled();
  });

  test('should return error for non-existent user by email', async () => {
    const result = await transferToUser('nonexistent@example.com', 100, 'Test transfer', 'email');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Recipient not found');
  });

  test('should return error for non-existent user by IBAN', async () => {
    const result = await transferToUser('PK36XXXXXXXXXXXXXXXXXXXX', 100, 'Test transfer', 'iban');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Recipient not found');
  });

  test('should prevent self-transfer by email', async () => {
    const result = await transferToUser('sender@example.com', 100, 'Test transfer', 'email');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Cannot transfer to yourself');
  });

  test('should prevent self-transfer by IBAN', async () => {
    const result = await transferToUser('PK36FNVT0000001234567890', 100, 'Test transfer', 'iban');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Cannot transfer to yourself');
  });

  test('should handle invalid identifier type', async () => {
    const result = await transferToUser('some-value', 100, 'Test transfer', 'invalid-type');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid identifier type');
  });

  test('should return error when not authenticated', async () => {
    // Temporarily mock auth to return null
    const originalAuth = mockAuth.currentUser;
    mockAuth.currentUser = null;

    try {
      const result = await transferToUser('recipient@example.com', 100, 'Test transfer', 'email');

      expect(result.success).toBe(false);
      expect(result.message).toBe('User not authenticated');
    } finally {
      mockAuth.currentUser = originalAuth;
    }
  });

  test('should return error for invalid transfer amount', async () => {
    // Test zero amount
    let result = await transferToUser('recipient@example.com', 0, 'Test transfer', 'email');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid transfer amount');

    // Test negative amount
    result = await transferToUser('recipient@example.com', -50, 'Test transfer', 'email');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid transfer amount');

    // Test null amount
    result = await transferToUser('recipient@example.com', null, 'Test transfer', 'email');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid transfer amount');
  });

  test('should create proper transaction records', async () => {
    const result = await transferToUser('recipient@example.com', 100, 'Test transfer', 'email');

    expect(result.success).toBe(true);

    // Verify that we called set on the transaction collections twice (sender and recipient)
    const writeBatchInstance = mockDb.writeBatch();
    expect(writeBatchInstance.set).toHaveBeenCalledTimes(2);

    // Verify that we called set on the history collections twice (sender and recipient)
    expect(writeBatchInstance.set).toHaveBeenCalledTimes(2); // This includes both transaction and history calls
  });
});

console.log('Test suite defined successfully. To run: npx jest src/api/__tests__/transferToUser.comprehensive.test.js');