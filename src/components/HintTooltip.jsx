// src/components/HintTooltip.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HintTooltip = ({ hint, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onTouchStart={() => setIsOpen(true)}
      onTouchEnd={() => setIsOpen(false)}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[9999] bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none"
          >
            <div className="bg-sidebar text-text-primary text-xs rounded-lg px-3 py-2 border border-white/20 shadow-xl max-w-[200px] w-max text-center whitespace-normal">
              {hint}
            </div>
            {/* Arrow pointing DOWN toward trigger */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-sidebar" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HintTooltip;