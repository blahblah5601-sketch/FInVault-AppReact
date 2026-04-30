// Simple test to verify user transfer functions exist and are properly exported
import { findUserByEmail, findUserByIBAN, transferToUser } from '../api';

describe('User Transfer Functions Existence', () => {
  test('findUserByEmail should be a function', () => {
    expect(typeof findUserByEmail).toBe('function');
  });

  test('findUserByIBAN should be a function', () => {
    expect(typeof findUserByIBAN).toBe('function');
  });

  test('transferToUser should be a function', () => {
    expect(typeof transferToUser).toBe('function');
  });
});