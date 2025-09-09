// src/components/AppLayout.jsx
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';

// The component receives props, including the onLogout function
function AppLayout({ user, onLogout, accounts, budgets, vaults, transactions, history }) {
    const [activePage, setActivePage] = useState('dashboard');
    useEffect(() => {
    // This runs after the component renders, ensuring the <i> tags are in the DOM
        if (window.lucide) {
        window.lucide.createIcons();
        }
    }); // Note: No dependency array, so it runs on every re-render

    return (
        <div id="app-container" className="flex h-screen w-full">
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
        />
        </main>
        </div>
    );
}

export default AppLayout;