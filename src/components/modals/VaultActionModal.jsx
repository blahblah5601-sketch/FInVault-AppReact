// src/components/modals/VaultActionModal.jsx
import { useState, useEffect } from 'react';

function VaultActionModal({ isOpen, onClose, onSubmit, vault, actionType }) {
  const [amount, setAmount] = useState('');

  // Effect to clear the amount when the modal is opened for a new action
  useEffect(() => {
    if (isOpen) {
      setAmount('');
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-panel rounded-lg p-6 w-11/12 max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-sm text-text-secondary mb-4">To/From: {vault.name}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="vault-action-amount" className="block text-sm font-medium text-text-primary">Amount</label>
              {/* Show the max deposit amount if applicable */}
              {isGoalVaultDeposit && (
                <p className="text-xs text-text-secondary">
                  Max Deposit: Rs {remainingGoal.toLocaleString()}
                </p>
              )}
            </div>
            <input 
              type="number" 
              id="vault-action-amount" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              max={isGoalVaultDeposit ? remainingGoal : null}
              className="w-full bg-sidebar border-slate-600 rounded-md p-2" 
              placeholder="0.00" 
              required 
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" className="btn-secondary py-2 px-4 rounded-lg" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary py-2 px-4 rounded-lg">{title}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VaultActionModal;