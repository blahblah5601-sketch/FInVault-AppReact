// src/components/BudgetItem.jsx
import { useState } from 'react';
import Icon from './Icon';
import { CreditCard } from 'lucide-react'; // Importing CreditCard icon for assigned budgets

function BudgetItem({ budget, onUpdate, onDelete, onAssign, canAssignMore, addBudgetItem, removeBudgetItem, showToast, preferences }) {
  const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
  const [isExpanded, setIsExpanded] = useState(preferences?.showEnvelopeItemsExpanded ?? false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('circle');

  // Map tailwind color names to hex values for inline styles
  const colorMap = {
    green: '#0e7c6e',
    red: '#d63b3b',
    blue: '#2056d4',
    yellow: '#c9a84c',
    purple: '#7c3aed',
    teal: '#0e7c6e',
  };
  const budgetColorHex = budget.color && budget.color.includes('#') ? budget.color : (colorMap[budget.color] || '#2056d4');

  let assignButton;
  if (budget.isCardAssigned) {
    assignButton = <button onClick={() => onAssign(budget, 'unassign')} className="text-xs" style={{ borderRadius: 99, padding: '4px 12px', fontSize: 11, background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-soft)', cursor: 'pointer' }}>Unassign</button>;
  } else if (canAssignMore) {
    assignButton = <button onClick={() => onAssign(budget, 'assign')} className="text-xs" style={{ borderRadius: 99, padding: '4px 12px', fontSize: 11, background: budgetColorHex, color: 'white', border: 'none', cursor: 'pointer' }}>Assign to Card</button>;
  } else {
    assignButton = <button className="text-xs" style={{ borderRadius: 99, padding: '4px 12px', fontSize: 11, background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-soft)', cursor: 'not-allowed' }} disabled>Slots Full</button>;
  }

  // Calculate total allocated amount from envelope items
  const totalAllocated = budget.items?.reduce((sum, item) => sum + item.allocatedAmount, 0) || 0;

  // Calculate total spent from envelope items
  const totalSpentFromItems = budget.items?.reduce((sum, item) => sum + item.spentAmount, 0) || 0;

  const handleAddItem = async () => {
    if (!newItemName || !newItemAmount || parseFloat(newItemAmount) <= 0) {
      showToast('Please enter a valid name and amount');
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
      showToast('Failed to add envelope item');
    }
  };

  return (
    <div style={{
      borderRadius: 16,
      border: '1px solid var(--color-border-soft)',
      padding: 18,
      background: 'var(--color-panel)',
      borderTop: `3px solid ${budgetColorHex}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500 }}>
            {budget.name}
            {budget.isCardAssigned && <CreditCard className="w-4 h-4 inline ml-2" style={{ color: budgetColorHex }} />}
          </p>
        </div>
        <p style={{ fontSize: 12, fontWeight: 600, color: budgetColorHex }}>{percentage}%</p>
      </div>

      {/* Progress bar */}
      <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.06)', marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, borderRadius: 99, background: budgetColorHex }}></div>
      </div>

      {/* Spent / Limit */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 14 }}>
        <span style={{ color: 'var(--color-text-muted)' }}>Spent: <strong style={{ fontFamily: 'Space Mono', color: 'var(--color-text-primary)' }}>Rs {budget.spent.toLocaleString('en-US')}</strong></span>
        <span style={{ color: 'var(--color-text-muted)' }}>Limit: <strong style={{ fontFamily: 'Space Mono', color: 'var(--color-text-primary)' }}>Rs {budget.limit.toLocaleString('en-US')}</strong></span>
      </div>

      {/* Action buttons as pills */}
      <div className="flex gap-2 flex-wrap">
        {assignButton}
        <button
          onClick={onUpdate}
          style={{ borderRadius: 99, padding: '4px 12px', fontSize: 11, background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-soft)', cursor: 'pointer' }}
        >Update</button>
        <button
          onClick={onDelete}
          style={{ borderRadius: 99, padding: '4px 12px', fontSize: 11, background: 'var(--color-red-accent)', color: 'white', border: 'none', cursor: 'pointer' }}
        >Delete</button>
      </div>

      {/* Envelope items toggle and list */}
      {budget.items && budget.items.length > 0 && (
        <>
          <div className="flex justify-between items-center" style={{ marginBottom: 10, marginTop: 10 }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1"
              style={{ borderRadius: 99, padding: '4px 12px', fontSize: 11, background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-soft)', cursor: 'pointer' }}
            >
              <span>{isExpanded ? 'Hide Envelopes' : 'Show Envelopes'}</span>
              <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              style={{ borderRadius: 99, padding: '4px 12px', fontSize: 11, background: budgetColorHex, color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Add Item
            </button>
          </div>

          {isExpanded && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {budget.items.map((item) => (
                  <div key={item.id} style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 12, border: '1px solid var(--color-border-soft)' }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${budgetColorHex}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={item.icon} style={{ width: 18, height: 18, color: budgetColorHex }} />
                        </div>
                        <div>
                          <h5 style={{ fontSize: 12, fontWeight: 500 }}>{item.name}</h5>
                          <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            <span style={{ fontFamily: 'Space Mono' }}>Rs {item.spentAmount.toLocaleString('en-US')}</span> of <span style={{ fontFamily: 'Space Mono' }}>Rs {item.allocatedAmount.toLocaleString('en-US')}</span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBudgetItem(budget.id, item.id);
                          }}
                          style={{ borderRadius: 99, padding: '3px 10px', fontSize: 10, background: 'var(--color-red-accent)', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {/* Mini progress bar for envelope item */}
                    <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', marginTop: 8, overflow: 'hidden' }}>
                      {item.allocatedAmount > 0 && (
                        <div
                          style={{ height: '100%', width: `${Math.min(100, Math.round((item.spentAmount / item.allocatedAmount) * 100))}%`, borderRadius: 99, background: budgetColorHex }}
                        ></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {showAddForm && (
                <div className="mt-4" style={{ padding: 16, background: 'var(--color-bg)', borderRadius: 12, border: '1px solid var(--color-border-soft)' }}>
                  <h5 style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Add Envelope Item</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Item Name</label>
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Enter item name"
                        className="w-full"
                        style={{ padding: '8px 12px', fontSize: 12, background: 'var(--color-panel)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-soft)', borderRadius: 10, outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label className="block" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Amount (PKR)</label>
                      <div>
                        <span style={{ position: 'relative' }}>
                          <input
                            type="number"
                            value={newItemAmount}
                            onChange={(e) => setNewItemAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full"
                            style={{ padding: '8px 12px', paddingLeft: 28, fontSize: 12, background: 'var(--color-panel)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-soft)', borderRadius: 10, outline: 'none' }}
                          />
                          <span style={{ position: 'absolute', left: 10, top: 10, fontSize: 10, color: 'var(--color-text-muted)' }}>Rs</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Icon</label>
                      <select
                        value={newItemIcon}
                        onChange={(e) => setNewItemIcon(e.target.value)}
                        className="w-full"
                        style={{ padding: '8px 12px', fontSize: 12, background: 'var(--color-panel)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-soft)', borderRadius: 10, outline: 'none' }}
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
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={handleAddItem}
                      style={{ width: '100%', padding: '9px 16px', fontSize: 13, background: budgetColorHex, color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer' }}
                      disabled={!newItemName || !newItemAmount || parseFloat(newItemAmount) <= 0}
                    >
                      Add Item
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      style={{ width: '100%', padding: '9px 16px', fontSize: 13, background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-soft)', borderRadius: 10, marginTop: 8, cursor: 'pointer' }}
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