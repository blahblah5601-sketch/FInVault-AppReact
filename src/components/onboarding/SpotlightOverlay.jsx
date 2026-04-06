// src/components/onboarding/SpotlightOverlay.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SpotlightOverlay = ({ targetSelector, hint, onNext, onSkip }) => {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!targetSelector) {
      setRect(null);
      return;
    }

    const measureTarget = () => {
      const el = document.querySelector(targetSelector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height
        });
      } else {
        setRect(null);
      }
    };

    measureTarget();

    // Re-measure on resize in case layout shifts
    window.addEventListener('resize', measureTarget);
    return () => window.removeEventListener('resize', measureTarget);
  }, [targetSelector]);

  // If no target found, render nothing
  if (!rect) return null;

  const padding = 10;

  // The spotlight is a fixed div positioned exactly over the target element
  // box-shadow creates the dark overlay outside the spotlight area
  const spotlightStyle = {
    position: 'fixed',
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
    borderRadius: '12px',
    // This creates the darkened surround effect:
    // The box-shadow spreads 9999px in all directions, darkening everything outside this element
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
    zIndex: 9998,
    pointerEvents: 'none' // allow clicks to pass through TO the highlighted element
  };

  // Position tooltip below the spotlight if there's room, otherwise above
  const spaceBelow = window.innerHeight - (rect.top + rect.height + padding);
  const tooltipTop = spaceBelow > 120
    ? rect.top + rect.height + padding + 12
    : rect.top - padding - 100; // above if not enough space below

  // Keep tooltip horizontally within viewport
  const tooltipLeft = Math.max(
    16,
    Math.min(rect.left, window.innerWidth - 232)
  );

  return (
    <>
      {/* Spotlight cutout — uses box-shadow to darken surroundings */}
      <div style={spotlightStyle} />

      {/* Tooltip and controls — pointer-events enabled here */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          top: tooltipTop,
          left: tooltipLeft,
          zIndex: 9999,
          width: 216
        }}
      >
        <div className="bg-panel border border-white/20 rounded-xl p-4 shadow-2xl">
          <p className="text-sm text-text-secondary mb-3 leading-relaxed">{hint}</p>
          <div className="flex gap-2">
            <button
              onClick={onNext}
              className="flex-1 btn-primary py-1.5 px-3 rounded-lg text-sm"
            >
              Got it
            </button>
            <button
              onClick={onSkip}
              className="text-xs text-text-muted hover:text-text-primary py-1.5 px-2 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
        {/* Small arrow pointing up toward the spotlight */}
        <div
          className="absolute -top-2 left-4 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '8px solid var(--color-panel)'
          }}
        />
      </motion.div>
    </>
  );
};

export default SpotlightOverlay;