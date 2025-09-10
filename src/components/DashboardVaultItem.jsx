// src/components/DashboardVaultItem.jsx
import Icon from './Icon';

function DashboardVaultItem({ vault }) {
  const isSavings = vault.isSavingsAccount;
  const percentage = !isSavings && vault.target > 0 ? Math.round((vault.current / vault.target) * 100) : 0;

  return (
    <div className={`bg-background/50 p-4 rounded-xl flex flex-col h-full ${isSavings ? 'border border-green-500/30' : ''}`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 bg-${vault.color}-500/20 rounded-lg`}>
          <Icon name={vault.icon} className={`w-5 h-5 text-${vault.color}-400`} />
        </div>
        <span className="font-medium">{vault.name}</span>
      </div>
      <div className="text-center my-auto py-2">
        <p className="text-2xl font-bold font-mono">Rs {Math.floor(vault.current).toLocaleString('en-US')}</p>
        <p className="font-medium text-sm mt-1 text-green-400">
          {isSavings ? `${(vault.returnRate * 100).toFixed(0)}% APR` : `${percentage}% Complete`}
        </p>
      </div>
      {!isSavings && vault.target ? (
        <div className="w-full bg-sidebar rounded-full h-2.5 mt-auto">
          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
      ) : <div className="h-2.5 mt-auto"></div>}
    </div>
  );
}

export default DashboardVaultItem;