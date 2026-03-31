// src/components/onboarding/OnboardingController.jsx
import { useState, useEffect } from 'react';
import { getUserPreferences, updateUserPreferences } from '../../api';
import DashboardWizard from './DashboardWizard';
import SpotlightOverlay from './SpotlightOverlay';
import TooltipChain from './TooltipChain';

const OnboardingController = ({ children }) => {
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [pagesVisited, setPagesVisited] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding state from Firestore on mount
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const prefs = await getUserPreferences();
        if (prefs) {
          setOnboardingCompleted(prefs.onboardingCompleted ?? false);
          setOnboardingStep(prefs.onboardingStep ?? 0);
          setPagesVisited(prefs.pagesVisited ?? []);
        }
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingState();
  }, []);

  // Save onboarding state to Firestore when it changes
  useEffect(() => {
    if (!isLoading) {
      const saveOnboardingState = async () => {
        try {
          await updateUserPreferences({
            onboardingCompleted,
            onboardingStep,
            pagesVisited
          });
        } catch (error) {
          console.error('Failed to save onboarding state:', error);
        }
      };

      saveOnboardingState();
    }
  }, [onboardingCompleted, onboardingStep, pagesVisited, isLoading]);

  // Handle completing a step
  const completeStep = () => {
    setOnboardingStep(prev => prev + 1);
  };

  // Handle skipping the tour
  const skipTour = () => {
    setOnboardingCompleted(true);
  };

  // Handle completing the entire onboarding
  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  // If onboarding is completed, render children (the actual app)
  if (onboardingCompleted) {
    return children;
  }

  // Show loading state while checking onboarding status
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render appropriate onboarding component based on step
  return (
    <>
      {/* Render the main app content underneath */}
      {children}

      {/* Onboarding overlay */}
      <div className="fixed inset-0 z-50 bg-black/50">
        {/* Dashboard Wizard (step-by-step modal) */}
        <DashboardWizard
          step={onboardingStep}
          onCompleteStep={completeStep}
          onSkip={skipTour}
          onComplete={completeOnboarding}
        />

        {/* Spotlight Overlay for feature highlights */}
        <SpotlightOverlay
          step={onboardingStep}
          onCompleteStep={completeStep}
          onSkip={skipTour}
        />

        {/* Tooltip Chain for page-specific walkthroughs */}
        <TooltipChain
          step={onboardingStep}
          onCompleteStep={completeStep}
          onSkip={skipTour}
          pagesVisited={pagesVisited}
          setPagesVisited={setPagesVisited}
        />
      </div>
    </>
  );
};

export default OnboardingController;