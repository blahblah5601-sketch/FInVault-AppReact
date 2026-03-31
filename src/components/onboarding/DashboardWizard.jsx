// src/components/onboarding/DashboardWizard.jsx
import { useState } from 'react';
import { X } from 'lucide-react';

const DashboardWizard = ({ step, onCompleteStep, onSkip, onComplete }) => {
  // Define the steps for the dashboard wizard
  const steps = [
    {
      id: 1,
      title: 'Welcome to FinVault',
      description: 'Show logo, brief description, "Let\'s get started" button',
      content: `
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-primary">FV</span>
          </div>
          <h3 className="text-lg font-semibold">Welcome to FinVault</h3>
          <p className="text-text-secondary">
            Your secure, all-in-one financial companion for managing money, budgets, and payments.
          </p>
          <button onClick={onCompleteStep} className="btn-primary py-2 px-6 rounded-lg">
            Let's get started
          </button>
        </div>
      `
    },
    {
      id: 2,
      title: 'Your Account',
      description: 'Highlight the hero card, explain balance and IBAN',
      content: `
        <div className="space-y-4">
          <h3 className="font-semibold">Your Account</h3>
          <p className="text-text-secondary">
            This is your main account dashboard. See your total balance and IBAN at a glance.
          </p>
          <div className="bg-background/50 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary">💳</span>
              </div>
              <div>
                <p className="font-medium">Primary Account</p>
                <p className="text-text-secondary">PK36 **** **** **** 8021</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-text-secondary">Total Balance: Rs 25,450.00</p>
            </div>
          </div>
          <button onClick={onCompleteStep} className="btn-primary py-2 px-6 rounded-lg">
            Got it
          </button>
        </div>
      `
    },
    {
      id: 3,
      title: 'Quick Actions',
      description: 'Highlight the 4 buttons (Send Money etc.), explain each',
      content: `
        <div className="space-y-4">
          <h3 className="font-semibold">Quick Actions</h3>
          <p className="text-text-secondary">
            Access your most-used financial actions right from the dashboard.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-primary">💸</span>
              </div>
              <p className="font-small text-text-secondary">Send Money</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-primary">➕</span>
              </div>
              <p className="font-small text-text-secondary">Add Funds</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-primary">📳</span>
              </div>
              <p className="font-small text-text-secondary">NFC Payment</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-primary">📊</span>
              </div>
              <p className="font-small text-text-secondary">Budgets</p>
            </div>
          </div>
          <button onClick={onCompleteStep} className="btn-primary py-2 px-6 rounded-lg">
            Continue
          </button>
        </div>
      `
    },
    {
      id: 4,
      title: 'Navigation',
      description: 'Highlight the planet buttons, explain they navigate to sections',
      content: `
        <div className="space-y-4">
          <h3 className="font-semibold">Navigation</h3>
          <p className="text-text-secondary">
            Switch between different sections of the app using the navigation icons.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary">🏦</span>
              </div>
              <p className="font-small text-text-secondary">Accounts</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary">💰</span>
              </div>
              <p className="font-small text-text-secondary">Vaults</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary">📋</span>
              </div>
              <p className="font-small text-text-secondary">Payments</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary">⚙️</span>
              </div>
              <p className="font-small text-text-secondary">Settings</p>
            </div>
          </div>
          <button onClick={onCompleteStep} className="btn-primary py-2 px-6 rounded-lg">
            I understand
          </button>
        </div>
      `
    },
    {
      id: 5,
      title: 'You\'re ready!',
      description: 'Confetti animation, "Go to Dashboard" button',
      content: `
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-primary">🎉</span>
          </div>
          <h3 className="text-lg font-semibold">You're ready!</h3>
          <p className="text-text-secondary">
            You've learned the basics. Start managing your finances with confidence.
          </p>
          <button onClick={onComplete} className="btn-primary py-2 px-6 rounded-lg">
            Go to Dashboard
          </button>
        </div>
      `
    }
  ];

  const currentStep = steps.find(s => s.id === step + 1) || steps[steps.length - 1];

  if (!currentStep) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-background/90 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md space-y-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{currentStep.title}</h3>
          <button onClick={onSkip} className="text-xs btn-danger py-1 px-2 rounded">
            Skip Tour
          </button>
        </div>

        <div className="text-text-secondary">{currentStep.description}</div>

        <div dangerouslySetInnerHTML={{ __html: currentStep.content }} />

        {step < steps.length && (
          <button onClick={onCompleteStep} className="w-full btn-primary py-2 px-6 rounded-lg">
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardWizard;