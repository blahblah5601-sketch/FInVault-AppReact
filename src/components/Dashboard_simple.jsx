//src/components/dashboard_modals/Dashboard_simple.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import CentralSun from './dashboard_modals/CentralSun';
import BudgetPlanet from './dashboard_modals/BudgetPlanet';
import VaultPlanet from './dashboard_modals/VaultPlanet';
import CardCarousel from './dashboard_modals/CardCarousel';

const RADIUS = 250; // Orbit distance from Sun
// const mockCards = [  {    id: 'card-1',    account_no: '****1234',    account_type: 'Premium Checking',    balance: 12450.75,    budget: { name: 'Monthly Budget', progress: 68 },    vault: { name: 'Emergency Fund', balance: 5000 }  },  {    id: 'card-2',    account_no: '****5678',    account_type: 'Savings Account',    balance: 8320.50,    budget: { name: 'Vacation Fund', progress: 42 },    vault: { name: 'Dream Home', balance: 15000 }  },  {    id: 'card-3',    account_no: '****9012',    account_type: 'Investment Account',    balance: 25680.25,    budget: { name: 'Tech Gadgets', progress: 85 },    vault: { name: 'Retirement', balance: 45000 }  }];


export default function Dashboard_simple({ accounts, budgets, vaults, setActivePage, activePage }) {
  const navItems = [
    { id: 'dashboard'},
    { id: 'card-control'},
    { id: 'budgets'},
    { id: 'vaults' },
    ];
  
  const [selectedCard, setSelectedCard] = useState(accounts?.[0] || null);
  return (
    <section id="dashboard_simple" className="relative h-full w-full bg-[#030712] overflow-hidden flex items-center justify-center">
      {navItems.map(item => (
          <a
            key={item.id}
            href="#"
            // Highlight the link if its id matches the activePage state
            className={`nav-link flex items-center p-2 text-base font-normal rounded-lg ${
              activePage === item.id? 'bg-primary/10 text-primary font-medium' 
                  : 'text-text-secondary hover:bg-sidebar-hover'
            }`}
            // When clicked, call setActivePage to change the state in AppLayout
            onClick={(e) => { e.preventDefault(); setActivePage(item.id);  
            }}
          >
          </a>
        ))}

      {/* 1. ROTATING BACKGROUND LAYER */}
      <motion.div 
        className="absolute inset-[-50%] opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0id2hpdGUiIC8+PC9zdmc+")`,
          backgroundSize: '200px 200px'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
      />

      {/* 2. THE ZERO-POINT ANCHOR (Centered flex container) */}
      <div className="relative w-0 h-0 flex items-center justify-center">
        
        {/* CENTERED SUN (Removed its own rotation) */}
        <CentralSun 
          balance={selectedCard?.balance || 0} 
          accountNo={selectedCard?.account_no || "****"}
          setActivePage={setActivePage}
        />

        {/* LEFT HEMISPHERE: BUDGETS */}
        {budgets?.slice(0, 3).map((budget, i) => {
          const angles = [140, 180, 220]; // Symmetrical curve on the left
          return (
            <BudgetPlanet 
              key={budget.id}
              name={budget.name}
              progress={(budget.spent / budget.limit) * 100}
              orbitPosition={{ angle: angles[i], radius: RADIUS+10 }}
              setActivePage={setActivePage}
            />
          );
        })}

        {/* RIGHT HEMISPHERE: VAULTS */}
        {vaults?.slice(0, 3).map((vault, i) => {
          const angles = [-50, 0, 50]; // Symmetrical curve on the right
          return (
            <VaultPlanet 
              key={vault.id}
              name={vault.name}
              balance={vault.current}
              orbitPosition={{ angle: angles[i], radius: RADIUS-50 }}
              setActivePage={setActivePage}
            />
          );
        })}
      </div>

      {/* FIXED UI ELEMENTS */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center z-50">
        <CardCarousel 
          cards={accounts} 
          selectedCard={selectedCard?.id} 
          onSelectCard={setSelectedCard} 
        />
      </div>
    </section>
  );
};

