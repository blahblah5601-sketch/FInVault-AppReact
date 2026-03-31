// src/components/BudgetItem.jsx
import { useState } from 'react';
import Icon from './Icon';
import { CreditCard } from 'lucide-react'; // Importing CreditCard icon for assigned budgets

function BudgetItem({ budget, onUpdate, onDelete, onAssign, canAssignMore, addBudgetItem, removeBudgetItem }) {
  const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('circle');

  let assignButton;
  if (budget.isCardAssigned) {
    assignButton = <button onClick={() => onAssign(budget, 'unassign')} className="text-xs btn-secondary py-1 px-2 rounded">Unassign</button>;
  } else if (canAssignMore) {
    assignButton = <button onClick={() => onAssign(budget, 'assign')} className="text-xs btn-primary py-1 px-2 rounded">Assign to Card</button>;
  } else {
    assignButton = <button className="text-xs btn-disabled py-1 px-2 rounded" disabled>Slots Full</button>;
  }

  // Calculate total allocated amount from envelope items
  const totalAllocated = budget.items?.reduce((sum, item) => sum + item.allocatedAmount, 0) || 0;

  // Calculate total spent from envelope items
  const totalSpentFromItems = budget.items?.reduce((sum, item) => sum + item.spentAmount, 0) || 0;

  const handleAddItem = async () => {
    if (!newItemName || !newItemAmount || parseFloat(newItemAmount) <= 0) {
      alert('Please enter a valid name and amount');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: newItemName,
      allocatedAmount: parseFloat(newItemAmount),
      spentAmount: 0,
      icon: newItemIcon
    };

    const success = await addBudgetItem(budget.id, newItem);
    if (success) {
      setNewItemName('');
      setNewItemAmount('');
      setNewItemIcon('circle');
      setShowAddForm(false);
    } else {
      alert('Failed to add envelope item');
    }
  };

  return (
    <div className="budget-item-full border-t pt-6 mt-6 first:mt-0 first:pt-0 first:border-t-0" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 bg-${budget.color}-500/20 rounded-lg`}>
            <Icon name={budget.icon} className={`w-6 h-6 text-${budget.color}-400`}/>
          </div>
          <div>
            <h4 className="font-semibold text-lg flex items-center">
              {budget.name}
              {budget.isCardAssigned && <CreditCard className="w-4 h-4 text-green-400 ml-2" />}
            </h4>
            <p className="text-sm text-text-secondary">
              {budget.items && budget.items.length > 0 ?
                (
                  <>
                    <span className="font-mono">Rs {totalSpentFromItems.toLocaleString('en-US')}</span> of <span className="font-mono">Rs {totalAllocated.toLocaleString('en-US')}</span> (Envelopes)
                  </>
                ) :
                (
                  <>
                    Spent <span className="font-mono">Rs {budget.spent.toLocaleString('en-US')}</span> of <span className="font-mono">Rs {budget.limit.toLocaleString('en-US')}</span>
                  </>
                )
              }
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-medium text-lg ${percentage > 90 ? 'text-red-400' : ''}`}>{percentage}% Used</p>
          {/* We will make these buttons functional later */}
          <div className="flex gap-2 mt-2">
            {assignButton}
            <button onClick={onUpdate} className="text-xs btn-secondary py-1 px-2 rounded">Update</button>
            <button onClick={onDelete} className="text-xs btn-danger py-1 px-2 rounded">Delete</button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-sidebar rounded-full h-3 mb-4">
        <div className={`bg-green-500 h-3 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>

      {/* Envelope items toggle and list */}
      {budget.items && budget.items.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs btn-secondary py-1 px-3 rounded flex items-center space-x-1"
            >
              <span>{isExpanded ? 'Hide Envelopes' : 'Show Envelopes'}</span>
              <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-xs btn-primary py-1 px-3 rounded"
            >
              Add Item
            </button>
          </div>

          {isExpanded && (
            <>
              <div className="space-y-3">
                {budget.items.map((item) => (
                  <div key={item.id} className="p-3 bg-white/10 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/20 rounded-full">
                          <Icon name={item.icon} className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm">{item.name}</h5>
                          <p className="text-xs text-text-secondary">
                            <span className="font-mono">Rs {item.spentAmount.toLocaleString('en-US')}</span> of <span className="font-mono">Rs {item.allocatedAmount.toLocaleString('en-US')}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBudgetItem(budget.id, item.id);
                          }}
                          className="text-xs btn-danger py-1 px-2 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {/* Mini progress bar for envelope item */}
                    <div className="w-full bg-sidebar rounded-full h-2 mt-2">
                      {item.allocatedAmount > 0 && (
                        <div className={`bg-green-500 h-2 rounded-full`}
                          style={{ width: `${Math.min(100, Math.round((item.spentAmount / item.allocatedAmount) * 100))}%` }}></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {showAddForm && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h5 className="font-semibold text-sm mb-2">Add Envelope Item</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-text-primary mb-1">Item Name</label>
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Enter item name"
                        className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-text-primary mb-1">Amount (PKR)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-text-secondary">Rs</span>
                        <input
                          type="number"
                          value={newItemAmount}
                          onChange={(e) => setNewItemAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-3 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-text-primary mb-1">Icon</label>
                      <select
                        value={newItemIcon}
                        onChange={(e) => setNewItemIcon(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                      >
                        <option value="circle">Circle</option>
                        <option value="shopping-cart">Shopping</option>
                        <option value="food">Food</option>
                        <option value="gas-pump">Gas</option>
                        <option value="zap">Utilities</option>
                        <option value="home">Home</option>
                        <option value="heart">Health</option>
                        <option value="movie">Entertainment</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleAddItem}
                      className="w-full btn-primary py-2 px-4 rounded-lg"
                      disabled={!newItemName || !newItemAmount || parseFloat(newItemAmount) <= 0}
                    >
                      Add Item
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="w-full btn-secondary py-2 px-4 rounded-lg mt-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default BudgetItem;