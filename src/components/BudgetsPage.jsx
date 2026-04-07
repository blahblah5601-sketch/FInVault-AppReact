// src/components/BudgetsPage.jsx
import { createBudget, updateBudget, deleteBudget, toggleBudgetCardAssignment, getUserPreferences, updateUserPreferences, addBudgetItem as addBudgetItemApi, removeBudgetItem as removeBudgetItemApi } from '../api';
import { useState, useEffect } from 'react';
import BudgetItem from './BudgetItem';
import { Plus } from 'lucide-react';
import CreateBudgetModal from './modals/CreateBudgetModal';
import UpdateBudgetModal from './modals/UpdateBudgetModal';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';

function BudgetsPage({ budgets, showToast }) {
  // Calculate summary totals from the budgets prop
  const MAX_CARD_ASSIGNMENTS = 3;
  const MAX_BUDGETS = 5;
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const assignedCount = budgets.filter(b => b.isCardAssigned).length;
  const canAssignMore = assignedCount < MAX_CARD_ASSIGNMENTS;

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // 1. Add isDeleting state

  // State for visual view preference (loaded from user preferences)
  const [useVisualBudgetView, setUseVisualBudgetView] = useState(false);

  // Load user preference for visual view on mount
  useEffect(() => {
    const loadPreference = async () => {
      const prefs = await getUserPreferences();
      if (prefs && prefs.useVisualBudgetView !== undefined) {
        setUseVisualBudgetView(prefs.useVisualBudgetView);
      }
    };
    loadPreference();
  }, []);

  // Toggle visual view preference and update user preferences
  const toggleVisualView = async () => {
    const newView = !useVisualBudgetView;
    setUseVisualBudgetView(newView);
    try {
      await updateUserPreferences({ useVisualBudgetView: newView });
    } catch (error) {
      console.error("Failed to update user preferences:", error);
      showToast("Failed to save preference");
    }
  };

  const addBudgetItem = async (budgetId, item) => {
    return await addBudgetItemApi(budgetId, item);
  };

  const removeBudgetItem = async (budgetId, itemId) => {
    return await removeBudgetItemApi(budgetId, itemId);
  };

  const handleCreateBudget = async (name, limit) => {
    const success = await createBudget(name, limit);
    if (success) setIsModalOpen(false);
    else showToast("Failed to create budget.");
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
      showToast("Failed to update budget.");
    }
  };

  const handleOpenDeleteModal = (budget) => {
    setItemToDelete(budget);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      setIsDeleting(true); //  Set isDeleting to true when deletion starts
      const success = await deleteBudget(itemToDelete);
      setIsDeleting(false); // Reset the deleting state
      setIsDeleteModalOpen(false); // Now close the modal
      if (success) {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        showToast(`Budget '${itemToDelete.name}' was deleted.`);
      } else {
        showToast("Failed to delete budget.");
      }
    }
  };

  const handleAssignBudget = async (budget, action) => {
    const result = await toggleBudgetCardAssignment(budget, budgets, action);
    if (!result.success) {
      showToast(result.message); // Use the toast to show errors
    }
  };

  // Function to generate a random color for budgets (if needed, but we use budget.color)
  // We don't need this because budgets already have a color

  // Function to calculate the angle for a budget segment in the donut chart
  const getAngle = (limit, total) => {
    return (limit / total) * 360;
  };

  // Function to convert polar coordinates to Cartesian coordinates for SVG path
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // Function to describe the arc for a budget segment
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;
  };

  return (
    <>
      <section id="budgets" className="page-section space-y-8">
        <div className="flex justify-between items-center" style={{ fontFamily: 'Sora' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 500 }}>My Budgets</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {budgets.length} of {MAX_BUDGETS} budgets created.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={toggleVisualView}
              className={`${useVisualBudgetView ? 'bg-primary/20 text-primary' : ''}`}
              style={{ fontFamily: 'Sora', padding: '10px 18px', fontSize: 13, background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-soft)', borderRadius: 10, cursor: 'pointer' }}
            >
              {useVisualBudgetView ? 'List View' : 'Visual View'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              id="new-budget-btn"
              style={{ fontFamily: 'Sora', padding: '10px 18px', fontSize: 13, background: 'var(--color-accent, #1a1f3a)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Plus className="w-4 h-4" style={{ marginRight: 6 }} />
              New Budget
            </button>
          </div>
        </div>

        {useVisualBudgetView ? (
          // Visual View (Donut Chart)
          <div style={{ borderRadius: 16, border: '1px solid var(--color-border-soft)', padding: 18, background: 'var(--color-panel)', textAlign: 'center' }}>
            {totalBudgeted > 0 ? (
              <>
                <div style={{ marginBottom: 6 }}>
                  <svg style={{ width: 96, height: 96, margin: '0 auto 16px' }} viewBox="0 0 100 100">
                    {/* Donut chart background (circle) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="10"
                    />
                    {/* Budget segments */}
                    {budgets.map((budget, index) => {
                      const startAngle = budgets.slice(0, index).reduce((sum, b) => sum + b.limit, 0);
                      const endAngle = startAngle + budget.limit;
                      const startAngleDeg = getAngle(startAngle, totalBudgeted);
                      const endAngleDeg = getAngle(endAngle, totalBudgeted);
                      return (
                        <path
                          key={budget.id}
                          d={describeArc(50, 50, 40, startAngleDeg, endAngleDeg)}
                          fill={budget.color}
                          stroke="var(--color-bg)"
                          strokeWidth="2"
                          cursor="pointer"
                          onClick={() => handleOpenUpdateModal(budget)}
                        />
                      );
                    })}
                    {/* Center circle (hole of the donut) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="20"
                      fill="var(--color-bg)"
                    />
                    {/* Total budgeted amount in the center */}
                    <text
                      x="50"
                      y="55"
                      textAnchor="middle"
                      fill="var(--color-text-primary)"
                      fontWeight="700"
                      fontSize="8"
                    >
                      Rs {totalBudgeted.toLocaleString('en-US')}
                    </text>
                  </svg>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Total Budgeted
                  </p>
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 32 }}>
                No budgets to display. Create a budget to get started.
              </p>
            )}
          </div>
        ) : (
          // List View (existing functionality)
          <>
            {/* Budget Summary - now with live data */}
            <div style={{ borderRadius: 16, border: '1px solid var(--color-border-soft)', padding: 18, background: 'var(--color-panel)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Monthly Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ textAlign: 'center' }}>
                <div style={{ padding: 14, background: 'var(--color-bg)', borderRadius: 12 }}>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Total Budgeted</p>
                  <p style={{ fontFamily: 'Space Mono', fontSize: 20, fontWeight: 700 }}>Rs {totalBudgeted.toLocaleString('en-US')}</p>
                </div>
                <div style={{ padding: 14, background: 'var(--color-bg)', borderRadius: 12 }}>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Total Spent</p>
                  <p style={{ fontFamily: 'Space Mono', fontSize: 20, fontWeight: 700 }}>Rs {totalSpent.toLocaleString('en-US')}</p>
                </div>
                <div style={{ padding: 14, background: 'var(--color-bg)', borderRadius: 12 }}>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Remaining</p>
                  <p style={{ fontFamily: 'Space Mono', fontSize: 20, fontWeight: 700 }}>Rs {totalRemaining.toLocaleString('en-US')}</p>
                </div>
              </div>
            </div>

            {/* Budget List - now dynamically rendered */}
            <div id="budgets-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {budgets.map(budget => (
                <BudgetItem
                  key={budget.id}
                  budget={budget}
                  onUpdate={() => handleOpenUpdateModal(budget)}
                  onDelete={() => handleOpenDeleteModal(budget)}
                  onAssign={handleAssignBudget}
                  canAssignMore={canAssignMore}
                  addBudgetItem={addBudgetItem}
                  removeBudgetItem={removeBudgetItem}
                  showToast={showToast}
                />
              ))}
            </div>
          </>
        )}

        {/* Modals */}
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

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemType="budget"
          itemName={itemToDelete?.name}
          isDeleting={isDeleting}
        />
      </section>
    </>
  );
}

export default BudgetsPage;