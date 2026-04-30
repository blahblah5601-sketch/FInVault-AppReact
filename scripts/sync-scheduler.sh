#!/bin/bash

# Firebase → PostgreSQL Sync Scheduler
# This script starts the sync scheduler and handles process management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Firebase environment variables are set
check_firebase_env() {
    if [[ -z "${VITE_FIREBASE_APIKEY}" || -z "${VITE_FIREBASE_PROJECTID}" ]]; then
        print_error "Firebase environment variables are not set."
        print_error "Please set the following environment variables:"
        print_error "  VITE_FIREBASE_APIKEY"
        print_error "  VITE_FIREBASE_PROJECTID"
        print_error "  VITE_FIREBASE_AUTHDOMAIN"
        print_error "  VITE_FIREBASE_STORAGEBUCKET"
        print_error "  VITE_FIREBASE_MESSAGINGSENDERID"
        print_error "  VITE_FIREBASE_APPID"
        return 1
    fi
    return 0
}

# Function to check if PostgreSQL environment variables are set
check_postgres_env() {
    if [[ -z "${VITE_POSTGRES_USER}" || -z "${VITE_POSTGRES_DB}" ]]; then
        print_warning "PostgreSQL environment variables are not fully set."
        print_warning "Using default values. Ensure these are correct for production."
        return 0
    fi
    return 0
}

# Function to start the sync scheduler
start_sync_scheduler() {
    print_status "Starting Firebase → PostgreSQL sync scheduler..."

    # Check environment variables
    check_firebase_env || return 1
    check_postgres_env || return 1

    # Navigate to the project root
    cd "$SCRIPT_DIR/.."

    # Start the sync scheduler
    print_status "Starting sync scheduler with Node.js..."

    # Use Node.js to start the sync scheduler
    node -e "
      const SyncScheduler = require('./src/sync/sync-scheduler');
      const scheduler = new SyncScheduler();
      scheduler.start();
    "
}

# Function to show sync status
show_sync_status() {
    print_status "Checking sync scheduler status..."

    # In a real implementation, you might want to check if the process is running
    # For now, we'll just show the status from the scheduler class
    node -e "
      const SyncScheduler = require('./src/sync/sync-scheduler');
      const scheduler = new SyncScheduler();
      console.log(scheduler.getSyncStatus());
    "
}

# Function to stop the sync scheduler
stop_sync_scheduler() {
    print_warning "Sync scheduler stop functionality not implemented in this script."
    print_warning "The scheduler runs as a background process and will continue until manually stopped."
    print_warning "To stop, you may need to kill the Node.js process."
}

# Function to trigger manual sync
trigger_manual_sync() {
    local userId=$1

    if [[ -z "$userId" ]]; then
        print_error "User ID is required for manual sync."
        print_error "Usage: $0 manual-sync <user-id>"
        return 1
    fi

    print_status "Triggering manual sync for user: $userId"

    cd "$SCRIPT_DIR/.."

    node -e "
      const SyncScheduler = require('./src/sync/sync-scheduler');
      const scheduler = new SyncScheduler();
      scheduler.triggerSync('$userId').then(result >> {
        console.log('Manual sync result:', result);
      }).catch(error >> {
        console.error('Manual sync error:', error);
      });
    "
}

# Function to show help
show_help() {
    echo "Firebase → PostgreSQL Sync Scheduler"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start          Start the sync scheduler"
    echo "  status         Show sync scheduler status"
    echo "  stop           Stop the sync scheduler (not implemented)"
    echo "  manual-sync    Trigger manual sync for a specific user"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 manual-sync user_12345"
}

# Main script logic
case "${1:-start}" in
    start)
        start_sync_scheduler
        ;;
    status)
        show_sync_status
        ;;
    stop)
        stop_sync_scheduler
        ;;
    manual-sync)
        trigger_manual_sync "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac