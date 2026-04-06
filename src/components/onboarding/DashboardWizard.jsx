// src/components/onboarding/DashboardWizard.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Welcome to FinVault',
    render: ({ onNext }) => (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">FV</span>
        </div>
        <p className="text-text-secondary text-sm">
          Your secure all-in-one financial companion for managing money, budgets, and payments.
        </p>
        <button onClick={onNext} className="btn-primary py-2 px-6 rounded-lg w-full">
          Let's get started
        </button>
      </div>
    )
  },
  {
    id: 2,
    title: 'Your Account',
    render: ({ onNext }) => (
      <div className="space-y-4">
        <p className="text-text-secondary text-sm">
          The hero card shows your active account balance and masked IBAN. Tap the eye icon to show or hide your balance at any time.
        </p>
        <div className="bg-background/50 p-4 rounded-xl border border-white/10">
          <p className="text-xs text-text-muted uppercase tracking-wider">Active Account</p>
          <p className="font-bold text-lg mt-1">Primary Account</p>
          <p className="text-3xl font-extrabold mt-2">Rs 50,000</p>
          <p className="font-mono text-sm opacity-50 mt-2">PK36 **** **** **** 8021</p>
        </div>
        <button onClick={onNext} className="btn-primary py-2 px-6 rounded-lg w-full">
          Got it
        </button>
      </div>
    )
  },
  {
    id: 3,
    title: 'Quick Actions',
    render: ({ onNext }) => (
      <div className="space-y-4">
        <p className="text-text-secondary text-sm">
          All your most-used actions are icon buttons inside the account card. Hover over any icon to see a tooltip. Tap any icon to get started.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji: '💸', label: 'Send' },
            { emoji: '➕', label: 'Add' },
            { emoji: '⬛', label: 'QR' },
            { emoji: '📡', label: 'NFC' },
            { emoji: '📊', label: 'Budgets' },
            { emoji: '🛡️', label: 'Vaults' },
            { emoji: '💳', label: 'Payments' },
            { emoji: '🏦', label: 'Accounts' }
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center p-2 bg-white/10 rounded-xl">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-xs text-text-muted mt-1">{item.label}</span>
            </div>
          ))}
        </div>
        <button onClick={onNext} className="btn-primary py-2 px-6 rounded-lg w-full">
          Continue
        </button>
      </div>
    )
  },
  {
    id: 4,
    title: 'Navigation',
    render: ({ onNext }) => (
      <div className="space-y-4">
        <p className="text-text-secondary text-sm">
          Use the sidebar on the left to switch between Budgets, Vaults, Payments, Accounts, Card Control, Transactions, and Settings.
        </p>
        <p className="text-text-secondary text-sm">
          You can turn icon tooltips on or off in Settings → Dashboard at any time.
        </p>
        <button onClick={onNext} className="btn-primary py-2 px-6 rounded-lg w-full">
          I understand
        </button>
      </div>
    )
  },
  {
    id: 5,
    title: "You're ready!",
    render: ({ onComplete }) => (
      <div className="text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <p className="text-text-secondary text-sm">
          You've learned the basics. Start managing your finances with confidence.
        </p>
        <button onClick={onComplete} className="btn-primary py-2 px-6 rounded-lg w-full">
          Go to Dashboard
        </button>
      </div>
    )
  }
];

const DashboardWizard = ({ step, onCompleteStep, onSkip, onComplete }) => {
  const currentStep = steps[step] || steps[steps.length - 1];
  if (!currentStep) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <div className="relative bg-panel rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs text-text-muted">Step {currentStep.id} of {steps.length}</p>
              <h3 className="text-lg font-semibold">{currentStep.title}</h3>
            </div>
            <button
              onClick={onSkip}
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Skip tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-sidebar rounded-full h-1 mb-5">
            <motion.div
              className="bg-primary h-1 rounded-full"
              initial={{ width: `${((currentStep.id - 1) / steps.length) * 100}%` }}
              animate={{ width: `${(currentStep.id / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step content — rendered as actual JSX via render function */}
          {currentStep.render({ onNext: onCompleteStep, onComplete })}

          {/* Skip link (except on last step) */}
          {currentStep.id < steps.length && (
            <button
              onClick={onSkip}
              className="w-full text-xs text-text-muted mt-3 hover:text-text-primary transition-colors py-1"
            >
              Skip tour
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DashboardWizard;