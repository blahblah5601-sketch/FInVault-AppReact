// Test for transferToUser using proxyquire to mock Firebase dependencies
const proxyquire = require('proxyquire');
const assert = require('assert');

// We'll create a mock for the firebase module
const firebaseMock = {
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
      commit: jest.fn().mockResolvedValue()
    }))
  }
};

// We need to mock the functions inside api.js that are used by transferToUser
// Specifically: findUserByEmail, findUserByIBAN, getAccounts
// We'll create mock implementations for these
const mockFindUserByEmail = async (email) => {
  if (email === 'recipient@example.com') {
    return {
      id: 'recipient-user-id',
      email: 'recipient@example.com',
      name: 'Recipient User'
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

// Now we use proxyquire to load the api.js file with our mocks
// We need to mock the firebase module and also the internal functions
// However, note that the internal functions are in the same file, so we have to mock the whole file or use a different strategy.

// Instead, let's mock the firebase module and then rely on the actual api.js functions but they will use our mocked firebase.
// But the api.js also uses findUserByEmail and findUserByIBAN which are in the same file.
// We cannot easily mock those without rewriting the module.

// Alternative: we can rewrite the transferToUser function to accept the dependencies as parameters for testing, but that's not the current design.

// Given the complexity, let's test the function by creating a separate test that mimics the logic but we already did that in the manual test.

// Since we are stuck with the ES module issue, let's fallback to testing the function by examining its code and writing a test that doesn't require running it.

// However, the user wants to run tests until functionality is proven stable.

// Let's try a different approach: use vitest with the correct configuration for ES modules.

// We saw that vitest had an error about module-runner. This might be due to a version mismatch.
// Let's try to upgrade vitest to a version that works with Node.js ES modules.

// But we are limited in time.

// Given the above, let's create a test that can be run in a browser-like environment using jsdom and jest, but we have to fix the ES module issue.

// We can try to rename api.js to api.cjs and change the imports to require, but that would break the app.

// Instead, let's create a test file that is ES module and uses dynamic import to load the api.js file, and then we mock the firebase module before importing.

// We can do this in a jest test by using jest.isolateModulesFn.

// Let's try to write a test using jest.isolateModulesFn.

// We'll create a new test file in ES module format (keep .js) and use jest.isolateModulesFn.

// However, we are getting errors about unexpected token when trying to import the api.js file.

// Let's try to configure jest to handle ES modules by setting "type": "module" in package.json and then using the "exports" field.

// But we already have "type": "module" in package.json.

// The error we got earlier was about require not being defined in ES module scope when we tried to use require in the test file.

// So let's write the test file as ES module and use import.

// We'll try again with an ES module test file, but this time we'll use jest.mock to mock the firebase module.

// We saw that the error was: SyntaxError: Cannot use import statement outside a module when trying to require the api.js file.

// So we must use import to load the api.js file.

// Let's write the test file as ES module and use import.

// We'll also need to mock the firebase module before importing the api.js file.

// We can do this with jest.mock before the import.

// Let's try:
