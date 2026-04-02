// src/components/MainContent.jsx
import DashboardPage from './DashboardPage';
import CardControlPage from './CardControlPage';
import BudgetsPage from './BudgetsPage';
import VaultsPage from './VaultsPage';
import TransactionsPage from './TransactionsPage';
import SettingsPage from './SettingsPage';
import Dashboard_simple from './Dashboard_simple';
import PaymentsPage from './PaymentsPage';
import AccountsPage from './AccountsPage';

// This component will eventually show the correct page component
function MainContent({ activePage, accounts, budgets, vaults, transactions, showToast, theme, setTheme, history, setActivePage }) {
  
  return (
    <div 
      
      className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
      {/* This is conditional rendering. It checks activePage and shows the right content. */}
      {activePage === 'dashboard' && (
        <DashboardPage accounts={accounts} budgets={budgets} vaults={vaults} setActivePage={setActivePage} activePage={activePage}/>
      )}

      {activePage === 'dashboard_simple' && (
        <Dashboard_simple accounts={accounts} budgets={budgets} vaults={vaults} setActivePage={setActivePage} activePage={activePage}/>
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

      {activePage === 'payments' && (
        <PaymentsPage
          showToast={showToast}
          billers={billers || []}
          beneficiaries={beneficiaries || []}
          history={history}
          onSendMoney={() => {/* open send money panel */}}
          onAddFunds={() => {/* open add funds panel */}}
          onQRPayment={() => {/* open QR panel */}}
          onNFCPayment={() => {/* open NFC panel */}}
        />
      )}

      {activePage === 'settings' && (
        // Pass the theme state and the function to update it
        <SettingsPage
          currentTheme={theme}
          setCurrentTheme={setTheme}
        />
      )}
      {activePage === 'card-control' && <CardControlPage accounts={accounts} budgets={budgets} showToast={showToast} />}
    
    </div>
  );
}

export default MainContent;