// src/components/Sidebar.jsx
import {   LayoutDashboard, CreditCard, PieChart, ShieldCheck, List, Settings, UserCircle, LogOut } from 'lucide-react';
import Logo from './Logo';

function Sidebar({ user, onLogout, activePage, setActivePage }) {
  const navItems = [
    { id: 'dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'card-control', Icon: CreditCard, label: 'Card Control' },
    { id: 'budgets', Icon: PieChart, label: 'Budgets' },
    { id: 'vaults', Icon: ShieldCheck, label: 'Vaults' },
    { id: 'transactions', Icon: List, label: 'Transactions' },
    { id: 'settings', Icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="sidebar w-16 md:w-64 flex-shrink-0 transition-all duration-300 ease-in-out hidden sm:flex flex-col">
        <div className="flex items-center justify-center md:justify-start px-4 h-20 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <Logo className="h-8 w-8" /> {/* <-- Use Logo component */}
            <h1 className="text-2xl font-bold ml-2 hidden md:block">FinVault</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map(item => (
          <a
            key={item.id}
            href="#"
            // Highlight the link if its id matches the activePage state
            className={`nav-link flex items-center p-2 text-base font-normal rounded-lg ${
              activePage === item.id ? 'bg-sidebar' : 'hover:bg-sidebar'
            }`}
            // When clicked, call setActivePage to change the state in AppLayout
            onClick={() => setActivePage(item.id)}
          >
            <item.Icon className="w-6 h-6" />
            <span className="ml-3 hidden md:block">{item.label}</span>
          </a>
        ))}
        </nav>
        <div className="px-2 py-4 mt-auto border-t" style={{ borderColor: 'var(--color-border)' }}>
             <div className="flex items-center p-2 text-base font-normal rounded-lg">
                <UserCircle className="w-8 h-8 rounded-full text-text-secondary" />
                <span className="ml-3 hidden md:block text-sm text-text-secondary truncate" title={user.email}>{user.email}</span>
            </div>
            <a href="#" onClick={onLogout} className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-sidebar text-red-400 hover:text-red-300">
              <LogOut className="w-6 h-6" />
              <span className="ml-3 hidden md:block">Logout</span>
            </a>
        </div>
    </aside>
  );
}

export default Sidebar;