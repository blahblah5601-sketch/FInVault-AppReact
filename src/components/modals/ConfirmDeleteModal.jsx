// src/components/modals/ConfirmDeleteModal.jsx
import { AlertTriangle, LoaderCircle } from 'lucide-react';

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, itemType, itemName, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-11/12 max-w-sm mx-4 p-6 shadow-2xl text-center" style={{
        backgroundColor: 'var(--color-panel)',
        borderRadius: '16px',
        border: '1px solid var(--color-border)'
      }} onClick={e => e.stopPropagation()}>
        {isDeleting ? (
          <>
            <LoaderCircle className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: 'var(--color-primary)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Deleting...</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Deleting {itemType} <span className="font-bold">'{itemName}'</span>.
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-red-accent)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Are you sure?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              This will permanently delete the {itemType} <span className="font-bold">'{itemName}'</span>.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={onClose} className="py-[10px] px-5 text-sm font-medium transition-colors"
                style={{ borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', fontFamily: "'Sora', sans-serif" }}>
                Cancel
              </button>
              <button onClick={onConfirm} className="py-[10px] px-5 text-sm font-medium text-white transition-colors"
                style={{ borderRadius: '10px', backgroundColor: 'var(--color-red-accent)', border: 'none', fontFamily: "'Sora', sans-serif" }}
                onMouseEnter={e => e.target.style.backgroundColor = '#b82e2e'}
                onMouseLeave={e => e.target.style.backgroundColor = 'var(--color-red-accent)'}>
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
