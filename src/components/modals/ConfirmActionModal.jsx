// src/components/modals/ConfirmActionModal.jsx

function ConfirmActionModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-11/12 max-w-sm mx-4 p-6 shadow-2xl text-center" style={{
        backgroundColor: 'var(--color-panel)',
        borderRadius: '16px',
        border: '1px solid var(--color-border)'
      }} onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-medium mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
        <div className="flex justify-center gap-3">
          <button onClick={onClose} className="py-[10px] px-5 text-sm font-medium transition-colors"
            style={{ borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', fontFamily: "'Sora', sans-serif" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="py-[10px] px-5 text-sm font-medium text-white transition-colors"
            style={{ borderRadius: '10px', backgroundColor: '#1a1f3a', border: 'none', fontFamily: "'Sora', sans-serif" }}
            onMouseEnter={e => e.target.style.backgroundColor = '#262d52'}
            onMouseLeave={e => e.target.style.backgroundColor = '#1a1f3a'}>
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmActionModal;
