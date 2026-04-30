# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Test User Credentials (for development/testing)

When testing the application manually, you can use these credentials:
- Email: test@finvault.app
- Password: TestPassword123!

Note: These are for development/testing only. In production, users should register their own accounts.

## Development Commands

- **Start development server**: `pnpm dev`
- **Build for production**: `pnpm build`
- **Preview production build**: `pnpm preview`
- **Deploy to GitHub Pages**: `pnpm deploy` (runs build then deploys)
- **Lint code**: `pnpm lint`
- **Run tests**: Currently no test runner configured in package.json (only validation.test.js exists)

## Code Architecture & Structure

### Technology Stack
- **Frontend**: React 19 with Vite bundler
- **Styling**: Tailwind CSS
- **State Management**: React Context & useState/useEffect hooks (no external state library)
- **Backend**: Local Firebase (parent) + PostgreSQL (child mirror)
- **Routing**: React Router DOM v7
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: PostgreSQL 15 with UUID primary keys

### Data Model
The app uses Firestore with a users subcollection structure:
```
/users/{userId}/
  ├── budgets/[budgetId]
  ├── vaults/[vaultId]
  ├── accounts/[accountId]
  ├── transactions/[transactionId]
  ├── history/[historyId]
  └── settings (single document)
```

### Key Directories
- `src/components` - Reusable UI components organized by feature:
  - Dashboard components (CardCarousel, DashboardVaultItem, etc.)
  - Page components (BudgetsPage, VaultsPage, TransactionsPage, SettingsPage)
  - Modal components (CreateBudgetModal, VaultActionModal, etc.)
  - Layout components (AppLayout, Sidebar, Header)
- `src/firebase.js` - Firebase initialization and exports
- `src/api.js` - Firestore CRUD operations for budgets, vaults, transactions
- `src/theme.js` - Theme management functions
- `src/utils/` - Utility functions (validation)
- `dataconnect-generated/` - Firebase Data Connect generated client code
- `functions/` - Firebase Functions (Node.js)
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore composite indexes

### Authentication Flow
1. App.jsx uses `onAuthStateChanged` to monitor auth state
2. On login: loads user preferences, sets up real-time listeners for all data collections
3. On logout: clears all data and resets theme
4. AuthComponent.jsx handles login/register UI

### Real-time Data Synchronization
- Uses Firestore `onSnapshot` listeners in App.jsx useEffect
- Collections synced: accounts, budgets, vaults, transactions, history
- Listeners are cleaned up on auth changes to prevent memory leaks

### Theme System
- User preferences stored in Firestore settings document
- Theme applied via `applyTheme()` function from theme.js
- Default theme: 'Slate'
- Theme changes persist across sessions via Firestore

### Common Development Patterns
1. **Component Structure**: Most components are functional components using hooks
2. **Styling**: Tailwind utility-first CSS with custom colors in theme.js
3. **Firebase Operations**: All Firestore operations go through api.js functions
4. **Error Handling**: API functions return boolean success/failure or objects with {success, message}
5. **Toast Notifications**: Centralized showToast function in App.jsx passed down as prop
6. **Modal Pattern**: Modals are state-controlled components that receive data via props

### Environment Setup
- Requires Firebase project with:
  - Authentication (Email/Password enabled)
  - Firestore Database
  - Firebase Functions (for dataconnect)
- Environment variables in .env.local (not committed)
- Firebase configuration in src/firebase.js

## Docker Development Environment
- **Docker Setup**: The project includes Docker support for PostgreSQL database
- **Database Schema**: Uses UUID-based schema with proper foreign key relationships
- **Sample Data**: Pre-populated with test user (test@finvault.app) and sample accounts/vaults
- **Scripts**: `database/init.sql` contains comprehensive schema and sample data for all tables
- **Quick Start**: `docker-compose up -d` starts PostgreSQL with health checks and volume persistence
- **Environment**: Use `.env.docker` for Docker-specific configuration
- **Database Container**: Running PostgreSQL 15 Alpine with user `finvault` and database `finvault`
- **Sample Data Includes**: Test user with checking ($5000) and savings ($15000) accounts, sample vaults, budgets, beneficiaries, billers, cards, and transaction history

## Database Architecture

### Parent-Child Sync System
- **Parent (Master)**: Local Firebase - all writes go here
- **Child (Mirror)**: PostgreSQL - read-only mirror with data inheritance
- **Sync Direction**: Local Firebase → PostgreSQL (unidirectional)
- **Data Residency**: All sensitive data stays in PostgreSQL
- **Compliance**: PostgreSQL handles regulatory requirements

### PostgreSQL Structure (Read-Only Mirror)
- **Primary Keys**: UUID (uuid_generate_v4()) not SERIAL
- **Tables**: users, accounts, transactions, vaults, budgets, settings, history, cards, beneficiaries, billers
- **Foreign Keys**: All reference UUIDs from users(id)
- **Sample Data**: Test user: test@finvault.app, Accounts: checking ($5000), savings ($15000)
- **Indexes**: Optimized for performance on frequently queried columns
- **Docker Setup**: PostgreSQL container with user `finvault` and database `finvault`
- **Sample Data Includes**: Test user with checking ($5000) and savings ($15000) accounts, sample vaults, budgets, beneficiaries, billers, cards, and transaction history

## SQL Scripts
- `database/init.sql`: Comprehensive schema and sample data for all tables
- **Important**: Scripts expect existing test user and accounts/vaults
- **Docker Integration**: `database/init.sql` is automatically executed by PostgreSQL container on first run

## Error Handling Guidelines
- **When a command returns an error, read the error into account for the next step, instead of repeating the command again and again.**
- Always analyze error messages before retrying operations
- Check for common issues like missing dependencies, incorrect paths, or permission problems
- Use error context to adjust approach rather than blindly retrying
- When troubleshooting, read relevant files and logs to understand the root cause

## Documentation
- **Iteration Log**: `docs/iteration-log.md` - Detailed changelog and development history tracking all changes, bug fixes, and improvements
- **Main README**: `docs/README.md` - Project overview and getting started guide
- **Development Plan**: `docs/PLAN.md` - Initial project planning and architecture decisions
- **Development Status**: `docs/FINISHED.md` - Current state and completion status of features
- **Task List**: `docs/tasklist.md` - Comprehensive list of development tasks and progress
- **Context File**: `docs/context.md` - Project context and background information
- **Configuration**: `docs/CLAUDE.md` - This file - Claude Code guidance and instructions

## Firebase Data Connect
This project uses Firebase Data Connect (PostgreSQL via Firebase):
- Schema defined in dataconnect/ directory
- Generated client code in src/dataconnect-generated/
- Currently appears to be in transition/experimental use alongside direct Firestore access
