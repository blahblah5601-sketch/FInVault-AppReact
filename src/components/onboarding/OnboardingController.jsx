// src/components/onboarding/OnboardingController.jsx
import { useState, useEffect } from 'react';
import { getUserPreferences, updateUserPreferences } from '../../api';
import DashboardWizard from './DashboardWizard';
import TooltipChain from './TooltipChain';

const OnboardingController = ({ children, activePage }) => {
  // Default to true to prevent flash — will be set correctly once prefs load
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [pagesVisited, setPagesVisited] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding state from Firestore once on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const prefs = await getUserPreferences();
        if (prefs) {
          // Only override defaults if prefs exist
          setOnboardingCompleted(prefs.onboardingCompleted ?? false);
          setOnboardingStep(prefs.onboardingStep ?? 0);
          setPagesVisited(prefs.pagesVisited ?? []);
        } else {
          // No prefs at all = brand new user = start onboarding
          setOnboardingCompleted(false);
        }
      } catch (err) {
        console.error('Failed to load onboarding state:', err);
        // Fail safe — never block the app
        setOnboardingCompleted(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []); // runs once on mount only

  const completeStep = async () => {
    const nextStep = onboardingStep + 1;
    setOnboardingStep(nextStep);
    // Save progress to Firestore so user can resume if they close the app mid-tour
    await updateUserPreferences({ onboardingStep: nextStep });
  };

  const finishOnboarding = async () => {
    setOnboardingCompleted(true);
    // Reset step counter and mark completed
    await updateUserPreferences({
      onboardingCompleted: true,
      onboardingStep: 0
    });
  };

  const markPageVisited = async (page) => {
    const updated = [...pagesVisited, page];
    setPagesVisited(updated);
    await updateUserPreferences({ pagesVisited: updated });
  };

  // While loading prefs, render children silently — no flash, no spinner
  // The wizard will appear once isLoading becomes false if needed
  return (
    <>
      {children}
      {/* Only show onboarding after prefs have loaded AND onboarding not completed */}
      {!isLoading && !onboardingCompleted && (
        <DashboardWizard
          step={onboardingStep}
          onCompleteStep={completeStep}
          onSkip={finishOnboarding}
          onComplete={finishOnboarding}
        />
      )}
      {/* TooltipChain shown after wizard is done, on a per-page basis */}
      {!isLoading && onboardingCompleted && (
        <TooltipChain
          activePage={activePage}
          pagesVisited={pagesVisited}
          onMarkVisited={markPageVisited}
        />
      )}
    </>
  );
};

export default OnboardingController;