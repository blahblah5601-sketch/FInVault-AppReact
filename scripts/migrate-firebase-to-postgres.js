const { auth } = require("./firebase");
const postgres = require("./database/postgres");
const queries = require("./database/queries");
const mappers = require("./database/mappers");

class PostgreSQLMigration {
  constructor() {
    this.migrationStatus = new Map();
    this.totalUsers = 0;
    this.completedUsers = 0;
  }

  async migrateAllUsers() {
    try {
      console.log('Starting migration of all users...');

      // Get all users from Firebase
      const usersSnapshot = await this.getAllFirebaseUsers();
      this.totalUsers = usersSnapshot.size;

      console.log(`Found ${this.totalUsers} users to migrate`);

      // Process each user
      for (const doc of usersSnapshot.docs) {
        const firebaseUser = doc.data();
        const userId = doc.id;

        console.log(`Migrating user: ${firebaseUser.email}`);

        try {
          await this.migrateUser(userId, firebaseUser);
          this.completedUsers++;
          console.log(`Completed ${this.completedUsers}/${this.totalUsers} users`);
        } catch (error) {
          console.error(`Error migrating user ${firebaseUser.email}:`, error);
          this.migrationStatus.set(userId, { status: 'error', error: error.message });
        }
      }

      console.log('Migration completed!');
      console.log(`Successfully migrated ${this.completedUsers} out of ${this.totalUsers} users`);

      if (this.migrationStatus.size > 0) {
        console.log('Errors occurred for some users:');
        this.migrationStatus.forEach((status, userId) => {
          if (status.status === 'error') {
            console.log(`User ${userId}: ${status.error}`);
          }
        });
      }

      return {
        totalUsers: this.totalUsers,
        completedUsers: this.completedUsers,
        errors: this.migrationStatus.size
      };

    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async getAllFirebaseUsers() {
    try {
      const usersRef = auth.currentUser ? null : auth.getUsers();
      if (usersRef) {
        return await usersRef.get();
      } else {
        // Fallback: get all users from Firebase Auth
        const users = await auth.listUsers();
        return users.users;
      }
    } catch (error) {
      console.error('Error getting Firebase users:', error);
      throw error;
    }
  }

  async migrateUser(userId, firebaseUser) {
    try {
      // Start transaction for atomic migration
      await postgres.transaction(async (client) => {
        // 1. Create user in PostgreSQL
        const userPostgreSQL = mappers.mapFirebaseUserToPostgreSQL(firebaseUser);
        await queries.createUser(userPostgreSQL, client);

        // 2. Migrate accounts
        await this.migrateAccounts(userId, client);

        // 3. Migrate budgets
        await this.migrateBudgets(userId, client);

        // 4. Migrate vaults
        await this.migrateVaults(userId, client);

        // 5. Migrate transactions
        await this.migrateTransactions(userId, client);

        // 6. Migrate history
        await this.migrateHistory(userId, client);

        // 7. Migrate other collections
        await this.migrateBankAccounts(userId, client);
        await this.migrateCards(userId, client);
        await this.migratePayments(userId, client);
        await this.migrateBeneficiaries(userId, client);
        await this.migrateBillers(userId, client);
        await this.migratePaymentMethods(userId, client);
        await this.migrateBankConnections(userId, client);

        // Log migration completion
        await this.createMigrationLog(userId, 'success', client);
      });

      this.migrationStatus.set(userId, { status: 'completed' });
      return true;

    } catch (error) {
      console.error(`Error migrating user ${userId}:`, error);
      this.migrationStatus.set(userId, { status: 'error', error: error.message });
      throw error;
    }
  }

  async migrateAccounts(userId, client) {
    try {
      const accountsRef = auth.currentUser ? null : auth.getUserAccounts(userId);
      const accountsSnapshot = accountsRef ? await accountsRef.get() : [];

      if (accountsSnapshot.size === 0) return;

      const accountsData = accountsSnapshot.docs.map(doc => doc.data());
      const postgresAccounts = mappers.mapFirebaseAccountsToPostgreSQL(accountsData, userId);

      for (const account of postgresAccounts) {
        await queries.createAccount(account, client);
      }

      console.log(`Migrated ${postgresAccounts.length} accounts for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating accounts for user ${userId}:`, error);
      throw error;
    }
  }

  async migrateBudgets(userId, client) {
    try {
      const budgetsRef = auth.currentUser ? null : auth.getUserBudgets(userId);
      const budgetsSnapshot = budgetsRef ? await budgetsRef.get() : [];

      if (budgetsSnapshot.size === 0) return;

      const budgetsData = budgetsSnapshot.docs.map(doc => doc.data());
      const postgresBudgets = mappers.mapFirebaseBudgetsToPostgreSQL(budgetsData, userId);

      for (const budget of postgresBudgets) {
        await queries.createBudget(budget, client);
      }

      console.log(`Migrated ${postgresBudgets.length} budgets for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating budgets for user ${userId}:`, error);
      throw error;
    }
  }

  async migrateVaults(userId, client) {
    try {
      const vaultsRef = auth.currentUser ? null : auth.getUserVaults(userId);
      const vaultsSnapshot = vaultsRef ? await vaultsRef.get() : [];

      if (vaultsSnapshot.size === 0) return;

      const vaultsData = vaultsSnapshot.docs.map(doc => doc.data());
      const postgresVaults = mappers.mapFirebaseVaultsToPostgreSQL(vaultsData, userId);

      for (const vault of postgresVaults) {
        await queries.createVault(vault, client);
      }

      console.log(`Migrated ${postgresVaults.length} vaults for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating vaults for user ${userId}:`, error);
      throw error;
    }
  }

  async migrateTransactions(userId, client) {
    try {
      const transactionsRef = auth.currentUser ? null : auth.getUserTransactions(userId);
      const transactionsSnapshot = transactionsRef ? await transactionsRef.get() : [];

      if (transactionsSnapshot.size === 0) return;

      const transactionsData = transactionsSnapshot.docs.map(doc => doc.data());
      const postgresTransactions = mappers.mapFirebaseTransactionsToPostgreSQL(transactionsData, userId);

      for (const transaction of postgresTransactions) {
        await queries.createTransaction(transaction, client);
      }

      console.log(`Migrated ${postgresTransactions.length} transactions for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating transactions for user ${userId}:`, error);
      throw error;
    }
  }

  async migrateHistory(userId, client) {
    try {
      const historyRef = auth.currentUser ? null : auth.getUserHistory(userId);
      const historySnapshot = historyRef ? await historyRef.get() : [];

      if (historySnapshot.size === 0) return;

      const historyData = historySnapshot.docs.map(doc => doc.data());
      const postgresHistory = mappers.mapFirebaseHistoryToPostgreSQL(historyData, userId);

      for (const history of postgresHistory) {
        await queries.createHistory(history, client);
      }

      console.log(`Migrated ${postgresHistory.length} history entries for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating history for user ${userId}:`, error);
      throw error;
    }
  }

  async migrateBankAccounts(userId, client) {
    try {
      const bankAccountsRef = auth.currentUser ? null : auth.getUserBankAccounts(userId);
      const bankAccountsSnapshot = bankAccountsRef ? await bankAccountsRef.get() : [];

      if (bankAccountsSnapshot.size === 0) return;

      const bankAccountsData = bankAccountsSnapshot.docs.map(doc => doc.data());
      const postgresBankAccounts = bankAccountsData.map(account => ({
        ...mappers.mapFirebaseAccountToPostgreSQL(account, userId),
        account_name: account.accountName,
        account_number: account.accountNumber,
        bank_connection_id: account.bankConnectionId,
        account_type: account.accountType,
        balance: account.balance || 0,
        currency: account.currency || 'PKR',
        is_primary: account.isPrimary || false,
        is_active: account.isActive !== false,
        created_at: account.createdAt || new Date()
      }));

      for (const bankAccount of postgresBankAccounts) {
        await postgres.query(`
          INSERT INTO bank_accounts (id, user_id, account_name, account_number,
                                    bank_connection_id, account_type, balance,
                                    currency, is_primary, is_active, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
          bankAccount.id, bankAccount.user_id, bankAccount.account_name,
          bankAccount.account_number, bankAccount.bank_connection_id,
          bankAccount.account_type, bankAccount.balance, bankAccount.currency,
          bankAccount.is_primary, bankAccount.is_active, bankAccount.created_at
        ]);
      }

      console.log(`Migrated ${postgresBankAccounts.length} bank accounts for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating bank accounts for user ${userId}:`, error);
      throw error;
    }
  }

  async migrateCards(userId, client) {
    try {
      const cardsRef = auth.currentUser ? null : auth.getUserCards(userId);
      const cardsSnapshot = cardsRef ? await cardsRef.get() : [];

      if (cardsSnapshot.size === 0) return;

      const cardsData = cardsSnapshot.docs.map(doc => doc.data());
      const postgresCards = cardsData.map(card => ({
        ...mappers.mapFirebaseAccountToPostgreSQL(card, userId),
        card_nickname: card.cardNickname,
        last_four: card.lastFour,
        bank_account_id: card.bankAccountId,
        card_type: card.cardType,
        network: card.network,
        is_primary: card.isPrimary || false,
        is_active: card.isActive !== false,
        spending_limit: card.spendingLimit || 0,
        created_at: card.createdAt || new Date()
      }));

      for (const card of postgresCards) {
        await postgres.query(`
          INSERT INTO cards (id, user_id, card_nickname, last_four,
                           bank_account_id, card_type, network,
                           is_primary, is_active, spending_limit, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
          card.id, card.user_id, card.card_nickname, card.last_four,
          card.bank_account_id, card.card_type, card.network,
          card.is_primary, card.is_active, card.spending_limit, card.created_at
        ]);
      }

      console.log(`Migrated ${postgresCards.length} cards for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating cards for user ${userId}:`, error);
      throw error;
    }
  }

  async migratePayments(userId, client) {
    try {
      const paymentsRef = auth.currentUser ? null : auth.getUserPayments(userId);
      const paymentsSnapshot = paymentsRef ? await paymentsRef.get() : [];

      if (paymentsSnapshot.size === 0) return;

      const paymentsData = paymentsSnapshot.docs.map(doc => doc.data());
      const postgresPayments = mappers.mapFirebaseTransactionsToPostgreSQL(paymentsData, userId);

      for (const payment of postgresPayments) {
        await queries.createTransaction(payment, client);
      }

      console.log(`Migrated ${postgresPayments.length} payments for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating payments for user ${userId}:`, error);
      throw error;
    }
  }

  async migrateBeneficiaries(userId, client) {
    try {
      const beneficiariesRef = auth.currentUser ? null : auth.getUserBeneficiaries(userId);
      const beneficiariesSnapshot = beneficiariesRef ? await beneficiariesRef.get() : [];

      if (beneficiariesSnapshot.size === 0) return;

      const beneficiariesData = beneficiariesSnapshot.docs.map(doc => doc.data());
      const postgresBeneficiaries = beneficiariesData.map(beneficiary => ({
        ...mappers.mapFirebaseAccountToPostgreSQL(beneficiary, userId),
        beneficiary_name: beneficiary.beneficiaryName,
        nickname: beneficiary.nickname,
        destination_type: beneficiary.destinationType,
        destination_value: beneficiary.destinationValue,
        is_active: beneficiary.isActive !== false,
        created_at: beneficiary.createdAt || new Date()
      }));

      for (const beneficiary of postgresBeneficiaries) {
        await postgres.query(`
          INSERT INTO beneficiaries (id, user_id, beneficiary_name, nickname,
                                    destination_type, destination_value,
                                    is_active, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          beneficiary.id, beneficiary.user_id, beneficiary.beneficiary_name,
          beneficiary.nickname, beneficiary.destination_type,
          beneficiary.destination_value, beneficiary.is_active, beneficiary.created_at
        ]);
      }

      console.log(`Migrated ${postgresBeneficiaries.length} beneficiaries for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating beneficiaries for user ${userId}:`, error);
      throw error;
    }
  }

  async migrateBillers(userId, client) {
    try {
      const billersRef = auth.currentUser ? null : auth.getUserBillers(userId);
      const billersSnapshot = billersRef ? await billersRef.get() : [];

      if (billersSnapshot.size === 0) return;

      const billersData = billersSnapshot.docs.map(doc => doc.data());
      const postgresBillers = billersData.map(biller => ({
        ...mappers.mapFirebaseAccountToPostgreSQL(biller, userId),
        name: biller.name,
        category: biller.category,
        account_ref: biller.accountRef,
        last_amount: biller.lastAmount || 0,
        created_at: biller.createdAt || new Date()
      }));

      for (const biller of postgresBillers) {
        await postgres.query(`
          INSERT INTO billers (id, user_id, name, category,
                             account_ref, last_amount, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, [
          biller.id, biller.user_id, biller.name, biller.category,
          biller.account_ref, biller.last_amount, biller.created_at
        ]);
      }

      console.log(`Migrated ${postgresBillers.length} billers for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating billers for user ${userId}:`, error);
      throw error;
    }
  }

  async migratePaymentMethods(userId, client) {
    try {
      const paymentMethodsRef = auth.currentUser ? null : auth.getUserPaymentMethods(userId);
      const paymentMethodsSnapshot = paymentMethodsRef ? await paymentMethodsRef.get() : [];

      if (paymentMethodsSnapshot.size === 0) return;

      const paymentMethodsData = paymentMethodsSnapshot.docs.map(doc => doc.data());
      const postgresPaymentMethods = paymentMethodsData.map(method => ({
        ...mappers.mapFirebaseAccountToPostgreSQL(method, userId),
        method_type: method.methodType,
        is_enabled: method.isEnabled !== false,
        is_primary: method.isPrimary || false,
        created_at: method.createdAt || new Date()
      }));

      for (const method of postgresPaymentMethods) {
        await postgres.query(`
          INSERT INTO payment_methods (id, user_id, method_type,
                                      is_enabled, is_primary, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          method.id, method.user_id, method.method_type,
          method.is_enabled, method.is_primary, method.created_at
        ]);
      }

      console.log(`Migrated ${postgresPaymentMethods.length} payment methods for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating payment methods for user ${userId}:`, error);
      throw error;
    }
  }

  async migrateBankConnections(userId, client) {
    try {
      const bankConnectionsRef = auth.currentUser ? null : auth.getUserBankConnections(userId);
      const bankConnectionsSnapshot = bankConnectionsRef ? await bankConnectionsRef.get() : [];

      if (bankConnectionsSnapshot.size === 0) return;

      const bankConnectionsData = bankConnectionsSnapshot.docs.map(doc => doc.data());
      const postgresBankConnections = bankConnectionsData.map(connection => ({
        ...mappers.mapFirebaseAccountToPostgreSQL(connection, userId),
        bank_name: connection.bankName,
        bank_id: connection.bankId,
        connection_status: connection.connectionStatus,
        last_synced: connection.lastSynced || null,
        created_at: connection.createdAt || new Date()
      }));

      for (const connection of postgresBankConnections) {
        await postgres.query(`
          INSERT INTO bank_connections (id, user_id, bank_name, bank_id,
                                       connection_status, last_synced, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, [
          connection.id, connection.user_id, connection.bank_name,
          connection.bank_id, connection.connection_status,
          connection.last_synced, connection.created_at
        ]);
      }

      console.log(`Migrated ${postgresBankConnections.length} bank connections for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error migrating bank connections for user ${userId}:`, error);
      throw error;
    }
  }

  async createMigrationLog(userId, status, client) {
    const logData = {
      user_id: userId,
      status: status,
      timestamp: new Date(),
      details: status === 'success' ? 'Migration completed successfully' : 'Migration failed'
    };

    await postgres.query(`
      INSERT INTO migration_logs (user_id, status, timestamp, details)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [logData.user_id, logData.status, logData.timestamp, logData.details]);
  }

  async rollbackUser(userId) {
    try {
      console.log(`Rolling back migration for user ${userId}...`);

      await postgres.transaction(async (client) => {
        // Delete all PostgreSQL data for this user
        const tables = [
          'accounts', 'budgets', 'vaults', 'transactions',
          'history', 'bank_accounts', 'cards', 'payments',
          'beneficiaries', 'billers', 'payment_methods', 'bank_connections'
        ];

        for (const table of tables) {
          await client.query(`
            DELETE FROM ${table}
            WHERE user_id = $1
          `, [userId]);
        }

        // Delete user
        await client.query(`
          DELETE FROM users
          WHERE id = $1
        `, [userId]);

        // Delete migration log
        await client.query(`
          DELETE FROM migration_logs
          WHERE user_id = $1
        `, [userId]);
      });

      console.log(`Rollback completed for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error rolling back migration for user ${userId}:`, error);
      return false;
    }
  }

  async getMigrationStatus() {
    return {
      totalUsers: this.totalUsers,
      completedUsers: this.completedUsers,
      errors: this.migrationStatus.size,
      details: Object.fromEntries(this.migrationStatus)
    };
  }
}

module.exports = new PostgreSQLMigration();