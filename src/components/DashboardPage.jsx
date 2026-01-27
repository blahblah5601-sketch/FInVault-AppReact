//src/components/DashboardPage.jsx
import DashboardBudgetItem from './DashboardBudgetItem';
import DashboardVaultItem from './DashboardVaultItem';


//Previous DashboardPage implementation commented out for reference
function DashboardPage({ accounts, budgets, vaults }) {
  const mainAccount = accounts.find(a => a.id === 'current');

  return (
    /* h-full and overflow-hidden removes the page scroll */
    <section id="dashboard" className="h-full flex flex-col space-y-6 overflow-hidden p-4">
      
      {/* Top Section: Centered Financial Hero */}
      <div className="flex-none flex flex-col items-center justify-center py-8 bg-background/30 rounded-3xl border border-white/5">
        <p className="text-base text-text-secondary uppercase tracking-widest">Active Account</p>
        <h3 className="text-2xl font-bold mt-1">
          {mainAccount ? mainAccount.name : 'Primary Account'}
        </h3>
        
        <div className="mt-6 text-center">
          <p className="text-base text-text-secondary">Total Balance</p>
          <p className="text-5xl font-extrabold tracking-tight mt-2">
            Rs {mainAccount ? mainAccount.balance.toLocaleString('en-US') : '0.00'}
          </p>
          <p className="text-xl font-mono tracking-[0.2em] mt-4 opacity-50">**** 8021</p>
        </div>

        {/* Foundation for Payment Options: Quick Actions */}
        <div className="flex gap-4 mt-8">
           <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
             Send Money
           </button>
           <button className="bg-white/10 text-white px-8 py-3 rounded-xl font-bold border border-white/10 hover:bg-white/20 transition-all">
             Add Funds
           </button>
        </div>
      </div>

      {/* Bottom Section: Scrollable Grid for Items (if they overflow) */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Summary */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex justify-between items-center">
              Budgets <span className="text-sm font-normal text-primary">View All</span>
            </h2>
            <div className="grid gap-4">
              {budgets.slice(0, 2).map(budget => (
                <DashboardBudgetItem key={budget.id} budget={budget} />
              ))}
            </div>
          </div>

          {/* Vault Summary */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex justify-between items-center">
              Vaults <span className="text-sm font-normal text-primary">View All</span>
            </h2>
            <div className="grid gap-4">
              {vaults.slice(0, 2).map(vault => (
                <DashboardVaultItem key={vault.id} vault={vault} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;


