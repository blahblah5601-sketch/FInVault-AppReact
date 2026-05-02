// src/components/BankLinking.jsx
import { useState, useEffect } from 'react';
import { updateUserPreferences, getUserPreferences } from '../api';
import { Link, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const BankLinking = ({ user, showToast }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasBankConnection, setHasBankConnection] = useState(false);
  const [lastConnectedProvider, setLastConnectedProvider] = useState('');

  // Load connection status on mount
  useEffect(() => {
    const loadStatus = async () => {
      if (!user) return;
      try {
        const prefs = await getUserPreferences();
        setHasBankConnection(prefs.hasBankConnection || false);
        setLastConnectedProvider(prefs.lastConnectedProvider || '');
      } catch (err) {
        // Error handled by showToast in parent
      }
    };
    loadStatus();
  }, [user]);

  const handleConnectBank = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: REPLACE WITH RAAST LOGIC ONCE BACKEND IS READY
      // Example structure when Raast service is available:
      // const tokenResponse = await raastService.createLinkToken(user.uid);
      // setLinkToken(tokenResponse.link_token);

      setIsLoading(false);
      setSuccess('Bank connection initialized (demo mode).');
    } catch (err) {
      // setError('Bank connection initialization failed. Please check configuration and try again.');
      setIsLoading(false);
    }
  };

  const handleLinkSuccess = async (publicKey, metadata) => {
    setIsLoading(true);
    try {
      // TODO: REPLACE WITH RAAST LOGIC ONCE BACKEND IS READY
      // const tokenResponse = await raastService.exchangePublicToken(publicKey);

      await updateUserPreferences({
        hasBankConnection: true,
        lastConnectedProvider: metadata.provider_name || metadata.institution?.name || 'Unknown Bank',
      });
      setHasBankConnection(true);
      setLastConnectedProvider(metadata.provider_name || metadata.institution?.name || 'Unknown Bank');
      setSuccess('Bank connected successfully.');
      showToast('Bank account linked successfully.');
      setIsLoading(false);
    } catch (err) {
      // setError('Bank connection failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await updateUserPreferences({
        hasBankConnection: false,
        lastConnectedProvider: '',
      });
      setHasBankConnection(false);
      setLastConnectedProvider('');
      showToast('Bank account disconnected.');
    } catch (err) {
      // setError('Failed to disconnect bank account.');
    }
  };

  return (
    <section className="flex flex-col overflow-y-auto p-4" style={{ color: 'var(--color-text-primary)' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Bank Linking</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Connect your bank account via Raast for seamless transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Main connection panel */}
          <div className="rounded-panel p-6 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                backgroundColor: hasBankConnection ? 'rgba(14,124,110,0.15)' : 'var(--color-accent, #1a1f3a)',
                color: hasBankConnection ? 'var(--color-teal)' : 'var(--color-gold)',
              }}>
                <Link className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{hasBankConnection ? 'Connected' : 'Connect Your Bank'}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {hasBankConnection ? `Connected via ${lastConnectedProvider}` : 'Link your bank account securely through Raast'}
                </p>
              </div>
            </div>

            {/* Status indicator */}
            {hasBankConnection && (
              <div className="rounded-sm-panel p-4 mb-5 flex items-center gap-3" style={{
                backgroundColor: 'rgba(14,124,110,0.08)',
                border: '1px solid rgba(14,124,110,0.2)',
              }}>
                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-teal)' }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-teal)' }}>Bank account connected</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Provider: {lastConnectedProvider || 'Raast Demo Bank'}</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-xs font-medium px-3 py-1.5 rounded-panel transition-colors"
                  style={{ backgroundColor: 'rgba(214,59,59,0.1)', color: 'var(--color-red-accent)' }}
                >
                  Disconnect
                </button>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="rounded-sm-panel p-4 mb-5 flex items-center gap-3" style={{
                backgroundColor: 'rgba(214,59,59,0.08)',
                border: '1px solid rgba(214,59,59,0.2)',
              }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-red-accent)' }} />
                <p className="text-sm" style={{ color: 'var(--color-red-accent)' }}>{error}</p>
              </div>
            )}

            {/* Success display */}
            {success && (
              <div className="rounded-sm-panel p-4 mb-5 flex items-center gap-3" style={{
                backgroundColor: 'rgba(14,124,110,0.08)',
                border: '1px solid rgba(14,124,110,0.2)',
              }}>
                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-teal)' }} />
                <p className="text-sm" style={{ color: 'var(--color-teal)' }}>{success}</p>
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-3" style={{ color: 'var(--color-gold)' }} />
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Connecting to your bank...</span>
              </div>
            ) : (
              <button
                onClick={hasBankConnection ? handleDisconnect : handleConnectBank}
                className="w-full py-3 rounded-panel font-medium flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  backgroundColor: hasBankConnection ? 'rgba(214,59,59,0.1)' : 'var(--color-accent, #1a1f3a)',
                  color: hasBankConnection ? 'var(--color-red-accent)' : 'white',
                }}
                onMouseEnter={e => {
                  if (!hasBankConnection) e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '1';
                }}
                disabled={isLoading}
              >
                <Link className="w-4 h-4" />
                {hasBankConnection ? 'Disconnect Bank Account' : 'Connect Bank Account'}
              </button>
            )}

            <p className="text-xs mt-3 text-center" style={{ color: 'var(--color-text-muted)' }}>
              Note: Currently in demo mode. Raast integration coming soon.
            </p>
          </div>

          {/* How it works section */}
          <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold mb-4">How Bank Linking Works</h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Click Connect', desc: 'Click the connect button above to start the bank linking process.' },
                { step: '2', title: 'Authenticate', desc: 'You will be redirected to your bank\'s login page to authenticate securely.' },
                { step: '3', title: 'Done', desc: 'Your bank account will be linked and ready for seamless transactions via Raast.' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5" style={{
                    backgroundColor: 'var(--color-accent, #1a1f3a)',
                    color: 'white',
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Features card */}
          <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold mb-4">Features</h3>
            <div className="space-y-3">
              {[
                { icon: 'lock', title: 'Secure', desc: 'Bank-level encryption and security' },
                { icon: 'bolt', title: 'Instant', desc: 'Real-time account verification' },
                { icon: 'refresh', title: 'Auto-sync', desc: 'Automatic transaction sync' },
              ].map(feature => (
                <div key={feature.icon} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
                    backgroundColor: 'rgba(201,168,76,0.12)',
                    color: 'var(--color-gold)',
                  }}>
                    {feature.icon === 'lock' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/></svg>}
                    {feature.icon === 'bolt' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2"/></svg>}
                    {feature.icon === 'refresh' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6" strokeWidth="2"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeWidth="2"/></svg>}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{feature.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo bank info */}
          <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold mb-3">Current Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Connection</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                  backgroundColor: hasBankConnection ? 'rgba(14,124,110,0.15)' : 'rgba(214,59,59,0.15)',
                  color: hasBankConnection ? 'var(--color-teal)' : 'var(--color-red-accent)',
                }}>
                  {hasBankConnection ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Provider</span>
                <span className="text-xs font-medium">{lastConnectedProvider || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Raast Status</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-gold)' }}>Demo Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BankLinking;
