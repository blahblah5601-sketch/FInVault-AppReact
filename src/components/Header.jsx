// src/components/Header.jsx

function Header({ activePage }) {
  // Capitalize the first letter of the page title
  const pageTitle = activePage.charAt(0).toUpperCase() + activePage.slice(1).replace('-', ' ');

  return (
    <header className="flex items-center justify-between h-20 px-6 border-b bg-slate-800" style={{ borderColor: 'var(--color-border)' }}>
      <h1 className="text-xl font-semibold">{pageTitle}</h1>
      {/* ... (Notifications button and logic will go here later) ... */}
    </header>
  );
}

export default Header;