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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg p-6 w-11/12 max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4">Create New Goal Vault</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vault-name" className="block text-sm font-medium text-slate-300 mb-1">Vault Name</label>
            <input 
              type="text" 
              id="vault-name" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-700 border-slate-600 rounded-md p-2" 
              placeholder="e.g., Vacation Fund" 
              required 
            />
          </div>
          <div>
            <label htmlFor="vault-target" className="block text-sm font-medium text-slate-300 mb-1">Target Amount</label>
            <input 
              type="number" 
              id="vault-target" 
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="w-full bg-slate-700 border-slate-600 rounded-md p-2" 
              placeholder="e.g., 100000" 
              required 
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" className="btn-secondary py-2 px-4 rounded-lg" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary py-2 px-4 rounded-lg">Create Vault</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateVaultModal;