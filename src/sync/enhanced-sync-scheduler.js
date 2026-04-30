import firebasePostgresSync from '../sync/firebase-postgres-sync.js';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

// Import the SyncMonitor for comprehensive monitoring
import syncMonitor from './sync-monitor.js';

export class EnhancedSyncScheduler {
  constructor() {
    this.syncProcessor = firebasePostgresSync;
    this.syncInterval = process.env.SYNC_INTERVAL || 300000; // 5 minutes in ms
    this.maxConcurrentSyncs = 1; // Prevent overlapping syncs
    this.isSyncing = false;

    // Initialize monitoring
    this.syncMonitor = syncMonitor;
    this.syncMonitor.log('info', 'EnhancedSyncScheduler initialized');
  }

  // Initialize Firebase
  async initializeFirebase() {
    try {
      // Initialize Firebase app (assuming config is in environment variables)
      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: process.env.VITE_FIREBASE_APIKEY,
          authDomain: process.env.VITE_FIREBASE_AUTHDOMAIN,
          projectId: process.env.VITE_FIREBASE_PROJECTID,
          storageBucket: process.env.VITE_FIREBASE_STORAGEBUCKET,
          messagingSenderId: process.env.VITE_FIREBASE_MESSAGINGSENDERID,
          appId: process.env.VITE_FIREBASE_APPID
        });
      }

      this.syncMonitor.log('info', 'Firebase initialized successfully');
      return true;
    } catch (error) {
      this.syncMonitor.recordError(error, { operation: 'firebase-init' });
      return false;
    }
  }

  // Start the sync scheduler
  async start() {
    this.syncMonitor.log('info', 'Starting Firebase → PostgreSQL sync scheduler...');

    // Initialize Firebase first
    const firebaseInitialized = await this.initializeFirebase();
    if (!firebaseInitialized) {
      this.syncMonitor.log('error', 'Failed to initialize Firebase. Sync scheduler will not start.');
      return;
    }

    // Start the sync loop
    this.syncLoop();

    this.syncMonitor.log('info', `Sync scheduler started. Syncing every ${this.syncInterval / 60000} minutes.`);
  }

  // Main sync loop
  async syncLoop() {
    const syncStartTime = Date.now();

    try {
      // Check if a sync is already in progress
      if (this.isSyncing) {
        this.syncMonitor.log('warn', 'Sync already in progress. Skipping this cycle.');
        return;
      }

      this.isSyncing = true;
      this.syncMonitor.log('info', 'Starting sync cycle');

      try {
        // Get all users with pending sync operations
        const usersWithPendingSync = await this.getUsersWithPendingSync();
        const userCount = usersWithPendingSync.length;

        this.syncMonitor.log('info', `Found ${userCount} users with pending sync operations`, {
          usersToSync: userCount
        });

        let successfulSyncs = 0;
        let failedSyncs = 0;

        // Sync each user
        for (const userId of usersWithPendingSync) {
          this.syncMonitor.log('info', `Starting sync for user: ${userId}`, {
            userId: userId,
            operation: 'user-sync-start'
          });

          const userSyncStartTime = Date.now();

          try {
            const result = await this.syncProcessor.syncAll(userId);

            const duration = Date.now() - userSyncStartTime;

            if (result.success) {
              successfulSyncs++;
              this.syncMonitor.recordSyncOperation(userId, 'full-sync', 'success', duration, result.documentsSynced);
              this.syncMonitor.log('info', `Sync completed successfully for user: ${userId}`, {
                userId: userId,
                operation: 'user-sync-success',
                duration: duration,
                documentsSynced: result.documentsSynced,
                syncCompleted: true
              });
            } else {
              failedSyncs++;
              this.syncMonitor.recordError(result.error, {
                userId: userId,
                operation: 'user-sync-failure'
              });
              this.syncMonitor.log('error', `Sync failed for user: ${userId}`, {
                userId: userId,
                operation: 'user-sync-failure',
                error: result.error.message,
                duration: duration
              });
            }

          } catch (error) {
            failedSyncs++;
            this.syncMonitor.recordError(error, {
              userId: userId,
              operation: 'user-sync-exception'
            });
            this.syncMonitor.log('error', `Sync exception for user: ${userId}`, {
              userId: userId,
              operation: 'user-sync-exception',
              error: error.message
            });
          }

          // Small delay between users to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Log sync cycle summary
        const cycleDuration = Date.now() - syncStartTime;
        this.syncMonitor.log('info', 'Sync cycle completed', {
          operation: 'sync-cycle-complete',
          totalUsers: userCount,
          successfulSyncs: successfulSyncs,
          failedSyncs: failedSyncs,
          cycleDuration: cycleDuration,
          syncCompleted: true
        });

      } catch (error) {
        this.syncMonitor.recordError(error, { operation: 'fatal-sync-loop' });
        this.syncMonitor.log('error', 'Error during sync loop', {
          operation: 'sync-loop-error',
          error: error.message
        });
      } finally {
        this.isSyncing = false;

        // Schedule next sync
        const nextSyncDelay = this.syncInterval - (Date.now() - syncStartTime);
        setTimeout(() => this.syncLoop(), nextSyncDelay > 0 ? nextSyncDelay : 0);
      }

    } catch (error) {
      this.syncMonitor.recordError(error, { operation: 'fatal-sync-loop' });
      this.syncMonitor.log('error', 'Fatal error in sync loop', {
        operation: 'fatal-sync-error',
        error: error.message
      });
      this.isSyncing = false;
      // Retry after a delay
      setTimeout(() => this.syncLoop(), 60000); // Retry after 1 minute
    }
  }

  // Get users with pending sync operations
  async getUsersWithPendingSync() {
    try {
      const db = firebase.firestore();
      const usersRef = db.collection('users');

      // Find users who have documents with pending sync status
      const pendingUsers = new Set();

      // Check budgets collection
      const budgetsQuery = usersRef.select('id').limit(100);
      const budgetsSnapshot = await budgetsQuery.get();

      for (const userDoc of budgetsSnapshot.docs) {
        const userId = userDoc.id;
        const budgetsRef = usersRef.doc(userId).collection('budgets');
        const pendingBudgets = await budgetsRef.where('syncStatus', '==', 'pending').limit(1).get();

        if (!pendingBudgets.empty) {
          pendingUsers.add(userId);
        }
      }

      // Check other collections similarly (simplified for brevity)
      // In production, you might want to check all collections

      return Array.from(pendingUsers);

    } catch (error) {
      this.syncMonitor.log('error', 'Error getting users with pending sync', {
        operation: 'get-pending-users-error',
        error: error.message
      });
      return [];
    }
  }

  // Manual sync trigger (for testing/debugging)
  async triggerSync(userId) {
    this.syncMonitor.log('info', `Manual sync triggered for user: ${userId}`, {
      userId: userId,
      operation: 'manual-sync-trigger'
    });

    const userSyncStartTime = Date.now();

    try {
      const result = await this.syncProcessor.syncAll(userId);
      const duration = Date.now() - userSyncStartTime;

      if (result.success) {
        this.syncMonitor.recordSyncOperation(userId, 'manual-sync', 'success', duration, result.documentsSynced);
        this.syncMonitor.log('info', `Manual sync completed successfully for user: ${userId}`, {
          userId: userId,
          operation: 'manual-sync-success',
          duration: duration,
          documentsSynced: result.documentsSynced,
          syncCompleted: true
        });
      } else {
        this.syncMonitor.recordError(result.error, {
          userId: userId,
          operation: 'manual-sync-failure'
        });
        this.syncMonitor.log('error', `Manual sync failed for user: ${userId}`, {
          userId: userId,
          operation: 'manual-sync-failure',
          error: result.error.message,
          duration: duration
        });
      }

      return result;

    } catch (error) {
      this.syncMonitor.recordError(error, {
        userId: userId,
        operation: 'manual-sync-exception'
      });
      this.syncMonitor.log('error', `Manual sync exception for user: ${userId}`, {
        userId: userId,
        operation: 'manual-sync-exception',
        error: error.message
      });

      return { success: false, error: error };
    }
  }

  // Get sync status with comprehensive monitoring data
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      syncInterval: this.syncInterval,
      lastSync: this.syncMonitor.metrics.lastSyncTime || null,
      syncCount: this.syncMonitor.metrics.totalSyncs,
      successfulSyncs: this.syncMonitor.metrics.successfulSyncs,
      failedSyncs: this.syncMonitor.metrics.failedSyncs,
      totalDocumentsSynced: this.syncMonitor.metrics.totalDocumentsSynced,
      errorCount: this.syncMonitor.metrics.errorCount,
      warnings: this.syncMonitor.metrics.warnings,
      health: this.syncMonitor.healthStatus,
      recentLogs: this.syncMonitor.logs.slice(-10) // Last 10 logs
    };
  }

  // Get detailed metrics
  getDetailedMetrics() {
    return this.syncMonitor.getDetailedMetrics();
  }

  // Export logs
  exportLogs(filename) {
    return this.syncMonitor.exportLogs(filename);
  }

  // Perform health check
  async healthCheck() {
    return this.syncMonitor.healthCheck();
  }
}

export default new EnhancedSyncScheduler();

// If this file is run directly, start the scheduler
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await syncMonitor.start();
  })();
}