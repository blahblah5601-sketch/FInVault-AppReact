// ==================== CONSTANTS ====================

export const LIMITS = {
  // User limits
  MAX_BUDGETS: 5,
  MAX_VAULTS: 5,
  MAX_CARD_ASSIGNMENTS: 3,
  
  // Amount limits (in PKR)
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 10000000, // 10 million
  MIN_BUDGET_LIMIT: 100,
  MAX_BUDGET_LIMIT: 1000000, // 1 million
  
  // String limits
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 200,
  
  // Auth limits
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 20,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
};

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NUMERIC: /^\d+(\.\d{1,2})?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s-']+$/,
  PHONE_PK: /^(\+92|0)?[0-9]{10}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,50}$/,
};

export const ERROR_MESSAGES = {
  AUTH: {
    EMAIL_REQUIRED: 'Email address is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_TOO_SHORT: `Password must be at least ${LIMITS.MIN_PASSWORD_LENGTH} characters`,
    PASSWORD_TOO_WEAK: 'Password must include uppercase, lowercase, and numbers',
    EMAIL_IN_USE: 'This email address is already registered',
    INVALID_CREDENTIALS: 'Invalid email/username or password',
    TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please try again in 15 minutes.',
    ACCOUNT_DISABLED: 'This account has been disabled. Contact support.',
    USERNAME_REQUIRED: 'Username is required',
    USERNAME_INVALID: 'Username must be 3-50 characters and can only contain letters, numbers, and underscores',
    USERNAME_TOO_SHORT: 'Username must be at least 3 characters',
    USERNAME_TOO_LONG: 'Username must be less than 50 characters',
    USERNAME_IN_USE: 'This username is already taken',
  },
  
  BUDGET: {
    NAME_REQUIRED: 'Budget name is required',
    NAME_TOO_SHORT: 'Budget name is too short',
    NAME_TOO_LONG: `Budget name must be less than ${LIMITS.MAX_NAME_LENGTH} characters`,
    NAME_INVALID: 'Budget name can only contain letters, numbers, spaces, and hyphens',
    LIMIT_REQUIRED: 'Budget limit is required',
    LIMIT_INVALID: 'Budget limit must be a valid number',
    LIMIT_TOO_LOW: `Budget limit must be at least Rs ${LIMITS.MIN_BUDGET_LIMIT.toLocaleString()}`,
    LIMIT_TOO_HIGH: `Budget limit cannot exceed Rs ${LIMITS.MAX_BUDGET_LIMIT.toLocaleString()}`,
    LIMIT_BELOW_SPENT: 'Budget limit cannot be less than current spending',
    MAX_REACHED: `You can only create up to ${LIMITS.MAX_BUDGETS} budgets`,
    ASSIGNED_CANNOT_DELETE: 'Cannot delete a budget assigned to your card',
  },
  
  VAULT: {
    NAME_REQUIRED: 'Vault name is required',
    NAME_TOO_SHORT: 'Vault name is too short',
    NAME_TOO_LONG: `Vault name must be less than ${LIMITS.MAX_NAME_LENGTH} characters`,
    NAME_INVALID: 'Vault name can only contain letters, numbers, spaces, and hyphens',
    TARGET_REQUIRED: 'Target amount is required',
    TARGET_INVALID: 'Target amount must be a valid positive number',
    TARGET_TOO_LOW: 'Target amount must be at least Rs 100',
    MAX_REACHED: `You can only create up to ${LIMITS.MAX_VAULTS} vaults`,
    HAS_FUNDS_CANNOT_DELETE: 'Cannot delete vault with funds. Withdraw first.',
    SAVINGS_ACCOUNT_CANNOT_DELETE: 'Cannot delete the main savings account',
  },
  
  TRANSACTION: {
    AMOUNT_REQUIRED: 'Amount is required',
    AMOUNT_INVALID: 'Please enter a valid amount',
    AMOUNT_TOO_LOW: `Amount must be at least Rs ${LIMITS.MIN_AMOUNT}`,
    AMOUNT_TOO_HIGH: `Amount cannot exceed Rs ${LIMITS.MAX_AMOUNT.toLocaleString()}`,
    AMOUNT_EXCEEDS_GOAL: 'Deposit exceeds vault goal',
    INSUFFICIENT_FUNDS: 'Insufficient funds in account',
    INSUFFICIENT_VAULT_FUNDS: 'Insufficient funds in vault',
    DESCRIPTION_REQUIRED: 'Description is required',
    DESCRIPTION_TOO_LONG: `Description must be less than ${LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
  },
  
  GENERAL: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_FORMAT: 'Invalid format',
    RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    OPERATION_FAILED: 'Operation failed. Please try again.',
  },
};

// ==================== SANITIZATION ====================

/**
 * Remove potentially dangerous characters from string
 * Prevents XSS attacks
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    // Remove HTML tags
    .replace(/[<>]/g, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove event handlers (onclick, onerror, etc.)
    .replace(/on\w+\s*=/gi, '')
    // Remove data: protocol
    .replace(/data:/gi, '')
    // Limit length
    .substring(0, LIMITS.MAX_NAME_LENGTH);
};

/**
 * Escape HTML special characters for safe display
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Sanitize filename for safe storage
 */
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return 'file';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100);
};

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate email address format
 * 
 * @param {string} email - Email address to validate
 * @returns {Object} { valid: boolean, error?: string, email?: string }
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { 
      valid: false, 
      error: ERROR_MESSAGES.AUTH.EMAIL_REQUIRED 
    };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (!PATTERNS.EMAIL.test(trimmed)) {
    return { 
      valid: false, 
      error: ERROR_MESSAGES.AUTH.EMAIL_INVALID 
    };
  }
  
  // Additional check for common typos
  const commonTypos = [
    '@gmial.com', '@gmai.com', '@yahooo.com', '@hotmial.com'
  ];
  
  if (commonTypos.some(typo => trimmed.includes(typo))) {
    return {
      valid: false,
      error: 'Did you mean @gmail.com or @yahoo.com?'
    };
  }
  
  return { valid: true, email: trimmed };
};

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, error?: string, strength?: Object }
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { 
      valid: false, 
      error: ERROR_MESSAGES.AUTH.PASSWORD_REQUIRED 
    };
  }
  
  // Check length
  if (password.length < LIMITS.MIN_PASSWORD_LENGTH) {
    return { 
      valid: false, 
      error: ERROR_MESSAGES.AUTH.PASSWORD_TOO_SHORT 
    };
  }
  
  if (password.length > LIMITS.MAX_PASSWORD_LENGTH) {
    return { 
      valid: false, 
      error: 'Password is too long' 
    };
  }
  
  // Check character variety
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const varietyScore = [
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar
  ].filter(Boolean).length;
  
  // Require at least 3 out of 4 character types
  if (varietyScore < 3) {
    return { 
      valid: false, 
      error: ERROR_MESSAGES.AUTH.PASSWORD_TOO_WEAK 
    };
  }
  
  // Check for common weak passwords
  const weakPasswords = [
    'password', 'password123', '12345678', 'qwerty', 
    'admin', 'letmein', 'welcome', 'monkey', 'dragon'
  ];
  
  if (weakPasswords.includes(password.toLowerCase())) {
    return {
      valid: false,
      error: 'This password is too common. Please choose a stronger one.'
    };
  }
  
  return { 
    valid: true, 
    strength: {
      score: varietyScore,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    }
  };
};

/**
 * Calculate password strength for UI display
 * Returns a score from 0-5 and a label
 * 
 * @param {string} password - Password to evaluate
 * @returns {Object} { score: number, label: string, color: string }
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: 'None', color: 'gray' };
  }
  
  const checks = [
    password.length >= 8,
    password.length >= 12,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password),
  ];
  
  const score = checks.filter(Boolean).length;
  
  const levels = [
    { label: 'Very Weak', color: 'red' },
    { label: 'Weak', color: 'orange' },
    { label: 'Fair', color: 'yellow' },
    { label: 'Good', color: 'blue' },
    { label: 'Strong', color: 'green' },
    { label: 'Very Strong', color: 'green' },
  ];
  
  return { score, ...levels[Math.min(score, 5)] };
};

/**
 * Validate name (budget, vault, etc.)
 * 
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {Object} { valid: boolean, error?: string, sanitized?: string }
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || typeof name !== 'string') {
    return { 
      valid: false, 
      error: `${fieldName} is required` 
    };
  }
  
  const sanitized = sanitizeString(name);
  
  if (sanitized.length < LIMITS.MIN_NAME_LENGTH) {
    return { 
      valid: false, 
      error: `${fieldName} is too short` 
    };
  }
  
  if (sanitized.length > LIMITS.MAX_NAME_LENGTH) {
    return { 
      valid: false, 
      error: `${fieldName} must be less than ${LIMITS.MAX_NAME_LENGTH} characters` 
    };
  }
  
  if (!PATTERNS.ALPHANUMERIC.test(sanitized)) {
    return { 
      valid: false, 
      error: `${fieldName} can only contain letters, numbers, spaces, and hyphens` 
    };
  }
  
  return { valid: true, sanitized };
};

/**
 * Validate monetary amount
 * 
 * @param {number|string} amount - Amount to validate
 * @param {Object} options - Validation options
 * @returns {Object} { valid: boolean, error?: string, amount?: number }
 */
export const validateAmount = (amount, options = {}) => {
  const {
    min = LIMITS.MIN_AMOUNT,
    max = LIMITS.MAX_AMOUNT,
    allowZero = false,
    fieldName = 'Amount',
  } = options;
  
  // Convert to number
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num) || num === null || num === undefined) {
    return { 
      valid: false, 
      error: ERROR_MESSAGES.TRANSACTION.AMOUNT_INVALID 
    };
  }
  
  if (!allowZero && num <= 0) {
    return { 
      valid: false, 
      error: `${fieldName} must be positive` 
    };
  }
  
  if (allowZero && num < 0) {
    return {
      valid: false,
      error: `${fieldName} cannot be negative`
    };
  }
  
  if (num < min) {
    return { 
      valid: false, 
      error: `${fieldName} must be at least Rs ${min.toLocaleString()}` 
    };
  }
  
  if (num > max) {
    return { 
      valid: false, 
      error: `${fieldName} cannot exceed Rs ${max.toLocaleString()}` 
    };
  }
  
  // Round to 2 decimal places
  const rounded = Math.round(num * 100) / 100;
  
  return { valid: true, amount: rounded };
};

/**
 * Validate budget limit specifically
 */
export const validateBudgetLimit = (limit) => {
  return validateAmount(limit, {
    min: LIMITS.MIN_BUDGET_LIMIT,
    max: LIMITS.MAX_BUDGET_LIMIT,
    fieldName: 'Budget limit',
  });
};

/**
 * Validate transaction description
 */
export const validateDescription = (desc) => {
  if (!desc || typeof desc !== 'string') {
    return { 
      valid: false, 
      error: ERROR_MESSAGES.TRANSACTION.DESCRIPTION_REQUIRED 
    };
  }
  
  const sanitized = sanitizeString(desc);
  
  if (sanitized.length === 0) {
    return { 
      valid: false, 
      error: 'Description cannot be empty' 
    };
  }
  
  if (sanitized.length > LIMITS.MAX_DESCRIPTION_LENGTH) {
    return { 
      valid: false, 
      error: ERROR_MESSAGES.TRANSACTION.DESCRIPTION_TOO_LONG 
    };
  }
  
  return { valid: true, sanitized };
};

// ==================== RATE LIMITING ====================

/**
 * Client-side rate limiter
 * Prevents abuse by limiting requests per time window
 */
export class RateLimiter {
  constructor(maxRequests = LIMITS.MAX_REQUESTS_PER_MINUTE, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  canMakeRequest(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Filter out requests outside the time window
    const recentRequests = userRequests.filter(
      time => now - time < this.windowMs
    );
    
    if (recentRequests.length >= this.maxRequests) {
      const oldestRequest = recentRequests[0];
      const retryAfter = Math.ceil(
        (oldestRequest + this.windowMs - now) / 1000
      );
      
      return { 
        allowed: false, 
        error: ERROR_MESSAGES.GENERAL.RATE_LIMIT,
        retryAfter,
      };
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return { allowed: true };
  }
  
  reset(key) {
    this.requests.delete(key);
  }
  
  clear() {
    this.requests.clear();
  }
}

/**
 * Login attempt tracker
 * Prevents brute force attacks on authentication
 */
export class LoginAttemptTracker {
  constructor() {
    this.attempts = new Map();
  }
  
  recordAttempt(email) {
    const key = email.toLowerCase();
    const record = this.attempts.get(key) || { 
      count: 0, 
      lastAttempt: Date.now() 
    };
    
    record.count++;
    record.lastAttempt = Date.now();
    
    this.attempts.set(key, record);
    
    return record.count;
  }
  
  isLockedOut(email) {
    const key = email.toLowerCase();
    const record = this.attempts.get(key);
    
    if (!record) return { locked: false };
    
    const timeSinceLastAttempt = Date.now() - record.lastAttempt;
    
    if (
      record.count >= LIMITS.MAX_LOGIN_ATTEMPTS && 
      timeSinceLastAttempt < LIMITS.LOCKOUT_DURATION_MS
    ) {
      const remainingMinutes = Math.ceil(
        (LIMITS.LOCKOUT_DURATION_MS - timeSinceLastAttempt) / 1000 / 60
      );
      
      return {
        locked: true,
        remainingTime: remainingMinutes,
      };
    }
    
    return { locked: false };
  }
  
  resetAttempts(email) {
    this.attempts.delete(email.toLowerCase());
  }
  
  clear() {
    this.attempts.clear();
  }
}

// Export global instances
export const apiRateLimiter = new RateLimiter(
  LIMITS.MAX_REQUESTS_PER_MINUTE, 
  60000
);

export const loginAttemptTracker = new LoginAttemptTracker();

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if value is a valid number
 */
export const isValidNumber = (value) => {
  return typeof value === 'number' && 
         !isNaN(value) && 
         isFinite(value);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount, currency = 'PKR') => {
  if (!isValidNumber(amount)) return 'Rs 0.00';
  
  return `Rs ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Validate file upload (for future features)
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  } = options;
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    const maxMB = maxSize / 1024 / 1024;
    return { 
      valid: false, 
      error: `File size must be less than ${maxMB}MB` 
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type must be one of: ${allowedTypes.join(', ')}` 
    };
  }
  
  return { valid: true };
};

/**
 * Debounce function for input validation
 * Delays validation until user stops typing
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep object comparison
 */
export const hasChanged = (obj1, obj2, keys = null) => {
  if (!keys) {
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
  }

  return keys.some(key => obj1[key] !== obj2[key]);
};

/**
 * Validate username format and availability
 *
 * @param {string} username - Username to validate
 * @returns {Object} { valid: boolean, error?: string, sanitized?: string }
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return {
      valid: false,
      error: ERROR_MESSAGES.AUTH.USERNAME_REQUIRED
    };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return {
      valid: false,
      error: ERROR_MESSAGES.AUTH.USERNAME_TOO_SHORT
    };
  }

  if (trimmed.length > LIMITS.MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: ERROR_MESSAGES.AUTH.USERNAME_TOO_LONG
    };
  }

  if (!PATTERNS.USERNAME.test(trimmed)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.AUTH.USERNAME_INVALID
    };
  }

  return { valid: true, sanitized: trimmed.toLowerCase() };
};