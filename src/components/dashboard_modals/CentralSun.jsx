// components/CentralSun.jsx
import { motion } from 'framer-motion';

/**
 * CentralSun Component
 * @param {Object} props
 * @param {string} props.accountType - Type of account
 * @param {string} props.accountNo - Account number (masked)
 * @param {number} props.balance - Current balance
 */
export default function CentralSun({ accountType, accountNo, balance }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 blur-3xl opacity-50 scale-150"></div>
      
      {/* Main Sun Body */}
      <motion.div
        className="relative w-72 h-72 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 shadow-2xl shadow-orange-500/50 flex flex-col items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        {/* Inner Circle */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex flex-col items-center justify-center gap-3 p-6">
          
          {/* Account Type */}
          <motion.p
            key={accountType}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold text-orange-900 uppercase tracking-wider"
          >
            {accountType}
          </motion.p>

          {/* Balance - Main Focus */}
          <motion.div
            key={balance}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="text-center"
          >
            <p className="text-5xl font-bold text-white drop-shadow-lg">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          {/* Account Number */}
          <motion.p
            key={accountNo}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-orange-900/80"
          >
            {accountNo}
          </motion.p>
        </div>

        {/* Rotating Rays */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <motion.g
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '50% 50%' }}
          >
            {[...Array(8)].map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="5"
                x2="50"
                y2="15"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="0.5"
                strokeLinecap="round"
                transform={`rotate(${i * 45} 50 50)`}
              />
            ))}
          </motion.g>
        </svg>
      </motion.div>
    </motion.div>
  );
}
