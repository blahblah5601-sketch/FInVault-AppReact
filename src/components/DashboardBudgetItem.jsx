// src/components/DashboardBudgetItem.jsx
import Icon from "./Icon";

function DashboardBudgetItem({ budget }) {
  const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
  
  return (
    <div className="bg-background/50 p-4 rounded-xl flex flex-col h-full">
      <div className="flex items-center space-x-3">
        <div className={`p-2 bg-${budget.color}-500/20 rounded-lg`}>
          <Icon name={budget.icon} className={`w-5 h-5 text-${budget.color}-400`} />
        </div>
        <span className="font-medium">{budget.name}</span>
      </div>
      <div className="text-center my-auto py-2">
        <p className="text-2xl font-bold font-mono">Rs {budget.spent.toLocaleString('en-US')}</p>
        <p className="font-medium text-sm mt-1" style={{ color: percentage > 90 ? '#f87171' : 'var(--color-primary)' }}>
          {percentage}% Used
        </p>
      </div>
      <div className="w-full bg-sidebar rounded-full h-2.5 mt-auto">
        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

export default DashboardBudgetItem;