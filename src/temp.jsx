{/* /   return (
//     <div className="overflow-hidden">

//     {/* Authentication Container (Shown when logged out) */} 
//     <div id="auth-container" className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4 hidden">
//         <div className="auth-card w-full max-w-sm space-y-6">
//             <div className="text-center">
//                 <div className="flex items-center justify-center mb-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeColor="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" style="color: var(--color-primary)"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
//                     <h1 className="text-3xl font-bold ml-2">FinVault</h1>
//                 </div>
//                 <p id="auth-mode-label" className="text-text-secondary">Sign in to continue</p>
//             </div>

//             {/* Login Form */}
//             <form id="login-form" className="space-y-4">
//                 <input type="email" id="login-email" placeholder="Email" required className="auth-input"/>
//                 <input type="password" id="login-password" placeholder="Password" required className="auth-input"/>
//                 <button type="submit" className="w-full btn-primary py-3 rounded-lg font-semibold">Login</button>
//             </form>

//             {/* Signup Form (Initially hidden) */}
//             <form id="signup-form" className="space-y-4 hidden">
//                 <input type="email" id="signup-email" placeholder="Email" required className="auth-input"/>
//                 <input type="password" id="signup-password" placeholder="Password (min. 6 characters)" required className="auth-input"/>
//                 <button type="submit" className="w-full btn-primary py-3 rounded-lg font-semibold">Create Account</button>
//             </form>

//             <p id="auth-error" className="error-message"></p>

//             <p className="text-sm text-center text-text-secondary">
//                 <span id="toggle-text">Don't have an account?</span>
//                 <a href="#" id="toggle-auth-mode" className="font-medium hover:underline" style="color: var(--color-primary);">Sign up</a>
//             </p>
//         </div>
//     </div>

//     {/* Loading Spinner (Shown on initial load) */}
//     <div id="loading-spinner" className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
//         <div className="w-8 h-8 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin"></div>
//         <p className="text-text-secondary mt-4">Connecting...</p>
//     </div>

//     {/* Main App Container (Shown when logged in) */}
//     <div id="app-container" className="flex h-screen w-full hidden">
//         {/* Sidebar */}
//         <aside className="sidebar w-16 md:w-64 flex-shrink-0 transition-all duration-300 ease-in-out hidden sm:flex flex-col">
//             <div className="flex items-center justify-center md:justify-start px-4 h-20 border-b" style="borderColor: var(--color-border);">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" style="color: var(--color-primary)"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
//                 <h1 className="text-2xl font-bold ml-2 hidden md:block">FinVault</h1>
//             </div>
//             <nav className="flex-1 px-2 py-4 space-y-2">
//                 <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg bg-slate-700" data-target="dashboard">
//                     <i data-lucide="layout-dashboard" className="w-6 h-6"></i>
//                     <span className="ml-3 hidden md:block">Dashboard</span>
//                 </a>
//                 <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700" data-target="card-control">
//                     <i data-lucide="credit-card" className="w-6 h-6"></i>
//                     <span className="ml-3 hidden md:block">Card Control</span>
//                 </a>
//                 <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700" data-target="budgets">
//                     <i data-lucide="pie-chart" className="w-6 h-6"></i>
//                     <span className="ml-3 hidden md:block">Budgets</span>
//                 </a>
//                 <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700" data-target="vaults">
//                     <i data-lucide="shield-check" className="w-6 h-6"></i>
//                     <span className="ml-3 hidden md:block">Vaults</span>
//                 </a>
//                  <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700" data-target="transactions">
//                     <i data-lucide="list" className="w-6 h-6"></i>
//                     <span className="ml-3 hidden md:block">Transactions</span>
//                 </a>
//                 <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700" data-target="settings">
//                     <i data-lucide="settings" className="w-6 h-6"></i>
//                     <span className="ml-3 hidden md:block">Settings</span>
//                 </a>
//             </nav>
//             <div className="px-2 py-4 mt-auto border-t" style="borderColor: var(--color-border);">
//                  <div className="flex items-center p-2 text-base font-normal rounded-lg">
//                     <i data-lucide="user-circle" className="w-8 h-8 rounded-full text-text-secondary"></i>
//                     <span id="user-email-display" className="ml-3 hidden md:block text-sm text-text-secondary truncate" title="user@example.com">user@example.com</span>
//                 </div>
//                 <a href="#" id="logout-button" className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700 text-red-400 hover:text-red-300">
//                     <i data-lucide="log-out" className="w-6 h-6"></i>
//                     <span className="ml-3 hidden md:block">Logout</span>
//                 </a>
//             </div>
//         </aside>

//         {/* Main Content (Your original content is here) */}
//         <main className="flex-1 flex flex-col overflow-hidden">
//             {/* Header */}
//             <header className="flex items-center justify-between h-20 px-6 border-b bg-slate-800" style="borderColor: var(--color-border);">
//                  <div className="sm:hidden">
//                      <button id="mobile-menu-button" className="p-2 rounded-md">
//                          <i data-lucide="menu" className="w-6 h-6"></i>
//                      </button>
//                  </div>
//                  <h1 className="text-xl font-semibold" id="page-title">Dashboard</h1>
//                  <div className="flex items-center space-x-4 relative">
//                      <button id="notifications-btn" className="p-2 rounded-full hover:bg-slate-700 relative">
//                          <i data-lucide="bell" className="w-6 h-6"></i>
//                          <span id="notification-dot" className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
//                      </button>
//                      <div id="notifications-dropdown" className="absolute top-full right-0 mt-2 w-80 bg-slate-700 rounded-lg shadow-lg hidden z-10">
//                         <div className="p-3 border-b border-slate-600">
//                             <h4 className="font-semibold">Notifications</h4>
//                         </div>
//                         <div id="notification-list" className="max-h-96 overflow-y-auto">
//                             {/* Notifications will be populated by JS */}
//                         </div>
//                      </div>
//                  </div>
//             </header>

//             <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8" id="main-content-area">

//                 {/* All your page sections (<section id="dashboard">, etc.) go here, unchanged. */}
//                 {/* Dashboard Section */}
//                 <section id="dashboard" className="page-section space-y-8">
//                     {/* Card and AI Section */}
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                         <div className="lg:col-span-2">
//                              {/* Premium Smart Card */}
//                             <div id="smart-card-display" className="card-gradient p-6 rounded-2xl shadow-lg relative h-56 transition-all duration-300">
//                                 <div className="flex justify-between items-start">
//                                     <div>
//                                         <p className="text-sm text-text-secondary">Active Account</p>
//                                         <h3 id="active-account-name" className="text-xl font-semibold">Current Account</h3>
//                                     </div>
//                                     <div className="flex items-center">
//                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
//                                     </div>
//                                 </div>
//                                 <div className="absolute bottom-6 left-6">
//                                      <p className="text-sm text-text-secondary">Total Balance</p>
//                                     <p id="card-balance" className="text-3xl font-bold">Rs 124,530.50</p>
//                                     <p id="card-number" className="text-lg font-mono tracking-widest mt-2 text-text-primary">**** **** **** 8021</p>
//                                 </div>
//                                 <div id="card-frozen-overlay" className="absolute inset-0 bg-black bg-opacity-60 rounded-2xl flex items-center justify-center hidden backdrop-blur-sm">
//                                     <i data-lucide="snowflake" className="w-16 h-16 text-blue-300"></i>
//                                     <p className="text-2xl font-bold text-blue-200 ml-4">Card Frozen</p>
//                                 </div>
//                             </div>

//                              {/* Quick Actions */}
//                             <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
//                                  <button id="add-money-btn" className="btn-secondary p-4 rounded-lg flex flex-col items-center justify-center space-y-2">
//                                     <i data-lucide="plus-circle" className="w-6 h-6"></i>
//                                     <span>Add Money</span>
//                                  </button>
//                                   <button className="nav-link btn-secondary p-4 rounded-lg flex flex-col items-center justify-center space-y-2" data-target="card-control">
//                                     <i data-lucide="shuffle" className="w-6 h-6"></i>
//                                     <span>Rotate Card</span>
//                                  </button>
//                                  <button id="send-money-btn" className="btn-secondary p-4 rounded-lg flex flex-col items-center justify-center space-y-2">
//                                     <i data-lucide="send" className="w-6 h-6"></i>
//                                     <span>Send</span>
//                                  </button>
//                                   <button id="qr-pay-btn" className="btn-secondary p-4 rounded-lg flex flex-col items-center justify-center space-y-2">
//                                     <i data-lucide="qr-code" className="w-6 h-6"></i>
//                                     <span>Pay with QR</span>
//                                  </button>
//                             </div>
//                         </div>

//                         {/* AI Financial Advisor */}
//                         <div className="bg-slate-900/50 p-6 rounded-2xl flex flex-col">
//                             <div className="flex justify-between items-center mb-4">
//                                  <h3 className="text-lg font-semibold">AI Financial Advisor</h3>
//                                  <button id="new-advice-btn" className="p-1 rounded-full hover:bg-slate-700"><i data-lucide="refresh-cw" className="w-4 h-4 text-text-secondary"></i></button>
//                             </div>
//                             <div className="flex items-start space-x-4">
//                                 <div className="p-2 rounded-full" style="background-color: var(--color-primary); opacity: 0.2;">
//                                     <i data-lucide="brain-circuit" className="w-6 h-6" style="color: var(--color-primary);"></i>
//                                 </div>
//                                 <div id="ai-advice-content" className="flex-1 bg-slate-700 p-4 rounded-lg">
//                                     {/* AI Advice populated by JS */}
//                                 </div>
//                             </div>
//                              <button id="ai-action-btn" className="btn-primary mt-auto py-2 px-4 rounded-lg w-full">Move Savings</button>
//                         </div>
//                     </div>

//                     {/* Budget Jars */}
//                     <div>
//                         <div className="flex items-center justify-between mb-4">
//                             <h2 className="text-xl font-semibold">Budget Jars</h2>
//                             <button className="nav-link text-sm btn-secondary py-1 px-3 rounded-md" data-target="transactions">View History</button>
//                         </div>
//                         <div id="dashboard-budgets" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                            {/* Populated by JS */}
//                         </div>
//                     </div>

//                     {/* Savings Vaults */}
//                     <div>
//                         <div className="flex items-center justify-between mb-4">
//                             <h2 className="text-xl font-semibold">Savings Vaults</h2>
//                             <button className="nav-link text-sm btn-secondary py-1 px-3 rounded-md" data-target="transactions">View History</button>
//                         </div>
//                         <div id="dashboard-vaults" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {/* Populated by JS */}
//                         </div>
//                     </div>
//                 </section>

//                 {/* Card Control Section */}
//                 <section id="card-control" className="page-section hidden">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
//                         <div>
//                             <h2 className="text-2xl font-semibold mb-4">Card Control</h2>
//                             <div id="smart-card-display-control" className="card-gradient p-6 rounded-2xl shadow-lg relative h-56">
//                                  <div className="flex justify-between items-start">
//                                     <div>
//                                         <p className="text-sm text-text-secondary">Active Account</p>
//                                         <h3 id="active-account-name-control" className="text-xl font-semibold">Current Account</h3>
//                                     </div>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
//                                 </div>
//                                 <div className="absolute bottom-6 left-6">
//                                     <p id="card-number-control" className="text-lg font-mono tracking-widest text-text-primary">**** **** **** 8021</p>
//                                 </div>
//                                 <div id="card-frozen-overlay-control" className="absolute inset-0 bg-black bg-opacity-60 rounded-2xl flex items-center justify-center hidden backdrop-blur-sm">
//                                     <i data-lucide="snowflake" className="w-16 h-16 text-blue-300"></i>
//                                     <p className="text-2xl font-bold text-blue-200 ml-4">Card Frozen</p>
//                                 </div>
//                             </div>
//                              <div className="mt-6 flex items-center justify-between bg-slate-900/50 p-4 rounded-xl">
//                                 <div className="flex items-center">
//                                     <i data-lucide="snowflake" className="w-6 h-6 mr-3 text-blue-400"></i>
//                                     <span className="font-medium">Freeze Card</span>
//                                 </div>
//                                 <label htmlFor="freeze-toggle" className="inline-flex relative items-center cursor-pointer">
//                                     <input type="checkbox" value="" id="freeze-toggle" className="sr-only peer"/>
//                                     <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
//                                 </label>
//                             </div>
//                         </div>

//                         <div className="bg-slate-900/50 p-6 rounded-2xl">
//                             <h3 className="text-lg font-semibold mb-4">Rotate Active Account</h3>
//                             <p className="text-sm text-text-secondary mb-6">Select which account or budget jar your physical card should use for the next transaction.</p>
//                             <div className="space-y-3" id="account-selector">
//                                 {/* Accounts will be populated by JS */}
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                  {/* Budgets Section */}
//                 <section id="budgets" className="page-section hidden space-y-8">
//                      <div className="flex justify-between items-center mb-6">
//                         <div>
//                             <h2 className="text-2xl font-semibold">My Budgets</h2>
//                             <p id="budget-count-text" className="text-sm text-text-secondary mt-1"></p>
//                         </div>
//                         <button id="new-budget-btn" className="btn-primary py-2 px-4 rounded-lg flex items-center">
//                             <i data-lucide="plus" className="w-5 h-5 mr-2"></i>
//                             New Budget
//                         </button>
//                      </div>
                     
//                      {/* Budget Summary */}
//                     <div className="bg-slate-900/50 p-6 rounded-2xl">
//                         <h3 className="font-semibold text-lg mb-4">Monthly Summary</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
//                             <div>
//                                 <p className="text-sm text-text-secondary">Total Budgeted</p>
//                                 <p id="total-budgeted" className="text-2xl font-bold font-mono"></p>
//                             </div>
//                             <div>
//                                 <p className="text-sm text-text-secondary">Total Spent</p>
//                                 <p id="total-spent" className="text-2xl font-bold font-mono"></p>
//                             </div>
//                             <div>
//                                 <p className="text-sm text-text-secondary">Remaining</p>
//                                 <p id="total-remaining" className="text-2xl font-bold font-mono"></p>
//                             </div>
//                         </div>
//                     </div>
                     
//                      <div id="budgets-list" className="bg-slate-900/50 p-6 rounded-2xl space-y-6">
//                         {/* Populated by JS */}
//                      </div>
//                 </section>
                
//                 {/* Vaults Section */}
//                 <section id="vaults" className="page-section hidden">
//                      <div className="flex justify-between items-center mb-6">
//                         <div>
//                             <h2 className="text-2xl font-semibold">Savings Vaults</h2>
//                             <p className="text-sm text-text-secondary mt-1">Total Saved: <span id="total-saved-vaults-page" className="font-bold text-base"></span></p>
//                         </div>
//                      </div>
//                      <div id="savings-account-container" className="mb-8">
//                         {/* Savings Account Rendered here */}
//                      </div>
//                      <div className="flex justify-between items-center mb-4">
//                         <h3 className="text-xl font-semibold">Goal Vaults</h3>
//                         <button id="new-vault-btn" className="btn-primary py-2 px-4 rounded-lg flex items-center">
//                             <i data-lucide="plus" className="w-5 h-5 mr-2"></i>
//                             New Vault
//                         </button>
//                      </div>
//                      <div id="vaults-list" className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                          {/* Populated by JS */}
//                      </div>
//                 </section>
                
//                 {/* Transactions Section */}
//                 <section id="transactions" className="page-section hidden space-y-8">
//                     <div>
//                         <div className="flex justify-between items-center mb-6">
//                             <h2 className="text-2xl font-semibold">Spending History</h2>
//                             <button id="export-spending-btn" className="btn-secondary py-2 px-4 rounded-lg flex items-center">
//                                 <i data-lucide="file-spreadsheet" className="w-5 h-5 mr-2"></i>
//                                 Export
//                             </button>
//                         </div>
//                         <div className="bg-slate-900/50 rounded-2xl overflow-hidden">
//                             <table className="w-full text-left">
//                                 <thead className="bg-slate-800">
//                                     <tr>
//                                         <th className="p-4 font-semibold">Date</th>
//                                         <th className="p-4 font-semibold">Description</th>
//                                         <th className="p-4 font-semibold">Category</th>
//                                         <th className="p-4 font-semibold text-right">Amount</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody id="transaction-list">
//                                     {/* Populated by JS */}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     <div>
//                         <h2 className="text-2xl font-semibold mb-6">Other History</h2>
//                          <div className="bg-slate-900/50 p-6 rounded-2xl">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                  <button id="show-savings-history-btn" className="w-full btn-secondary p-3 rounded-lg flex items-center justify-center">
//                                     <i data-lucide="piggy-bank" className="w-5 h-5 mr-2"></i>
//                                     View Savings History
//                                 </button>
//                                 <button id="show-vault-history-btn" className="w-full btn-secondary p-3 rounded-lg flex items-center justify-center">
//                                     <i data-lucide="shield-check" className="w-5 h-5 mr-2"></i>
//                                     View Goal Vault History
//                                 </button>
//                                 <button id="show-budget-history-btn" className="w-full btn-secondary p-3 rounded-lg flex items-center justify-center">
//                                     <i data-lucide="pie-chart" className="w-5 h-5 mr-2"></i>
//                                     View Budget History
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     <div id="savings-history-container" className="hidden">
//                         <div className="flex justify-between items-center mb-6">
//                              <h2 className="text-2xl font-semibold">Savings Account History</h2>
//                              <button id="export-savings-history-btn" className="btn-secondary py-2 px-4 rounded-lg flex items-center">
//                                 <i data-lucide="file-spreadsheet" className="w-5 h-5 mr-2"></i>
//                                 Export
//                             </button>
//                         </div>
//                          <div className="bg-slate-900/50 p-6 rounded-2xl">
//                             <table className="w-full text-left">
//                                <thead className="border-b" style="borderColor: var(--color-border);">
//                                    <tr>
//                                        <th className="p-3 font-semibold">Date</th>
//                                        <th className="p-3 font-semibold">Action</th>
//                                        <th className="p-3 font-semibold">Details</th>
                                       
//                                    </tr>
//                                </thead>
//                                <tbody id="savings-history-list">
//                                    {/* Populated by JS */}
//                                </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     <div id="vault-history-container" className="hidden">
//                         <div className="flex justify-between items-center mb-6">
//                              <h2 className="text-2xl font-semibold">Goal Vault History</h2>
//                              <button id="export-vault-history-btn" className="btn-secondary py-2 px-4 rounded-lg flex items-center">
//                                 <i data-lucide="file-spreadsheet" className="w-5 h-5 mr-2"></i>
//                                 Export
//                             </button>
//                         </div>
//                          <div className="bg-slate-900/50 p-6 rounded-2xl">
//                             <table className="w-full text-left">
//                                <thead className="border-b" style="borderColor: var(--color-border);">
//                                    <tr>
//                                        <th className="p-3 font-semibold">Date</th>
//                                        <th className="p-3 font-semibold">Action</th>
//                                        <th className="p-3 font-semibold">Details</th>
//                                    </tr>
//                                </thead>
//                                <tbody id="vault-history-list">
//                                    {/* Populated by JS */}
//                                </tbody>
//                             </table>
//                         </div>
//                     </div>
                    
//                     <div id="budget-history-container" className="hidden">
//                         <div className="flex justify-between items-center mb-6">
//                             <h2 className="text-2xl font-semibold">Budget History</h2>
//                              <button id="export-budget-history-btn" className="btn-secondary py-2 px-4 rounded-lg flex items-center">
//                                 <i data-lucide="file-spreadsheet" className="w-5 h-5 mr-2"></i>
//                                 Export
//                             </button>
//                         </div>
//                         <div className="bg-slate-900/50 p-6 rounded-2xl">
//                              <table className="w-full text-left">
//                                <thead className="border-b" style="borderColor: var(--color-border);">
//                                    <tr>
//                                        <th className="p-3 font-semibold">Date</th>
//                                        <th className="p-3 font-semibold">Action</th>
//                                        <th className="p-3 font-semibold">Details</th>
//                                    </tr>
//                                </thead>
//                                <tbody id="budget-history-list">
//                                    {/* Populated by JS */}
//                                </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </section>
                
//                 {/* Settings Section */}
//                 <section id="settings" className="page-section hidden space-y-8">
//                     <div>
//                         <h2 className="text-2xl font-semibold mb-6">Settings</h2>
//                         <div className="bg-slate-900/50 p-6 rounded-2xl">
//                             <h3 className="text-lg font-semibold mb-4">Theme Customization</h3>
//                             <p className="text-sm text-text-secondary mb-6">Choose a color scheme for your dashboard.</p>
//                             <div id="theme-selector" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                                 {/* Theme options will be generated by JS */}
//                             </div>
//                         </div>
//                     </div>
//                      <div>
//                         <div className="bg-slate-900/50 p-6 rounded-2xl">
//                             <h3 className="text-lg font-semibold mb-4">Card Security</h3>
//                             <p className="text-sm text-text-secondary mb-6">Find your card's last known location.</p>
//                             <button id="locate-card-btn-settings" className="btn-secondary py-2 px-4 rounded-lg flex items-center">
//                                 <i data-lucide="map-pin" className="w-5 h-5 mr-2"></i>
//                                 Locate My Card
//                             </button>
//                         </div>
//                     </div>
//                     <div>
//                         <div className="bg-slate-900/50 p-6 rounded-2xl">
//                             <h3 className="text-lg font-semibold mb-4">Simulation Controls</h3>
//                             <p className="text-sm text-text-secondary mb-6">Advance time to see features like monthly returns.</p>
//                             <button id="simulate-payout-btn" className="btn-primary py-2 px-4 rounded-lg">Simulate Monthly Payout</button>
//                         </div>
//                     </div>
//                 </section>
//             </div>
//         </main>
//     </div>

//     {/* Mobile Sidebar and Modals (Unchanged from your original file) */}
//     <div id="mobile-sidebar" className="fixed inset-0 bg-slate-900 z-40 transform -translate-x-full transition-transform duration-300 ease-in-out sm:hidden">
//          <aside className="w-64 flex-shrink-0 flex flex-col h-full">
//             <div className="flex items-center justify-between px-4 h-20 border-b border-slate-700">
//                 <div className="flex items-center">
//                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" style="color: var(--color-primary)"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
//                     <h1 className="text-2xl font-bold ml-2">FinVault</h1>
//                 </div>
//                 <button id="close-mobile-menu" className="p-2">
//                     <i data-lucide="x" className="w-6 h-6"></i>
//                 </button>
//             </div>
//             <nav className="flex-1 px-2 py-4 space-y-2">
//                 <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg bg-slate-700" data-target="dashboard">
//                     <i data-lucide="layout-dashboard" className="w-6 h-6"></i><span className="ml-3">Dashboard</span>
//                 </a>
//                 <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700" data-target="card-control">
//                     <i data-lucide="credit-card" className="w-6 h-6"></i><span className="ml-3">Card Control</span>
//                 </a>
//                 <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700" data-target="budgets">
//                     <i data-lucide="pie-chart" className="w-6 h-6"></i><span className="ml-3">Budgets</span>
//                 </a>
//                 <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700" data-target="vaults">
//                     <i data-lucide="shield-check" className="w-6 h-6"></i><span className="ml-3">Vaults</span>
//                 </a>
//                 <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700" data-target="transactions">
//                     <i data-lucide="list" className="w-6 h-6"></i><span className="ml-3">Transactions</span>
//                 </a>
//                  <a href="#" className="nav-link flex items-center p-2 text-base font-normal rounded-lg hover:bg-slate-700" data-target="settings">
//                     <i data-lucide="settings" className="w-6 h-6"></i><span className="ml-3">Settings</span>
//                 </a>
//             </nav>
//         </aside>
//     </div>

//     {/* All your modals are here, unchanged. */}
//     <div id="onboarding-modal" className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden z-50 p-4">
//         <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md text-center">
//              <div id="onboarding-step-1">
//                 <i data-lucide="gem" className="w-12 h-12 text-green-400 mx-auto mb-4"></i>
//                 <h3 className="text-xl font-semibold mb-2">Welcome to FinVault!</h3>
//                 <p className="text-text-secondary mb-6">Your all-in-one financial command center. Let's take a quick tour.</p>
//                 <button className="onboarding-next btn-primary py-2 px-6 rounded-lg w-full">Next</button>
//              </div>
//              <div id="onboarding-step-2" className="hidden">
//                  <i data-lucide="pie-chart" className="w-12 h-12 text-sky-400 mx-auto mb-4"></i>
//                 <h3 className="text-xl font-semibold mb-2">Create Budget Jars</h3>
//                 <p className="text-text-secondary mb-6">Separate your money into categories like 'Food' or 'Shopping' to track your spending easily.</p>
//                 <div className="flex gap-4">
//                     <button className="onboarding-prev btn-secondary py-2 px-6 rounded-lg w-1/2">Previous</button>
//                     <button className="onboarding-next btn-primary py-2 px-6 rounded-lg w-1/2">Next</button>
//                 </div>
//              </div>
//              <div id="onboarding-step-3" className="hidden">
//                 <i data-lucide="credit-card" className="w-12 h-12 text-amber-400 mx-auto mb-4"></i>
//                 <h3 className="text-xl font-semibold mb-2">The Universal Card</h3>
//                 <p className="text-text-secondary mb-6">Assign any Budget Jar to your physical card to spend directly from it. You're always in control.</p>
//                  <div className="flex gap-4">
//                     <button className="onboarding-prev btn-secondary py-2 px-6 rounded-lg w-1/2">Previous</button>
//                     <button className="onboarding-finish btn-primary py-2 px-6 rounded-lg w-1/2">Let's Get Started!</button>
//                 </div>
//              </div>
//         </div>
//     </div>
    
//     <div id="qr-scanner-modal" className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden z-50 p-4">
//         <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm text-center">
//             <h3 className="text-xl font-semibold mb-4">Scan to Pay</h3>
//             <div className="relative w-64 h-64 mx-auto bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-600">
//                 <div className="absolute inset-0 bg-grid-slate-700/20"></div>
//                 <div className="qr-scanner-line"></div>
//             </div>
//             <p className="mt-4 text-text-secondary text-sm">Hold your camera up to a QR code</p>
//             <button className="mt-6 btn-secondary py-2 px-6 rounded-lg" data-action="close">Cancel</button>
//         </div>
//     </div>

//     <div id="map-modal" className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden z-50">
//         <div className="bg-slate-800 rounded-lg p-6 w-11/12 max-w-2xl text-center">
//             <h3 className="text-xl font-semibold mb-4">Locating Your Card...</h3>
//             <div className="aspect-video bg-slate-700 rounded-md flex items-center justify-center">
//                 <p></p>
//                 <i data-lucide="map" className="w-24 h-24 text-text-muted"></i>
//             </div>
//             <p className="mt-4 text-text-secondary">Last seen: 2 minutes ago at Tariq Road, Karachi</p>
//             <button id="close-map-modal" className="mt-6 btn-primary py-2 px-6 rounded-lg">Close</button>
//         </div>
//     </div>
    
//     <div id="add-money-modal" className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden z-50">
//         <div className="bg-slate-800 rounded-lg p-6 w-11/12 max-w-md">
//             <h3 className="text-xl font-semibold mb-4">Add Money to Current Account</h3>
//             <form id="add-money-form" className="space-y-4">
//                 <div>
//                     <label htmlFor="add-money-amount" className="block text-sm font-medium text-text-primary mb-1">Amount</label>
//                     <input type="number" id="add-money-amount" name="add-money-amount" className="w-full bg-slate-700 border-slate-600 rounded-md p-2" placeholder="e.g., 10000" required/>
//                 </div>
//                 <div>
//                     <label htmlFor="add-money-source" className="block text-sm font-medium text-text-primary mb-1">Source</label>
//                     <select id="add-money-source" name="add-money-source" className="w-full bg-slate-700 border-slate-600 rounded-md p-2">
//                         <option>Linked Bank Account (**** 1234)</option>
//                         <option>Debit Card (**** 5678)</option>
//                     </select>
//                 </div>
//                 <div className="flex justify-end gap-4 pt-4">
//                     <button type="button" className="btn-secondary py-2 px-4 rounded-lg" data-action="close">Cancel</button>
//                     <button type="submit" className="btn-primary py-2 px-4 rounded-lg">Add Money</button>
//                 </div>
//             </form>
//         </div>
//     </div>
    
//     <div id="send-money-modal" className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden z-50">
//         <div className="bg-slate-800 rounded-lg p-6 w-11/12 max-w-md">
//             <h3 className="text-xl font-semibold mb-4">Send Money</h3>
//             <form id="send-money-form" className="space-y-4">
//                  <div>
//                     <label htmlFor="send-money-recipient" className="block text-sm font-medium text-text-primary mb-1">Recipient Account/IBAN</label>
//                     <input type="text" id="send-money-recipient" name="send-money-recipient" className="w-full bg-slate-700 border-slate-600 rounded-md p-2" placeholder="e.g., PK36SCBL0000001123456789" required/>
//                 </div>
//                 <div>
//                     <label htmlFor="send-money-amount" className="block text-sm font-medium text-text-primary mb-1">Amount</label>
//                     <input type="number" id="send-money-amount" name="send-money-amount" className="w-full bg-slate-700 border-slate-600 rounded-md p-2" placeholder="e.g., 2500" required/>
//                 </div>
//                 <div>
//                     <label htmlFor="send-money-service" className="block text-sm font-medium text-text-primary mb-1">Service</label>
//                     <select id="send-money-service" name="send-money-service" className="w-full bg-slate-700 border-slate-600 rounded-md p-2">
//                         <option>Bank Transfer</option>
//                         <option>JazzCash</option>
//                         <option>Easypaisa</option>
//                     </select>
//                 </div>
//                 <div className="flex justify-end gap-4 pt-4">
//                     <button type="button" className="btn-secondary py-2 px-4 rounded-lg" data-action="close">Cancel</button>
//                     <button type="submit" className="btn-primary py-2 px-4 rounded-lg">Send Money</button>
//                 </div>
//             </form>
//         </div>
//     </div>

//     <div id="new-vault-modal" className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden z-50">
//         <div className="bg-slate-800 rounded-lg p-6 w-11/12 max-w-md">
//             <h3 className="text-xl font-semibold mb-4">Create New Vault</h3>
//             <form id="new-vault-form" className="space-y-4">
//                 <div>
//                     <label htmlFor="vault-name" className="block text-sm font-medium text-text-primary mb-1">Vault Name</label>
//                     <input type="text" id="vault-name" name="vault-name" className="w-full bg-slate-700 border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-green-500" placeholder="e.g., Vacation Trip" required/>
//                 </div>
//                 <div>
//                     <label htmlFor="vault-target" className="block text-sm font-medium text-text-primary mb-1">Target Amount</label>
//                     <input type="number" id="vault-target" name="vault-target" className="w-full bg-slate-700 border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-green-500" placeholder="e.g., 200000" required/>
//                 </div>
//                 <div className="flex justify-end gap-4 pt-4">
//                     <button type="button" className="btn-secondary py-2 px-4 rounded-lg" data-action="close">Cancel</button>
//                     <button type="submit" className="btn-primary py-2 px-4 rounded-lg">Create Vault</button>
//                 </div>
//             </form>
//         </div>
//     </div>
    
//     <div id="new-budget-modal" className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden z-50">
//         <div className="bg-slate-800 rounded-lg p-6 w-11/12 max-w-md">
//             <h3 className="text-xl font-semibold mb-4">Create New Budget</h3>
//             <form id="new-budget-form" className="space-y-4">
//                 <div>
//                     <label htmlFor="budget-name" className="block text-sm font-medium text-text-primary mb-1">Budget Name</label>
//                     <input type="text" id="budget-name" name="budget-name" className="w-full bg-slate-700 border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-green-500" placeholder="e.g., Groceries" required/>
//                 </div>
//                 <div>
//                     <label htmlFor="budget-limit" className="block text-sm font-medium text-text-primary mb-1">Monthly Limit</label>
//                     <input type="number" id="budget-limit" name="budget-limit" className="w-full bg-slate-700 border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-green-500" placeholder="e.g., 25000" required/>
//                 </div>
//                 <div className="flex justify-end gap-4 pt-4">
//                     <button type="button" className="btn-secondary py-2 px-4 rounded-lg" data-action="close">Cancel</button>
//                     <button type="submit" className="btn-primary py-2 px-4 rounded-lg">Create Budget</button>
//                 </div>
//             </form>
//         </div>
//     </div>

//     <div id="update-budget-modal" className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden z-50">
//         <div className="bg-slate-800 rounded-lg p-6 w-11/12 max-w-md">
//             <h3 className="text-xl font-semibold mb-4">Update Budget</h3>
//             <form id="update-budget-form" className="space-y-4">
//                 <input type="hidden" id="update-budget-id" name="update-budget-id"/>
//                 <div>
//                     <label htmlFor="update-budget-name" className="block text-sm font-medium text-text-primary mb-1">Budget Name</label>
//                     <input type="text" id="update-budget-name" name="update-budget-name" className="w-full bg-slate-700 border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-green-500" required/>
//                 </div>
//                 <div>
//                     <label htmlFor="update-budget-limit" className="block text-sm font-medium text-text-primary mb-1">Monthly Limit</label>
//                     <input type="number" id="update-budget-limit" name="update-budget-limit" className="w-full bg-slate-700 border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-green-500" required/>
//                 </div>
//                 <div className="flex justify-end gap-4 pt-4">
//                     <button type="button" className="btn-secondary py-2 px-4 rounded-lg" data-action="close">Cancel</button>
//                     <button type="submit" className="btn-primary py-2 px-4 rounded-lg">Update Budget</button>
//                 </div>
//             </form>
//         </div>
//     </div>

//     <div id="vault-action-modal" className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden z-50">
//         <div className="bg-slate-800 rounded-lg p-6 w-11/12 max-w-md">
//             <h3 id="vault-action-title" className="text-xl font-semibold mb-4">Vault Action</h3>
//             <form id="vault-action-form" className="space-y-4">
//                 <input type="hidden" id="vault-action-id" name="vault-action-id"/>
//                 <input type="hidden" id="vault-action-type" name="vault-action-type"/>
//                 <div>
//                     <label htmlFor="vault-action-amount" className="block text-sm font-medium text-text-primary mb-1">Amount</label>
//                     <input type="number" id="vault-action-amount" name="vault-action-amount" className="w-full bg-slate-700 border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-green-500" placeholder="e.g., 5000" required/>
//                 </div>
//                 <div className="flex justify-end gap-4 pt-4">
//                     <button type="button" className="btn-secondary py-2 px-4 rounded-lg" data-action="close">Cancel</button>
//                     <button type="submit" id="vault-action-submit" className="btn-primary py-2 px-4 rounded-lg">Confirm</button>
//                 </div>
//             </form>
//         </div>
//     </div>

//     <div id="confirm-delete-modal" className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden z-50">
//         <div className="bg-slate-800 rounded-lg p-6 w-11/12 max-w-md text-center">
//             <i data-lucide="alert-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4"></i>
//             <h3 id="confirm-delete-title" className="text-xl font-semibold mb-2">Are you sure?</h3>
//             <p id="confirm-delete-message" className="text-text-secondary mb-6">This action cannot be undone.</p>
//             <div className="flex justify-center gap-4">
//                 <button type="button" className="btn-secondary py-2 px-6 rounded-lg" data-action="close">Cancel</button>
//                 <button type="button" id="confirm-delete-btn" className="btn-danger py-2 px-6 rounded-lg">Delete</button>
//             </div>
//         </div>
//     </div>

//     <div id="toast-notification" className="fixed bottom-8 right-8 bg-green-600 text-white py-3 px-6 rounded-lg shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out z-50">
//         <p id="toast-message"></p>
//     </div>

//     {/* Your script, now a module */}
//     <script type="module" src="/src/main.js"></script>
// </div>
//   )
// */}

 export default App
