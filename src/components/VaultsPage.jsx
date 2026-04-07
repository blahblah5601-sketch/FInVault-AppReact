// src/components/VaultsPage.jsx
import { useState } from 'react'; // <-- Import useState
import VaultItem from './VaultItem';
import CreateVaultModal from './modals/CreateVaultModal'; // <-- Import the new modal
import VaultActionModal from './modals/VaultActionModal'; // <-- Import action modal
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import { createVault, handleVaultTransaction, deleteVault } from '../api'; // <-- Import the new API function
import { Plus } from 'lucide-react'; // <-- 1. Import STATIC icons directly
import Icon from './Icon';

function VaultsPage({ vaults , accounts, showToast }) {
  // Separate the main savings account from the other goal vaults
  const savingsAccount = vaults.find(v => v.isSavingsAccount);
  const goalVaults = vaults.filter(v => !v.isSavingsAccount);
  const [isCreateVaultModalOpen, setIsCreateVaultModalOpen] = useState(false); // State for the modal
  const totalSaved = vaults.reduce((sum, v) => sum + v.current, 0);
  const [actionModalState, setActionModalState] = useState({ isOpen: false, vault: null, type: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // 1. Add isDeleting state

  const handleCreateVault = async (name, target) => {
    const success = await createVault(name, target);
    if (success) setIsCreateVaultModalOpen(false);
    else showToast("Failed to create vault.");
  };

  const handleOpenActionModal = (vault, type) => {
    setActionModalState({ isOpen: true, vault: vault, type: type });
  };

  const handleCloseActionModal = () => {
    setActionModalState({ isOpen: false, vault: null, type: '' });
  };

  const handleActionSubmit = async (vault, actionType, amount) => {
    const result = await handleVaultTransaction(vault, accounts, actionType, amount);
    if (result.success) {
      handleCloseActionModal();
      showToast('Transaction successful!');
    if (result.goalReached) {
        // Show the celebration message!
        showToast(`Congratulations! You've reached your goal for '${result.vaultName}'! 🎉`);
      }
    } else {
      showToast(result.message); // Show error message from API
    }
  };

  const handleOpenDeleteModal = (vault) => {
    setItemToDelete(vault);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      setIsDeleting(true); // Show the "deleting" state in the modal
      const success = await deleteVault(itemToDelete);
      setIsDeleting(false); // Reset the deleting state
      setIsDeleteModalOpen(false); // Now close the modal
      if (success) {
        showToast(`Vault '${itemToDelete.name}' deleted.`);
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        showToast("Error: Could not delete vault.");
      }
    }
  };


  return (
    <section id="vaults" className="flex flex-col space-y-[22px]">
          <div className="flex justify-between items-center">
              <div>
                  <h2 className="text-2xl font-medium" style={{ fontFamily: "'Sora', sans-serif" }}>Savings Vaults</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {goalVaults.length} goal{goalVaults.length !== 1 ? 's' : ''} &middot; Total saved:{' '}
                      <span className="font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>Rs {totalSaved.toLocaleString('en-US')}</span>
                  </p>
              </div>
          </div>

          {/* Special Savings Account */}
          {savingsAccount && (
              <div id="savings-account-container">
                  <div className="rounded-panel p-5 flex flex-col md:flex-row md:items-center justify-between" style={{
                      backgroundColor: 'var(--color-panel)',
                      border: '1px solid var(--color-border)',
                      borderTop: '3px solid #0e7c6e'
                  }}>
                      <div className="flex items-center space-x-3 mb-4 md:mb-0">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: '#0e7c6e20' }}>
                              <Icon name={savingsAccount.icon} className="w-6 h-6" style={{ color: '#0e7c6e' }} />
                          </div>
                          <div>
                              <h4 className="font-medium text-sm">{savingsAccount.name}</h4>
                              <p className="text-xs" style={{ color: '#0e7c6e' }}>
                                  Interest Bearing ({(savingsAccount.returnRate * 100).toFixed(0)}% APR)
                              </p>
                          </div>
                      </div>
                      <div className="text-center md:text-right mb-3 md:mb-0 md:mx-auto">
                          <p className="font-bold font-mono text-xl" style={{ fontFamily: "'Space Mono', monospace" }}>
                              Rs {Math.floor(savingsAccount.current).toLocaleString('en-US')}
                          </p>
                      </div>
                      <div className="flex gap-3 md:w-44">
                          <button
                              onClick={() => handleOpenActionModal(savingsAccount, 'withdraw')}
                              className="flex-1 py-2 text-xs font-medium transition-colors"
                              style={{
                                  borderRadius: '10px', border: '1px solid var(--color-border)',
                                  background: 'transparent', color: 'var(--color-text-primary)',
                                  fontFamily: "'Sora', sans-serif"
                              }}
                          >
                              Withdraw
                          </button>
                          <button
                              onClick={() => handleOpenActionModal(savingsAccount, 'deposit')}
                              className="flex-1 py-2 text-xs font-medium text-white transition-colors"
                              style={{
                                  borderRadius: '10px', background: '#0e7c6e',
                                  border: 'none', fontFamily: "'Sora', sans-serif"
                              }}
                          >
                              Deposit
                          </button>
                      </div>
                  </div>
              </div>
          )}

          <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium" style={{ fontFamily: "'Sora', sans-serif" }}>Goal Vaults</h3>
              <button
                  onClick={() => setIsCreateVaultModalOpen(true)}
                  id="new-vault-btn"
                  className="py-[10px] px-[18px] text-sm font-medium text-white flex items-center transition-colors"
                  style={{
                      borderRadius: '10px',
                      backgroundColor: 'var(--color-accent, #1a1f3a)',
                      fontFamily: "'Sora', sans-serif",
                      border: 'none'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                  <Plus className="w-4 h-4 mr-2" />
                  New Goal
              </button>
          </div>

          {/* Vault list — 3-column grid matching reference */}
          <div id="vaults-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          {goalVaults.length > 0 ? goalVaults.map(vault => (
            <VaultItem
              key={vault.id}
              vault={vault}
              onDeposit={() => handleOpenActionModal(vault, 'deposit')}
              onWithdraw={() => handleOpenActionModal(vault, 'withdraw')}
              onDelete={() => handleOpenDeleteModal(vault)}
            />
          )) : (
            <div className="col-span-full text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No vaults yet. Create your first savings goal to get started.
            </div>
          )}
          </div>

      {/* Modals */}
      <CreateVaultModal
            isOpen={isCreateVaultModalOpen}
            onClose={() => setIsCreateVaultModalOpen(false)}
            onSubmit={handleCreateVault}
      />
      <VaultActionModal
        isOpen={actionModalState.isOpen}
        onClose={handleCloseActionModal}
        onSubmit={handleActionSubmit}
        vault={actionModalState.vault}
        actionType={actionModalState.type}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemType="vault"
        itemName={itemToDelete?.name}
        isDeleting={isDeleting}
      />
    </section>
  );
}

export default VaultsPage;