// Simple verification test for transfer functions
const { findUserByEmail, findUserByIBAN, transferToUser, transferBetweenAccounts } = require('../api');

describe('Transfer Functions Existence and Types', () => {
  test('findUserByEmail should be a function', () => {
    expect(typeof findUserByEmail).toBe('function');
  });

  test('findUserByIBAN should be a function', () => {
    expect(typeof findUserByIBAN).toBe('function');
  });

  test('transferToUser should be a function', () => {
    expect(typeof transferToUser).toBe('function');
  });

  test('transferBetweenAccounts should be a function', () => {
    expect(typeof transferBetweenAccounts).toBe('function');
  });
});