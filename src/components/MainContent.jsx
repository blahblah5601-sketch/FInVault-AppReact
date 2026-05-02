// src/components/MainContent.jsx
import { useEffect } from 'react';
import DashboardPage from './DashboardPage';
import CardControlPage from './CardControlPage';
import BudgetsPage from './BudgetsPage';
import VaultsPage from './VaultsPage';
import TransactionsPage from './TransactionsPage';
import SettingsPage from './SettingsPage';
import Dashboard_simple from './Dashboard_simple';
import PaymentsPage from './PaymentsPage';
import AccountsPage from './AccountsPage';
import PageLoading from './PageLoading';

// This component will eventually show the correct page component
function MainContent({
  activePage,
  accounts,
  budgets,
  vaults,
  transactions,
  history,
  billers,
  beneficiaries,
  showToast,
  theme,
  setTheme,
  setActivePage,
  preferences,
  onOpenSendMoney,
  onOpenAddFunds,
  onOpenQRPayment,
  onOpenNFCPayment,
  isDataLoading
}) {
  const compactMode = preferences?.compactMode ?? false;

  // Show loading skeletons while initial data is loading
  if (isDataLoading && activePage !== 'settings') {
    return <PageLoading page={activePage} />;
  }

  return (
    <div
      className={`flex-1 overflow-y-auto ${compactMode ? 'p-2 md:p-4' : 'p-4 md:p-8'} space-y-${compactMode ? '4' : '8'}`}>
      {/* This is conditional rendering. It checks activePage and shows the right content. */}
      {activePage === 'dashboard' && (
        <DashboardPage
          accounts={accounts}
          budgets={budgets}
          vaults={vaults}
          transactions={transactions}
          setActivePage={setActivePage}
          activePage={activePage}
          preferences={preferences}
          onSendMoney={onOpenSendMoney}
          onAddFunds={onOpenAddFunds}
          onQRPayment={onOpenQRPayment}
          onNFCPayment={onOpenNFCPayment}
        />
      )}

      {activePage === 'dashboard_simple' && (
        <Dashboard_simple accounts={accounts} budgets={budgets} vaults={vaults} setActivePage={setActivePage} activePage={activePage}/>
      )}

      {activePage === 'budgets' && (
        <BudgetsPage budgets={budgets} showToast={showToast} preferences={preferences}/>
      )}

      {activePage === 'vaults' && (
        <VaultsPage vaults={vaults} accounts={accounts} showToast={showToast} preferences={preferences}/>
      )}

      {activePage === 'transactions' && (
        <TransactionsPage transactions={transactions} isLoading={isDataLoading} />
      )}

      {activePage === 'accounts' && (
        <AccountsPage accounts={accounts} showToast={showToast} />
      )}

      {activePage === 'payments' && (
        <PaymentsPage
          showToast={showToast}
          billers={billers || []}
          beneficiaries={beneficiaries || []}
          history={history}
          onSendMoney={onOpenSendMoney}
          onAddFunds={onOpenAddFunds}
          onQRPayment={onOpenQRPayment}
          onNFCPayment={onOpenNFCPayment}
        />
      )}

      {activePage === 'settings' && (
        // Pass the theme state and the function to update it
        <SettingsPage
          currentTheme={theme}
          setCurrentTheme={setTheme}
          preferences={preferences}
        />
      )}
      {activePage === 'card-control' && <CardControlPage accounts={accounts} budgets={budgets} showToast={showToast} />}

      {/* QR/NFC pay pages trigger their panels and redirect to dashboard */}
      {activePage === 'qr-pay' && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <QRPayRedirect onOpen={onOpenQRPayment} setActivePage={setActivePage} />
        </div>
      )}
      {activePage === 'nfc-pay' && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <NFCPayRedirect onOpen={onOpenNFCPayment} setActivePage={setActivePage} />
        </div>
      )}

    </div>
  );
}

function QRPayRedirect({ onOpen, setActivePage }) {
  useEffect(() => {
    onOpen();
    const timer = setTimeout(() => setActivePage('dashboard'), 300);
    return () => clearTimeout(timer);
  }, [onOpen, setActivePage]);

  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-[var(--color-gold)] rounded-full animate-spin"></div>
    </div>
  );
}

function NFCPayRedirect({ onOpen, setActivePage }) {
  useEffect(() => {
    onOpen();
    const timer = setTimeout(() => setActivePage('dashboard'), 300);
    return () => clearTimeout(timer);
  }, [onOpen, setActivePage]);

  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-[var(--color-gold)] rounded-full animate-spin"></div>
    </div>
  );
}

export default MainContent;