// src/components/DashboardPage.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import HintTooltip from './HintTooltip.jsx';
import { Eye, EyeOff } from 'lucide-react';

// Custom SVG icons for the dashboard
const SendMoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8l4 4-4 4"/>
  </svg>
);

const AddFundsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
  </svg>
);

const QRPaymentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M6 6h.01M18 6h.01M6 12h12M6 18h.01M18 18h.01"/>
  </svg>
);

const NFCPaymentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 16.5 21.75 21.75M9 12a3 3 0 100-6 3 3 0 000 6zm0-3a1 1 0 11-2 0 1 1 0 012 0z"/>
  </svg>
);

const BudgetsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c4.418 0 8 3.582 8 8v1H4v-1c0-4.418 3.582-8 8-8z"/>
  </svg>
);

const VaultsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4v1c0 3.31 2.69 6 6 6v-1c0-2.21-1.79-4-4-4z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v-1"/>
  </svg>
);

const AccountsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 7v9a2 2 0 002 2h10a2 2 0 002-2V7M3 7c0-4.411 4.762-8 10.592-8s10.592 3.589 10.592 8"/>
  </svg>
);

const PaymentsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3v8a3 3 0 003 3z"/>
  </svg>
);

export default function DashboardPage({
  accounts,
  budgets,
  vaults,
  setActivePage,
  activePage,
  onSendMoney,
  onAddFunds,
  onQRPayment,
  onNFCPayment,
  showIconTooltips = true,
  showIBANOnHero = true,
  showBalanceByDefault = true
}) {
  const mainAccount = accounts?.[0];

  // Count active budgets (with spent > 0)
  const activeBudgetsCount = budgets?.filter(b => b.spent > 0).length || 0;

  // Count active vaults (with current > 0)
  const activeVaultsCount = vaults?.filter(v => v.current > 0).length || 0;

  const [balanceVisible, setBalanceVisible] = useState(showBalanceByDefault);

  // Format balance for display
  const formatBalance = (balance) => {
    if (!balanceVisible) {
      return '● ● ● ● ● ●';
    }
    return `Rs ${balance?.toLocaleString('en-US') || '0.00'}`;
  };

  // Format IBAN for display (masked)
  const formatMaskedIBAN = (iban) => {
    if (!iban) return '**** **** **** ****';
    // Remove spaces and take last 4 digits
    const clean = iban.replace(/\s+/g, '');
    const lastFour = clean.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  return (
    /* h-full and overflow-hidden removes the page scroll */
    <section id="dashboard" className="h-full flex flex-col overflow-y-auto max-h-screen p-4">
      {/* Hidden navigation links for accessibility */}
      <div className="hidden">
        <a id="dashboard-link" href="#dashboard" tabIndex="-1"></a>
        <a id="card-control-link" href="#card-control" tabIndex="-1"></a>
        <a id="budgets-link" href="#budgets" tabIndex="-1"></a>
        <a id="vaults-link" href="#vaults" tabIndex="-1"></a>
        <a id="payments-link" href="#payments" tabIndex="-1"></a>
        <a id="accounts-link" href="#accounts" tabIndex="-1"></a>
      </div>

      {/* Main Hero Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex-shrink-0 flex flex-col items-center justify-center py-8 bg-background/30 rounded-3xl border border-white/5 w-full max-w-2xl mx-auto"
      >
        {/* Account Name */}
        <p className="text-base text-text-secondary uppercase tracking-widest">
          {mainAccount ? mainAccount.name : 'Primary Account'}
        </p>

        {/* Balance Section */}
        <div className="mt-6 text-center">
          <p className="text-base text-text-secondary">Total Balance</p>
          <div className="flex items-center justify-center mt-2">
            <p className="text-5xl font-extrabold tracking-tight">
              {formatBalance(mainAccount?.balance || 0)}
            </p>
            <button onClick={() => setBalanceVisible(v => !v)} className="ml-2 text-text-muted hover:text-text-primary">
              {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {showIBANOnHero && (
            <p className="text-xl font-mono tracking-[0.2em] mt-4 opacity-50">
              {mainAccount?.ibanNumber ?
                `PK${mainAccount.ibanNumber.substring(2, 4)} ${formatMaskedIBAN(mainAccount.ibanNumber)}` :
                'PK36 **** **** **** 8021'}
            </p>
          )}
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-8 w-full px-2">
          {/* Send Money */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative w-full min-w-0 flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer aspect-square"
            onClick={onSendMoney}
          >
            <SendMoneyIcon className="mb-2" />
            <span className="text-xs text-text-secondary">Send</span>
            {showIconTooltips && (
              <HintTooltip hint="Send Money — Transfer funds to any account using IBAN or saved beneficiary">
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
              </HintTooltip>
            )}
          </motion.div>

          {/* Add Funds */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative w-full min-w-0 flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer aspect-square"
            onClick={onAddFunds}
          >
            <AddFundsIcon className="mb-2" />
            <span className="text-xs text-text-secondary">Add</span>
            {showIconTooltips && (
              <HintTooltip hint="Add Funds — Add money to your account from card or bank transfer">
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
              </HintTooltip>
            )}
          </motion.div>

          {/* QR Payment */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative w-full min-w-0 flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer aspect-square"
            onClick={onQRPayment}
          >
            <QRPaymentIcon className="mb-2" />
            <span className="text-xs text-text-secondary">QR</span>
            {showIconTooltips && (
              <HintTooltip hint="QR Payment — Scan QR codes to pay or display your QR code to receive payments">
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
              </HintTooltip>
            )}
          </motion.div>

          {/* NFC Payment */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative w-full min-w-0 flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer aspect-square"
            onClick={onNFCPayment}
          >
            <NFCPaymentIcon className="mb-2" />
            <span className="text-xs text-text-secondary">NFC</span>
            {showIconTooltips && (
              <HintTooltip hint="NFC Payment — Tap to pay or receive payments using NFC (requires mobile app)">
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
              </HintTooltip>
            )}
          </motion.div>

          {/* Budgets */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative w-full min-w-0 flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer aspect-square"
            onClick={() => setActivePage('budgets')}
          >
            <BudgetsIcon className="mb-2" />
            <span className="text-xs text-text-secondary">Budgets</span>
            {/* Count badge */}
            {activeBudgetsCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-primary text-white text-xs rounded-full"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {activeBudgetsCount}
              </motion.div>
            )}
            {showIconTooltips && (
              <HintTooltip hint="Budgets — View and manage your spending budgets">
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
              </HintTooltip>
            )}
          </motion.div>

          {/* Vaults */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative w-full min-w-0 flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer aspect-square"
            onClick={() => setActivePage('vaults')}
          >
            <VaultsIcon className="mb-2" />
            <span className="text-xs text-text-secondary">Vaults</span>
            {/* Count badge */}
            {activeVaultsCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-primary text-white text-xs rounded-full"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {activeVaultsCount}
              </motion.div>
            )}
            {showIconTooltips && (
              <HintTooltip hint="Vaults — View and manage your savings vaults">
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
              </HintTooltip>
            )}
          </motion.div>

          {/* Payments */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative w-full min-w-0 flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer aspect-square"
            onClick={() => setActivePage('payments')}
          >
            <PaymentsIcon className="mb-2" />
            <span className="text-xs text-text-secondary">Payments</span>
            {showIconTooltips && (
              <HintTooltip hint="Payments — Send money, pay bills, manage beneficiaries and QR/NFC payments">
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
              </HintTooltip>
            )}
          </motion.div>

          {/* Accounts */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative w-full min-w-0 flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer aspect-square"
            onClick={() => setActivePage('accounts')}
          >
            <AccountsIcon className="mb-2" />
            <span className="text-xs text-text-secondary">Accounts</span>
            {showIconTooltips && (
              <HintTooltip hint="Accounts — View and manage your bank accounts and sub-accounts">
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
              </HintTooltip>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}