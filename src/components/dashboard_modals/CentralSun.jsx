// components/CentralSun.jsx
import { motion } from 'framer-motion';

export default function CentralSun({accountType, accountNo, balance, setActivePage }) {
  const AccountType = accountType || "Default Account";


  return (
    <motion.div
      className="absolute flex items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Static Glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-orange-500/20 blur-[100px]" />
      
      {/* Main Sun Body (STATIONARY) */}
      <div className="relative z-10 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 shadow-[0_0_50px_rgba(249,115,22,0.5)] flex flex-col items-center justify-center text-center p-8" onClick={() => setActivePage('dashboard')}>
        <p className="text-orange-900/60 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</p>
        <motion.p
          key={balance}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-white drop-shadow-md"
        >
          ${balance.toLocaleString()}
        </motion.p>
        <p className="mt-2 text-orange-950/50 font-mono text-sm">{accountNo}</p>
        {/* Account Type */}
           <motion.p
             key={accountType}
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-xs font-semibold text-orange-900 uppercase tracking-wider"
           >
             {AccountType}
           </motion.p>
      </div>

      {/* Decorative Rotating Rays */}
      <svg className="absolute w-[120%] h-[120%]" viewBox="0 0 100 100">
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50% 50%' }}
        >
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="50" y1="5" x2="50" y2="15"
              stroke="white"
              strokeWidth="0.5"
              strokeOpacity="0.3"
              transform={`rotate(${i * 30} 50 50)`}
            />
          ))}
        </motion.g>
      </svg>
    </motion.div>
  );
};