// src/components/MainContent.jsx
import DashboardPage from './DashboardPage';
import CardControlPage from './CardControlPage';
import BudgetsPage from './BudgetsPage';
import VaultsPage from './VaultsPage';
import TransactionsPage from './TransactionsPage';
import SettingsPage from './SettingsPage'; 
// This component will eventually show the correct page component
function MainContent({ activePage, accounts, budgets, vaults, transactions, showToast }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
      {/* This is conditional rendering. It checks activePage and shows the right content. */}
      {activePage === 'dashboard' && (
        <DashboardPage accounts={accounts} budgets={budgets} vaults={vaults} />
      )}

      {activePage === 'budgets' && (
        <BudgetsPage budgets={budgets} showToast={showToast}/>
      )}
      
      {activePage === 'vaults' && (
        <VaultsPage vaults={vaults} accounts={accounts} showToast={showToast}/>
      )}

      {activePage === 'transactions' && (
        <TransactionsPage transactions={transactions} />
      )}
    
      {activePage === 'settings' && <SettingsPage />}
      
      {/* You can add placeholders for any remaining pages like Card Control */}
      {activePage === 'card-control' && <div></div>}

      {activePage === 'card-control' && <CardControlPage accounts={accounts} budgets={budgets} showToast={showToast}/>}
    </div>
  );
}

export default MainContent;