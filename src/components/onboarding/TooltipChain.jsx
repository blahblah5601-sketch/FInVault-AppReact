// src/components/onboarding/TooltipChain.jsx
// Note: activePage prop is required — this component uses state-based routing,
// NOT window.location.pathname which always returns the base deploy path.
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define tooltip chains per page
// selectors must match actual IDs/classes used in those page components
const CHAINS = {
  budgets: [
    {
      selector: '#new-budget-btn',
      hint: 'Tap here to create a new budget category for tracking your spending.'
    },
    {
      selector: '#budgets-list',
      hint: 'Your budgets appear here. Each one shows how much you have spent versus your limit.'
    }
  ],
  vaults: [
    {
      selector: '#new-vault-btn',
      hint: 'Tap here to create a new savings vault for a specific goal.'
    },
    {
      selector: '#vaults-list',
      hint: 'Each vault tracks your progress toward its savings target.'
    }
  ],
  payments: [
    {
      selector: '#payments',
      hint: 'This is your Payments hub. Manage billers, beneficiaries, and view recent payment history.'
    }
  ],
  accounts: [
    {
      selector: '#accounts-page',
      hint: 'View your main account IBAN and account number here. You can also create sub-accounts.'
    }
  ],
  transactions: [
    {
      selector: '#transaction-list',
      hint: 'All your transactions appear here in reverse chronological order.'
    }
  ]
};

const TooltipChain = ({ activePage, pagesVisited, onMarkVisited }) => {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);

  const chain = CHAINS[activePage] || [];
  const alreadyVisited = pagesVisited.includes(activePage);
  const currentTooltip = chain[index];

  // Reset index whenever the page changes
  useEffect(() => {
    setIndex(0);
  }, [activePage]);

  // Measure the target element whenever the current tooltip changes
  useEffect(() => {
    if (!currentTooltip || alreadyVisited) {
      setRect(null);
      return;
    }

    const measureTarget = () => {
      const el = document.querySelector(currentTooltip.selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height
        });
      } else {
        // Element not found (maybe not rendered yet) — hide tooltip
        setRect(null);
      }
    };

    // Small delay to allow page render to settle before measuring
    const timer = setTimeout(measureTarget, 150);

    window.addEventListener('resize', measureTarget);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureTarget);
    };
  }, [currentTooltip, alreadyVisited]);

  const handleNext = () => {
    if (index < chain.length - 1) {
      // Advance to next tooltip in chain
      setIndex(i => i + 1);
    } else {
      // End of chain — mark this page as visited so chain never shows again
      onMarkVisited(activePage);
    }
  };

  const handleSkip = () => {
    // Mark page as visited immediately
    onMarkVisited(activePage);
  };

  // Don't render if: no chain for this page, already visited, no tooltip found, or target not in DOM
  if (!currentTooltip || alreadyVisited || !rect || chain.length === 0) return null;

  // Position tooltip below the target if space allows, otherwise above
  const spaceBelow = window.innerHeight - (rect.top + rect.height);
  const tooltipTop = spaceBelow > 120
    ? rect.top + rect.height + 12
    : rect.top - 112;

  // Keep tooltip horizontally within viewport (tooltip is ~216px wide)
  const tooltipLeft = Math.max(
    16,
    Math.min(rect.left, window.innerWidth - 232)
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${activePage}-${index}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'fixed',
          top: tooltipTop,
          left: tooltipLeft,
          zIndex: 9999,
          width: 216
        }}
      >
        <div className="bg-panel border border-white/20 rounded-xl p-4 shadow-2xl">
          {/* Progress indicator */}
          <p className="text-xs text-text-muted mb-1">
            {index + 1} of {chain.length}
          </p>

          {/* Hint text */}
          <p className="text-sm text-text-secondary mb-3 leading-relaxed">
            {currentTooltip.hint}
          </p>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={handleNext}
              className="flex-1 btn-primary py-1.5 px-3 rounded-lg text-sm"
            >
              {index < chain.length - 1 ? 'Next' : 'Got it'}
            </button>
            <button
              onClick={handleSkip}
              className="text-xs text-text-muted hover:text-text-primary py-1.5 px-2 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Arrow pointing up toward the target element */}
        <div
          className="absolute -top-2 left-4 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '8px solid var(--color-panel)'
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default TooltipChain;