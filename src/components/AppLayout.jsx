// src/components/AppLayout.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';

// The component receives props, including the onLogout function
function AppLayout({ user, onLogout, showToast, theme, setTheme, accounts, budgets, vaults, transactions, history }) {
    const [activePage, setActivePage] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // useEffect for lucide.createIcons() was deleted as pnpm install lucide-react was done to fix lucide icons issue

    return (
    <div id="app-container" className="flex h-screen w-full bg-background text-text-secondary overflow-hidden">
        {/* 2. Mobile Backdrop: Only shows when menu is open on small screens */}
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}

        {/* 3. Updated Sidebar Wrapper: Hidden on mobile, fixed/slide-in on mobile, flex on desktop */}
        <div className={`
            fixed inset-y-0 left-0 z-50 w-64 transform bg-background
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            transition-transform duration-300 ease-in-out
            lg:relative lg:translate-x-0 lg:flex
        `}>
            <Sidebar 
                user={user} 
                onLogout={onLogout} 
                activePage={activePage} 
                setActivePage={(page) => {
                    setActivePage(page);
                    setIsMobileMenuOpen(false); // Close menu after clicking a link
                }}
            />
        </div>

        {/* 4. Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Pass a function to Header to open the menu */}
            <Header 
                activePage={activePage} 
                onMenuClick={() => setIsMobileMenuOpen(true)} 
            />
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