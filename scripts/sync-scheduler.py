# Firebase → PostgreSQL Sync Scheduler
# This script starts the sync scheduler and handles process management

import os
import sys
import time
from datetime import datetime
from src.sync.enhanced_sync_scheduler import EnhancedSyncScheduler

def print_status(message):
    print(f"[INFO] {message}")

def print_warning(message):
    print(f"[WARNING] {message}")

def print_error(message):
    print(f"[ERROR] {message}")

def check_firebase_env():
    required_vars = [
        "VITE_FIREBASE_APIKEY",
        "VITE_FIREBASE_PROJECTID",
        "VITE_FIREBASE_AUTHDOMAIN",
        "VITE_FIREBASE_STORAGEBUCKET",
        "VITE_FIREBASE_MESSAGINGSENDERID",
        "VITE_FIREBASE_APPID"
    ]

    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print_error("Firebase environment variables are not set:")
        for var in missing_vars:
            print_error(f"  {var}")
        return False
    return True

def check_postgres_env():
    required_vars = [
        "VITE_POSTGRES_USER",
        "VITE_POSTGRES_DB"
    ]

    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print_warning("PostgreSQL environment variables are not fully set:")
        for var in missing_vars:
            print_warning(f"  {var}")
        print_warning("Using default values. Ensure these are correct for production.")
    return True

def start_sync_scheduler():
    print_status("Starting Firebase → PostgreSQL sync scheduler...")

    # Check environment variables
    if not check_firebase_env():
        sys.exit(1)

    check_postgres_env()

    # Navigate to the project root
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    # Start the sync scheduler
    print_status("Starting sync scheduler...")

    try:
        scheduler = EnhancedSyncScheduler()
        scheduler.start()
    except KeyboardInterrupt:
        print_status("Sync scheduler stopped by user.")
        sys.exit(0)
    except Exception as e:
        print_error(f"Failed to start sync scheduler: {e}")
        sys.exit(1)

def show_sync_status():
    print_status("Checking sync scheduler status...")

    try:
        from src.sync.enhanced_sync_scheduler import EnhancedSyncScheduler
        scheduler = EnhancedSyncScheduler()
        print(scheduler.getSyncStatus())
    except Exception as e:
        print_error(f"Failed to get sync status: {e}")

def trigger_manual_sync(user_id):
    if not user_id:
        print_error("User ID is required for manual sync.")
        print_error("Usage: python sync-scheduler.py manual-sync <user-id>")
        sys.exit(1)

    print_status(f"Triggering manual sync for user: {user_id}")

    try:
        from src.sync.enhanced_sync_scheduler import EnhancedSyncScheduler
        scheduler = EnhancedSyncScheduler()
        result = scheduler.triggerSync(user_id)
        print(f"Manual sync result: {result}")
    except Exception as e:
        print_error(f"Manual sync error: {e}")

def show_help():
    print("Firebase → PostgreSQL Sync Scheduler")
    print()
    print("Usage: python sync-scheduler.py [COMMAND]")
    print()
    print("Commands:")
    print("  start          Start the sync scheduler")
    print("  status         Show sync scheduler status")
    print("  manual-sync    Trigger manual sync for a specific user")
    print("  help           Show this help message")
    print()
    print("Examples:")
    print("  python sync-scheduler.py start")
    print("  python sync-scheduler.py manual-sync user_12345")

if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "start"

    if command == "start":
        start_sync_scheduler()
    elif command == "status":
        show_sync_status()
    elif command == "manual-sync":
        user_id = sys.argv[2] if len(sys.argv) > 2 else None
        trigger_manual_sync(user_id)
    elif command in ("help", "--help", "-h"):
        show_help()
    else:
        print_error(f"Unknown command: {command}")
        show_help()
        sys.exit(1)