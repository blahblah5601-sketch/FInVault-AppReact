// src/components/Header.jsx
import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

function Header({ activePage, onMenuClick, history = [], transactions = [] }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const pageTitle = activePage.charAt(0).toUpperCase() + activePage.slice(1).replace('-', ' ');

  // Build recent activity from transactions and history
  const recentActivity = [
    ...transactions.slice(0, 5).map(t => ({
      id: t.id || `tx-${Math.random()}`,
      type: t.cat || 'Transaction',
      desc: t.desc || t.type || 'Transaction',
      amount: t.amount,
      time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
      icon: t.type === 'credit' ? 'down' : 'up'
    })),
    ...history.slice(0, 3).map(h => ({
      id: h.id || `hist-${Math.random()}`,
      type: h.type || 'Activity',
      desc: h.desc || h.note || h.type || 'Activity',
      amount: h.amount,
      time: h.createdAt ? new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      date: h.createdAt ? new Date(h.createdAt).toLocaleDateString() : '',
      icon: h.type?.includes('Payment') ? 'payment' : 'info'
    }))
  ];

  const unreadCount = Math.min(recentActivity.length, 99);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!showNotifications) return;
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifications]);

  return (
    <header
      ref={notifRef}
      className="flex items-center justify-between h-20 px-6 border-b bg-panel"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-secondary hover:bg-background/50 rounded-lg transition-colors"
          aria-label="Open Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <h1 className="text-base font-medium capitalize">{pageTitle}</h1>
      </div>

      {/* Notification Button */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-border/50 hover:bg-white/10 transition-colors"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4" style={{ color: 'var(--color-text-primary)', stroke: 'var(--color-text-primary)' }} />
          {/* Notification dot */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-accent rounded-full border-2 border-white"></div>
          )}
        </button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div
            className="absolute right-0 top-12 w-80 z-50 rounded-panel border"
            style={{
              backgroundColor: 'var(--color-panel)',
              borderColor: 'var(--color-border)',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h4 className="text-sm font-semibold">Recent Activity</h4>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {recentActivity.length} item{recentActivity.length !== 1 ? 's' : ''}
              </p>
            </div>

            {recentActivity.length > 0 ? recentActivity.map((item) => (
              <div
                key={item.id}
                className="px-4 py-3 border-b last:border-b-0 hover:bg-white/5 transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.desc}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {item.type} {item.time ? `at ${item.time}` : ''}
                    </p>
                  </div>
                  {item.amount && (
                    <span className={`text-xs font-mono whitespace-nowrap ${item.type === 'credit' ? '' : ''}`}
                      style={{
                        color: item.type === 'credit' ? '#22c55e' : 'var(--color-red-accent)',
                        fontWeight: 600
                      }}
                    >
                      {item.type === 'credit' ? '+' : '-'}Rs{Math.abs(item.amount)?.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="px-4 py-8 text-center">
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No recent activity</p>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
