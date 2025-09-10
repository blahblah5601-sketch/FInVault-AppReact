// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        sidebar: 'var(--color-sidebar)',
        panel: 'var(--color-panel)',
        interactive: 'var(--color-interactive)', 
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)' // We can add hover variants later
        },
        border: 'var(--color-border)',
        text: {
            primary: 'var(--color-text-primary)',
            secondary: 'var(--color-text-secondary)',
            muted: 'var(--color-text-muted)',
          }
        }
    },
  },
  plugins: [],
}