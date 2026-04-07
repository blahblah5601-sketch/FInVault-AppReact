// src/components/CardControlPage.jsx
import { useState, useEffect } from 'react';
import { updateUserPreferences, getUserPreferences } from '../api';
import { Snowflake, CheckCircle2, Link, LibrarySquare } from 'lucide-react';
import CardGraphic from './CardGraphic';
import ConfirmActionModal from './modals/ConfirmActionModal';

function CardControlPage({ accounts, budgets, showToast }) {
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [activeAccountId, setActiveAccountId] = useState('current');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [nextAccountId, setNextAccountId] = useState(null);
  const mainAccount = accounts.find(a => a.id === 'current');
  const assignedBudgets = budgets.filter(b => b.isCardAssigned);

  useEffect(() => {
    const loadPreferences = async () => {
      const prefs = await getUserPreferences();
      if (prefs) {
        setIsCardFrozen(prefs.isCardFrozen || false);
        setActiveAccountId(prefs.activeAccountId || 'current');
      }
    };
    loadPreferences();
  }, []);

  const handleFreezeToggle = async () => {
    const newFrozenState = !isCardFrozen;
    setIsCardFrozen(newFrozenState);
    try {
      await updateUserPreferences({ isCardFrozen: newFrozenState });
    } catch (error) {
      setIsCardFrozen(!newFrozenState);
      if (showToast) showToast('Failed to update card freeze preference.');
    }
  };

  const handleAccountChange = (accountId) => {
    setNextAccountId(accountId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAccountChange = async () => {
    if (nextAccountId) {
      setActiveAccountId(nextAccountId);
      await updateUserPreferences({ activeAccountId: nextAccountId });
      showToast("Active card account has been changed.");
    }
    setIsConfirmModalOpen(false);
    setNextAccountId(null);
  };

  const displayAccounts = mainAccount ? [
    mainAccount,
    ...assignedBudgets.map(b => ({ id: b.id, name: `${b.name} Jar`, balance: b.limit - b.spent }))
  ] : [];

  const activeAccount = displayAccounts.find(acc => acc.id === activeAccountId) || mainAccount;

  return (
    <section id="card-control" className="flex flex-col space-y-[22px]">
      {/* Header / Card visual */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium" style={{ fontFamily: "'Sora', sans-serif" }}>Card Control</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Manage cards, NFC defaults & budget links
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
        {/* Left: Card Display + Freeze */}
        <div className="space-y-[14px]">
          <div className={`rounded-panel p-6 relative overflow-hidden ${isCardFrozen ? 'grayscale' : ''}`}
            style={{ backgroundColor: '#1a1f3a', color: 'white' }}>
            {/* Decorative circles */}
            <div className="absolute rounded-full" style={{
              width: '140px', height: '140px', top: '-70px', right: '-40px',
              backgroundColor: 'rgba(255,255,255,0.06)'
            }} />
            <div className="absolute rounded-full" style={{
              width: '90px', height: '90px', bottom: '-25px', left: '20px',
              backgroundColor: 'rgba(255,255,255,0.06)'
            }} />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Active Account</p>
                <h3 className="text-sm font-medium mt-1" style={{ fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.75)' }}>
                  {activeAccount?.name}
                </h3>
              </div>
              {/* Chip */}
              <div className="w-[26px] h-[19px] bg-[var(--color-gold)] rounded-sm flex items-center justify-center">
                <svg viewBox="0 0 18 13" fill="none" width="18" height="13">
                  <rect x="1" y="1" width="16" height="11" rx="1.5" stroke="#1a1f3a" strokeWidth="1.1"/>
                  <path d="M6 1v11M12 1v11M1 4.5h16M1 8.5h16" stroke="#1a1f3a" strokeWidth=".7"/>
                </svg>
              </div>
            </div>
            <div className="relative z-10 mt-[20px]">
              <p className="text-xs tracking-[2px]" style={{ fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.5)' }}>
                **** **** **** 8021
              </p>
              <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {activeAccount?.ibanNumber ? activeAccount.ibanNumber.substring(0, 6) + ' ****' : 'PK36 FNVT **** 8021'}
              </p>
            </div>

            {isCardFrozen && (
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-20"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                <Snowflake className="w-14 h-14" style={{ color: 'rgba(136,192,255,0.7)' }} />
                <p className="text-xl font-bold ml-3" style={{ color: 'rgba(136,192,255,0.9)' }}>Card Frozen</p>
              </div>
            )}
          </div>

          {/* Freeze Toggle */}
          <div className="rounded-panel p-4 flex items-center justify-between" style={{
            backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--color-border)'
          }}>
            <div className="flex items-center gap-3">
              <Snowflake className="w-5 h-5" style={{ color: 'var(--color-blue-accent)' }} />
              <span className="text-sm font-medium">Freeze Card</span>
            </div>
            <label htmlFor="freeze-toggle" className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="freeze-toggle" className="sr-only peer"
                checked={isCardFrozen} onChange={handleFreezeToggle} />
              <div className="w-11 h-6 bg-background/10 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white after:border after:border-gray-300 peer-checked:bg-[var(--color-blue-accent)]" />
            </label>
          </div>
        </div>

        {/* Right: Account Selector */}
        <div className="rounded-panel p-[18px]" style={{
          backgroundColor: 'var(--color-panel)',
          border: '1px solid var(--color-border)'
        }}>
          <h3 className="text-sm font-medium mb-1">Rotate Active Account</h3>
          <p className="text-xs mb-[18px]" style={{ color: 'var(--color-text-muted)' }}>
            Select which account or budget jar your card uses.
          </p>
          <div id="account-selector" className="space-y-3">
            {displayAccounts.map(account => (
              <label key={account.id} htmlFor={`acc-${account.id}`}
                className="flex items-center p-4 rounded-[10px] cursor-pointer transition-all border hover:bg-background/10"
                style={{
                  backgroundColor: activeAccountId === account.id
                    ? 'rgba(14,124,110,0.12)'
                    : 'var(--color-bg)',
                  borderColor: activeAccountId === account.id
                    ? 'rgba(14,124,110,0.4)'
                    : 'transparent',
                  borderStyle: 'solid'
                }}>
                <input type="radio" id={`acc-${account.id}`} name="activeAccount" value={account.id}
                  className="hidden" checked={account.id === activeAccountId}
                  onChange={() => handleAccountChange(account.id)} />
                <div className="flex-1">
                  <p className="text-xs font-medium">{account.name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Available:{' '}
                    <span style={{ fontFamily: "'Space Mono', monospace" }}>
                      Rs {account.balance.toLocaleString('en-US')}
                    </span>
                  </p>
                </div>
                {activeAccountId === account.id && (
                  <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-teal)' }} />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Features */}
        <div className="rounded-panel p-[18px]" style={{
          backgroundColor: 'var(--color-panel)',
          border: '1px solid var(--color-border)'
        }}>
          <h3 className="text-sm font-medium mb-[18px]">Advanced Features</h3>
          <div className="space-y-3">
            <button onClick={() => showToast('Coming Soon!')}
              className="w-full flex items-center text-left py-3 px-4 transition-colors"
              style={{
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                fontFamily: "'Sora', sans-serif",
                fontSize: '13px',
                color: 'var(--color-text-primary)'
              }}
              onMouseEnter={e => e.target.style.borderColor = 'var(--color-gold)'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--color-border)'}>
              <Link className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>Link External Bank Account</span>
            </button>
            <button onClick={() => showToast('Coming Soon!')}
              className="w-full flex items-center text-left py-3 px-4 transition-colors"
              style={{
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                fontFamily: "'Sora', sans-serif",
                fontSize: '13px',
                color: 'var(--color-text-primary)'
              }}
              onMouseEnter={e => e.target.style.borderColor = 'var(--color-gold)'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--color-border)'}>
              <LibrarySquare className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>Generate Virtual Card</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAccountChange}
        title="Confirm Account Change"
        message="Are you sure you want to rotate your active card account?"
      />
    </section>
  );
}

export default CardControlPage;
