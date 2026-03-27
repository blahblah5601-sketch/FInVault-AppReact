// src/components/LoadingSkeleton.jsx

/**
 * Reusable loading skeleton component
 * Shows placeholder content while data loads
 */
function LoadingSkeleton({ className = "", width = "100%", height = "20px", rounded = "md" }) {
  const roundedClasses = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  return (
    <div
      className={`animate-pulse bg-sidebar ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
      aria-label="Loading..."
      role="status"
    />
  );
}

export default LoadingSkeleton;