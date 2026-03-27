# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **Backend**: Firebase Authentication & Firestore Database
- **Routing**: React Router DOM v7
- **Animations**: Framer Motion
- **Icons**: Lucide React

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

## Firebase Data Connect
This project uses Firebase Data Connect (PostgreSQL via Firebase):
- Schema defined in dataconnect/ directory
- Generated client code in src/dataconnect-generated/
- Currently appears to be in transition/experimental use alongside direct Firestore access
