// src/components/SettingsPage.jsx
import { themes, applyTheme } from '../theme.js';
import { updateUserPreferences, getUserPreferences } from '../api.js';
import { useState, useEffect } from 'react';
import HintTooltip from './HintTooltip.jsx';

function ToggleSwitch({ checked, onChange, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-colors duration-150"
      style={{
        backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-interactive)',
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-150"
        style={{
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}

function SettingRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
        {hint && (
          <HintTooltip hint={hint}>
            <svg className="h-4 w-4 cursor-default flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </HintTooltip>
        )}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

export default function SettingsPage({ currentTheme, setCurrentTheme, preferences }) {
  const [userPreferences, setUserPreferences] = useState(preferences || {});
  const [showIconTooltips, setShowIconTooltips] = useState(preferences?.showIconTooltips ?? true);
  const [usePlanetIcons, setUsePlanetIcons] = useState(preferences?.usePlanetIcons ?? true);
  const [showIBANOnHero, setShowIBANOnHero] = useState(preferences?.showIBANOnHero ?? true);
  const [showBalanceByDefault, setShowBalanceByDefault] = useState(preferences?.showBalanceByDefault ?? true);
  const [showEnvelopeItemsExpanded, setShowEnvelopeItemsExpanded] = useState(preferences?.showEnvelopeItemsExpanded ?? false);
  const [useVisualBudgetView, setUseVisualBudgetView] = useState(preferences?.useVisualBudgetView ?? false);
  const [budgetWarningThreshold, setBudgetWarningThreshold] = useState(preferences?.budgetWarningThreshold?.toString() ?? '80');
  const [requirePaymentConfirmation, setRequirePaymentConfirmation] = useState(preferences?.requirePaymentConfirmation ?? true);
  const [saveCardDetailsSession, setSaveCardDetailsSession] = useState(preferences?.saveCardDetailsSession ?? false);
  const [compactMode, setCompactMode] = useState(preferences?.compactMode ?? false);
  const [showMonthlyIncome, setShowMonthlyIncome] = useState(preferences?.showMonthlyIncome ?? true);
  const [showMonthlySpend, setShowMonthlySpend] = useState(preferences?.showMonthlySpend ?? true);

  useEffect(() => {
    const loadPreferences = async () => {
      const prefs = await getUserPreferences();
      setUserPreferences(prefs);

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
      if (prefs.showMonthlyIncome !== undefined) setShowMonthlyIncome(prefs.showMonthlyIncome);
      if (prefs.showMonthlySpend !== undefined) setShowMonthlySpend(prefs.showMonthlySpend);
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
    // Update local state immediately for better UX
    setUserPreferences(prev => ({ ...prev, [field]: value }));

    // Also update specific state variables for immediate UI feedback
    if (field === 'compactMode') setCompactMode(value);
    if (field === 'showIconTooltips') setShowIconTooltips(value);
    if (field === 'usePlanetIcons') setUsePlanetIcons(value);
    if (field === 'showIBANOnHero') setShowIBANOnHero(value);
    if (field === 'showBalanceByDefault') setShowBalanceByDefault(value);
    if (field === 'showEnvelopeItemsExpanded') setShowEnvelopeItemsExpanded(value);
    if (field === 'useVisualBudgetView') setUseVisualBudgetView(value);
    if (field === 'budgetWarningThreshold') setBudgetWarningThreshold(value.toString());
    if (field === 'requirePaymentConfirmation') setRequirePaymentConfirmation(value);
    if (field === 'saveCardDetailsSession') setSaveCardDetailsSession(value);
    if (field === 'showMonthlyIncome') setShowMonthlyIncome(value);
    if (field === 'showMonthlySpend') setShowMonthlySpend(value);
  };

  const handleSelectChange = async (field, value) => {
    await updateUserPreferences({ [field]: parseInt(value) });
  };

  const sections = [
    {
      key: 'appearance',
      title: 'Appearance',
    },
    {
      key: 'dashboard',
      title: 'Dashboard',
    },
    {
      key: 'budgets',
      title: 'Budgets',
    },
    {
      key: 'payments',
      title: 'Payments',
    },
    {
      key: 'interface',
      title: 'Interface',
    },
  ];

  return (
    <section id="settings" className="flex flex-col overflow-y-auto p-4" style={{ color: 'var(--color-text-primary)' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage your preferences and application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: settings list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Appearance Section */}
          <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold mb-5" id="settings-appearance">Appearance</h3>

            {/* Theme selector grid */}
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Choose a color theme for your application.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-5">
              {Object.keys(themes).map(themeName => {
                const isActive = currentTheme === themeName;
                return (
                  <button
                    key={themeName}
                    onClick={() => handleThemeSelect(themeName)}
                    className="relative flex flex-col items-center p-3 rounded-panel border transition-all duration-200"
                    style={{
                      borderColor: isActive ? 'var(--color-gold)' : 'var(--color-border)',
                      backgroundColor: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                    }}
                  >
                    {isActive && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: 'var(--color-gold)', color: '#1a1f3a' }}>
                        &#10003;
                      </div>
                    )}
                    <div
                      className="h-10 w-full rounded-sm-panel mb-2 border"
                      style={{
                        border: typeof themes[themeName]['--color-bg'] === 'string' && themes[themeName]['--color-bg'].includes('#fff') ? '1px solid #d1d5db' : '1px solid var(--color-border)',
                        background: `linear-gradient(135deg, ${themes[themeName]['--color-card-gradient-from']}, ${themes[themeName]['--color-card-gradient-to']})`
                      }}
                    />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{themeName}</span>
                  </button>
                );
              })}
            </div>

            {/* Compact Mode Toggle */}
            <SettingRow
              label="Compact Mode"
              hint="Reduces padding and font sizes across the app for a more dense layout"
              checked={compactMode}
              onChange={(v) => handleToggleChange('compactMode', v)}
            />
          </div>

          {/* Dashboard Section */}
          <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold mb-4" id="settings-dashboard">Dashboard</h3>

            <SettingRow
              label="Show IBAN on Dashboard Hero"
              hint="Display your full IBAN (partially masked) on the dashboard account card"
              checked={showIBANOnHero}
              onChange={(v) => handleToggleChange('showIBANOnHero', v)}
            />
            <SettingRow
              label="Show balance by default"
              hint="When enabled, your balance is visible. When disabled, tap the eye icon to reveal it"
              checked={showBalanceByDefault}
              onChange={(v) => handleToggleChange('showBalanceByDefault', v)}
            />
            <SettingRow
              label="Use Planet Icons on Dashboard"
              hint="When enabled, shows animated planet icons for navigation. When disabled, shows simple icon grid"
              checked={usePlanetIcons}
              onChange={(v) => handleToggleChange('usePlanetIcons', v)}
            />
            <SettingRow
              label="Show Monthly Income Card"
              hint="Display the monthly income stat card on the dashboard"
              checked={showMonthlyIncome}
              onChange={(v) => handleToggleChange('showMonthlyIncome', v)}
            />
            <SettingRow
              label="Show Monthly Spend Card"
              hint="Display the monthly spend stat card on the dashboard"
              checked={showMonthlySpend}
              onChange={(v) => handleToggleChange('showMonthlySpend', v)}
            />
          </div>

          {/* Budgets Section */}
          <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold mb-4" id="settings-budgets">Budgets</h3>

            <SettingRow
              label="Show Envelope Items by default (expanded)"
              hint="When enabled, budget cards will show their envelope items expanded by default"
              checked={showEnvelopeItemsExpanded}
              onChange={(v) => handleToggleChange('showEnvelopeItemsExpanded', v)}
            />
            <SettingRow
              label="Use Visual (Donut) View by default"
              hint="When enabled, the budgets page will open in the visual donut chart view instead of list view"
              checked={useVisualBudgetView}
              onChange={(v) => handleToggleChange('useVisualBudgetView', v)}
            />

            {/* Budget warning threshold */}
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Budget warning threshold</span>
                <HintTooltip hint="When a budget reaches this percentage of its limit, it will turn yellow as a warning">
                  <svg className="h-4 w-4 cursor-default" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </HintTooltip>
              </div>
              <select
                value={budgetWarningThreshold}
                onChange={(e) => handleSelectChange('budgetWarningThreshold', e.target.value)}
                className="form-input"
              >
                <option value="70">70%</option>
                <option value="80">80%</option>
                <option value="90">90%</option>
              </select>
            </div>
          </div>

          {/* Payments Section */}
          <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold mb-4" id="settings-payments">Payments</h3>

            <SettingRow
              label="Require confirmation before sending money"
              hint="When enabled, you'll be asked to confirm before sending any money"
              checked={requirePaymentConfirmation}
              onChange={(v) => handleToggleChange('requirePaymentConfirmation', v)}
            />
            <SettingRow
              label="Save card details for session"
              hint="When enabled, card details are remembered for the current browser session only (never stored)"
              checked={saveCardDetailsSession}
              onChange={(v) => handleToggleChange('saveCardDetailsSession', v)}
            />
          </div>

          {/* Interface Section */}
          <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold mb-4" id="settings-interface">Interface</h3>

            <SettingRow
              label="Show tooltips on icon buttons"
              hint="When enabled, hovering or long-pressing any icon button shows a description of that action"
              checked={showIconTooltips}
              onChange={(v) => handleToggleChange('showIconTooltips', v)}
            />
          </div>
        </div>

        {/* Right column: quick settings summary card */}
        <div className="space-y-4">
          <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold mb-4">Quick Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Active Theme', value: currentTheme },
                { label: 'Compact Mode', value: compactMode ? 'On' : 'Off' },
                { label: 'Budget Alerts', value: `${budgetWarningThreshold}%` },
                { label: 'Payment Confirm', value: requirePaymentConfirmation ? 'Yes' : 'No' },
                { label: 'Tooltips', value: showIconTooltips ? 'Enabled' : 'Disabled' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Quick Links */}
          <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold mb-4">Sections</h3>
            <div className="space-y-1">
              {sections.map(s => (
                <a
                  key={s.key}
                  href={`#settings-${s.key}`}
                  className="block text-sm py-1.5 px-2 rounded transition-colors duration-150 hover:bg-white/5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}