// src/components/AccountsPage.jsx
import { useState, useEffect } from 'react';
import { getAccounts, createSubAccount, deleteSubAccount, setActiveSubAccount } from '../api';
import { formatIBAN, BANK_BICS } from '../utils/ibanUtils';
import { Plus, Trash2, Loader2, Menu } from 'lucide-react';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';

const AccountsPage = ({ showToast }) => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [selectedBic, setSelectedBic] = useState('FNVT'); // Default to FinVault
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load accounts on mount
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accountsData = await getAccounts();
        setAccounts(accountsData);
        // Find the active account (main account or active sub-account)
        const active = accountsData.find(acc => acc.accountLevel === 'main' || acc.isActive);
        if (active) {
          setActiveAccountId(active.id);
        }
      } catch (error) {
        console.error('Failed to load accounts:', error);
        showToast('Failed to load accounts');
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, [showToast]);

  // Handle creating a new sub-account
  const handleCreateSubAccount = async (e) => {
    e.preventDefault();
    if (!newAccountName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      // Find the main account to use as parent
      const mainAccount = accounts.find(acc => acc.accountLevel === 'main');
      if (!mainAccount) {
        showToast('No main account found');
        return;
      }

      const success = await createSubAccount(newAccountName, selectedBic, mainAccount.id);
      if (success) {
        setIsCreating(false);
        setNewAccountName('');
        setSelectedBic('FNVT');
        showToast('Sub-account created successfully');
        // Reload accounts
        const accountsData = await getAccounts();
        setAccounts(accountsData);
      } else {
        setIsCreating(false);
        showToast('Failed to create sub-account');
      }
    } catch (error) {
      setIsCreating(false);
      console.error('Error creating sub-account:', error);
      showToast('Failed to create sub-account');
    }
  };

  // Handle deleting a sub-account
  const handleDeleteSubAccount = async (account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    setIsDeleting(true);
    const success = await deleteSubAccount(accountToDelete.id);
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    if (success) {
      showToast(`Sub-account '${accountToDelete.name}' deleted.`);
      // Reload accounts
      const accountsData = await getAccounts();
      setAccounts(accountsData);
    } else {
      showToast('Failed to delete sub-account.');
    }
    setAccountToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAccountToDelete(null);
  };

  // Handle setting active sub-account
  const handleSetActiveSubAccount = async (accountId) => {
    try {
      const success = await setActiveSubAccount(accountId);
      if (success) {
        setActiveAccountId(accountId);
        showToast('Active account updated');
      } else {
        showToast('Failed to set active account');
      }
    } catch (error) {
      console.error('Error setting active sub-account:', error);
      showToast('Failed to set active account');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const mainAccount = accounts.find(acc => acc.accountLevel === 'main');
  const subAccounts = accounts.filter(acc => acc.accountLevel === 'sub');

  return (
    <div className="min-h-[calc(100vh-64px)] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <p className="text-text-secondary">Manage your main account and sub-accounts</p>
      </div>

      {/* Main Account Card */}
      {mainAccount && (
        <div className="bg-background/50 p-6 rounded-2xl mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary">🏦</span>
            </div>
            <div>
              <h2 className="font-semibold">Main Account</h2>
              <p className="text-text-secondary">Primary checking account</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <p className="text-sm font-medium text-text-secondary">Account Number</p>
              <p className="ml-auto font-mono text-text-primary">{mainAccount.accountNumber}</p>
            </div>
            <div className="flex items-center">
              <p className="text-sm font-medium text-text-secondary">IBAN</p>
              <div className="ml-auto flex items-center space-x-2">
                <p className="font-mono text-text-primary">{formatIBAN(mainAccount.ibanNumber)}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(mainAccount.ibanNumber);
                    showToast('IBAN copied to clipboard');
                  }}
                  className="text-xs btn-secondary py-1 px-2 rounded hover:bg-primary/20"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <p className="text-sm font-medium text-text-secondary">Bank</p>
              <p className="ml-auto text-text-primary">{mainAccount.bankName}</p>
            </div>
            <div className="flex items-center">
              <p className="text-sm font-medium text-text-secondary">Balance</p>
              <p className="ml-auto font-mono text-text-primary">Rs {mainAccount.balance?.toLocaleString('en-US') || '0.00'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Accounts Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Sub-Accounts</h2>
        {subAccounts.length > 0 ? (
          <div className="space-y-4">
            {subAccounts.map((account) => (
              <div key={account.id} className="bg-background/50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary text-sm">#{account.subAccountIndex}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{account.name}</h3>
                      <p className="text-sm text-text-secondary">{account.bankName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.isActive
                      ? <span className="text-xs btn-primary py-1 px-2 rounded">Active</span>
                      : <button onClick={() => handleSetActiveSubAccount(account.id)} className="text-xs btn-secondary py-1 px-2 rounded">Set Active</button>
                    }
                    <button onClick={() => handleDeleteSubAccount(account)} className="text-xs btn-danger py-1 px-2 rounded">Delete</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-text-secondary">Account No</p><p className="font-mono">{account.accountNumber}</p></div>
                  <div><p className="text-text-secondary">Balance</p><p className="font-mono">Rs {account.balance?.toLocaleString('en-US') || '0'}</p></div>
                  <div className="col-span-2">
                    <p className="text-text-secondary">IBAN</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs">{formatIBAN(account.ibanNumber)}</p>
                      <button onClick={() => { navigator.clipboard.writeText(account.ibanNumber); showToast('IBAN copied'); }} className="text-xs btn-secondary py-1 px-2 rounded">Copy</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">
            No sub-accounts yet. Create one to get started.
          </p>
        )}
      </div>

      {/* Create Sub-Account Form */}
      <div className="bg-background/50 p-6 rounded-2xl">
        <h2 className="text-xl font-semibold mb-4">Add Sub-Account</h2>
        <form onSubmit={handleCreateSubAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Account Name</label>
            <input
              type="text"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              placeholder="e.g., Savings, Business, etc."
              className="w-full px-4 py-2 rounded border border-white/20 bg-background/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isCreating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bank</label>
            <select
              value={selectedBic}
              onChange={(e) => setSelectedBic(e.target.value)}
              className="w-full px-4 py-2 rounded border border-white/20 bg-background/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isCreating}
            >
              {Object.entries(BANK_BICS).map(([key, { code, name, color }]) => (
                <option key={code} value={code} style={{ color }}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setNewAccountName('');
                setSelectedBic('FNVT');
              }}
              className="btn-secondary py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !newAccountName.trim()}
              className={`btn-primary py-2 px-4 rounded ${isCreating ? 'opacity-50' : ''}`}
            >
              {isCreating ? 'Creating...' : 'Create Sub-Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Delete Confirmation Modal
  {isDeleteModalOpen && (
    <ConfirmDeleteModal
      isOpen={isDeleteModalOpen}
      onClose={handleCancelDelete}
      onConfirm={handleConfirmDelete}
      itemType="sub-account"
      itemName={accountToDelete?.name || ''}
      isDeleting={isDeleting}
    />
  )}
};

export default AccountsPage;