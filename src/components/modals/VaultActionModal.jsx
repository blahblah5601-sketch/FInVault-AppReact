// src/components/modals/VaultActionModal.jsx
import { useState, useEffect } from 'react';

function VaultActionModal({ isOpen, onClose, onSubmit, vault, actionType }) {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) setAmount('');
  }, [isOpen]);

  if (!isOpen || !vault) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(vault, actionType, parseFloat(amount));
  };

  const title = `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Funds`;
  const isGoalVaultDeposit = actionType === 'deposit' && !vault.isSavingsAccount && vault.target;
  const remainingGoal = isGoalVaultDeposit ? vault.target - vault.current : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-11/12 max-w-md mx-4 p-6 shadow-2xl" style={{
        backgroundColor: 'var(--color-panel)',
        borderRadius: '16px',
        border: '1px solid var(--color-border)'
      }} onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-medium mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h3>
        <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>To/From: {vault.name}</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="vault-action-amount" className="block text-xs tracking-[0.3px]" style={{
                color: 'var(--color-text-muted)', fontFamily: "'Sora', sans-serif"
              }}>Amount</label>
              {isGoalVaultDeposit && (
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Max Deposit: <span style={{ fontFamily: "'Space Mono', monospace" }}>Rs {remainingGoal.toLocaleString()}</span>
                </p>
              )}
            </div>
            <input type="number" id="vault-action-amount" value={amount}
              onChange={e => setAmount(e.target.value)}
              max={isGoalVaultDeposit ? remainingGoal : null}
              className="w-full p-4 text-xl font-bold outline-none"
              style={{ borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-panel)', color: 'var(--color-text-primary)', fontFamily: "'Space Mono', monospace" }}
              onFocus={e => e.target.style.borderColor = 'var(--color-gold)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              placeholder="0.00" required autoFocus />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="py-[10px] px-4 text-sm font-medium transition-colors"
              style={{ borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', fontFamily: "'Sora', sans-serif" }}>
              Cancel
            </button>
            <button type="submit" className="py-[10px] px-5 text-sm font-medium text-white transition-colors"
              style={{ borderRadius: '10px', backgroundColor: '#1a1f3a', border: 'none', fontFamily: "'Sora', sans-serif" }}
              onMouseEnter={e => e.target.style.backgroundColor = '#262d52'}
              onMouseLeave={e => e.target.style.backgroundColor = '#1a1f3a'}>
              {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VaultActionModal;
