// src/components/BudgetItem.jsx

function BudgetItem({ budget }) {
  const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
  
  return (
    <div className="budget-item-full border-t pt-6 mt-6 first:mt-0 first:pt-0 first:border-t-0" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-4">
          <div className={`p-3 bg-${budget.color}-500/20 rounded-lg`}>
            <i data-lucide={budget.icon} className={`w-6 h-6 text-${budget.color}-400`}></i>
          </div>
          <div>
            <h4 className="font-semibold text-lg flex items-center">
              {budget.name}
              {budget.isCardAssigned && <i data-lucide="credit-card" className="w-4 h-4 text-green-400 ml-2"></i>}
            </h4>
            <p className="text-sm text-slate-400">
              Spent <span className="font-mono">Rs {budget.spent.toLocaleString('en-US')}</span> of <span className="font-mono">Rs {budget.limit.toLocaleString('en-US')}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-medium text-lg ${percentage > 90 ? 'text-red-400' : ''}`}>{percentage}% Used</p>
          {/* We will make these buttons functional later */}
          <div className="flex gap-2 mt-2">
            <button className="text-xs btn-secondary py-1 px-2 rounded">Assign</button>
            <button className="text-xs btn-secondary py-1 px-2 rounded">Update</button>
            <button className="text-xs btn-danger py-1 px-2 rounded">Delete</button>
          </div>
        </div>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3">
        <div className={`bg-green-500 h-3 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

export default BudgetItem;