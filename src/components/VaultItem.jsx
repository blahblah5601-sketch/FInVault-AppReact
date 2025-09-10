// src/components/VaultItem.jsx
import Icon from './Icon';

function VaultItem({ vault , onDeposit, onWithdraw }) {
  const percentage = vault.target > 0 ? Math.round((vault.current / vault.target) * 100) : 0;

  return (
    <div className="bg-background/50 p-6 rounded-2xl flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 bg-${vault.color}-500/20 rounded-lg`}>
            <Icon name={vault.icon} className={`w-8 h-8 text-${vault.color}-400`} />
          </div>
          <div>
            <h4 className="font-semibold text-lg">{vault.name}</h4>
            <p className="text-sm text-slate-400">Target: Rs {vault.target.toLocaleString('en-US')}</p>
          </div>
        </div>
        <button className="text-slate-500 hover:text-red-500">
          <Icon data-lucide="trash-2" className="w-5 h-5" />
        </button>
      </div>
      <div className="text-center my-4 flex-1">
        <p className="text-3xl font-bold font-mono">Rs {vault.current.toLocaleString('en-US')}</p>
        <p className="font-medium mt-1" style={{ color: 'var(--color-primary)' }}>{percentage}% Complete</p>
      </div>
      <div className="w-full bg-sidebar rounded-full h-3 mb-4">
        <div className="bg-green-500 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="flex gap-4">
        <button onClick={onWithdraw} className="flex-1 btn-secondary py-2 rounded-lg">Withdraw</button>
        <button onClick={onDeposit} className="flex-1 btn-primary py-2 rounded-lg">Deposit</button>
      </div>
    </div>
  );
}

export default VaultItem;