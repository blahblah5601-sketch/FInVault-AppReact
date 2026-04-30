import { Pool } from 'pg';

class PostgreSQLClient {
  constructor() {
    this.pool = new Pool({
      user: process.env.VITE_POSTGRES_USER || 'finvault',
      host: process.env.VITE_POSTGRES_HOST || 'localhost',
      database: process.env.VITE_POSTGRES_DB || 'finvault',
      password: process.env.VITE_POSTGRES_PASSWORD || 'finvault',
      port: parseInt(process.env.VITE_POSTGRES_PORT) || 5432,
      ssl: process.env.VITE_POSTGRES_SSL === 'true' || false
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected pool error', err);
    });
  }

  // Execute a query
  async query(text, params) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Execute a query with a single row
  async queryOne(text, params) {
    const result = await this.query(text, params);
    return result.rows[0];
  }

  // Execute a query with multiple rows
  async queryAll(text, params) {
    const result = await this.query(text, params);
    return result.rows;
  }

  // Batch insert
  async batchInsert(documents) {
    if (documents.length === 0) {
      return { success: true, inserted: 0 };
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const insertTexts = documents.map(doc => `
        INSERT INTO ${doc.collection} (
          id, user_id, data, created_at, updated_at, sync_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        )
      `);

      const insertValues = documents.map(doc => [
        doc.id,
        doc.userId,
        JSON.stringify(doc),
        new Date(),
        new Date(),
        'synced'
      ]);

      for (let i = 0; i < insertTexts.length; i++) {
        await client.query(insertTexts[i], insertValues[i]);
      }

      await client.query('COMMIT');

      return { success: true, inserted: documents.length };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Batch insert error:', error);
      return { success: false, error: error };
    } finally {
      client.release();
    }
  }

  // Insert a single document
  async insert(document) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO ${document.collection} (
          id, user_id, data, created_at, updated_at, sync_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        )
      `, [
        document.id,
        document.userId,
        JSON.stringify(document),
        new Date(),
        new Date(),
        'synced'
      ]);

      return { success: true, inserted: result.rowCount };

    } catch (error) {
      console.error('Insert error:', error);
      return { success: false, error: error };
    } finally {
      client.release();
    }
  }

  // Update a document
  async update(document) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        UPDATE ${document.collection}
        SET data = $1, updated_at = $2, sync_status = $3
        WHERE id = $4 AND user_id = $5
      `, [
        JSON.stringify(document),
        new Date(),
        'synced',
        document.id,
        document.userId
      ]);

      return { success: true, updated: result.rowCount };

    } catch (error) {
      console.error('Update error:', error);
      return { success: false, error: error };
    } finally {
      client.release();
    }
  }

  // Delete a document
  async delete(collection, documentId, userId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        DELETE FROM ${collection}
        WHERE id = $1 AND user_id = $2
      `, [documentId, userId]);

      return { success: true, deleted: result.rowCount };

    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error };
    } finally {
      client.release();
    }
  }

  // Check if a document exists
  async exists(collection, documentId, userId) {
    const result = await this.queryOne(`
      SELECT 1 FROM ${collection}
      WHERE id = $1 AND user_id = $2
    `, [documentId, userId]);

    return result !== undefined;
  }

  // Get a document by ID
  async getById(collection, documentId, userId) {
    const result = await this.queryOne(`
      SELECT data FROM ${collection}
      WHERE id = $1 AND user_id = $2
    `, [documentId, userId]);

    return result ? JSON.parse(result.data) : null;
  }

  // Get all documents for a user
  async getAll(collection, userId) {
    const results = await this.queryAll(`
      SELECT data FROM ${collection}
      WHERE user_id = $1
    `, [userId]);

    return results.map(row => JSON.parse(row.data));
  }

  // Get documents with sync status
  async getWithSyncStatus(collection, syncStatus, userId) {
    const results = await this.queryAll(`
      SELECT data FROM ${collection}
      WHERE user_id = $1 AND sync_status = $2
    `, [userId, syncStatus]);

    return results.map(row => JSON.parse(row.data));
  }

  // Update sync status for a document
  async updateSyncStatus(collection, documentId, userId, status) {
    const result = await this.query(`
      UPDATE ${collection}
      SET sync_status = $1, updated_at = $2
      WHERE id = $3 AND user_id = $4
    `, [status, new Date(), documentId, userId]);

    return { success: true, updated: result.rowCount };
  }

  // Health check
  async healthCheck() {
    try {
      await this.query('SELECT 1');
      return { healthy: true };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

export default new PostgreSQLClient();