// src/components/BudgetsPage.jsx
import { createBudget , updateBudget } from '../api';
import { useState } from 'react';
import BudgetItem from './BudgetItem';
import CreateBudgetModal from './modals/CreateBudgetModal';
import UpdateBudgetModal from './modals/UpdateBudgetModal';


function BudgetsPage({ budgets }) {
  // Calculate summary totals from the budgets prop
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const totalRemaining = totalBudgeted - totalSpent;
  const MAX_BUDGETS = 5;

  const handleCreateBudget = async (name, limit) => {
    const success = await createBudget(name, limit);
    if (success) setIsModalOpen(false);
    else alert("Failed to create budget.");
  };

  const handleOpenUpdateModal = (budget) => {
    setBudgetToEdit(budget);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateBudget = async (budgetId, newName, newLimit) => {
    const success = await updateBudget(budgetId, newName, newLimit);
    if (success) {
      setIsUpdateModalOpen(false);
      setBudgetToEdit(null);
    } else {
      alert("Failed to update budget.");
    }
  };

  return (
    <><section id="budgets" className="page-section space-y-8">
          <div className="flex justify-between items-center">
              <div>
                  <h2 className="text-2xl font-semibold">My Budgets</h2>
                  <p className="text-sm text-slate-400 mt-1">
                      {budgets.length} of {MAX_BUDGETS} budgets created.
                  </p>
              </div>
              <button
                  onClick={() => setIsModalOpen(true)}
                  id="new-budget-btn"
                  className="btn-primary py-2 px-4 rounded-lg flex items-center"
              >
                  <i data-lucide="plus" className="w-5 h-5 mr-2"></i>
                  New Budget
              </button>
          </div>

          {/* Budget Summary - now with live data */}
          <div className="bg-slate-900/50 p-6 rounded-2xl">
              <h3 className="font-semibold text-lg mb-4">Monthly Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                      <p className="text-sm text-slate-400">Total Budgeted</p>
                      <p className="text-2xl font-bold font-mono">Rs {totalBudgeted.toLocaleString('en-US')}</p>
                  </div>
                  <div>
                      <p className="text-sm text-slate-400">Total Spent</p>
                      <p className="text-2xl font-bold font-mono">Rs {totalSpent.toLocaleString('en-US')}</p>
                  </div>
                  <div>
                      <p className="text-sm text-slate-400">Remaining</p>
                      <p className="text-2xl font-bold font-mono">Rs {totalRemaining.toLocaleString('en-US')}</p>
                  </div>
              </div>
          </div>

          {/* Budget List - now dynamically rendered */}
          <div id="budgets-list" className="bg-slate-900/50 p-6 rounded-2xl">
              {budgets.map(budget => (
                  <BudgetItem key={budget.id} budget={budget} onUpdate={() => handleOpenUpdateModal(budget)}/>
              ))}
          </div>
      </section>

        <CreateBudgetModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateBudget} 
        />

        <UpdateBudgetModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSubmit={handleUpdateBudget}
        budgetToEdit={budgetToEdit}
        />
    </>
  );
}

export default BudgetsPage;