// src/components/modals/CreateBudgetModal.jsx
import { useState } from 'react';

// The component receives props to control it:
// isOpen: a boolean to show/hide it
// onClose: a function to call when the user clicks "Cancel" or the background
// onSubmit: a function to call when the form is submitted
function CreateBudgetModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');

  if (!isOpen) {
    return null; // If it's not open, render nothing
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name, parseFloat(limit)); // Pass the data up to the parent
    // Clear the form for next time
    setName('');
    setLimit('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-panel rounded-lg p-6 w-11/12 max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4">Create New Budget</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="budget-name" className="block text-sm font-medium text-text-primary mb-1">Budget Name</label>
            <input 
              type="text" 
              id="budget-name" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-sidebar border-slate-600 rounded-md p-2" 
              placeholder="e.g., Groceries" 
              required 
            />
          </div>
          <div>
            <label htmlFor="budget-limit" className="block text-sm font-medium text-text-primary mb-1">Monthly Limit</label>
            <input 
              type="number" 
              id="budget-limit" 
              value={limit}
              onChange={e => setLimit(e.target.value)}
              className="w-full bg-sidebar border-slate-600 rounded-md p-2" 
              placeholder="e.g., 25000" 
              required 
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" className="btn-secondary py-2 px-4 rounded-lg" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary py-2 px-4 rounded-lg">Create Budget</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBudgetModal;