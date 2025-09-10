// src/components/DashboardPage.jsx
import DashboardBudgetItem from './DashboardBudgetItem';
import DashboardVaultItem from './DashboardVaultItem';

function DashboardPage({ accounts, budgets, vaults }) {
  const mainAccount = accounts.find(a => a.id === 'current');

  return (
    <section id="dashboard" className="page-section space-y-8">
      {/* Card and AI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Premium Smart Card */}
          <div id="smart-card-display" className="card-gradient p-6 rounded-2xl shadow-lg relative h-56 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">Active Account</p>
                <h3 id="active-account-name" className="text-xl font-semibold">
                  {mainAccount ? mainAccount.name : '...'}
                </h3>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-sm text-slate-400">Total Balance</p>
              <p id="card-balance" className="text-3xl font-bold">
                Rs {mainAccount ? mainAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </p>
              <p id="card-number" className="text-lg font-mono tracking-widest mt-2 text-slate-300">**** **** **** 8021</p>
            </div>
          </div>
          {/* ... Quick Actions buttons will go here ... */}
        </div>

        {/* AI Financial Advisor */}
        <div className="bg-background/50 p-6 rounded-2xl flex flex-col">
           {/* ... AI Advisor content will go here ... */}
        </div>
      </div>

      {/* Budget Jars */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Budget Jars</h2>
          <button className="nav-link text-sm btn-secondary py-1 px-3 rounded-md" data-target="transactions">View History</button>
        </div>
        <div id="dashboard-budgets" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.slice(0, 3).map(budget => (
            <DashboardBudgetItem key={budget.id} budget={budget} />
          ))}
        </div>
      </div>

      {/* Savings Vaults */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Savings Vaults</h2>
          <button className="nav-link text-sm btn-secondary py-1 px-3 rounded-md" data-target="transactions">View History</button>
        </div>
        <div id="dashboard-vaults" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map(vault => (
            <DashboardVaultItem key={vault.id} vault={vault} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;