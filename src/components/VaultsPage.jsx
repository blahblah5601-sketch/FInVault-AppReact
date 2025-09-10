// src/components/VaultsPage.jsx
import { useState } from 'react'; // <-- Import useState
import VaultItem from './VaultItem';
import CreateVaultModal from './modals/CreateVaultModal'; // <-- Import the new modal
import VaultActionModal from './modals/VaultActionModal'; // <-- Import action modal
import { createVault, handleVaultTransaction } from '../api'; // <-- Import the new API function
import { Plus } from 'lucide-react'; // <-- 1. Import STATIC icons directly
import Icon from './Icon';

function VaultsPage({ vaults , accounts, showToast }) {
  // Separate the main savings account from the other goal vaults
  const savingsAccount = vaults.find(v => v.isSavingsAccount);
  const goalVaults = vaults.filter(v => !v.isSavingsAccount);
  const [isCreateVaultModalOpen, setIsCreateVaultModalOpen] = useState(false); // State for the modal
  const totalSaved = vaults.reduce((sum, v) => sum + v.current, 0);
  const [actionModalState, setActionModalState] = useState({ isOpen: false, vault: null, type: '' });

  const handleCreateVault = async (name, target) => {
    const success = await createVault(name, target);
    if (success) setIsCreateVaultModalOpen(false);
    else alert("Failed to create vault.");
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


  return (
    <><section id="vaults" className="page-section">
          <div className="flex justify-between items-center mb-6">
              <div>
                  <h2 className="text-2xl font-semibold">Savings Vaults</h2>
                  <p className="text-sm text-text-secondary mt-1">
                      Total Saved: <span className="font-bold text-base">Rs {totalSaved.toLocaleString('en-US')}</span>
                  </p>
              </div>
          </div>

          {/* Render the special Savings Account container if it exists */}
          {savingsAccount && (
              <div id="savings-account-container" className="mb-8">
                  <div className="bg-background/50 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between border-2 border-green-500/50">
                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                          <div className={`p-3 bg-${savingsAccount.color}-500/20 rounded-lg`}>
                              <Icon name={savingsAccount.icon} className="w-8 h-8 text-green-400" />
                          </div>
                          <div>
                              <h4 className="font-semibold text-lg">{savingsAccount.name}</h4>
                              {/* <p className="text-sm text-text-secondary">Saved: Rs {Math.floor(savingsAccount.current).toLocaleString('en-US')}</p> */}
                          </div>
                      </div>
                      <div className="text-center md:text-right mb-4 md:mb-0 md:mx-auto">
                          <p className="text-2xl font-bold font-mono">Rs {Math.floor(savingsAccount.current).toLocaleString('en-US')}</p>
                          <p className="text-sm mt-1 text-green-400">Interest Bearing ({(savingsAccount.returnRate * 100).toFixed(0)}% APR)</p>
                      </div>
                      <div className="flex gap-4 md:flex-col md:w-36">
                          <button onClick={() => handleOpenActionModal(savingsAccount, 'withdraw')} className="flex-1 btn-secondary py-2 rounded-lg">Withdraw</button>
                          <button onClick={() => handleOpenActionModal(savingsAccount, 'deposit')} className="flex-1 btn-primary py-2 rounded-lg">Deposit</button>
                      </div>
                  </div>
              </div>
          )}

          <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Goal Vaults</h3>
              <button
                  onClick={() => setIsCreateVaultModalOpen(true)}
                  id="new-vault-btn"
                  className="btn-primary py-2 px-4 rounded-lg flex items-center"
              >
                  <Plus className="w-5 h-5 mr-2" />
                  New Vault
              </button>
          </div>

          {/* Render the list of Goal Vaults */}
          <div id="vaults-list" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goalVaults.map(vault => (
            <VaultItem 
              key={vault.id} 
              vault={vault}
              onDeposit={() => handleOpenActionModal(vault, 'deposit')}
              onWithdraw={() => handleOpenActionModal(vault, 'withdraw')}
            />
          ))}
          </div>
      </section>
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
    </>
  );
}

export default VaultsPage;