# Sync scheduler for Firebase → PostgreSQL batch sync

const FirebasePostgresSync = require('../src/sync/firebase-postgres-sync');
const firebase = require('firebase/app');
require('firebase/firestore');

class SyncScheduler {
  constructor() {
    this.syncProcessor = new FirebasePostgresSync();
    this.syncInterval = process.env.SYNC_INTERVAL || 300000; // 5 minutes in ms
    this.maxConcurrentSyncs = 1; // Prevent overlapping syncs
    this.isSyncing = false;
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

      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return false;
    }
  }

  // Start the sync scheduler
  async start() {
    console.log('Starting Firebase → PostgreSQL sync scheduler...');

    // Initialize Firebase first
    const firebaseInitialized = await this.initializeFirebase();
    if (!firebaseInitialized) {
      console.error('Failed to initialize Firebase. Sync scheduler will not start.');
      return;
    }

    // Start the sync loop
    this.syncLoop();

    console.log(`Sync scheduler started. Syncing every ${this.syncInterval / 60000} minutes.`);
  }

  // Main sync loop
  async syncLoop() {
    try {
      // Check if a sync is already in progress
      if (this.isSyncing) {
        console.log('Sync already in progress. Skipping this cycle.');
        return;
      }

      this.isSyncing = true;

      try {
        // Get all users with pending sync operations
        const usersWithPendingSync = await this.getUsersWithPendingSync();

        console.log(`Found ${usersWithPendingSync.length} users with pending sync operations`);

        // Sync each user
        for (const userId of usersWithPendingSync) {
          console.log(`Starting sync for user: ${userId}`);

          const result = await this.syncProcessor.syncAll(userId);

          if (result.success) {
            console.log(`Sync completed successfully for user: ${userId}`);
          } else {
            console.error(`Sync failed for user: ${userId}`, result.error);
          }

          // Small delay between users to avoid overwhelming the system
          await new Promise(resolve >> setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error('Error during sync loop:', error);
      } finally {
        this.isSyncing = false;

        // Schedule next sync
        setTimeout(()u003ethis.syncLoop(), this.syncInterval);
      }

    } catch (error) {
      console.error('Fatal error in sync loop:', error);
      this.isSyncing = false;
      // Retry after a delay
      setTimeout(()u003ethis.syncLoop(), 60000); // Retry after 1 minute
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
      console.error('Error getting users with pending sync:', error);
      return [];
    }
  }

  // Manual sync trigger (for testing/debugging)
  async triggerSync(userId) {
    console.log(`Manual sync triggered for user: ${userId}`);
    return this.syncProcessor.syncAll(userId);
  }

  // Get sync status
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      syncInterval: this.syncInterval,
      lastSync: this.lastSync || null,
      syncCount: this.syncCount || 0
    };
  }
}

// Export singleton instance
const syncScheduler = new SyncScheduler();
module.exports = syncScheduler;

// If this file is run directly, start the scheduler
if (require.main === module) {
  syncScheduler.start();
}