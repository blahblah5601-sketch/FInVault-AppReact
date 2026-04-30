import * as firebase from 'firebase/app';
import 'firebase/firestore';
import postgres from './postgres.js';
import { v4 as uuidv4 } from 'uuid';

class FirebasePostgresSync {
  constructor() {
    this.postgres = postgres;
    this.batchSize = 100; // Sync 100 documents per batch
    this.maxRetries = 3; // Max retry attempts
  }

  // Sync all documents for a user
  async syncAll(userId) {
    try {
      // Get all collections for the user
      const collections = [
        'budgets',
        'vaults',
        'accounts',
        'transactions',
        'history',
        'settings'
      ];

      let totalDocumentsSynced = 0;

      for (const collection of collections) {
        const documentsSynced = await this.syncCollection(userId, collection);
        totalDocumentsSynced += documentsSynced;
      }

      return {
        success: true,
        documentsSynced: totalDocumentsSynced
      };

    } catch (error) {
      console.error('Error syncing user ', userId, error);
      return {
        success: false,
        error: error
      };
    }
  }

  // Sync a specific collection for a user
  async syncCollection(userId, collection) {
    try {
      const db = firebase.firestore();
      const collectionRef = db.collection('users').doc(userId).collection(collection);

      // Get documents with pending sync status
      const query = collectionRef.where('syncStatus', '==', 'pending').limit(this.batchSize);
      const snapshot = await query.get();

      if (snapshot.empty) {
        return 0; // No documents to sync
      }

      const documents = [];

      // Prepare documents for PostgreSQL
      snapshot.forEach(doc => {
        const data = doc.data();
        data.id = doc.id;
        data.collection = collection;
        data.userId = userId;

        documents.push(data);
      });

      // Batch insert into PostgreSQL
      const result = await this.postgres.batchInsert(documents);

      if (result.success) {
        // Update sync status in Firestore
        const batch = db.batch();

        snapshot.forEach(doc => {
          batch.update(doc.ref, { syncStatus: 'synced' });
        });

        await batch.commit();

        return documents.length;
      } else {
        console.error('PostgreSQL batch insert failed:', result.error);
        return 0;
      }

    } catch (error) {
      console.error('Error syncing collection ', collection, error);
      return 0;
    }
  }

  // Sync a single document
  async syncDocument(userId, collection, documentId) {
    try {
      const db = firebase.firestore();
      const docRef = db.collection('users').doc(userId).collection(collection).doc(documentId);

      const doc = await docRef.get();

      if (!doc.exists) {
        return {
          success: false,
          error: new Error('Document does not exist')
        };
      }

      const data = doc.data();
      data.id = doc.id;
      data.collection = collection;
      data.userId = userId;

      // Insert into PostgreSQL
      const result = await this.postgres.insert(data);

      if (result.success) {
        // Update sync status in Firestore
        await docRef.update({ syncStatus: 'synced' });

        return {
          success: true,
          document: data
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }

    } catch (error) {
      console.error('Error syncing document ', documentId, error);
      return {
        success: false,
        error: error
      };
    }
  }

  // Sync a single document by path
  async syncByPath(userId, collectionPath, documentId) {
    try {
      const db = firebase.firestore();
      const docRef = db.doc(`${collectionPath}/${documentId}`);

      const doc = await docRef.get();

      if (!doc.exists) {
        return {
          success: false,
          error: new Error('Document does not exist')
        };
      }

      const data = doc.data();
      data.id = doc.id;
      data.collection = collectionPath.split('/')[1];
      data.userId = userId;

      // Insert into PostgreSQL
      const result = await this.postgres.insert(data);

      if (result.success) {
        // Update sync status in Firestore
        await docRef.update({ syncStatus: 'synced' });

        return {
          success: true,
          document: data
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }

    } catch (error) {
      console.error('Error syncing document by path ', documentId, error);
      return {
        success: false,
        error: error
      };
    }
  }

  // Retry sync for failed documents
  async retrySync(userId, collection, documentId) {
    try {
      const db = firebase.firestore();
      const docRef = db.collection('users').doc(userId).collection(collection).doc(documentId);

      const doc = await docRef.get();

      if (!doc.exists) {
        return {
          success: false,
          error: new Error('Document does not exist')
        };
      }

      const data = doc.data();
      data.id = doc.id;
      data.collection = collection;
      data.userId = userId;

      // Insert into PostgreSQL
      const result = await this.postgres.insert(data);

      if (result.success) {
        // Update sync status in Firestore
        await docRef.update({ syncStatus: 'synced' });

        return {
          success: true,
          document: data
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }

    } catch (error) {
      console.error('Error retrying sync for document ', documentId, error);
      return {
        success: false,
        error: error
      };
    }
  }
}

export default new FirebasePostgresSync();