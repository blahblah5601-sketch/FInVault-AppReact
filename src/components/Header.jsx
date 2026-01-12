// src/components/Header.jsx

// 1. Destructure the onMenuClick prop
function Header({ activePage, onMenuClick }) {
  const pageTitle = activePage.charAt(0).toUpperCase() + activePage.slice(1).replace('-', ' ');

  return (
    <header className="flex items-center justify-between h-20 px-6 border-b bg-panel" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-center gap-4">
        {/* 2. Add the Mobile Menu Button (Visible only on mobile/tablet) */}
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
        
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>
      
      {/* ... (Notifications button and logic) ... */}
    </header>
  );
}

export default Header;