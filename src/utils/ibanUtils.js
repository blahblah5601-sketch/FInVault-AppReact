// ==================== IBAN UTILS ====================

/**
 * Bank BIC codes for Pakistani banks
 * Each BIC has: code (4 chars), name, and color (for UI)
 */
export const BANK_BICS = {
  FINVAULT: { code: 'FNVT', name: 'FinVault', color: '#3b82f6' }, // blue-500
  HBL: { code: 'HABB', name: 'HBL (Habib Bank)', color: '#10b981' }, // emerald-500
  MCB: { code: 'MUCB', name: 'MCB Bank', color: '#f59e0b' }, // amber-500
  UBL: { code: 'UMBL', name: 'UBL (United Bank)', color: '#8b5cf6' }, // violet-500
  MEEZAN: { code: 'MEZN', name: 'Meezan Bank', color: '#06b6d4' }, // cyan-500
  ABL: { code: 'ABPA', name: 'Allied Bank', color: '#ef4444' }, // red-500
  FAYSAL: { code: 'FAYS', name: 'Faysal Bank', color: '#84cc16' }, // lime-500
  ASKARI: { code: 'ASCM', name: 'Askari Bank', color: '#f97316' }, // orange-500
};

/**
 * Convert a letter to its numeric equivalent for IBAN calculation
 * A=10, B=11, ..., Z=35
 * @param {string} char - Single uppercase letter
 * @returns {string} - Numeric string representation
 */
const letterToNumber = (char) => {
  return char.charCodeAt(0) - 55; // 'A' is 65, so 65-55=10
};

/**
 * Calculate MOD 97-10 of a large numeric string
 * Processes in chunks to avoid integer overflow
 * @param {string} numericString - String of digits
 * @returns {number} - MOD 97 result
 */
const mod97 = (numericString) => {
  let remainder = 0;
  const chunkSize = 9; // Process 9 digits at a time (safe for JS numbers)

  for (let i = 0; i < numericString.length; i += chunkSize) {
    const chunk = numericString.substring(i, i + chunkSize);
    const num = parseInt(chunk, 10);
    remainder = (remainder * Math.pow(10, chunk.length) + num) % 97;
  }

  return remainder;
};

/**
 * Validate a Pakistani IBAN
 * @param {string} iban - IBAN to validate (with or without spaces)
 * @returns {{ valid: boolean, error?: string }} - Validation result
 */
export const validateIBAN = (iban) => {
  // Remove spaces
  const cleanIban = iban.replace(/\s+/g, '').toUpperCase();

  // Check length (should be 24 for Pakistan: PK + 2 check + 4 BIC + 16 account)
  if (cleanIban.length !== 24) {
    return { valid: false, error: 'IBAN must be 24 characters long' };
  }

  // Check country code
  if (!cleanIban.startsWith('PK')) {
    return { valid: false, error: 'IBAN must start with PK for Pakistan' };
  }

  // Extract components
  const checkDigits = cleanIban.substring(2, 4);
  const bankCode = cleanIban.substring(4, 8);
  const accountNumber = cleanIban.substring(8, 24);

  // Validate bank code exists in our BIC list
  const validBIC = Object.values(BANK_BICS).some(bic => bic.code === bankCode);
  if (!validBIC) {
    return { valid: false, error: 'Invalid bank code in IBAN' };
  }

  // Validate account number is all digits
  if (!/^\d{16}$/.test(accountNumber)) {
    return { valid: false, error: 'Account number must be 16 digits' };
  }

  // Perform MOD 97-10 validation
  // 1. Move first 4 characters to the end
  const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);

  // 2. Convert letters to numbers (A=10, B=11, ..., Z=35)
  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const char = rearranged[i];
    if (/[A-Z]/.test(char)) {
      numericString += letterToNumber(char);
    } else {
      numericString += char;
    }
  }

  // 3. Calculate MOD 97-10
  const remainder = mod97(numericString);

  // 4. IBAN is valid if remainder is 1
  return { valid: remainder === 1 };
};

/**
 * Generate a deterministic 16-digit account number from userId and index
 * @param {string} userId - Firebase user ID
 * @param {number} index - Account index (0 for main, 1-3 for sub-accounts)
 * @returns {string} - 16-digit account number
 */
export const generateAccountNumber = (userId, index) => {
  // Create a hash from userId + index
  let hash = 0;
  const str = userId + index.toString();

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Make hash positive and ensure 16 digits
  let accountNum = Math.abs(hash).toString();

  // If less than 16 digits, pad with zeros at the beginning
  while (accountNum.length < 16) {
    accountNum = '0' + accountNum;
  }

  // If more than 16 digits, take last 16 digits
  if (accountNum.length > 16) {
    accountNum = accountNum.substring(accountNum.length - 16);
  }

  return accountNum;
};

/**
 * Generate a Pakistani IBAN from BIC code and account number
 * @param {string} bicCode - 4-character bank BIC code
 * @param {string} accountNumber - 16-digit account number
 * @returns {string} - 24-character IBAN (without spaces)
 */
export const generateIBAN = (bicCode, accountNumber) => {
  // Validate inputs
  if (!/^[A-Z]{4}$/.test(bicCode)) {
    throw new Error('BIC code must be 4 uppercase letters');
  }

  if (!/^\d{16}$/.test(accountNumber)) {
    throw new Error('Account number must be 16 digits');
  }

  // Construct preliminary IBAN: PK + 00 (temp check digits) + BIC + account
  const preliminary = 'PK00' + bicCode + accountNumber;

  // Move first 4 chars to end and convert to numbers
  const rearranged = preliminary.substring(4) + preliminary.substring(0, 4);

  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const char = rearranged[i];
    if (/[A-Z]/.test(char)) {
      numericString += letterToNumber(char);
    } else {
      numericString += char;
    }
  }

  // Calculate check digits: 98 - MOD97-10
  const remainder = mod97(numericString);
  const checkDigits = String(98 - remainder).padStart(2, '0');

  // Construct final IBAN
  return 'PK' + checkDigits + bicCode + accountNumber;
};

/**
 * Format IBAN for display (groups of 4 separated by spaces)
 * @param {string} iban - 24-character IBAN (without spaces)
 * @returns {string} - Formatted IBAN (e.g., PK36 FNVT 0000 1234 5678 9012)
 */
export const formatIBAN = (iban) => {
  // Remove any existing spaces
  const clean = iban.replace(/\s+/g, '');

  // Validate length
  if (clean.length !== 24) {
    return iban; // Return as-is if invalid length
  }

  // Insert spaces every 4 characters
  return clean.match(/.{1,4}/g).join(' ');
};
