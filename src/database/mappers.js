const { v4: uuidv4 } = require('uuid');

class PostgreSQLMappers {
  // Map Firebase document format to PostgreSQL format
  mapFirebaseUserToPostgreSQL(firebaseUser) {
    return {
      id: firebaseUser.id || uuidv4(),
      email: firebaseUser.email,
      created_at: firebaseUser.created_at || new Date(),
      settings: firebaseUser.settings || { theme: 'Slate', notifications: true }
    };
  }

  mapFirebaseAccountToPostgreSQL(firebaseAccount, userId) {
    return {
      id: firebaseAccount.id || uuidv4(),
      user_id: userId,
      name: firebaseAccount.name,
      account_level: firebaseAccount.accountLevel || 'main',
      parent_account_id: firebaseAccount.parentAccountId,
      iban_number: firebaseAccount.ibanNumber,
      account_number: firebaseAccount.accountNumber,
      bank_bic: firebaseAccount.bankBic,
      bank_name: firebaseAccount.bankName,
      sub_account_index: firebaseAccount.subAccountIndex || 0,
      balance: firebaseAccount.balance || 0,
      is_active: firebaseAccount.isActive !== false,
      created_at: firebaseAccount.createdAt || new Date()
    };
  }

  mapFirebaseBudgetToPostgreSQL(firebaseBudget, userId) {
    return {
      id: firebaseBudget.id || uuidv4(),
      user_id: userId,
      name: firebaseBudget.name,
      limit: firebaseBudget.limit || 0,
      spent: firebaseBudget.spent || 0,
      icon: firebaseBudget.icon,
      color: firebaseBudget.color,
      is_card_assigned: firebaseBudget.isCardAssigned || false,
      items: firebaseBudget.items || [],
      created_at: firebaseBudget.createdAt || new Date()
    };
  }

  mapFirebaseVaultToPostgreSQL(firebaseVault, userId) {
    return {
      id: firebaseVault.id || uuidv4(),
      user_id: userId,
      name: firebaseVault.name,
      target: firebaseVault.target || 0,
      current: firebaseVault.current || 0,
      icon: firebaseVault.icon,
      color: firebaseVault.color,
      is_savings_account: firebaseVault.isSavingsAccount || false,
      created_at: firebaseVault.createdAt || new Date()
    };
  }

  mapFirebaseTransactionToPostgreSQL(firebaseTransaction, userId) {
    return {
      id: firebaseTransaction.id || uuidv4(),
      user_id: userId,
      amount: firebaseTransaction.amount,
      currency: firebaseTransaction.currency || 'USD',
      description: firebaseTransaction.description,
      category: firebaseTransaction.category,
      source_account_id: firebaseTransaction.sourceAccountId,
      destination: firebaseTransaction.destination,
      destination_type: firebaseTransaction.destinationType,
      status: firebaseTransaction.status || 'completed',
      payment_method: firebaseTransaction.paymentMethod,
      created_at: firebaseTransaction.createdAt || new Date()
    };
  }

  mapFirebaseHistoryToPostgreSQL(firebaseHistory, userId) {
    return {
      id: firebaseHistory.id || uuidv4(),
      user_id: userId,
      type: firebaseHistory.type,
      details: firebaseHistory.details,
      date: firebaseHistory.date || new Date(),
      created_at: firebaseHistory.createdAt || new Date()
    };
  }

  // Map PostgreSQL format to Firebase document format
  mapPostgreSQLUserToFirebase(postgreSQLUser) {
    return {
      id: postgreSQLUser.id,
      email: postgreSQLUser.email,
      created_at: postgreSQLUser.created_at,
      settings: postgreSQLUser.settings
    };
  }

  mapPostgreSQLAccountToFirebase(postgreSQLAccount) {
    return {
      id: postgreSQLAccount.id,
      name: postgreSQLAccount.name,
      accountLevel: postgreSQLAccount.account_level,
      parentAccountId: postgreSQLAccount.parent_account_id,
      ibanNumber: postgreSQLAccount.iban_number,
      accountNumber: postgreSQLAccount.account_number,
      bankBic: postgreSQLAccount.bank_bic,
      bankName: postgreSQLAccount.bank_name,
      subAccountIndex: postgreSQLAccount.sub_account_index,
      balance: postgreSQLAccount.balance,
      isActive: postgreSQLAccount.is_active,
      createdAt: postgreSQLAccount.created_at
    };
  }

  mapPostgreSQLBudgetToFirebase(postgreSQLBudget) {
    return {
      id: postgreSQLBudget.id,
      name: postgreSQLBudget.name,
      limit: postgreSQLBudget.limit,
      spent: postgreSQLBudget.spent,
      icon: postgreSQLBudget.icon,
      color: postgreSQLBudget.color,
      isCardAssigned: postgreSQLBudget.is_card_assigned,
      items: postgreSQLBudget.items,
      createdAt: postgreSQLBudget.created_at
    };
  }

  mapPostgreSQLVaultToFirebase(postgreSQLVault) {
    return {
      id: postgreSQLVault.id,
      name: postgreSQLVault.name,
      target: postgreSQLVault.target,
      current: postgreSQLVault.current,
      icon: postgreSQLVault.icon,
      color: postgreSQLVault.color,
      isSavingsAccount: postgreSQLVault.is_savings_account,
      createdAt: postgreSQLVault.created_at
    };
  }

  mapPostgreSQLTransactionToFirebase(postgreSQLTransaction) {
    return {
      id: postgreSQLTransaction.id,
      amount: postgreSQLTransaction.amount,
      currency: postgreSQLTransaction.currency,
      description: postgreSQLTransaction.description,
      category: postgreSQLTransaction.category,
      sourceAccountId: postgreSQLTransaction.source_account_id,
      destination: postgreSQLTransaction.destination,
      destinationType: postgreSQLTransaction.destination_type,
      status: postgreSQLTransaction.status,
      paymentMethod: postgreSQLTransaction.payment_method,
      createdAt: postgreSQLTransaction.created_at
    };
  }

  mapPostgreSQLHistoryToFirebase(postgreSQLHistory) {
    return {
      id: postgreSQLHistory.id,
      type: postgreSQLHistory.type,
      details: postgreSQLHistory.details,
      date: postgreSQLHistory.date,
      createdAt: postgreSQLHistory.created_at
    };
  }

  // Batch mapping functions
  mapFirebaseAccountsToPostgreSQL(firebaseAccounts, userId) {
    return firebaseAccounts.map(account =>
      this.mapFirebaseAccountToPostgreSQL(account, userId)
    );
  }

  mapFirebaseBudgetsToPostgreSQL(firebaseBudgets, userId) {
    return firebaseBudgets.map(budget =>
      this.mapFirebaseBudgetToPostgreSQL(budget, userId)
    );
  }

  mapFirebaseVaultsToPostgreSQL(firebaseVaults, userId) {
    return firebaseVaults.map(vault =>
      this.mapFirebaseVaultToPostgreSQL(vault, userId)
    );
  }

  mapFirebaseTransactionsToPostgreSQL(firebaseTransactions, userId) {
    return firebaseTransactions.map(transaction =>
      this.mapFirebaseTransactionToPostgreSQL(transaction, userId)
    );
  }

  mapFirebaseHistoryToPostgreSQL(firebaseHistory, userId) {
    return firebaseHistory.map(history =>
      this.mapFirebaseHistoryToPostgreSQL(history, userId)
    );
  }

  // Validation functions
  validateIBAN(iban) {
    // MOD97-10 algorithm for IBAN validation
    if (!iban || typeof iban !== 'string') return false;

    const ibanClean = iban.replace(/\s/g, '').toUpperCase();
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

    if (!ibanRegex.test(ibanClean)) return false;

    const rearranged = ibanClean.slice(4) + ibanClean.slice(0, 4);
    const numeric = rearranged.split('').map(char => {
      const code = char.charCodeAt(0);
      return code < 58 ? char : (code - 55).toString();
    }).join('');

    let remainder = 0;
    for (let i = 0; i < numeric.length; i++) {
      remainder = (remainder * 10 + parseInt(numeric[i], 10)) % 97;
    }

    return remainder === 1;
  }

  validateAccountNumber(accountNumber) {
    return accountNumber && typeof accountNumber === 'string' &&
           accountNumber.length >= 8 && accountNumber.length <= 16;
  }

  sanitizeString(input, maxLength = 100) {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '');
  }

  generateAccountNumber(userId, index) {
    let hash = 0;
    const str = userId + index.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString().padStart(16, '0').slice(-16);
  }

  generateIBAN(bankCode, accountNumber) {
    const countryCode = 'PK'; // Pakistan
    const checkDigits = '00';
    const bban = bankCode + accountNumber;

    const rearranged = bban + countryCode + checkDigits;
    const numeric = rearranged.split('').map(char => {
      const code = char.charCodeAt(0);
      return code < 58 ? char : (code - 55).toString();
    }).join('');

    let remainder = 0;
    for (let i = 0; i < numeric.length; i++) {
      remainder = (remainder * 10 + parseInt(numeric[i], 10)) % 97;
    }

    const check = (98 - remainder).toString().padStart(2, '0');
    return `${countryCode}${check}${bban}`;
  }
}

module.exports = new PostgreSQLMappers();