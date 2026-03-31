// src/components/onboarding/SpotlightOverlay.jsx
import { useEffect } from 'react';

const SpotlightOverlay = ({ step, onCompleteStep, onSkip }) => {
  // Define selectors and hints for each step
  const stepData = {
    1: { selector: '.hero-account-card', hint: 'This is your main account dashboard. See your total balance and IBAN at a glance.' },
    2: { selector: '.icon-button', hint: 'Access your most-used financial actions right from the dashboard.' },
    3: { selector: '#sidebar-nav', hint: 'Switch between different sections of the app using the navigation icons.' },
    4: { selector: '.budget-card', hint: 'Create and manage budgets to track your spending.' },
    5: { selector: '.vault-card', hint: 'Save money automatically in secure vaults for specific goals.' }
  };

  const data = stepData[step + 1];

  useEffect(() => {
    if (data) {
      const element = document.querySelector(data.selector);
      if (element) {
        element.setAttribute('data-spotlight', 'true');
        // Add click handler to advance to next step
        const handler = () => onCompleteStep();
        element.addEventListener('click', handler);
        return () => {
          element.removeAttribute('data-spotlight');
          element.removeEventListener('click', handler);
        };
      }
    }
  }, [step, data, onCompleteStep]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50"></div>

      {/* Spotlight cutout */}
      {data.selector && (
        <div
          className="fixed inset-0 -z-10"
          style={{
            pointerEvents: 'none',
            WebkitMask: `url(${data.selector}) no-repeat`,
            mask: `url(${data.selector}) no-repeat`,
            backgroundColor: 'black',
            backgroundBlendMode: 'destination-out',
            width: '100vw',
            height: '100vh'
          }}
        />
      )}

      {/* Tooltip */}
      <div className="fixed z-50 inset-0 flex items-end pb-10 pointer-events-none">
        <div className="w-full max-w-xs mx-auto text-center">
          <div className="bg-background/90 backdrop-blur-sm text-text-primary text-xs rounded-lg px-3 py-2 border border-white/20 shadow-lg">
            {data.hint}
          </div>
          <div className="mt-4 flex justify-center space-x-3">
            <button onClick={onCompleteStep} className="btn-primary py-2 px-6 rounded-lg">
              Got it
            </button>
            <button onClick={onSkip} className="text-xs btn-danger py-1 px-2 rounded">
              Skip Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightOverlay;