// src/components/AccountsPage.jsx
import { useState, useEffect } from 'react';
import { getAccounts, createSubAccount, deleteSubAccount, setActiveSubAccount } from '../api';
import { formatIBAN, BANK_BICS } from '../utils/ibanUtils';
import { Plus, Trash2, Loader2, Copy, Check, Building2, Wallet } from 'lucide-react';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';

const AccountsPage = ({ accounts: accountsProp, showToast }) => {
  const [localAccounts, setLocalAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [selectedBic, setSelectedBic] = useState('FNVT');
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedIban, setCopiedIban] = useState(null);

  // Use prop data if available, otherwise fetch own data
  const accounts = accountsProp && accountsProp.length > 0 ? accountsProp : localAccounts;

  useEffect(() => {
    if (!accountsProp || accountsProp.length === 0) {
      const loadAccounts = async () => {
        try {
          const accountsData = await getAccounts();
          setLocalAccounts(accountsData);
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
    } else {
      const active = accountsProp.find(acc => acc.accountLevel === 'main' || acc.isActive);
      if (active) {
        setActiveAccountId(active.id);
      }
      setIsLoading(false);
    }
  }, [showToast, accountsProp]);

  const handleCopyIban = (iban, accountName) => {
    navigator.clipboard.writeText(iban);
    setCopiedIban(iban);
    showToast('IBAN copied to clipboard');
    setTimeout(() => setCopiedIban(null), 2000);
  };

  const handleCreateSubAccount = async (e) => {
    e.preventDefault();
    if (!newAccountName.trim() || isCreating) return;

    setIsCreating(true);
    try {
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
        const accountsData = await getAccounts();
        setLocalAccounts(accountsData);
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
      const accountsData = await getAccounts();
      setLocalAccounts(accountsData);
    } else {
      showToast('Failed to delete sub-account.');
    }
    setAccountToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAccountToDelete(null);
  };

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
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-gold)' }} />
      </div>
    );
  }

  const mainAccount = accounts.find(acc => acc.accountLevel === 'main');
  const subAccounts = accounts.filter(acc => acc.accountLevel === 'sub');

  return (
    <>
      <section className="flex flex-col overflow-y-auto p-4" style={{ color: 'var(--color-text-primary)' }}>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Accounts</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage your main account and sub-accounts</p>
        </div>

        {/* Main Account Card */}
        {mainAccount && (
          <div className="rounded-panel p-6 border mb-6" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                backgroundColor: 'rgba(201,168,76,0.15)',
                color: 'var(--color-gold)',
              }}>
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Main Account</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                    backgroundColor: 'rgba(14,124,110,0.15)',
                    color: 'var(--color-teal)',
                  }}>
                    Primary
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{mainAccount.bankName}</p>
              </div>
            </div>

            <div className="rounded-sm-panel p-4 mb-4" style={{
              background: 'linear-gradient(135deg, var(--color-accent, #1a1f3a), #2a3060)',
              color: 'white',
            }}>
              <div className="text-[10px] tracking-[1px] mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                AVAILABLE BALANCE
              </div>
              <div className="font-mono text-[26px] font-bold tracking-[-0.5px]">
                Rs {mainAccount.balance?.toLocaleString('en-US') || '0.00'}
              </div>
              <div className="font-mono text-[11px] tracking-[2px] mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {'PK'}{mainAccount.ibanNumber?.substring(0, 4)} {formatIBAN(mainAccount.ibanNumber)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCopyIban(mainAccount.ibanNumber, mainAccount.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-panel text-xs font-medium transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {copiedIban === mainAccount.ibanNumber ? <Check className="w-3.5 h-3.5" style={{ color: '#14b8a0' }} /> : <Copy className="w-3.5 h-3.5" />}
                {copiedIban === mainAccount.ibanNumber ? 'Copied' : 'Copy IBAN'}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-sm-panel p-3" style={{ backgroundColor: 'rgba(13,15,26,0.06)' }}>
                <p className="text-[10px] uppercase tracking-[0.5px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Account Number</p>
                <p className="text-sm font-mono font-medium">{mainAccount.accountNumber}</p>
              </div>
              <div className="rounded-sm-panel p-3" style={{ backgroundColor: 'rgba(13,15,26,0.06)' }}>
                <p className="text-[10px] uppercase tracking-[0.5px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Bank</p>
                <p className="text-sm font-medium">{mainAccount.bankName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Accounts Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sub-Accounts</h3>
            {subAccounts.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                backgroundColor: 'rgba(32,86,212,0.12)',
                color: 'var(--color-blue-accent)',
              }}>
                {subAccounts.length} account{subAccounts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {subAccounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subAccounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-panel p-4 border transition-all duration-150"
                  style={{
                    backgroundColor: 'var(--color-panel)',
                    borderColor: account.isActive ? 'var(--color-gold)' : 'var(--color-border)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                        backgroundColor: account.isActive ? 'rgba(201,168,76,0.15)' : 'rgba(14,124,110,0.12)',
                        color: account.isActive ? 'var(--color-gold)' : 'var(--color-teal)',
                      }}>
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{account.name}</h4>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{account.bankName}</p>
                      </div>
                    </div>
                    {account.isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{
                        backgroundColor: 'rgba(14,124,110,0.15)',
                        color: 'var(--color-teal)',
                      }}>
                        Active
                      </span>
                    )}
                  </div>

                  {/* Balance */}
                  <div className="font-mono text-lg font-bold mb-3">
                    Rs {account.balance?.toLocaleString('en-US') || '0'}
                  </div>

                  {/* Account details */}
                  <div className="rounded-sm-panel p-3 mb-3" style={{ backgroundColor: 'rgba(13,15,26,0.06)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] uppercase tracking-[0.5px]" style={{ color: 'var(--color-text-muted)' }}>Account No</p>
                      <p className="text-xs font-mono">{account.accountNumber}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.5px]" style={{ color: 'var(--color-text-muted)' }}>IBAN</p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-mono">{formatIBAN(account.ibanNumber)}</p>
                        <button
                          onClick={() => handleCopyIban(account.ibanNumber, account.name)}
                          className="p-1 rounded transition-colors"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {copiedIban === account.ibanNumber ? <Check className="w-3 h-3" style={{ color: '#14b8a0' }} /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!account.isActive && (
                      <button
                        onClick={() => handleSetActiveSubAccount(account.id)}
                        className="flex-1 py-1.5 rounded text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: 'var(--color-accent, #1a1f3a)',
                          color: 'white',
                        }}
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSubAccount(account)}
                      className="py-1.5 px-3 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
                      style={{ backgroundColor: 'rgba(214,59,59,0.1)', color: 'var(--color-red-accent)' }}
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-panel p-8 border text-center" style={{
              backgroundColor: 'var(--color-panel)',
              borderColor: 'var(--color-border)',
            }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                backgroundColor: 'var(--color-interactive)',
              }}>
                <Wallet className="w-7 h-7" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <p className="text-sm font-medium mb-1">No sub-accounts yet</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Create one below to get started</p>
            </div>
          )}
        </div>

        {/* Create Sub-Account Form */}
        <div className="rounded-panel p-5 border mb-6" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{
              backgroundColor: 'rgba(14,124,110,0.12)',
              color: 'var(--color-teal)',
            }}>
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold">Add Sub-Account</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Create a new sub-account for better money management</p>
            </div>
          </div>

          <form onSubmit={handleCreateSubAccount} className="space-y-4">
            <div>
              <label className="form-label">Account Name</label>
              <input
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="e.g., Savings, Business, etc."
                className="form-input"
                disabled={isCreating}
              />
            </div>
            <div>
              <label className="form-label">Bank</label>
              <select
                value={selectedBic}
                onChange={(e) => setSelectedBic(e.target.value)}
                className="form-input"
                disabled={isCreating}
              >
                {Object.entries(BANK_BICS).map(([key, { code, name, color }]) => (
                  <option key={code} value={code} style={{ color }}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setNewAccountName('');
                  setSelectedBic('FNVT');
                }}
                className="py-2 px-4 rounded-panel text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !newAccountName.trim()}
                className="btn-primary py-2 px-4 rounded-panel text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isCreating ? 'Creating...' : 'Create Sub-Account'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemType="sub-account"
        itemName={accountToDelete?.name || ''}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default AccountsPage;