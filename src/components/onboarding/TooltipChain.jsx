// src/components/onboarding/TooltipChain.jsx
import { useState, useEffect } from 'react';
import HintTooltip from '../HintTooltip.jsx';

const TooltipChain = ({ step, onCompleteStep, onSkip, pagesVisited, setPagesVisited }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Define tooltip chains for different pages
  // In a real app, these would be more specific to each page
  const tooltipChains = {
    budgets: [
      { selector: '.budget-card', hint: 'Click on a budget to view details or make changes', position: 'bottom' },
      { selector: '#new-budget-btn', hint: 'Click here to create a new budget', position: 'top' },
      { selector: '.visual-view-toggle', hint: 'Switch between list view and visual donut chart view', position: 'right' }
    ],
    vaults: [
      { selector: '.vault-card', hint: 'Tap a vault to see details or make a deposit/withdrawal', position: 'bottom' },
      { selector: '#new-vault-btn', hint: 'Create a new savings vault for your goals', position: 'top' }
    ],
    payments: [
      { selector: '.biller-card', hint: 'Manage your recurring billers and make quick payments', position: 'bottom' },
      { selector: '#add-biller-btn', hint: 'Add a new biller for recurring payments', position: 'top' },
      { selector: '.beneficiary-card', hint: 'Save frequent recipients for faster transfers', position: 'bottom' },
      { selector: '#add-beneficiary-btn', hint: 'Add a new beneficiary to your list', position: 'top' }
    ]
  };

  // Get current page path - simplified for now
  // In a real app, you'd use useLocation() from react-router-dom
  const getCurrentPage = () => {
    // This is a simplified version - in reality you'd check the current route
    return window.location.pathname.includes('budgets') ? 'budgets' :
           window.location.pathname.includes('vaults') ? 'vaults' :
           window.location.pathname.includes('payments') ? 'payments' : null;
  };

  useEffect(() => {
    const page = getCurrentPage();
    if (page && tooltipChains[page]) {
      const chain = tooltipChains[page];

      // Check if we've already shown this chain for this page
      if (!pagesVisited.includes(page)) {
        // Show the first tooltip in the chain
        if (chain.length > 0) {
          const tooltip = chain[currentIndex];
          if (tooltip) {
            const element = document.querySelector(tooltip.selector);
            if (element) {
              const rect = element.getBoundingClientRect();
              setPosition({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX
              });
              setIsOpen(true);
            }
          }
        }
      }
    }
  }, [step, pagesVisited]);

  const handleNext = () => {
    const page = getCurrentPage();
    if (page && tooltipChains[page]) {
      const chain = tooltipChains[page];
      if (currentIndex < chain.length - 1) {
        // Move to next tooltip in chain
        setCurrentIndex(prev => prev + 1);

        // Update position for next tooltip
        const tooltip = chain[currentIndex + 1];
        if (tooltip) {
          const element = document.querySelector(tooltip.selector);
          if (element) {
            const rect = element.getBoundingClientRect();
            setPosition({
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX
            });
          }
        }
      } else {
        // End of chain for this page
        setPagesVisited(prev => [...prev, page]);
        onCompleteStep();
      }
    }
  };

  if (!isOpen) return null;

  const page = getCurrentPage();
  const chain = page && tooltipChains[page] ? tooltipChains[page] : [];
  const currentTooltip = chain[currentIndex];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Tooltip */}
      <div className="fixed z-50 pointer-events-auto"
           style={{
             top: position.top - 10,
             left: position.left - 10
           }}>
        <HintTooltip hint={currentTooltip?.hint || ''}>
          {/* Tooltip content wrapper */}
          <div className="relative">
            {/* Arrow pointing to element */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-background/90
                         backdrop-blur-sm rounded rotate-45 border border-white/20"/>
            <div className="bg-background/90 backdrop-blur-sm text-text-primary text-xs
                         rounded-lg px-3 py-2 border border-white/20 shadow-lg max-w-xs w-48">
              {currentTooltip?.hint}
            </div>
          </div>
        </HintTooltip>
      </div>

      {/* Controls */}
      <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center space-x-2">
        <div className="flex space-x-3">
          {currentIndex > 0 && (
            <button onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="text-xs btn-secondary py-1 px-2 rounded">
              Previous
            </button>
          )}
          {currentIndex < chain.length - 1 ? (
            <button onClick={handleNext} className="btn-primary py-2 px-6 rounded-lg">
              Next
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary py-2 px-6 rounded-lg">
              Got it
            </button>
          )}
          <button onClick={onSkip} className="text-xs btn-danger py-1 px-2 rounded">
            Skip Tour
          </button>
        </div>
        <div className="text-text-secondary text-xs text-center">
          {currentIndex + 1}/{chain.length}
        </div>
      </div>
    </div>
  );
};

export default TooltipChain;