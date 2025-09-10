// src/components/modals/ConfirmActionModal.jsx

function ConfirmActionModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-panel rounded-lg p-6 w-11/12 max-w-sm text-center" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-slate-400 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button onClick={onClose} className="btn-secondary py-2 px-6 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="btn-primary py-2 px-6 rounded-lg">Proceed</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmActionModal;