// Test component to verify design system consistency
// This file demonstrates the new design system tokens and classes

export function DesignSystemDemo() {
  return (
    <div style={{ padding: '20px', fontFamily: "'Sora', sans-serif" }}>
      <h2>Design System Demo</h2>

      <h3>Spacing Scale</h3>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ width: 'var(--space-xxs)', height: '20px', background: '#c9a84c' }} title="--space-xxs"></div>
        <div style={{ width: 'var(--space-xs)', height: '20px', background: '#c9a84c' }} title="--space-xs"></div>
        <div style={{ width: 'var(--space-sm)', height: '20px', background: '#c9a84c' }} title="--space-sm"></div>
        <div style={{ width: 'var(--space-md)', height: '20px', background: '#c9a84c' }} title="--space-md"></div>
        <div style={{ width: 'var(--space-lg)', height: '20px', background: '#c9a84c' }} title="--space-lg"></div>
        <div style={{ width: 'var(--space-xl)', height: '20px', background: '#c9a84c' }} title="--space-xl"></div>
      </div>

      <h3>Border Radius Scale</h3>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: '60px', height: '40px', background: '#c9a84c', borderRadius: 'var(--radius-xs)' }} title="--radius-xs"></div>
        <div style={{ width: '60px', height: '40px', background: '#c9a84c', borderRadius: 'var(--radius-sm)' }} title="--radius-sm"></div>
        <div style={{ width: '60px', height: '40px', background: '#c9a84c', borderRadius: 'var(--radius-md)' }} title="--radius-md"></div>
        <div style={{ width: '60px', height: '40px', background: '#c9a84c', borderRadius: 'var(--radius-lg)' }} title="--radius-lg"></div>
        <div style={{ width: '60px', height: '40px', background: '#c9a84c', borderRadius: 'var(--radius-xl)' }} title="--radius-xl"></div>
      </div>

      <h3>Typography Scale</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: 'var(--text-xs)' }}>Text XS (10px)</span>
        <span style={{ fontSize: 'var(--text-sm)' }}>Text SM (11px)</span>
        <span style={{ fontSize: 'var(--text-base)' }}>Text Base (12px)</span>
        <span style={{ fontSize: 'var(--text-md)' }}>Text MD (13px)</span>
        <span style={{ fontSize: 'var(--text-lg)' }}>Text LG (14px)</span>
        <span style={{ fontSize: 'var(--text-xl)' }}>Text XL (15px)</span>
        <span style={{ fontSize: 'var(--text-2xl)' }}>Text 2XL (16px)</span>
      </div>

      <h3>Buttons</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
        <button className="btn btn-danger">Danger</button>
        <button className="btn btn-ghost">Ghost</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
        <button className="btn btn-primary btn-sm">Small</button>
        <button className="btn btn-primary">Normal</button>
        <button className="btn btn-primary btn-lg">Large</button>
      </div>

      <h3>Form Inputs</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input className="form-input" placeholder="Standard input" />
        <input className="form-input-sm" placeholder="Small input" />
        <input className="form-input-lg" placeholder="Large input" />
      </div>
    </div>
  );
}