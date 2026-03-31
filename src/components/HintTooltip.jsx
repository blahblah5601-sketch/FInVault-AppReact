// src/components/HintTooltip.jsx
import { useState } from 'react';

const HintTooltip = ({ hint, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)} onTouchStart={() => setIsOpen(true)} onTouchEnd={() => setIsOpen(false)}>
      {children}
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 transform -translate-x-1/2">
          <div className="bg-background/90 backdrop-blur-sm text-text-primary text-xs rounded-lg px-3 py-2 border border-white/20 shadow-lg max-w-xs w-48">
            {hint}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-background/90 backdrop-blur-sm rotate-45 border border-white/20"></div>
        </div>
      )}
    </div>
  );
};

export default HintTooltip;