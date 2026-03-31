// src/components/SettingsPage.jsx
import { themes, applyTheme } from '../theme.js';
import { updateUserPreferences, getUserPreferences } from '../api.js';
import { useState, useEffect } from 'react';
import HintTooltip from './HintTooltip.jsx';

// --- 1. Use the COMPLETE themes object from your original project ---
function SettingsPage( { currentTheme, setCurrentTheme } ) {
  const [userPreferences, setUserPreferences] = useState({});
  const [showIconTooltips, setShowIconTooltips] = useState(true);
  const [usePlanetIcons, setUsePlanetIcons] = useState(true);
  const [showIBANOnHero, setShowIBANOnHero] = useState(true);
  const [showBalanceByDefault, setShowBalanceByDefault] = useState(true);
  const [showEnvelopeItemsExpanded, setShowEnvelopeItemsExpanded] = useState(false);
  const [useVisualBudgetView, setUseVisualBudgetView] = useState(false);
  const [budgetWarningThreshold, setBudgetWarningThreshold] = useState('80');
  const [requirePaymentConfirmation, setRequirePaymentConfirmation] = useState(true);
  const [saveCardDetailsSession, setSaveCardDetailsSession] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const prefs = await getUserPreferences();
      setUserPreferences(prefs);

      // Set state from preferences
      if (prefs.showIconTooltips !== undefined) setShowIconTooltips(prefs.showIconTooltips);
      if (prefs.usePlanetIcons !== undefined) setUsePlanetIcons(prefs.usePlanetIcons);
      if (prefs.showIBANOnHero !== undefined) setShowIBANOnHero(prefs.showIBANOnHero);
      if (prefs.showBalanceByDefault !== undefined) setShowBalanceByDefault(prefs.showBalanceByDefault);
      if (prefs.showEnvelopeItemsExpanded !== undefined) setShowEnvelopeItemsExpanded(prefs.showEnvelopeItemsExpanded);
      if (prefs.useVisualBudgetView !== undefined) setUseVisualBudgetView(prefs.useVisualBudgetView);
      if (prefs.budgetWarningThreshold !== undefined) setBudgetWarningThreshold(prefs.budgetWarningThreshold.toString());
      if (prefs.requirePaymentConfirmation !== undefined) setRequirePaymentConfirmation(prefs.requirePaymentConfirmation);
      if (prefs.saveCardDetailsSession !== undefined) setSaveCardDetailsSession(prefs.saveCardDetailsSession);
      if (prefs.compactMode !== undefined) setCompactMode(prefs.compactMode);
    };

    loadPreferences();
  }, []);

  const handleThemeSelect = async (themeName) => {
    setCurrentTheme(themeName);
    applyTheme(themeName);
    await updateUserPreferences({ theme: themeName });
  };

  const handleToggleChange = async (field, value) => {
    await updateUserPreferences({ [field]: value });
  };

  const handleSelectChange = async (field, value) => {
    await updateUserPreferences({ [field]: parseInt(value) });
  };

  return (
    <section id="settings" className="page-section">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      <div className="bg-background/50 p-6 rounded-2xl space-y-8">

        {/* Appearance Section */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Appearance</h3>
          <p className="text-sm text-text-secondary mb-6">Choose a color theme for your application.</p>
          <div id="theme-selector" className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.keys(themes).map(themeName => (
              <button
                key={themeName}
                onClick={() => handleThemeSelect(themeName)}
                className={`theme-btn p-4 rounded-lg border-2 transition-all ${
                  currentTheme === themeName ? 'border-white' : 'border-transparent'
                }`}
              >
                <div
                  className="h-12 w-full rounded-md mb-2"
                  style={{ background: `linear-gradient(135deg, ${themes[themeName]['--color-card-gradient-from']}, ${themes[themeName]['--color-card-gradient-to']})` }}
                ></div>
                <p className="font-medium text-text-secondary">{themeName}</p>
              </button>
            ))}
          </div>

          {/* Compact Mode Toggle */}
          <div className="mt-6 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={compactMode}
                onChange={(e) => handleToggleChange('compactMode', e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary rounded"
              />
              <span className="ml-3 text-text-primary">Compact Mode</span>
            </label>
            <HintTooltip hint="Reduces padding and font sizes across the app for a more dense layout">
              <svg className="ml-2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </HintTooltip>
          </div>
        </div>

        {/* Dashboard Section */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Dashboard</h3>

          {/* Show IBAN on Dashboard Hero */}
          <div className="mb-4 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showIBANOnHero}
                onChange={(e) => handleToggleChange('showIBANOnHero', e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary rounded"
              />
              <span className="ml-3 text-text-primary">Show IBAN on Dashboard Hero</span>
            </label>
            <HintTooltip hint="Display your full IBAN (partially masked) on the dashboard account card">
              <svg className="ml-2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </HintTooltip>
          </div>

          {/* Show balance by default */}
          <div className="mb-4 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showBalanceByDefault}
                onChange={(e) => handleToggleChange('showBalanceByDefault', e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary rounded"
              />
              <span className="ml-3 text-text-primary">Show balance by default</span>
            </label>
            <HintTooltip hint="When enabled, your balance is visible. When disabled, tap the eye icon to reveal it">
              <svg className="ml-2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </HintTooltip>
          </div>

          {/* Use Planet Icons on Dashboard */}
          <div className="mb-4 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={usePlanetIcons}
                onChange={(e) => handleToggleChange('usePlanetIcons', e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary rounded"
              />
              <span className="ml-3 text-text-primary">Use Planet Icons on Dashboard</span>
            </label>
            <HintTooltip hint="When enabled, shows animated planet icons for navigation. When disabled, shows simple icon grid">
              <svg className="ml-2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </HintTooltip>
          </div>
        </div>

        {/* Budgets Section */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Budgets</h3>

          {/* Show Envelope Items by default (expanded) */}
          <div className="mb-4 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showEnvelopeItemsExpanded}
                onChange={(e) => handleToggleChange('showEnvelopeItemsExpanded', e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary rounded"
              />
              <span className="ml-3 text-text-primary">Show Envelope Items by default (expanded)</span>
            </label>
            <HintTooltip hint="When enabled, budget cards will show their envelope items expanded by default">
              <svg className="ml-2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </HintTooltip>
          </div>

          {/* Use Visual (Donut) View by default */}
          <div className="mb-4 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useVisualBudgetView}
                onChange={(e) => handleToggleChange('useVisualBudgetView', e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary rounded"
              />
              <span className="ml-3 text-text-primary">Use Visual (Donut) View by default</span>
            </label>
            <HintTooltip hint="When enabled, the budgets page will open in the visual donut chart view instead of list view">
              <svg className="ml-2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </HintTooltip>
          </div>

          {/* Budget warning threshold */}
          <div className="mb-4">
            <label className="block text-text-primary mb-2">Budget warning threshold</label>
            <HintTooltip hint="When a budget reaches this percentage of its limit, it will turn yellow as a warning">
              <svg className="ml-2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </HintTooltip>
            <select
              value={budgetWarningThreshold}
              onChange={(e) => handleSelectChange('budgetWarningThreshold', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300 sm:text-sm"
            >
              <option value="70">70%</option>
              <option value="80">80%</option>
              <option value="90">90%</option>
            </select>
          </div>
        </div>

        {/* Payments Section */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Payments</h3>

          {/* Require confirmation before sending money */}
          <div className="mb-4 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={requirePaymentConfirmation}
                onChange={(e) => handleToggleChange('requirePaymentConfirmation', e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary rounded"
              />
              <span className="ml-3 text-text-primary">Require confirmation before sending money</span>
            </label>
            <HintTooltip hint="When enabled, you'll be asked to confirm before sending any money">
              <svg className="ml-2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </HintTooltip>
          </div>

          {/* Save card details for session */}
          <div className="mb-4 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={saveCardDetailsSession}
                onChange={(e) => handleToggleChange('saveCardDetailsSession', e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary rounded"
              />
              <span className="ml-3 text-text-primary">Save card details for session</span>
            </label>
            <HintTooltip hint="When enabled, card details are remembered for the current browser session only (never stored)">
              <svg className="ml-2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </HintTooltip>
          </div>
        </div>

        {/* Icon Tooltips Section */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Interface</h3>

          {/* Show tooltips on icon buttons */}
          <div className="mb-4 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showIconTooltips}
                onChange={(e) => handleToggleChange('showIconTooltips', e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary rounded"
              />
              <span className="ml-3 text-text-primary">Show tooltips on icon buttons</span>
            </label>
            <HintTooltip hint="When enabled, hovering or long-pressing any icon button shows a description of that action">
              <svg className="ml-2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </HintTooltip>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;