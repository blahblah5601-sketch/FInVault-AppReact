// src/components/Sidebar.jsx
import { LayoutDashboard, Landmark, CreditCard, Wallet, PieChart, ShieldCheck, List, Settings } from 'lucide-react';

function Sidebar({ user, onLogout, activePage, setActivePage, compactMode = false }) {
  const navSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'accounts', Icon: Landmark, label: 'Accounts' },
        { id: 'card-control', Icon: CreditCard, label: 'Card Control' },
      ]
    },
    {
      title: 'Finance',
      items: [
        { id: 'budgets', Icon: PieChart, label: 'Budgets' },
        { id: 'vaults', Icon: ShieldCheck, label: 'Vaults' },
        { id: 'transactions', Icon: List, label: 'Transactions' },
      ]
    },
    {
      title: 'Payments',
      items: [
        { id: 'payments', Icon: Wallet, label: 'Payments' },
        { id: 'settings', Icon: Settings, label: 'Settings' },
      ]
    }
  ];

  const isActive = (itemId) => activePage === itemId;

  const getInitials = () => {
    const name = user.email.split('@')[0];
    const parts = name.split(/[._-]/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="flex flex-col h-full w-full" style={{
      backgroundColor: '#1a1f3a',
      borderRadius: `${compactMode ? '8px' : '16px'} 0 0 ${compactMode ? '8px' : '16px'}`
    }}>
      {/* Logo */}
      <div className="flex items-center gap-3 mx-4 mt-4 mb-7">
        <div className="w-[28px] h-[28px] flex items-center justify-center shrink-0" style={{
          backgroundColor: 'var(--color-gold)',
          borderRadius: '8px'
        }}>
          <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
            <path d="M2 12V7L8 3L14 7V12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="5" y="9" width="6" height="5" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" rx=".5"/>
            <circle cx="8" cy="11.5" r=".8" fill="#fff"/>
          </svg>
        </div>
        <span className="font-mono-space text-[15px] font-bold tracking-[2px]" style={{
          color: 'var(--color-gold2)'
        }}>
          FINVAULT
        </span>
      </div>

      {/* Navigation Sections */}
      {navSections.map((section) => (
        <div key={section.title}>
          <div className="text-[10px] uppercase tracking-[1.5px] mb-2 mt-[14px] mx-2" style={{
            color: 'rgba(255,255,255,0.3)'
          }}>
            {section.title}
          </div>
          <div className="space-y-[6px]">
            {section.items.map((item) => {
              const active = isActive(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`sidebar-nav-item flex items-center gap-[10px] px-3 py-[10px] ${active ? 'active' : ''}`}
                >
                  <item.Icon
                    className="w-[15px] h-[15px] shrink-0"
                    style={{ opacity: active ? 1 : 0.8 }}
                  />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Footer */}
      <div className="border-t pt-4 mx-4" style={{
        borderColor: 'rgba(255,255,255,0.08)'
      }}>
        <div className="flex items-center gap-[10px]">
          <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0" style={{
            backgroundColor: 'var(--color-gold)',
            color: '#1a1f3a',
            fontSize: '12px',
            fontWeight: 600
          }}>
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium truncate" style={{
              color: 'rgba(255,255,255,0.85)'
            }}>
              {user.email.split('@')[0]}
            </p>
            <span className="text-[10px] block" style={{
              color: 'rgba(255,255,255,0.35)'
            }}>
              Premium Account
            </span>
          </div>
          <button
            onClick={onLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;