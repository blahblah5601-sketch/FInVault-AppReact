// components/VaultPlanet.jsx
import { motion } from 'framer-motion';

/**
 * VaultPlanet Component - Displays vault savings with glassmorphic design
 * @param {Object} props
 * @param {string} props.name - Vault name
 * @param {number} props.balance - Vault balance
 * @param {Object} props.orbitPosition - Position in orbit {angle, radius}
 */
export default function VaultPlanet({ name, balance, orbitPosition }) {
  const x = orbitPosition.radius * Math.cos((orbitPosition.angle * Math.PI) / 180);
  const y = orbitPosition.radius * Math.sin((orbitPosition.angle * Math.PI) / 180);

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{ x, y }}
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ delay: 0.5, duration: 0.7 }}
    >
      {/* Planet Body - Glassmorphic Rounded Square */}
      <motion.div
        className="relative w-44 h-44 rounded-3xl overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        {/* Glassmorphic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-cyan-400/30"></div>

        {/* Frosted Glass Effect Layers */}
        <div className="absolute inset-0 bg-white/5"></div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>

        {/* Lock Icon */}
        <div className="absolute top-4 right-4">
          <svg className="w-6 h-6 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center gap-3 p-6">
          <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            {name}
          </p>

          <motion.div
            key={balance}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-3xl font-bold text-white">
              ${balance.toLocaleString('en-US')}
            </p>
          </motion.div>

          <div className="flex items-center gap-1 text-green-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Secured</span>
          </div>
        </div>

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
        />
      </motion.div>

      {/* Glow */}
      <div className="absolute inset-0 rounded-3xl bg-cyan-500/20 blur-xl -z-10"></div>
    </motion.div>
  );
}
