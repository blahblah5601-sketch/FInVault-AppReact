// src/components/AppLayout.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';

// The component receives props, including the onLogout function
function AppLayout({ user, onLogout, showToast, theme, setTheme, accounts, budgets, vaults, transactions, history }) {
    const [activePage, setActivePage] = useState('dashboard');
    // useEffect for lucide.createIcons() was deleted as pnpm install lucide-react was done to fix lucide icons issue

    return (
        <div id="app-container" className="flex h-screen w-full bg-background text-text-secondary">
        <Sidebar 
        user={user} 
        onLogout={onLogout} 
        activePage={activePage} 
        setActivePage={setActivePage}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
        <Header activePage={activePage} />
        <MainContent 
          activePage={activePage}
          accounts={accounts} 
          budgets={budgets}
          vaults={vaults}
          transactions={transactions}
          history={history}
          showToast={showToast}
          theme={theme}
          setTheme={setTheme}
        />
        </main>
        </div>
    );
}

export default AppLayout;