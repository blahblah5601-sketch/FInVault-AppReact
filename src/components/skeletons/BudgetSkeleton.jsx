// src/components/skeletons/BudgetSkeleton.jsx
import LoadingSkeleton from '../LoadingSkeleton';

function BudgetSkeleton() {
  return (
    <div className="bg-background/50 p-4 rounded-xl flex flex-col h-full">
      {/* Icon and name */}
      <div className="flex items-center space-x-3 mb-4">
        <LoadingSkeleton width="40px" height="40px" rounded="lg" />
        <LoadingSkeleton width="120px" height="20px" />
      </div>

      {/* Amount */}
      <div className="text-center my-auto py-2">
        <LoadingSkeleton width="140px" height="32px" className="mx-auto mb-2" />
        <LoadingSkeleton width="80px" height="16px" className="mx-auto" />
      </div>

      {/* Progress bar */}
      <LoadingSkeleton height="10px" rounded="full" className="mt-auto" />
    </div>
  );
}

export default BudgetSkeleton;