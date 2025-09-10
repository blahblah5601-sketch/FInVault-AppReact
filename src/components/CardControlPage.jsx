// src/components/CardControlPage.jsx
import { useState, useEffect } from 'react';
import { updateUserPreferences, getUserPreferences } from '../api';
import { Snowflake, CheckCircle2, Link, LibrarySquare } from 'lucide-react';
import CardGraphic from './CardGraphic';
import ConfirmActionModal from './modals/ConfirmActionModal'; 

function CardControlPage({ accounts, budgets, showToast }) {
  // State for this page's interactive elements
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [activeAccountId, setActiveAccountId] = useState('current');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [nextAccountId, setNextAccountId] = useState(null);
  const mainAccount = accounts.find(a => a.id === 'current');
  const assignedBudgets = budgets.filter(b => b.isCardAssigned);

  useEffect(() => {
      const loadPreferences = async () => {
        const prefs = await getUserPreferences();
        if (prefs) {
          setIsCardFrozen(prefs.isCardFrozen || false);
          setActiveAccountId(prefs.activeAccountId || 'current');
        }
      };
      loadPreferences();
    }, []);// The empty array [] ensures this runs only once
  
  const handleFreezeToggle = async () => {
    setIsCardFrozen(!isCardFrozen);
    setIsCardFrozen(newFrozenState);
    await updateUserPreferences({ isCardFrozen: newFrozenState });
  };

  const handleAccountChange = (event) => {
    setNextAccountId(event.target.value); // Store the desired account
    setIsConfirmModalOpen(true); // Open the modal
  };

  const handleConfirmAccountChange = async () => {
    if (nextAccountId) {
      setActiveAccountId(nextAccountId); // Update the UI state
      await updateUserPreferences({ activeAccountId: nextAccountId }); // Save to database
      showToast("Active card account has been changed.");
    }
    setIsConfirmModalOpen(false); // Close the modal
    setNextAccountId(null); // Reset for next time
  };
  
  const displayAccounts = mainAccount ? [
    mainAccount,
    ...assignedBudgets.map(b => ({ id: b.id, name: `${b.name} Jar`, balance: b.limit - b.spent }))
  ] : [];

  const activeAccount = displayAccounts.find(acc => acc.id === activeAccountId) || mainAccount;
  
  return (
    <><section id="card-control" className="page-section">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Card Control</h2>
          <div id="smart-card-display-control" className={`card-gradient p-6 rounded-2xl shadow-lg relative h-56 ${isCardFrozen ? 'grayscale' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-text-secondary">Active Account</p>
                <h3 className="text-xl font-semibold">{activeAccount?.name}</h3>
              </div>
              <CardGraphic className="w-10 h-10 text-white" />
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-lg font-mono tracking-widest text-text-primary">**** **** **** 8021</p>
            </div>
            {isCardFrozen && (
              <div id="card-frozen-overlay-control" className="absolute inset-0 bg-black bg-opacity-60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Snowflake className="w-16 h-16 text-blue-300" n />
                <p className="text-2xl font-bold text-blue-200 ml-4">Card Frozen</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex items-center justify-between bg-background/50 p-4 rounded-xl">
            <div className="flex items-center">
              <Snowflake className="w-6 h-6 mr-3 text-blue-400" />
              <span className="font-medium">Freeze Card</span>
            </div>
            <label htmlFor="freeze-toggle" className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                id="freeze-toggle"
                className="sr-only peer"
                checked={isCardFrozen}
                onChange={handleFreezeToggle} />
              <div className="w-11 h-6 bg-interactive peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
        <div className="bg-background/50 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Rotate Active Account</h3>
          <p className="text-sm text-text-secondary mb-6">Select which account or budget jar your card should use.</p>
          {/* The `onChange` now triggers the confirmation flow */}
          <div className="space-y-3" id="account-selector" onChange={handleAccountChange}>
            {/* Account list is now dynamically rendered */}
            {displayAccounts.map(account => (
              <label key={account.id} htmlFor={`acc-${account.id}`} className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors border ${activeAccountId === account.id ? 'bg-green-500/20 border-green-500' : 'bg-panel border-transparent'} hover:bg-sidebar`}>
                <input type="radio" id={`acc-${account.id}`} name="activeAccount" value={account.id} className="hidden" defaultChecked={account.id === activeAccountId} />
                <div className="flex-1">
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-text-secondary">Available: Rs {account.balance.toLocaleString('en-US')}</p>
                </div>
                {activeAccountId === account.id && <CheckCircle2 className="w-6 h-6 text-green-500" />}
              </label>
            ))}
          </div>
        </div>
        {/* --- ADD THIS NEW SECTION --- */}
        <div className="bg-background/50 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Advanced Features</h3>
          <div className="space-y-3">
            <button
              onClick={() => showToast('Coming Soon!')}
              className="w-full btn-secondary p-4 rounded-lg flex items-center text-left"
            >
              <Link className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>Link External Bank Account</span>
            </button>
            <button
              onClick={() => showToast('Coming Soon!')}
              className="w-full btn-secondary p-4 rounded-lg flex items-center text-left"
            >
              <LibrarySquare className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>Generate Virtual Card</span>
            </button>
          </div>
        </div>
      </div>
    </section>
    <ConfirmActionModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAccountChange}
        title="Confirm Account Change"
        message="Are you sure you want to rotate your active card account?" 
    />
  </>
  );
}

export default CardControlPage;