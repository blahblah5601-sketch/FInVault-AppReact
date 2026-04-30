# Firebase → PostgreSQL Sync Scheduler

This directory contains the infrastructure for scheduling and managing the Firebase → PostgreSQL batch sync system.

## Files

### Core Scheduler
- `src/sync/sync-scheduler.js` - Main scheduler class with configuration and process management
- `src/sync/firebase-postgres-sync.js` - Batch sync processor (created in Task #3)

### Command-Line Interfaces
- `scripts/sync-scheduler.sh` - Bash script for Unix/Linux systems
- `scripts/sync-scheduler.py` - Python script for cross-platform compatibility  
- `scripts/sync-scheduler.js` - Node.js script for direct execution

### Configuration
- `package-sync.json` - Package configuration for sync scheduler dependencies

## Usage

### Starting the Scheduler
```bash
# Using the Node.js script (recommended)
node scripts/sync-scheduler.js start

# Using the Bash script (Unix/Linux)
./scripts/sync-scheduler.sh start

# Using the Python script (cross-platform)
python scripts/sync-scheduler.py start

# Using npm script
npm run start --prefix .
```

### Manual Sync
```bash
# Sync a specific user
node scripts/sync-scheduler.js manual-sync user_12345

# Check scheduler status
node scripts/sync-scheduler.js status
```

### Environment Variables

The scheduler requires the following environment variables:

**Firebase Configuration:**
- `VITE_FIREBASE_APIKEY` - Firebase API key
- `VITE_FIREBASE_PROJECTID` - Firebase project ID
- `VITE_FIREBASE_AUTHDOMAIN` - Firebase auth domain
- `VITE_FIREBASE_STORAGEBUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGINGSENDERID` - Firebase messaging sender ID
- `VITE_FIREBASE_APPID` - Firebase app ID

**PostgreSQL Configuration:**
- `VITE_POSTGRES_USER` - PostgreSQL username (default: finvault)
- `VITE_POSTGRES_DB` - PostgreSQL database name (default: finvault)
- `VITE_POSTGRES_HOST` - PostgreSQL host (default: localhost)
- `VITE_POSTGRES_PASSWORD` - PostgreSQL password (default: finvault)
- `VITE_POSTGRES_PORT` - PostgreSQL port (default: 5432)

## Configuration

The scheduler can be configured through environment variables:

- `SYNC_INTERVAL` - Sync interval in milliseconds (default: 300000 = 5 minutes)
- `MAX_CONCURRENT_SYNCS` - Maximum concurrent sync operations (default: 1)

## Integration with Docker

The scheduler can be integrated into the Docker setup by adding a new service to `docker-compose.yml`:

```yaml
sync-scheduler:
  image: node:20-alpine
  container_name: finvault-sync-scheduler
  working_dir: /app
  volumes:
    - .:/app
  environment:
    - NODE_ENV=production
    - SYNC_INTERVAL=300000
    - MAX_CONCURRENT_SYNCS=1
  depends_on:
    postgres:
      condition: service_healthy
  command: npm run start --prefix ./scripts
  networks:
    - finvault-network
```

## Monitoring

The scheduler provides basic monitoring through the status command and logs sync operations to the console. For production monitoring, consider:

- Adding logging to external services (Winston, Loggly, etc.)
- Implementing health checks
- Adding metrics collection (Prometheus, etc.)
- Setting up alerting for sync failures

## Error Handling

The scheduler includes robust error handling:
- Automatic retry on failures
- Graceful handling of concurrent sync attempts
- Error logging and status updates
- Manual sync trigger for debugging

## Testing

To test the scheduler:

1. Ensure Firebase and PostgreSQL are configured
2. Start the scheduler: `node scripts/sync-scheduler.js start`
3. Monitor the logs for sync operations
4. Use manual sync for testing specific users

## Production Deployment

For production deployment:

1. Configure environment variables securely
2. Set up proper logging and monitoring
3. Configure the Docker service for auto-restart
4. Set up health checks and alerting
5. Consider using a process manager (PM2, etc.) for Node.js processes