// src/components/modals/ConfirmDeleteModal.jsx
import { AlertTriangle, LoaderCircle } from 'lucide-react'; // 1. Import the icon

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, itemType, itemName, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-panel rounded-lg p-6 w-11/12 max-w-sm text-center" onClick={e => e.stopPropagation()}>
        {/* 3. Add conditional rendering */}
        {isDeleting ? (
          <>
            <LoaderCircle className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Deleting...</h3>
            <p className="text-text-secondary">
              Deleting.. {itemType} <span className="font-bold text-white">'{itemName}'</span>.
            </p>
          </>
        ) : (
        <>
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Are you sure?</h3>
        <p className="text-text-secondary mb-6">
          This will permanently delete the {itemType} <span className="font-bold text-white">'{itemName}'</span>.
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={onClose} className="btn-secondary py-2 px-6 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="btn-danger py-2 px-6 rounded-lg">Delete</button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;