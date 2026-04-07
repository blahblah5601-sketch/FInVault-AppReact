// src/components/VaultItem.jsx
import Icon from './Icon';

function VaultItem({ vault, onDeposit, onWithdraw, onDelete }) {
  const percentage = vault.target > 0 ? Math.round((vault.current / vault.target) * 100) : 0;

  // Map vault color name to hex
  const vaultColorHex = (color) => {
    const map = {
      green: '#0e7c6e', red: '#d63b3b', blue: '#2056d4', yellow: '#c9a84c',
      purple: '#7c3aed', teal: '#0e7c6e', emerald: '#0e7c6e', amber: '#c9a84c',
      orange: '#c9a84c', pink: '#d63b3b'
    };
    return map[color] || '#2056d4';
  };

  const accentColor = vaultColorHex(vault.color);

  return (
    <div className="rounded-panel p-[18px] flex flex-col" style={{
      backgroundColor: 'var(--color-panel)',
      border: '1px solid var(--color-border)',
      borderTop: `3px solid ${accentColor}`
    }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{
            backgroundColor: `${accentColor}20`
          }}>
            <Icon name={vault.icon} className="w-6 h-6" style={{ color: accentColor }} />
          </div>
          <div>
            <h4 className="font-medium text-[14px]" style={{ fontFamily: "'Sora', sans-serif" }}>
              {vault.name}
            </h4>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              Target: <span style={{ fontFamily: "'Space Mono', monospace" }}>Rs {vault.target.toLocaleString('en-US')}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-text-muted hover:text-red-500 transition-colors"
          title="Delete vault"
        >
          <Icon name="trash-2" className="w-4 h-4" />
        </button>
      </div>

      {/* Amount */}
      <p className="font-mono text-[22px] font-bold mb-1" style={{ fontFamily: "'Space Mono', monospace", color: 'var(--color-text-primary)' }}>
        Rs {vault.current.toLocaleString('en-US')}
      </p>
      <p className="text-[12px] mb-3" style={{ color: `${accentColor}`, fontWeight: 600 }}>
        {percentage}% Complete
      </p>

      {/* Progress bar — 7px height, rounded */}
      <div className="w-full rounded-full overflow-hidden mb-4" style={{
        height: '7px',
        backgroundColor: 'rgba(13,15,26,0.08)'
      }}>
        <div className="transition-all duration-500" style={{
          width: `${Math.min(percentage, 100)}%`,
          height: '100%',
          backgroundColor: accentColor
        }} />
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <button
          onClick={onWithdraw}
          className="flex-1 py-2 px-3 text-xs font-medium transition-colors cursor-pointer"
          style={{
            borderRadius: '10px',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontFamily: "'Sora', sans-serif"
          }}
        >
          Withdraw
        </button>
        <button
          onClick={onDeposit}
          className="flex-1 py-2 px-3 text-xs font-medium text-white transition-colors cursor-pointer"
          style={{
            borderRadius: '10px',
            backgroundColor: accentColor,
            border: 'none',
            fontFamily: "'Sora', sans-serif"
          }}
          onMouseEnter={e => e.target.style.opacity = '0.85'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          Deposit
        </button>
      </div>
    </div>
  );
}

export default VaultItem;
