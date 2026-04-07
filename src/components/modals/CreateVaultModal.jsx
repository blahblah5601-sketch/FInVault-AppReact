// src/components/modals/CreateVaultModal.jsx
import { useState } from 'react';

function CreateVaultModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name, parseFloat(target));
    setName('');
    setTarget('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-11/12 max-w-md mx-4 p-6 shadow-2xl" style={{
        backgroundColor: 'var(--color-panel)',
        borderRadius: '16px',
        border: '1px solid var(--color-border)'
      }} onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-medium mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>Create New Goal Vault</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vault-name" className="block text-xs mb-1 tracking-[0.3px]" style={{
              color: 'var(--color-text-muted)', fontFamily: "'Sora', sans-serif"
            }}>Vault Name</label>
            <input type="text" id="vault-name" value={name} onChange={e => setName(e.target.value)}
              className="w-full p-3 text-sm outline-none"
              style={{ borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-panel)', color: 'var(--color-text-primary)', fontFamily: "'Sora', sans-serif" }}
              onFocus={e => e.target.style.borderColor = 'var(--color-gold)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              placeholder="e.g., Vacation Fund" required />
          </div>
          <div>
            <label htmlFor="vault-target" className="block text-xs mb-1 tracking-[0.3px]" style={{
              color: 'var(--color-text-muted)', fontFamily: "'Sora', sans-serif"
            }}>Target Amount (PKR)</label>
            <input type="number" id="vault-target" value={target} onChange={e => setTarget(e.target.value)}
              className="w-full p-3 text-lg font-bold outline-none"
              style={{ borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-panel)', color: 'var(--color-text-primary)', fontFamily: "'Space Mono', monospace" }}
              onFocus={e => e.target.style.borderColor = 'var(--color-gold)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              placeholder="e.g., 100000" required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="py-[10px] px-4 text-sm font-medium transition-colors"
              style={{ borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', fontFamily: "'Sora', sans-serif" }}>
              Cancel
            </button>
            <button type="submit" className="py-[10px] px-5 text-sm font-medium text-white transition-colors"
              style={{ borderRadius: '10px', backgroundColor: '#1a1f3a', border: 'none', fontFamily: "'Sora', sans-serif" }}
              onMouseEnter={e => e.target.style.backgroundColor = '#262d52'}
              onMouseLeave={e => e.target.style.backgroundColor = '#1a1f3a'}>
              Create Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateVaultModal;
