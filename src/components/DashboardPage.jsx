// src/components/DashboardPage.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import HintTooltip from './HintTooltip.jsx';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, ShoppingBag, Utensils, Car, Home, Zap, CreditCard, CircleDollarSign, User } from 'lucide-react';

// Reference-style SVG icons for quick actions
const SendIcon = () => (
  <svg viewBox="0 0 17 17" fill="none" width="17" height="17">
    <path d="M2 8.5H15M15 8.5L10.5 4M15 8.5L10.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddFundsIcon = () => (
  <svg viewBox="0 0 17 17" fill="none" width="17" height="17">
    <circle cx="8.5" cy="8.5" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8.5 5.5v6M5.5 8.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PayBillIcon = () => (
  <svg viewBox="0 0 17 17" fill="none" width="17" height="17">
    <rect x="1.5" y="4" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1.5 7h14" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="4" y="9.5" width="3" height="1.5" rx=".5" fill="currentColor"/>
  </svg>
);

const QRIcon = () => (
  <svg viewBox="0 0 17 17" fill="none" width="17" height="17">
    <rect x="2" y="2" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="9.5" y="2" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="2" y="9.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M9.5 9.5h1.5M9.5 13h5M13 9.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const NFCIcon = () => (
  <svg viewBox="0 0 17 17" fill="none" width="17" height="17">
    <path d="M4.5 8.5c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M2 8.5c0-3.59 2.91-6.5 6.5-6.5S15 4.91 15 8.5 12.09 15 8.5 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const SavingsIcon = () => (
  <svg viewBox="0 0 17 17" fill="none" width="17" height="17">
    <path d="M5.5 8.5a3 3 0 116 0 3 3 0 01-6 0z" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2 8.5C2 4.91 4.91 2 8.5 2S15 4.91 15 8.5 12.09 15 8.5 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

// Map transaction category to an icon
const txIconMap = {
  'food': Utensils,
  'transport': Car,
  'travel': Car,
  'shopping': ShoppingBag,
  'bills': Home,
  'utilities': Zap,
  'transfer': ArrowUpRight,
  'income': ArrowDownLeft,
  'deposit': ArrowDownLeft,
  'subscription': CreditCard,
  'default': CircleDollarSign,
};

const getTransactionIcon = (tx) => {
  const amount = tx.amount || 0;
  if (amount >= 0 && (tx.desc?.toLowerCase().includes('deposit') || tx.desc?.toLowerCase().includes('add fund') || tx.desc?.toLowerCase().includes('income'))) {
    return ArrowDownLeft;
  }
  const cat = (tx.cat || tx.category || '').toLowerCase();
  for (const [key, icon] of Object.entries(txIconMap)) {
    if (cat.includes(key)) return icon;
  }
  const desc = (tx.desc || tx.description || '').toLowerCase();
  for (const [key, icon] of Object.entries(txIconMap)) {
    if (desc.includes(key)) return icon;
  }
  return CircleDollarSign;
};

const getIconBgColor = (tx) => {
  const amount = tx.amount || 0;
  if (amount >= 0) return '#e1f5f2';
  return '#fde8e8';
};

const getIconColor = (tx) => {
  const amount = tx.amount || 0;
  if (amount >= 0) return '#0e7c6e';
  return '#d63b3b';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // fallback: treat "X days ago" literally or show N/A
    return dateStr;
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Teal income arrow
const IncomeArrow = () => (
  <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
    <path d="M9 3v12M3 9h12" stroke="#0e7c6e" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

// Blue spend arrow
const SpendArrow = () => (
  <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
    <path d="M15 9H3M3 9l4-4M3 9l4 4" stroke="#2056d4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Transfer arrow icon
const TransferIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
    <path d="M9 4l5 5M9 4l-5 5M9 14l5-5M9 14l-5-5" stroke="#ff9f0a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DashboardPage({
  accounts,
  budgets,
  vaults,
  transactions,
  setActivePage,
  activePage,
  onSendMoney,
  onAddFunds,
  onQRPayment,
  onNFCPayment,
  onTransferBetweenAccounts,
  preferences
}) {
  const prefs = preferences || {
    showIconTooltips: true,
    showIBANOnHero: true,
    showBalanceByDefault: true,
    showMonthlyIncome: true,
    showMonthlySpend: true,
  };
  const showIBANOnHero = prefs.showIBANOnHero;
  const showBalanceByDefault = prefs.showBalanceByDefault;
  // Find the main account (accountLevel: 'main') or fallback to first account
  const mainAccount = accounts?.find(acc => acc.accountLevel === 'main') || accounts?.[0];

  const activeBudgetsCount = budgets?.filter(b => b.spent > 0).length || 0;
  const activeVaultsCount = vaults?.filter(v => v.current > 0).length || 0;

  const [balanceVisible, setBalanceVisible] = useState(showBalanceByDefault);

  const formatBalance = (balance) => {
    if (!balanceVisible) return '\u2022 \u2022 \u2022 \u2022 \u2022 \u2022';
    return `Rs ${balance?.toLocaleString('en-US') || '0.00'}`;
  };

  const formatMaskedIBAN = (iban) => {
    if (!iban) return '**** **** **** ****';
    const clean = iban.replace(/\s+/g, '');
    const lastFour = clean.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  // Compute monthly income vs spend from transactions history (if available)
  const totalBalance = accounts?.reduce((sum, account) => sum + (account.balance || 0), 0) || 0;

  // Get color for progress bar based on percentage
  const getBudgetBarColor = (pct) => {
    if (pct > 80) return '#d63b3b';
    if (pct > 50) return '#c9a84c';
    if (pct > 30) return '#2056d4';
    return '#0e7c6e';
  };

  // Quick action items — 6-column grid matching reference
  const quickActions = [
    { label: 'Send', icon: SendIcon, bgClass: 'navy', onClick: onSendMoney },
    { label: 'Add Funds', icon: AddFundsIcon, bgClass: 'teal', onClick: onAddFunds },
    { label: 'Pay Bill', icon: PayBillIcon, bgClass: 'gold', onClick: () => setActivePage('payments') },
    { label: 'QR Pay', icon: QRIcon, bgClass: 'blue', onClick: onQRPayment },
    { label: 'NFC Pay', icon: NFCIcon, bgClass: 'purple', onClick: onNFCPayment },
    { label: 'Savings', icon: SavingsIcon, bgClass: 'red', onClick: () => setActivePage('vaults') },
  ];

  const iconBgMap = {
    navy: { bg: 'var(--color-accent, #1a1f3a)', color: 'white' },
    teal: { bg: '#e1f5f2', color: '#0e7c6e' },
    gold: { bg: '#fef3d8', color: '#c9a84c' },
    blue: { bg: 'var(--color-blue2, #dde8ff)', color: '#2056d4' },
    red: { bg: '#fde8e8', color: '#d63b3b' },
    purple: { bg: '#ede8fe', color: '#7c3aed' },
    orange: { bg: '#fff7ed', color: '#ff9f0a' },
  };

  return (
    <section className="flex flex-col overflow-y-auto p-4 space-y-[22px]">
      {/* Hidden nav links for accessibility */}
      <div className="hidden">
        <a id="dashboard-link" href="#dashboard" tabIndex="-1"></a>
        <a id="card-control-link" href="#card-control" tabIndex="-1"></a>
        <a id="budgets-link" href="#budgets" tabIndex="-1"></a>
        <a id="vaults-link" href="#vaults" tabIndex="-1"></a>
        <a id="payments-link" href="#payments" tabIndex="-1"></a>
        <a id="accounts-link" href="#accounts" tabIndex="-1"></a>
      </div>

      {/* === TOP ROW: 3-column grid === */}
      <div className="grid grid-cols-2 gap-[var(--space-md)] md:grid-cols-[1.4fr_1fr_1fr] md:gap-[14px]">
        {/* Balance Card — full width on mobile (spans 2 cols), 1st column on desktop */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="col-span-2 md:col-span-1 relative overflow-hidden rounded-panel p-[22px] md:rounded-[var(--radius-xl)]"
          style={{ backgroundColor: '#1a1f3a', color: 'white' }}
        >
          {/* Decorative circles */}
          <div className="absolute rounded-full" style={{
            width: '130px', height: '130px', top: '-40px', right: '-40px',
            backgroundColor: 'rgba(201,168,76,0.15)'
          }} />
          <div className="absolute rounded-full" style={{
            width: '80px', height: '80px', bottom: '-20px', right: '40px',
            backgroundColor: 'rgba(201,168,76,0.08)'
          }} />

          {/* Gold chip */}
          <div className="w-[28px] h-[20px] rounded-sm mb-[18px] flex items-center justify-center" style={{
            backgroundColor: 'var(--color-gold)',
            minHeight: '20px'
          }}>
            <svg viewBox="0 0 18 14" fill="none" width="18" height="14">
              <rect x="1" y="1" width="16" height="12" rx="2" stroke="#1a1f3a" strokeWidth="1.2"/>
              <path d="M6 1v12M12 1v12M1 5h16M1 9h16" stroke="#1a1f3a" strokeWidth=".8"/>
            </svg>
          </div>

          <div className="text-[10px] tracking-[1px] mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            ACTIVE ACCOUNT BALANCE
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[26px] font-bold tracking-[-0.5px]">
              {formatBalance(mainAccount?.balance)}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setBalanceVisible(v => !v)}
              className="p-1 rounded transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)', minHeight: '44px', minWidth: '44px' }}
            >
              {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </motion.button>
          </div>
          <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Across all accounts
          </div>
          {showIBANOnHero && (
            <div className="font-mono text-[11px] tracking-[2px] mt-[16px]" style={{
              color: 'rgba(255,255,255,0.4)'
            }}>
              {mainAccount?.ibanNumber
                ? `PK${mainAccount.ibanNumber.substring(2, 4)} ${formatMaskedIBAN(mainAccount.ibanNumber)}`
                : '•••• •••• •••• ••••'}
            </div>
          )}
        </motion.div>

        {/* Stat Card — Monthly Income / Budgets */}
        {prefs.showMonthlyIncome !== false && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-panel p-[18px] border flex flex-col justify-between cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-xl)' }}
            onClick={() => setActivePage('budgets')}
          >
            <div>
              <div className="w-9 h-9 rounded-sm-panel flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-teal2)' }}>
                <IncomeArrow />
              </div>
              <div className="text-[11px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
                TOTAL BUDGETED
              </div>
              <div className="font-mono text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Rs {budgets?.reduce((s, b) => s + b.limit, 0).toLocaleString('en-US') || '0'}
              </div>
            </div>
            <div className="text-[11px] mt-2 flex items-center justify-between" style={{ color: 'var(--color-teal)' }}>
              <span>&#8593; Budget allocated</span>
              <span className="text-[10px] opacity-60">View all</span>
            </div>
          </motion.div>
        )}

        {/* Stat Card — Monthly Spend / Transactions */}
        {prefs.showMonthlySpend !== false && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-panel p-[18px] border flex flex-col justify-between cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-xl)' }}
            onClick={() => setActivePage('transactions')}
          >
            <div>
              <div className="w-9 h-9 rounded-sm-panel flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-blue2)' }}>
                <SpendArrow />
              </div>
              <div className="text-[11px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
                MONTHLY SPEND
              </div>
              <div className="font-mono text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Rs {budgets?.reduce((s, b) => s + b.spent, 0).toLocaleString('en-US') || '0'}
              </div>
            </div>
            <div className="text-[11px] mt-2 flex items-center justify-between" style={{ color: 'var(--color-red-accent)' }}>
              <span>&#8593; Active spending</span>
              <span className="text-[10px] opacity-60">View all</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* === QUICK ACTIONS: 6 equal columns === */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-[14px]">
        {quickActions.map((action, i) => {
          const IconComp = action.icon;
          const colors = iconBgMap[action.bgClass];
          return (
            <motion.div
              key={action.label}
              whileHover={{ y: -2, borderColor: 'var(--color-gold)' }}
              className="rounded-panel p-[14px_8px] flex flex-col items-center gap-2 cursor-pointer border transition-all duration-150"
              style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}
              onClick={action.onClick}
            >
              <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{
                backgroundColor: colors.bg,
                color: colors.color
              }}>
                <IconComp />
              </div>
              <span className="text-[11px] font-medium text-center" style={{ color: 'var(--color-text-secondary)' }}>
                {action.label}
              </span>
              {/* Tooltip */}
              {prefs.showIconTooltips && action.label === 'Send' && (
                <HintTooltip hint="Send Money — Transfer funds to any account using IBAN or saved beneficiary">
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
                </HintTooltip>
              )}
              {prefs.showIconTooltips && action.label === 'Add Funds' && (
                <HintTooltip hint="Add Funds — Add money to your account from card or bank transfer">
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
                </HintTooltip>
              )}
              {prefs.showIconTooltips && action.label === 'QR Pay' && (
                <HintTooltip hint="QR Payment — Scan QR codes to pay or display your QR code to receive payments">
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
                </HintTooltip>
              )}
              {prefs.showIconTooltips && action.label === 'NFC Pay' && (
                <HintTooltip hint="NFC Payment — Tap to pay or receive payments using NFC (requires mobile app)">
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/20 text-[8px] flex items-center justify-center cursor-help">?</span>
                </HintTooltip>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* === MID ROW: Recent Transactions + Budget Overview === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
        {/* Recent Transactions Panel */}
        <div className="rounded-panel p-5 border" style={{
          backgroundColor: 'var(--color-panel)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Recent Transactions</h3>
            <span className="text-xs cursor-pointer" style={{ color: 'var(--color-blue-accent)' }}
              onClick={() => setActivePage('transactions')}>
              View all
            </span>
          </div>
          {/* Render actual transactions if available, else show empty state */}
          {transactions && transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.slice(0, 7).map(tx => {
                const amount = tx.amount || 0;
                const IconComp = getTransactionIcon(tx);
                const bg = getIconBgColor(tx);
                const fg = getIconColor(tx);
                const isCredit = amount >= 0;
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg, color: fg }}>
                      <IconComp className="w-[15px] h-[15px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">{tx.desc || tx.description || 'Unknown'}</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{formatDate(tx.date)}</p>
                    </div>
                    <span className="text-xs font-mono font-semibold flex-shrink-0" style={{
                      color: isCredit ? 'var(--color-teal)' : 'var(--color-text-primary)'
                    }}>
                      {isCredit ? '+' : '-'}Rs {Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs text-text-muted text-center py-8">
                No transactions yet.
              </div>
            </div>
          )}
        </div>

        {/* Budget Overview Panel */}
        <div className="rounded-panel p-5 border" style={{
          backgroundColor: 'var(--color-panel)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Budget Overview</h3>
            <span className="text-xs cursor-pointer" style={{ color: 'var(--color-blue-accent)' }}
              onClick={() => setActivePage('budgets')}>
              Manage
            </span>
          </div>
          {budgets && budgets.length > 0 ? (
            <>
              <div className="space-y-4">
                {budgets.slice(0, 5).map(budget => {
                  const pct = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
                  const barColor = getBudgetBarColor(pct);
                  return (
                    <div key={budget.id} className="cursor-pointer rounded-panel p-3 -m-3 hover:bg-white/5 transition-colors" onClick={() => setActivePage('budgets')}>
                      <div className="flex justify-between mb-2">
                        <p className="text-xs font-medium">{budget.name}</p>
                        <span className="text-xs" style={{ color: barColor }}>
                          Rs {budget.spent.toLocaleString('en-US')} / Rs {budget.limit.toLocaleString('en-US')}
                        </span>
                      </div>
                      <div className="h-[8px] rounded-full overflow-hidden" style={{
                        backgroundColor: 'rgba(13,15,26,0.08)'
                      }}>
                        <div className="h-full rounded-full transition-all duration-300" style={{
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: barColor
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {budgets.length > 1 && (
                <div className="flex justify-between items-center mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Total across {budgets.length} budgets
                  </span>
                  <span className="text-xs font-mono font-medium">
                    Rs {budgets.reduce((s, b) => s + b.spent, 0).toLocaleString('en-US')} / Rs {budgets.reduce((s, b) => s + b.limit, 0).toLocaleString('en-US')}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs" style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>No budgets created yet.</p>
              <button className="text-xs font-medium px-4 py-2 rounded-panel cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--color-accent, #1a1f3a)', color: 'white', border: 'none' }}
                onClick={() => setActivePage('budgets')}>
                Create your first budget
              </button>
            </div>
          )}
        </div>
      </div>

      {/* === BOTTOM ROW: 3-column grid === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
        {/* Savings Goals */}
        <div className="rounded-panel p-5 border" style={{
          backgroundColor: 'var(--color-panel)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Savings Goals</h3>
            <span className="text-xs cursor-pointer" style={{ color: 'var(--color-blue-accent)' }}
              onClick={() => setActivePage('vaults')}>
              See all
            </span>
          </div>
          {vaults && vaults.length > 0 ? (
            <div className="space-y-4 mt-2">
              {vaults.slice(0, 3).map(vault => {
                const pct = vault.target > 0 ? Math.round((vault.current / vault.target) * 100) : 0;
                const barColor = pct > 80 ? '#0e7c6e' : pct > 45 ? '#2056d4' : '#c9a84c';
                return (
                  <div key={vault.id}>
                    <div className="flex justify-between mb-1">
                      <p className="text-xs font-medium">{vault.name}</p>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{pct}%</span>
                    </div>
                    <div className="h-[6px] rounded-full overflow-hidden" style={{
                      backgroundColor: 'rgba(13,15,26,0.08)'
                    }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: barColor
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-text-muted text-center py-6">
              No savings goals yet.
            </div>
          )}
          {vaults && vaults.length > 0 && (
            <div className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
              Total saved: <strong style={{ color: 'var(--color-text-primary)' }}>
                Rs {vaults.reduce((s, v) => s + v.current, 0).toLocaleString('en-US')}
              </strong> of Rs {vaults.reduce((s, v) => s + v.target, 0).toLocaleString('en-US')}
            </div>
          )}
        </div>

        {/* Upcoming Bills — placeholder */}
        <div className="rounded-panel p-5 border" style={{
          backgroundColor: 'var(--color-panel)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Upcoming Bills</h3>
            <span className="text-xs cursor-pointer" style={{ color: 'var(--color-blue-accent)' }}>
              Pay all
            </span>
          </div>
          <div className="text-xs text-text-muted text-center py-8">
            Bill payments coming soon.
          </div>
        </div>

        {/* Quick Pay — QR + NFC */}
        <div className="rounded-panel p-5 border" style={{
          backgroundColor: 'var(--color-panel)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="mb-3">
            <h3 className="text-sm font-medium">Quick Pay</h3>
          </div>
          {/* QR Box */}
          <div className="rounded-sm-panel p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors min-h-[110px] mb-[12px]"
            style={{ backgroundColor: 'rgba(13,15,26,0.06)' }}
            onClick={onQRPayment}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(13,15,26,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(13,15,26,0.06)'}
          >
            <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
              <rect x="4" y="4" width="20" height="20" rx="2" stroke="var(--color-text-primary)" strokeWidth="2"/>
              <rect x="8" y="8" width="12" height="12" rx="1" fill="var(--color-text-primary)"/>
              <rect x="40" y="4" width="20" height="20" rx="2" stroke="var(--color-text-primary)" strokeWidth="2"/>
              <rect x="44" y="8" width="12" height="12" rx="1" fill="var(--color-text-primary)"/>
              <rect x="4" y="40" width="20" height="20" rx="2" stroke="var(--color-text-primary)" strokeWidth="2"/>
              <rect x="8" y="44" width="12" height="12" rx="1" fill="var(--color-text-primary)"/>
              <rect x="40" y="40" width="8" height="8" rx="1" fill="var(--color-text-primary)"/>
              <rect x="52" y="40" width="8" height="8" rx="1" fill="var(--color-text-primary)"/>
              <rect x="40" y="52" width="8" height="8" rx="1" fill="var(--color-text-primary)"/>
              <rect x="52" y="52" width="8" height="8" rx="1" fill="var(--color-text-primary)"/>
              <rect x="28" y="4" width="8" height="8" rx="1" fill="var(--color-text-primary)"/>
              <rect x="4" y="28" width="8" height="8" rx="1" fill="var(--color-text-primary)"/>
              <rect x="28" y="28" width="8" height="8" rx="1" fill="var(--color-text-primary)"/>
              <rect x="40" y="28" width="8" height="8" rx="1" fill="var(--color-text-primary)"/>
              <rect x="52" y="28" width="8" height="8" rx="1" fill="var(--color-text-primary)"/>
            </svg>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Tap to show QR code
            </p>
          </div>

          {/* NFC Box */}
          <div className="rounded-sm-panel p-[14px_16px] flex items-center gap-3 cursor-pointer"
            style={{ backgroundColor: '#1a1f3a' }}
            onClick={onNFCPayment}
          >
            <div>
              <p className="text-xs font-medium text-white">NFC Payment</p>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Hold near terminal
              </span>
            </div>
            {/* NFC Pulse animation */}
            <div className="relative w-9 h-9 ml-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full" style={{
                border: '1.5px solid var(--color-gold)',
                animation: 'nfcPulse 1.8s ease-out infinite'
              }} />
              <div className="absolute inset-0 rounded-full scale-75" style={{
                border: '1.5px solid var(--color-gold)',
                animation: 'nfcPulse 1.8s ease-out infinite 0.6s'
              }} />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
