// src/components/SettingsPage.jsx
import { themes, applyTheme } from '../theme.js';
import { updateUserPreferences, getUserPreferences } from '../api.js';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
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
  const [showIBANOnHero, setShowIBANOnHero] = useState(preferences?.showIBANOnHero ?? true);
  const [showBalanceByDefault, setShowBalanceByDefault] = useState(preferences?.showBalanceByDefault ?? true);
  const [showEnvelopeItemsExpanded, setShowEnvelopeItemsExpanded] = useState(preferences?.showEnvelopeItemsExpanded ?? false);
  const [budgetWarningThreshold, setBudgetWarningThreshold] = useState(preferences?.budgetWarningThreshold?.toString() ?? '80');
  const [compactMode, setCompactMode] = useState(preferences?.compactMode ?? false);
  const [showMonthlyIncome, setShowMonthlyIncome] = useState(preferences?.showMonthlyIncome ?? true);
  const [showMonthlySpend, setShowMonthlySpend] = useState(preferences?.showMonthlySpend ?? true);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      const prefs = await getUserPreferences();
      setUserPreferences(prefs);

      if (prefs.showIconTooltips !== undefined) setShowIconTooltips(prefs.showIconTooltips);
      if (prefs.showIBANOnHero !== undefined) setShowIBANOnHero(prefs.showIBANOnHero);
      if (prefs.showBalanceByDefault !== undefined) setShowBalanceByDefault(prefs.showBalanceByDefault);
      if (prefs.showEnvelopeItemsExpanded !== undefined) setShowEnvelopeItemsExpanded(prefs.showEnvelopeItemsExpanded);
      if (prefs.budgetWarningThreshold !== undefined) setBudgetWarningThreshold(prefs.budgetWarningThreshold.toString());
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
    if (field === 'showIBANOnHero') setShowIBANOnHero(value);
    if (field === 'showBalanceByDefault') setShowBalanceByDefault(value);
    if (field === 'showEnvelopeItemsExpanded') setShowEnvelopeItemsExpanded(value);
    if (field === 'budgetWarningThreshold') setBudgetWarningThreshold(value.toString());
    if (field === 'showMonthlyIncome') setShowMonthlyIncome(value);
    if (field === 'showMonthlySpend') setShowMonthlySpend(value);
  };

  const handleSelectChange = async (field, value) => {
    await updateUserPreferences({ [field]: parseInt(value) });
  };

  const handleVerifyEmail = async () => {
    if (!auth.currentUser) return;
    setIsSendingVerification(true);
    setVerificationSent(false);
    try {
      // Reload user to get latest email verification status
      await auth.currentUser.reload();

      await sendEmailVerification(auth.currentUser, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      alert('Failed to send verification email. Please try again.');
    } finally {
      setIsSendingVerification(false);
    }
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
          {/* Account Verification Section - show only for unverified users */}
          {auth.currentUser && !auth.currentUser.emailVerified && (
          <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold mb-4" id="settings-account">Account Verification</h3>

            <div className="flex items-start gap-3 p-3 rounded-lg mb-4" style={{ backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Email Verification Required</p>
                <p>Please verify your email address to unlock all features including budget creation, transfers, and payments.</p>
              </div>
            </div>

            {verificationSent && (
              <div className="flex items-start gap-3 p-3 rounded-lg mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <p className="font-medium mb-1" style={{ color: '#22c55e' }}>
                    Verification email sent to <span className="font-medium">{auth.currentUser.email}</span>
                  </p>
                  <p className="text-xs">Please check your inbox (and spam folder) and click the verification link to activate your account.</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Email Verification</span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Verify ownership of {auth.currentUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={isSendingVerification || verificationSent}
                className="btn-primary px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 min-w-[140px] justify-center"
              >
                {isSendingVerification ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sending...
                  </>
                ) : verificationSent ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sent!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Verification
                  </>
                )}
              </button>
            </div>
          </div>
          )}

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