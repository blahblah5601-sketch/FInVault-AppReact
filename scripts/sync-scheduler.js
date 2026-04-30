#!/usr/bin/env node

/**
 * Firebase → PostgreSQL Sync Scheduler CLI
 * Node.js version of the sync scheduler command-line interface
 */

import enhancedSyncScheduler from '../src/sync/enhanced-sync-scheduler.js';
import fs from 'fs';
import path from 'path';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function printStatus(message) {
  console.log(`${colors.green}[INFO]${colors.reset} ${message}`);
}

function printWarning(message) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
}

function printError(message) {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

function checkFirebaseEnv() {
  const requiredVars = [
    'VITE_FIREBASE_APIKEY',
    'VITE_FIREBASE_PROJECTID',
    'VITE_FIREBASE_AUTHDOMAIN',
    'VITE_FIREBASE_STORAGEBUCKET',
    'VITE_FIREBASE_MESSAGINGSENDERID',
    'VITE_FIREBASE_APPID'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    printError('Firebase environment variables are not set:');
    missingVars.forEach(varName => printError(`  ${varName}`));
    return false;
  }
  return true;
}

function checkPostgresEnv() {
  const requiredVars = [
    'VITE_POSTGRES_USER',
    'VITE_POSTGRES_DB'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    printWarning('PostgreSQL environment variables are not fully set:');
    missingVars.forEach(varName => printWarning(`  ${varName}`));
    printWarning('Using default values. Ensure these are correct for production.');
  }
  return true;
}

async function startSyncScheduler() {
  printStatus('Starting Firebase → PostgreSQL sync scheduler...');

  // Check environment variables
  if (!checkFirebaseEnv()) {
    process.exit(1);
  }
  checkPostgresEnv();

  // Navigate to the project root
  const scriptDir = __dirname;
  const projectRoot = path.resolve(scriptDir, '../..');
  process.chdir(projectRoot);

  // Start the sync scheduler
  printStatus('Starting sync scheduler...');

  try {
    await enhancedSyncScheduler.start();
  } catch (error) {
    printError(`Failed to start sync scheduler: ${error.message}`);
    process.exit(1);
  }
}

async function showSyncStatus() {
  printStatus('Checking sync scheduler status...');

  try {
    const scheduler = new EnhancedSyncScheduler();
    console.log(scheduler.getSyncStatus());
  } catch (error) {
    printError(`Failed to get sync status: ${error.message}`);
  }
}

async function triggerManualSync(userId) {
  if (!userId) {
    printError('User ID is required for manual sync.');
    printError('Usage: node sync-scheduler.js manual-sync <user-id>');
    process.exit(1);
  }

  printStatus(`Triggering manual sync for user: ${userId}`);

  try {
    const scheduler = new EnhancedSyncScheduler();
    const result = await scheduler.triggerSync(userId);
    console.log('Manual sync result:', result);
  } catch (error) {
    printError(`Manual sync error: ${error.message}`);
  }
}

function showHelp() {
  console.log('Firebase → PostgreSQL Sync Scheduler');
  console.log();
  console.log('Usage: node sync-scheduler.js [COMMAND]');
  console.log();
  console.log('Commands:');
  console.log('  start          Start the sync scheduler');
  console.log('  status         Show sync scheduler status');
  console.log('  manual-sync    Trigger manual sync for a specific user');
  console.log('  help           Show this help message');
  console.log();
  console.log('Examples:');
  console.log('  node sync-scheduler.js start');
  console.log('  node sync-scheduler.js manual-sync user_12345');
}

// Main script logic
const command = process.argv[2] || 'start';

switch (command) {
  case 'start':
    startSyncScheduler();
    break;
  case 'status':
    showSyncStatus();
    break;
  case 'manual-sync':
    const userId = process.argv[3];
    triggerManualSync(userId);
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    printError(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}

// Make the script executable
if (require.main === module) {
  // This is the main module, do nothing special
}