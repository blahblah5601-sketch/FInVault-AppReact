// src/components/Sidebar.jsx

function Sidebar({ user, onLogout, activePage, setActivePage }) {
  const navItems = [
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { id: 'card-control', icon: 'credit-card', label: 'Card Control' },
    { id: 'budgets', icon: 'pie-chart', label: 'Budgets' },
    { id: 'vaults', icon: 'shield-check', label: 'Vaults' },
    { id: 'transactions', icon: 'list', label: 'Transactions' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="sidebar w-16 md:w-64 flex-shrink-0 transition-all duration-300 ease-in-out hidden sm:flex flex-col">
        <div className="flex items-center justify-center md:justify-start px-4 h-20 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" style={{ color: 'var(--color-primary)' }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            <h1 className="text-2xl font-bold ml-2 hidden md:block">FinVault</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map(item => (
          <a
            key={item.id}
            href="#"
            // Highlight the link if its id matches the activePage state
            className={`nav-link flex items-center p-2 text-base font-normal rounded-lg ${
              activePage === item.id ? 'bg-slate-700' : 'hover:bg-slate-700'
            }`}
            // When clicked, call setActivePage to change the state in AppLayout
            onClick={() => setActivePage(item.id)}
          >
            <i data-lucide={item.icon} className="w-6 h-6"></i>
            <span className="ml-3 hidden md:block">{item.label}</span>
          </a>
        ))}
        </nav>
        <div className="px-2 py-4 mt-auto border-t" style={{ borderColor: 'var(--color-border)' }}>
             <div className="flex items-center p-2 text-base font-normal rounded-lg">
                <i data-lucide="user-circle" className="w-8 h-8 rounded-full text-slate-400"></i>
                <span className="ml-3 hidden md:block text-sm text-slate-400 truncate" title={user.email}>{user.email}</span>
            </div>
            <a href="#" onClick={onLogout} className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700 text-red-400 hover:text-red-300">
                <i data-lucide="log-out" className="w-6 h-6"></i>
                <span className="ml-3 hidden md:block">Logout</span>
            </a>
        </div>
    </aside>
  );
}

export default Sidebar;