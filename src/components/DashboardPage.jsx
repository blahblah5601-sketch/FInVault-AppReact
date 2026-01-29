// src/components/DashboardPage.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import CentralSun from './dashboard_modals/CentralSun';
import BudgetPlanet from './dashboard_modals/BudgetPlanet';
import VaultPlanet from './dashboard_modals/VaultPlanet';
import CardCarousel from './dashboard_modals/CardCarousel';

const mockCards = [  {    id: 'card-1',    account_no: '****1234',    account_type: 'Premium Checking',    balance: 12450.75,    budget: { name: 'Monthly Budget', progress: 68 },    vault: { name: 'Emergency Fund', balance: 5000 }  },  {    id: 'card-2',    account_no: '****5678',    account_type: 'Savings Account',    balance: 8320.50,    budget: { name: 'Vacation Fund', progress: 42 },    vault: { name: 'Dream Home', balance: 15000 }  },  {    id: 'card-3',    account_no: '****9012',    account_type: 'Investment Account',    balance: 25680.25,    budget: { name: 'Tech Gadgets', progress: 85 },    vault: { name: 'Retirement', balance: 45000 }  }];

function DashboardPage({ accounts, budgets, vaults }) {
  const [selectedCard, setSelectedCard] = useState(mockCards[0]);
  const selectedAccount = accounts.find(a => a.id === 'current') || accounts[0];
  const RADIUS = 280; // Distance from the center

  return (
    <section className="relative w-full h-full bg-[#050510] overflow-hidden flex items-center justify-center">
      
      {/* STAR FIELD BACKGROUND */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,...')] " />

      {/* THE ZERO-POINT ANCHOR */}
      <div className="relative flex items-center justify-center">
        
        {/* CENTERED SUN */}
        <CentralSun 
          balance={selectedAccount?.balance || 0} 
          accountType={selectedAccount?.name || "Primary"} 
        />

        {/* LEFT HEMISPHERE: BUDGETS */}
        {budgets.slice(0, 3).map((budget, i) => {
          const angles = [150, 180, 210]; // Curved left
          return (
            <BudgetPlanet 
              key={budget.id}
              name={budget.name}
              progress={(budget.spent / budget.limit) * 100}
              orbitPosition={{ angle: angles[i], radius: RADIUS }}
            />
          );
        })}

        {/* RIGHT HEMISPHERE: VAULTS */}
        {vaults.slice(0, 3).map((vault, i) => {
          const angles = [-30, 0, 30]; // Curved right
          return (
            <VaultPlanet 
              key={vault.id}
              name={vault.name}
              balance={vault.current}
              orbitPosition={{ angle: angles[i], radius: RADIUS }}
            />
          );
        })}
      </div>

      {/* FIXED CAROUSEL */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center z-50">
        <CardCarousel cards={accounts} selectedCard={selectedAccount} />
      </div>
    </section>
  );
}

export default DashboardPage;