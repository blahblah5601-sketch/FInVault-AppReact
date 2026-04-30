# Docker Setup for FinVault Banking Application

This document explains how to set up and run the FinVault banking application using Docker containers.

## Overview

Docker provides an isolated environment for running the FinVault application with:
- PostgreSQL database for data persistence
- Node.js development server for React frontend
- Nginx web server for production deployment

## Prerequisites

- Docker Desktop (Windows, macOS, or Linux)
- Docker Compose (included with Docker Desktop)
- Git (for cloning the repository)

## Quick Start

### 1. Copy Environment Variables
```bash
# Copy your existing environment variables to Docker config
cp .env.local .env.docker
```

### 2. Start All Services
```bash
docker-compose up -d
```

### 3. Verify Services Are Running
```bash
docker-compose ps
docker-compose logs -f
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Nginx (if enabled)**: http://localhost:8080
- **PostgreSQL**: localhost:5432

## Database Setup Process

When you run `docker-compose up` for the first time:

### Step 1: PostgreSQL Container Starts
- Uses PostgreSQL 15 Alpine image
- Creates database `finvault` with user `finvault`
- Sets up password from environment variables

### Step 2: Database Initialization
- Runs `database/init.sql` automatically
- Creates all required tables:
  - `users` - User accounts and authentication
  - `accounts` - Bank accounts (checking, savings)
  - `transactions` - Transaction history
  - `vaults` - Savings goals
  - `budgets` - Monthly budget tracking
  - `beneficiaries` - Payment beneficiaries
  - `billers` - Bill payment recipients
  - `cards` - Payment cards
  - `history` - User activity history
  - `settings` - User preferences

### Step 3: Sample Data Insertion
- Creates test user: `test@finvault.app`
- Adds sample accounts with balances (checking: $5000, savings: $15000)
- Inserts sample vaults and budgets
- Sets up indexes for performance
- Pre-populates beneficiaries, billers, and cards tables
- Creates user activity history entries

## Development Workflow

### Starting Development
```bash
docker-compose up -d
# Frontend: http://localhost:3000
# Database: localhost:5432
```

### Stopping Services
```bash
docker-compose down
```

### Rebuilding Containers
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Database Management
```bash
# Access PostgreSQL directly
docker-compose exec postgres psql -U finvault -d finvault

# View database logs
docker-compose logs postgres

# Backup database
docker-compose exec postgres pg_dump -U finvault finvault > backup.sql

# Check database connection
docker-compose exec postgres pg_isready
```

## Environment Configuration

The `.env.docker` file contains all environment variables needed for Docker:

### Required Variables
- `VITE_FIREBASE_*` - Firebase configuration
- `VITE_POSTGRES_*` - Database connection settings
- `VITE_RAAST_*` - Payment gateway credentials
- `VITE_PAYPAK_*` - Payment gateway credentials

### Optional Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Application port (default: 3000)
- `LOG_LEVEL` - Logging level (info/warn/error)

## Production Deployment

### Using Nginx
Nginx is configured for production serving:
- Serves static assets with caching
- Handles API routing to React dev server
- Provides security headers and rate limiting
- Health check endpoint at `/health`

### Production Commands
```bash
# Build for production
docker-compose build

# Start in production mode
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

### Common Issues

#### Port Conflicts
If port 3000 is already in use:
```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is healthy
docker-compose exec postgres pg_isready

# Restart database service
docker-compose restart postgres

# Verify database files exist
docker-compose exec postgres ls -la /var/lib/postgresql/data/
```

#### Build Failures
```bash
# Clean up old containers
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
```

#### Environment Variables Not Loading
```bash
# Verify .env.docker exists and has correct permissions
ls -la .env.docker

# Check for syntax errors
cat .env.docker | grep -v "^#"
```

### Logs and Monitoring
```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f postgres

# Check container resource usage
docker stats
```

## Security Considerations

### Database Security
- Database runs isolated in Docker network
- Password stored in environment variables
- Regular database backups configured

### Application Security
- Environment variables not exposed in containers
- Nginx provides security headers
- Rate limiting on API endpoints

### Network Security
- Services communicate via internal Docker network
- Ports only exposed as needed
- Health checks prevent serving unhealthy services

## Maintenance

### Regular Tasks
```bash
# Update Docker images
docker-compose pull

# Clean up unused resources
docker system prune -f

# Backup database weekly
docker-compose exec postgres pg_dump -U finvault_user finvault > weekly_backup.sql
```

### Performance Monitoring
- Monitor container resource usage
- Check database connection pool
- Review application logs regularly

## Support

For additional help:
1. Check Docker and application logs
2. Verify environment variables are set correctly
3. Ensure Docker Desktop is running properly
4. Check port availability on your system

## Contributing

When making changes:
1. Update `docker-compose.yml` if new services are added
2. Modify `scripts/init-db.sql` for database schema changes
3. Update `.env.docker` for new environment variables
4. Test with `docker-compose build` before committing

---

**Last Updated**: 2026-04-15  
**Version**: 1.1  
**Author**: Docker Configuration Team