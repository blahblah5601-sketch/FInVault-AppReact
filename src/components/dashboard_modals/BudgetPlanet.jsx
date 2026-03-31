// components/BudgetPlanet.jsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
/**
 * BudgetPlanet Component - Shows budget progress as a radial ring
 * @param {Object} props
 * @param {string} props.name - Budget name
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {Object} props.orbitPosition - Position in orbit {angle, radius}
 */
export default function BudgetPlanet({ name, progress, orbitPosition, setActivePage}) {
  const [animatedProgress, setAnimatedProgress] = useState(0);  
  useEffect(() => {
    setAnimatedProgress(progress);
  }, [progress]);

  if (!orbitPosition) return null;
  // Convert polar to cartesian coordinates
  const x = orbitPosition.radius* Math.cos((orbitPosition.angle* Math.PI) / 180);
  const y = orbitPosition.radius* Math.sin((orbitPosition.angle* Math.PI) / 180);

  // SVG Circle Math: Circumference = 2πr
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      // style={{ x, y }}
      style={{ left: '50%', top: '50%', translateX: x, translateY: y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >

      {/* Planet Body */}
      <div className="relative w-40 h-40 flex items-center justify-center rounded-full cursor-pointer" onClick={() => setActivePage('budgets')}>
        {/* Background Circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-900/40 to-purple-700/40 backdrop-blur-sm border border-purple-500/30"></div>
        {/* SVG Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(168, 85, 247, 0.2)"
            strokeWidth="8"
          />
          
          {/* Progress Ring */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center gap-1 p-6">
        {/* <div className="relative z-10 flex flex-col items-center gap-2"> */}
          <p className="text-s text-purple-300 text-center uppercase tracking-wider">{name}</p>
          <motion.p
            key={progress}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold text-white"
          >
            {Math.round(animatedProgress)}%
          </motion.p>
          {/* <p className="text-sm text-purple-200">
            <span className="font-mono">Rs {budget.spent.toLocaleString('en-US')}</span> {" "}/{" "} <span className="font-mono"> {budget.toLocaleString('en-US')}</span>
          </p> */}
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl -z-10"></div>
    </motion.div>
  );
}
