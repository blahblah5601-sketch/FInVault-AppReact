const postgres = require("./postgres");

class PostgreSQLRealtime {
  constructor() {
    this.listeners = new Map();
    this.notifications = new Map();
  }

  // Listen for PostgreSQL notifications
  async listenForNotifications(userId, tableName, callback) {
    const channel = `user_${userId}_${tableName}`;

    // Create notification listener
    if (!this.listeners.has(channel)) {
      const listener = async (message) => {
        if (message.channel === channel) {
          const data = JSON.parse(message.payload);
          this.handleNotification(channel, data);
        }
      };

      postgres.pool.on('notification', listener);
      this.listeners.set(channel, listener);

      // Subscribe to the channel
      const client = await postgres.getClient();
      await client.query(`LISTEN ${channel}`);
      client.release();
    }

    // Store callback for this user and table
    if (!this.notifications.has(channel)) {
      this.notifications.set(channel, new Set());
    }
    this.notifications.get(channel).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.notifications.get(channel);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.notifications.delete(channel);
        }
      }
    };
  }

  // Handle incoming notifications
  handleNotification(channel, data) {
    const callbacks = this.notifications.get(channel);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in notification callback:', error);
        }
      });
    }
  }

  // Trigger notifications for data changes
  async triggerNotification(userId, tableName, operation, data) {
    const channel = `user_${userId}_${tableName}`;
    const payload = JSON.stringify({
      operation,
      data,
      timestamp: new Date().toISOString()
    });

    try {
      const client = await postgres.getClient();
      await client.query(`
        NOTIFY ${channel}, $1
      `, [payload]);
      client.release();
    } catch (error) {
      console.error('Error triggering notification:', error);
    }
  }

  // Create triggers for real-time updates
  async createTriggers() {
    const triggerFunctions = [
      this.createAccountTrigger,
      this.createBudgetTrigger,
      this.createVaultTrigger,
      this.createTransactionTrigger,
      this.createHistoryTrigger
    ];

    for (const createTrigger of triggerFunctions) {
      try {
        await createTrigger.call(this);
      } catch (error) {
        console.error('Error creating trigger:', error);
      }
    }
  }

  async createAccountTrigger() {
    const query = `
      CREATE OR REPLACE FUNCTION notify_account_changes()
      RETURNS TRIGGER AS $$
      DECLARE
        channel TEXT;
        payload JSON;
      BEGIN
        channel := 'user_' || NEW.user_id || '_accounts';

        IF TG_OP = 'INSERT' THEN
          payload := json_build_object(
            'operation', 'INSERT',
            'data', row_to_json(NEW)
          );
        ELSIF TG_OP = 'UPDATE' THEN
          payload := json_build_object(
            'operation', 'UPDATE',
            'data', row_to_json(NEW)
          );
        ELSIF TG_OP = 'DELETE' THEN
          payload := json_build_object(
            'operation', 'DELETE',
            'data', row_to_json(OLD)
          );
        END IF;

        PERFORM pg_notify(channel, payload::text);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS notify_account_changes_trigger ON accounts;
      CREATE TRIGGER notify_account_changes_trigger
      AFTER INSERT OR UPDATE OR DELETE ON accounts
      FOR EACH ROW EXECUTE FUNCTION notify_account_changes();
    `;

    await postgres.query(query);
  }

  async createBudgetTrigger() {
    const query = `
      CREATE OR REPLACE FUNCTION notify_budget_changes()
      RETURNS TRIGGER AS $$
      DECLARE
        channel TEXT;
        payload JSON;
      BEGIN
        channel := 'user_' || NEW.user_id || '_budgets';

        IF TG_OP = 'INSERT' THEN
          payload := json_build_object(
            'operation', 'INSERT',
            'data', row_to_json(NEW)
          );
        ELSIF TG_OP = 'UPDATE' THEN
          payload := json_build_object(
            'operation', 'UPDATE',
            'data', row_to_json(NEW)
          );
        ELSIF TG_OP = 'DELETE' THEN
          payload := json_build_object(
            'operation', 'DELETE',
            'data', row_to_json(OLD)
          );
        END IF;

        PERFORM pg_notify(channel, payload::text);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS notify_budget_changes_trigger ON budgets;
      CREATE TRIGGER notify_budget_changes_trigger
      AFTER INSERT OR UPDATE OR DELETE ON budgets
      FOR EACH ROW EXECUTE FUNCTION notify_budget_changes();
    `;

    await postgres.query(query);
  }

  async createVaultTrigger() {
    const query = `
      CREATE OR REPLACE FUNCTION notify_vault_changes()
      RETURNS TRIGGER AS $$
      DECLARE
        channel TEXT;
        payload JSON;
      BEGIN
        channel := 'user_' || NEW.user_id || '_vaults';

        IF TG_OP = 'INSERT' THEN
          payload := json_build_object(
            'operation', 'INSERT',
            'data', row_to_json(NEW)
          );
        ELSIF TG_OP = 'UPDATE' THEN
          payload := json_build_object(
            'operation', 'UPDATE',
            'data', row_to_json(NEW)
          );
        ELSIF TG_OP = 'DELETE' THEN
          payload := json_build_object(
            'operation', 'DELETE',
            'data', row_to_json(OLD)
          );
        END IF;

        PERFORM pg_notify(channel, payload::text);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS notify_vault_changes_trigger ON vaults;
      CREATE TRIGGER notify_vault_changes_trigger
      AFTER INSERT OR UPDATE OR DELETE ON vaults
      FOR EACH ROW EXECUTE FUNCTION notify_vault_changes();
    `;

    await postgres.query(query);
  }

  async createTransactionTrigger() {
    const query = `
      CREATE OR REPLACE FUNCTION notify_transaction_changes()
      RETURNS TRIGGER AS $$
      DECLARE
        channel TEXT;
        payload JSON;
      BEGIN
        channel := 'user_' || NEW.user_id || '_transactions';

        IF TG_OP = 'INSERT' THEN
          payload := json_build_object(
            'operation', 'INSERT',
            'data', row_to_json(NEW)
          );
        ELSIF TG_OP = 'UPDATE' THEN
          payload := json_build_object(
            'operation', 'UPDATE',
            'data', row_to_json(NEW)
          );
        ELSIF TG_OP = 'DELETE' THEN
          payload := json_build_object(
            'operation', 'DELETE',
            'data', row_to_json(OLD)
          );
        END IF;

        PERFORM pg_notify(channel, payload::text);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS notify_transaction_changes_trigger ON transactions;
      CREATE TRIGGER notify_transaction_changes_trigger
      AFTER INSERT OR UPDATE OR DELETE ON transactions
      FOR EACH ROW EXECUTE FUNCTION notify_transaction_changes();
    `;

    await postgres.query(query);
  }

  async createHistoryTrigger() {
    const query = `
      CREATE OR REPLACE FUNCTION notify_history_changes()
      RETURNS TRIGGER AS $$
      DECLARE
        channel TEXT;
        payload JSON;
      BEGIN
        channel := 'user_' || NEW.user_id || '_history';

        IF TG_OP = 'INSERT' THEN
          payload := json_build_object(
            'operation', 'INSERT',
            'data', row_to_json(NEW)
          );
        ELSIF TG_OP = 'UPDATE' THEN
          payload := json_build_object(
            'operation', 'UPDATE',
            'data', row_to_json(NEW)
          );
        ELSIF TG_OP = 'DELETE' THEN
          payload := json_build_object(
            'operation', 'DELETE',
            'data', row_to_json(OLD)
          );
        END IF;

        PERFORM pg_notify(channel, payload::text);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS notify_history_changes_trigger ON history;
      CREATE TRIGGER notify_history_changes_trigger
      AFTER INSERT OR UPDATE OR DELETE ON history
      FOR EACH ROW EXECUTE FUNCTION notify_history_changes();
    `;

    await postgres.query(query);
  }

  // WebSocket integration for real-time updates
  async setupWebSocketHandlers(io) {
    io.on('connection', (socket) => {
      const userId = socket.handshake.query.userId;
      if (!userId) {
        socket.disconnect();
        return;
      }

      // Subscribe to all user tables
      const tables = ['accounts', 'budgets', 'vaults', 'transactions', 'history'];

      const unsubscribeFunctions = [];

      tables.forEach(tableName => {
        const unsubscribe = this.listenForNotifications(userId, tableName, (data) => {
          socket.emit('dataChange', {
            tableName,
            operation: data.operation,
            data: data.data,
            timestamp: data.timestamp
          });
        });
        unsubscribeFunctions.push(unsubscribe);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        unsubscribeFunctions.forEach(fn => fn());
      });
    });
  }

  // Polling fallback for browsers without WebSocket support
  async startPolling(userId, callback, interval = 5000) {
    const tables = ['accounts', 'budgets', 'vaults', 'transactions', 'history'];

    const poll = async () => {
      try {
        const results = {};

        for (const tableName of tables) {
          const query = `
            SELECT * FROM ${tableName}
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 50
          `;
          const result = await postgres.query(query, [userId]);
          results[tableName] = result.rows;
        }

        callback(results);
      } catch (error) {
        console.error('Error in polling:', error);
      }
    };

    // Start polling
    poll();
    const intervalId = setInterval(poll, interval);

    // Return stop function
    return () => clearInterval(intervalId);
  }

  // Clean up listeners
  async cleanup() {
    for (const [channel, listener] of this.listeners) {
      postgres.pool.removeListener('notification', listener);
    }
    this.listeners.clear();
    this.notifications.clear();
  }
}

module.exports = new PostgreSQLRealtime();