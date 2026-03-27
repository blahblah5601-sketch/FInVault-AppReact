// src/components/PageLoading.jsx
import BudgetSkeleton from './skeletons/BudgetSkeleton';
import VaultSkeleton from './skeletons/VaultSkeleton';
import LoadingSkeleton from './LoadingSkeleton';

function PageLoading({ page }) {
  if (page === 'dashboard') {
    return (
      <section className="page-section space-y-8">
        {/* Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LoadingSkeleton height="224px" rounded="2xl" />
          </div>
          <LoadingSkeleton height="224px" rounded="2xl" />
        </div>

        {/* Budget Jars */}
        <div>
          <LoadingSkeleton width="200px" height="24px" className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BudgetSkeleton />
            <BudgetSkeleton />
            <BudgetSkeleton />
          </div>
        </div>

        {/* Vaults */}
        <div>
          <LoadingSkeleton width="200px" height="24px" className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <VaultSkeleton />
            <VaultSkeleton />
            <VaultSkeleton />
          </div>
        </div>
      </section>
    );
  }

  if (page === 'budgets') {
    return (
      <section className="page-section space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <LoadingSkeleton width="150px" height="32px" className="mb-2" />
            <LoadingSkeleton width="200px" height="16px" />
          </div>
          <LoadingSkeleton width="140px" height="40px" rounded="lg" />
        </div>

        <LoadingSkeleton height="200px" rounded="2xl" />

        <div className="bg-background/50 p-6 rounded-2xl space-y-6">
          <LoadingSkeleton height="120px" />
          <LoadingSkeleton height="120px" />
          <LoadingSkeleton height="120px" />
        </div>
      </section>
    );
  }

  // Default loading
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-sidebar border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}

export default PageLoading;