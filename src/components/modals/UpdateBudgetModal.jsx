// src/components/modals/UpdateBudgetModal.jsx
import { useState, useEffect } from 'react';

function UpdateBudgetModal({ isOpen, onClose, onSubmit, budgetToEdit }) {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');

  // When the modal opens, pre-fill the form with the budget's current data
  useEffect(() => {
    if (budgetToEdit) {
      setName(budgetToEdit.name);
      setLimit(budgetToEdit.limit);
    }
  }, [budgetToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(budgetToEdit.id, name, parseFloat(limit));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg p-6 w-11/12 max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4">Update Budget</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="update-budget-name" className="block text-sm font-medium text-slate-300 mb-1">Budget Name</label>
            <input 
              type="text" 
              id="update-budget-name" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-700 border-slate-600 rounded-md p-2" 
              required 
            />
          </div>
          <div>
            <label htmlFor="update-budget-limit" className="block text-sm font-medium text-slate-300 mb-1">Monthly Limit</label>
            <input 
              type="number" 
              id="update-budget-limit" 
              value={limit}
              onChange={e => setLimit(e.target.value)}
              className="w-full bg-slate-700 border-slate-600 rounded-md p-2" 
              required 
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" className="btn-secondary py-2 px-4 rounded-lg" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary py-2 px-4 rounded-lg">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateBudgetModal;