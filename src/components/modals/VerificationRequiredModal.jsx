// src/components/modals/VerificationRequiredModal.jsx

function VerificationRequiredModal({ isOpen, onClose, userEmail, onResend }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#0B0F1A] border border-[#1E293B] shadow-2xl rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-300" style={{ fontFamily: "'Sora', sans-serif" }}>
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#EF4444]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white text-center mb-2">Email Verification Required</h3>
        <p className="text-sm text-[#64748B] text-center mb-6">Please verify your email address to continue</p>

        {/* Email Info */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 mb-6">
          <p className="text-xs text-[#64748B] mb-1">Account Email</p>
          <p className="text-sm text-white font-medium break-all">{userEmail}</p>
        </div>

        {/* Resend Button */}
        <button
          type="button"
          onClick={onResend}
          className="w-full bg-[#F5A623] hover:bg-[#E8991D] text-[#0B0F1A] font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#F5A623]/30 mb-3"
        >
          Send Verification Email
        </button>

        {/* Note */}
        <p className="text-xs text-[#475569] text-center leading-relaxed">
          A verification link has been sent to your email. Please check your inbox (including spam folder) and click the link to activate your account.
        </p>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-2 text-sm text-[#64748B] hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default VerificationRequiredModal;
