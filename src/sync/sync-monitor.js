import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

class SyncMonitor {
  constructor() {
    this.metrics = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      totalDocumentsSynced: 0,
      errorCount: 0,
      warnings: 0,
      lastSyncTime: null,
      syncDurations: [],
      errorLog: [],
      warningLog: [],
      infoLog: [],
      debugLog: []
    };

    this.healthStatus = {
      isHealthy: true,
      lastHealthCheck: null,
      issues: []
    };

    this.logs = [];

    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  // Log a message
  log(level, message, metadata = {}) {
    const logEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level: level,
      message: message,
      metadata: metadata
    };

    // Add to logs array
    this.logs.push(logEntry);

    // Add to specific log type
    switch (level) {
      case 'debug':
        this.metrics.debugLog.push(logEntry);
        break;
      case 'info':
        this.metrics.infoLog.push(logEntry);
        break;
      case 'warn':
        this.metrics.warningLog.push(logEntry);
        this.metrics.warnings++;
        break;
      case 'error':
        this.metrics.errorLog.push(logEntry);
        this.metrics.errorCount++;
        break;
    }

    // Output to console with color coding
    const colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      green: '\x1b[32m',
      gray: '\x1b[90m'
    };

    let color = colors.gray;
    switch (level) {
      case 'error':
        color = colors.red;
        break;
      case 'warn':
        color = colors.yellow;
        break;
      case 'info':
        color = colors.blue;
        break;
      case 'debug':
        color = colors.gray;
        break;
    }

    console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${message}`);

    // Add metadata to console if present
    if (Object.keys(metadata).length > 0) {
      console.log(`${colors.gray}${JSON.stringify(metadata, null, 2)}${colors.reset}`);
    }
  }

  // Record a sync operation
  recordSyncOperation(userId, operation, status, duration, documentsSynced = 0) {
    this.metrics.totalSyncs++;

    if (status === 'success') {
      this.metrics.successfulSyncs++;
      this.metrics.totalDocumentsSynced += documentsSynced;
      this.metrics.syncDurations.push(duration);
    } else {
      this.metrics.failedSyncs++;
    }

    this.metrics.lastSyncTime = new Date().toISOString();

    this.log('info', `Sync operation recorded: ${operation}`, {
      userId: userId,
      operation: operation,
      status: status,
      duration: duration,
      documentsSynced: documentsSynced,
      timestamp: this.metrics.lastSyncTime
    });
  }

  // Record an error
  recordError(error, context = {}) {
    this.metrics.errorCount++;

    const errorEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context: context
    };

    this.metrics.errorLog.push(errorEntry);

    this.log('error', `Error recorded: ${error.message}`, {
      error: error.message,
      context: context,
      timestamp: errorEntry.timestamp
    });
  }

  // Get detailed metrics
  getDetailedMetrics() {
    const durations = this.metrics.syncDurations;
    const avgDuration = durations.length > 0 ?
      durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    return {
      totalSyncs: this.metrics.totalSyncs,
      successfulSyncs: this.metrics.successfulSyncs,
      failedSyncs: this.metrics.failedSyncs,
      totalDocumentsSynced: this.metrics.totalDocumentsSynced,
      errorCount: this.metrics.errorCount,
      warnings: this.metrics.warnings,
      averageSyncDuration: avgDuration,
      lastSyncTime: this.metrics.lastSyncTime,
      health: this.healthStatus
    };
  }

  // Export logs to file
  exportLogs(filename) {
    const fs = require('fs');
    const path = require('path');

    const logData = {
      logs: this.logs,
      metrics: this.metrics,
      health: this.healthStatus,
      exportedAt: new Date().toISOString()
    };

    const filePath = path.resolve(__dirname, '../logs/', filename);

    try {
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(logData, null, 2));

      this.log('info', `Logs exported to ${filePath}`);
      return filePath;
    } catch (error) {
      this.log('error', 'Failed to export logs', { error: error.message });
      throw error;
    }
  }

  // Perform health check
  async healthCheck() {
    this.healthStatus.lastHealthCheck = new Date().toISOString();
    this.healthStatus.issues = [];
    this.healthStatus.isHealthy = true;

    // Check Firebase connection
    try {
      const db = firebase.firestore();
      await db.collection('health').doc('check').get();
    } catch (error) {
      this.healthStatus.isHealthy = false;
      this.healthStatus.issues.push({
        type: 'firebase',
        status: 'unhealthy',
        error: error.message
      });
      this.log('error', 'Firebase connection failed', { error: error.message });
    }

    // Check PostgreSQL connection
    try {
      const postgres = require('./postgres.js');
      const health = await postgres.healthCheck();
      if (!health.healthy) {
        this.healthStatus.isHealthy = false;
        this.healthStatus.issues.push({
          type: 'postgres',
          status: 'unhealthy',
          error: health.error
        });
        this.log('error', 'PostgreSQL connection failed', { error: health.error });
      }
    } catch (error) {
      this.healthStatus.isHealthy = false;
      this.healthStatus.issues.push({
        type: 'postgres',
        status: 'unhealthy',
        error: error.message
      });
      this.log('error', 'PostgreSQL connection failed', { error: error.message });
    }

    // Check system resources (simplified)
    const memoryUsage = process.memoryUsage();
    const memoryMB = memoryUsage.rss / 1024 / 1024;

    if (memoryMB > 500) { // 500MB threshold
      this.healthStatus.issues.push({
        type: 'memory',
        status: 'warning',
        message: `High memory usage: ${Math.round(memoryMB)}MB`
      });
      this.log('warn', 'High memory usage', { memoryMB: Math.round(memoryMB) });
    }

    this.log('info', 'Health check completed', {
      healthy: this.healthStatus.isHealthy,
      issues: this.healthStatus.issues.length
    });

    return this.healthStatus;
  }
}

export default new SyncMonitor();