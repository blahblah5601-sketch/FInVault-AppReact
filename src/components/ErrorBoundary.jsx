// src/components/ErrorBoundary.jsx
import React, { useState } from 'react';

/**
 * Error Boundary component to catch JavaScript errors in the component tree
 * Prevents entire app from crashing when a component fails
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to trigger fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, send to logging service)
    // Error logged via monitoring service
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    // Reset error state and reload
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-panel rounded-2xl p-8 border" style={{
              backgroundColor: 'var(--color-panel)',
              borderColor: 'var(--color-border)'
            }}>
              {/* Error Icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(214, 59, 59, 0.1)' }}>
                <svg className="w-8 h-8" style={{ color: '#d63b3b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>

              {/* Error Message */}
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Something went wrong
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                An unexpected error occurred. We've logged the issue and you can try reloading the app.
              </p>

              {/* Error Details (collapsible) */}
              {this.state.error && process.env.NODE_ENV === 'development' && (
                <details className="text-left mb-4">
                  <summary className="text-xs cursor-pointer hover:underline" style={{ color: 'var(--color-text-muted)' }}>
                    Error Details (click to expand)
                  </summary>
                  <pre className="mt-2 p-3 text-xs rounded"
                       style={{
                         backgroundColor: 'rgba(13,15,26,0.5)',
                         color: '#ff6b6b',
                         overflow: 'auto',
                         maxHeight: '200px'
                       }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  Go Home
                </button>
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'white'
                  }}
                >
                  Reload App
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
