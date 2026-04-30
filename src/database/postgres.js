const { Pool } = require('pg');

class PostgreSQLClient {
  constructor() {
    this.pool = new Pool({
      user: process.env.VITE_POSTGRES_USER || 'finvault',
      host: process.env.VITE_POSTGRES_HOST || 'localhost',
      database: process.env.VITE_POSTGRES_DB || 'finvault',
      password: process.env.VITE_POSTGRES_PASSWORD || 'finvault',
      port: parseInt(process.env.VITE_POSTGRES_PORT) || 5432,
      max: 20, // Max connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Initialize database if needed
    this.initializeDatabase();
  }

  async initializeDatabase() {
    const client = await this.pool.connect();
    try {
      // Enable UUID extension if not exists
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      `);
    } catch (error) {
      console.error('Error initializing database:', error);
    } finally {
      client.release();
    }
  }

  async getClient() {
    return this.pool.connect();
  }

  async query(text, params) {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async transaction(callback) {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      try {
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    } finally {
      client.release();
    }
  }

  async batchTransaction(operations) {
    return this.transaction(async (client) => {
      const results = [];

      for (const operation of operations) {
        const result = await client.query(operation.text, operation.params);
        results.push(result);
      }

      return results;
    });
  }

  async close() {
    await this.pool.end();
  }
}

// Export singleton instance
const postgresClient = new PostgreSQLClient();
module.exports = postgresClient;