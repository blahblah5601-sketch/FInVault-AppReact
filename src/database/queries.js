const postgres = require("./postgres");

class PostgreSQLQueries {
  // User Operations
  async createUser(userData, client) {
    const query = `
      INSERT INTO users (id, email, created_at, settings)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const params = [
      userData.id,
      userData.email,
      userData.created_at,
      userData.settings || { theme: 'Slate', notifications: true }
    ];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  async getUserById(userId, client) {
    const query = `
      SELECT * FROM users WHERE id = $1
    `;
    const params = [userId];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  // Account Operations
  async createAccount(accountData, client) {
    const query = `
      INSERT INTO accounts (id, user_id, name, account_level, parent_account_id,
                          iban_number, account_number, bank_bic, bank_name,
                          sub_account_index, balance, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const params = [
      accountData.id,
      accountData.user_id,
      accountData.name,
      accountData.account_level,
      accountData.parent_account_id,
      accountData.iban_number,
      accountData.account_number,
      accountData.bank_bic,
      accountData.bank_name,
      accountData.sub_account_index,
      accountData.balance,
      accountData.is_active,
      accountData.created_at
    ];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  async getAccountsByUserId(userId, client) {
    const query = `
      SELECT * FROM accounts
      WHERE user_id = $1 AND is_active = true
      ORDER BY created_at DESC
    `;
    const params = [userId];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  // Budget Operations
  async createBudget(budgetData, client) {
    const query = `
      INSERT INTO budgets (id, user_id, name, limit, spent, icon, color,
                         is_card_assigned, items, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const params = [
      budgetData.id,
      budgetData.user_id,
      budgetData.name,
      budgetData.limit,
      budgetData.spent,
      budgetData.icon,
      budgetData.color,
      budgetData.is_card_assigned,
      budgetData.items,
      budgetData.created_at
    ];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  async getBudgetsByUserId(userId, client) {
    const query = `
      SELECT * FROM budgets
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const params = [userId];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  // Vault Operations
  async createVault(vaultData, client) {
    const query = `
      INSERT INTO vaults (id, user_id, name, target, current, icon, color,
                        is_savings_account, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      vaultData.id,
      vaultData.user_id,
      vaultData.name,
      vaultData.target,
      vaultData.current,
      vaultData.icon,
      vaultData.color,
      vaultData.is_savings_account,
      vaultData.created_at
    ];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  async getVaultsByUserId(userId, client) {
    const query = `
      SELECT * FROM vaults
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const params = [userId];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  // Transaction Operations
  async createTransaction(transactionData, client) {
    const query = `
      INSERT INTO transactions (id, user_id, amount, currency, description,
                               category, source_account_id, destination,
                               destination_type, status, payment_method, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const params = [
      transactionData.id,
      transactionData.user_id,
      transactionData.amount,
      transactionData.currency,
      transactionData.description,
      transactionData.category,
      transactionData.source_account_id,
      transactionData.destination,
      transactionData.destination_type,
      transactionData.status,
      transactionData.payment_method,
      transactionData.created_at
    ];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  async getTransactionsByUserId(userId, limit = 50, offset = 0, client) {
    const query = `
      SELECT * FROM transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const params = [userId, limit, offset];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  // History Operations
  async createHistory(historyData, client) {
    const query = `
      INSERT INTO history (id, user_id, type, details, date, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      historyData.id,
      historyData.user_id,
      historyData.type,
      historyData.details,
      historyData.date,
      historyData.created_at
    ];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  async getHistoryByUserId(userId, limit = 50, offset = 0, client) {
    const query = `
      SELECT * FROM history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const params = [userId, limit, offset];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  // Update Operations
  async updateAccountBalance(accountId, newBalance, client) {
    const query = `
      UPDATE accounts
      SET balance = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const params = [newBalance, accountId];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  async updateBudgetSpent(budgetId, newSpent, client) {
    const query = `
      UPDATE budgets
      SET spent = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const params = [newSpent, budgetId];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  async updateVaultBalance(vaultId, newCurrent, client) {
    const query = `
      UPDATE vaults
      SET current = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const params = [newCurrent, vaultId];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  // Delete Operations
  async deleteBudget(budgetId, client) {
    const query = `
      DELETE FROM budgets
      WHERE id = $1
      RETURNING *
    `;
    const params = [budgetId];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  async deleteVault(vaultId, client) {
    const query = `
      DELETE FROM vaults
      WHERE id = $2
      RETURNING *
    `;
    const params = [vaultId];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  // Complex Operations (with transactions)
  async handleVaultTransaction(vaultId, accountId, amount, client) {
    const operations = [
      {
        text: `
          UPDATE vaults
          SET current = current + $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `,
        params: [amount, vaultId]
      },
      {
        text: `
          UPDATE accounts
          SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `,
        params: [amount, accountId]
      }
    ];

    return client ? client.batchTransaction(operations) : postgres.batchTransaction(operations);
  }

  // Search Operations
  async searchTransactions(userId, query, limit = 20, client) {
    const searchQuery = `
      SELECT * FROM transactions
      WHERE user_id = $1
      AND (description ILIKE $2 OR category ILIKE $2 OR amount::text = $3)
      ORDER BY created_at DESC
      LIMIT $4
    `;
    const params = [userId, `%${query}%`, query, limit];
    return client ? client.query(searchQuery, params) : postgres.query(searchQuery, params);
  }

  // Utility Operations
  async getTotalBalance(userId, client) {
    const query = `
      SELECT COALESCE(SUM(balance), 0) as total_balance
      FROM accounts
      WHERE user_id = $1 AND is_active = true
    `;
    const params = [userId];
    return client ? client.query(query, params) : postgres.query(query, params);
  }

  async getBudgetSummary(userId, client) {
    const query = `
      SELECT
        COUNT(*) as total_budgets,
        SUM(limit) as total_limit,
        SUM(spent) as total_spent
      FROM budgets
      WHERE user_id = $1
    `;
    const params = [userId];
    return client ? client.query(query, params) : postgres.query(query, params);
  }
}

module.exports = new PostgreSQLQueries();