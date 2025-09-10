// src/theme.js

export const themes = {
    'Slate': {
        '--color-bg': '#020617', '--color-sidebar': '#0f172a', '--color-panel': '#1e293b',
        '--color-interactive': '#475569', // <-- ADD THIS
        '--color-card-gradient-from': '#334155', '--color-card-gradient-to': '#0f172a',
        '--color-primary': '#22c55e',
        '--color-text-primary': '#f1f5f9', '--color-text-secondary': '#cbd5e1', '--color-text-muted': '#94a3b8',
    },
    'Ocean': {
        '--color-bg': '#081c34', '--color-sidebar': '#0B2545', '--color-panel': '#13315C',
        '--color-interactive': '#3E5674', // <-- ADD THIS
        '--color-card-gradient-from': '#1E4976', '--color-card-gradient-to': '#0B2545',
        '--color-primary': '#37BEEB',
        '--color-text-primary': '#E0EFFF', '--color-text-secondary': '#A8BBD5', '--color-text-muted': '#8B9FB8',
    },
    'Forest': {
        '--color-bg': '#12221e', '--color-sidebar': '#1a2e29', '--color-panel': '#243b35',
        '--color-interactive': '#4a5e59', // <-- ADD THIS
        '--color-card-gradient-from': '#2f5d51', '--color-card-gradient-to': '#1a2e29',
        '--color-primary': '#34d399',
        '--color-text-primary': '#E6F4F1', '--color-text-secondary': '#B8DCD3', '--color-text-muted': '#8AAEA5',
    },
    'Sunset': {
        '--color-bg': '#3b162f', '--color-sidebar': '#4c1d3d', '--color-panel': '#6b2a57',
        '--color-interactive': '#894d75', // <-- ADD THIS
        '--color-card-gradient-from': '#9d3d7a', '--color-card-gradient-to': '#4c1d3d',
        '--color-primary': '#f472b6',
        '--color-text-primary': '#FDE7F3', '--color-text-secondary': '#F6BBE5', '--color-text-muted': '#E498CC',
    }
};


// --- 2. Use a COMPLETE applyTheme function ---
export const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;
    // Loop through all CSS variables in the theme and apply them to the document
    for (const [key, value] of Object.entries(theme)) {
        document.documentElement.style.setProperty(key, value);
    }
};
