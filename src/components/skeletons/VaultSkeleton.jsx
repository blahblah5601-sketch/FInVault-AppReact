// src/components/skeletons/VaultSkeleton.jsx
import LoadingSkeleton from '../LoadingSkeleton';

function VaultSkeleton() {
  return (
    <div className="bg-background/50 p-6 rounded-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <LoadingSkeleton width="48px" height="48px" rounded="lg" />
          <div>
            <LoadingSkeleton width="140px" height="20px" className="mb-2" />
            <LoadingSkeleton width="100px" height="16px" />
          </div>
        </div>
        <LoadingSkeleton width="24px" height="24px" rounded="md" />
      </div>

      {/* Amount */}
      <div className="text-center my-4 flex-1">
        <LoadingSkeleton width="180px" height="36px" className="mx-auto mb-2" />
        <LoadingSkeleton width="100px" height="20px" className="mx-auto" />
      </div>

      {/* Progress bar */}
      <LoadingSkeleton height="12px" rounded="full" className="mb-4" />

      {/* Buttons */}
      <div className="flex gap-4">
        <LoadingSkeleton height="40px" rounded="lg" className="flex-1" />
        <LoadingSkeleton height="40px" rounded="lg" className="flex-1" />
      </div>
    </div>
  );
}

export default VaultSkeleton;