// src/components/panels/SlideUpPanel.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const SlideUpPanel = ({ isOpen, onClose, title, children, className = '' }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Determine if we're on mobile (width < 768px)
  useEffect(() => {
    const updateMobileStatus = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };

    // Initial check
    updateMobileStatus();

    // Listen for resize events
    window.addEventListener('resize', updateMobileStatus);
    return () => window.removeEventListener('resize', updateMobileStatus);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm`}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`relative w-full max-w-lg mx-4 mb-6 ${className}`}
            style={{ height: isMobile ? '100vh' : '600px' }}
          >
            {/* Drag handle */}
            <div className="w-12 h-0.5 bg-white/20 rounded mb-4" />

            {/* Panel content */}
            <div className="bg-background/90 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-xs btn-danger py-1 px-2 rounded"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SlideUpPanel;