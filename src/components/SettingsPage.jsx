// src/components/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// --- 1. Use the COMPLETE themes object from your original project ---
const themes = {
    'Slate': {
        '--color-bg': '#0f172a', '--color-sidebar': '#1e293b', '--color-panel': '#1e293b',
        '--color-interactive': '#475569', // <-- ADD THIS
        '--color-card-gradient-from': '#334155', '--color-card-gradient-to': '#0f172a',
        '--color-primary': '#22c55e',
    },
    'Ocean': {
        '--color-bg': '#0B2545', '--color-sidebar': '#13315C', '--color-panel': '#13315C',
        '--color-interactive': '#3E5674', // <-- ADD THIS
        '--color-card-gradient-from': '#1E4976', '--color-card-gradient-to': '#0B2545',
        '--color-primary': '#37BEEB',
    },
    'Forest': {
        '--color-bg': '#1a2e29', '--color-sidebar': '#243b35', '--color-panel': '#243b35',
        '--color-interactive': '#4a5e59', // <-- ADD THIS
        '--color-card-gradient-from': '#2f5d51', '--color-card-gradient-to': '#1a2e29',
        '--color-primary': '#34d399',
    },
    'Sunset': {
        '--color-bg': '#4c1d3d', '--color-sidebar': '#6b2a57', '--color-panel': '#6b2a57',
        '--color-interactive': '#894d75', // <-- ADD THIS
        '--color-card-gradient-from': '#9d3d7a', '--color-card-gradient-to': '#4c1d3d',
        '--color-primary': '#f472b6',
    }
};


// --- 2. Use a COMPLETE applyTheme function ---
const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;
    // Loop through all CSS variables in the theme and apply them to the document
    for (const [key, value] of Object.entries(theme)) {
        document.documentElement.style.setProperty(key, value);
    }
};

function SettingsPage() {
  const [currentTheme, setCurrentTheme] = useState('Slate');

  // Fetch user's theme setting on component load
  useEffect(() => {
    const fetchUserSettings = async () => {
        if (auth.currentUser) {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists() && docSnap.data().settings?.theme) {
                const userTheme = docSnap.data().settings.theme;
                setCurrentTheme(userTheme);
                applyTheme(userTheme); // Apply the theme on initial load
            } else {
                applyTheme('Slate'); // Apply default theme if none is saved
            }
        }
    };
    fetchUserSettings();
  }, []); // The empty array [] means this runs only once

  const handleThemeSelect = async (themeName) => {
    setCurrentTheme(themeName);
    applyTheme(themeName);
    // Save to Firestore
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userDocRef, { "settings.theme": themeName });
  };

  return (
    <section id="settings" className="page-section">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      <div className="bg-background/50 p-6 rounded-2xl">
        <h3 className="font-semibold text-lg mb-4">Appearance</h3>
        <p className="text-sm text-slate-400 mb-6">Choose a color theme for your application.</p>
        <div id="theme-selector" className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.keys(themes).map(themeName => (
            <button
              key={themeName}
              onClick={() => handleThemeSelect(themeName)}
              className={`theme-btn p-4 rounded-lg border-2 transition-all ${
                currentTheme === themeName ? 'border-white' : 'border-transparent'
              }`}
            >
              <div
                className="h-12 w-full rounded-md mb-2"
                style={{ background: `linear-gradient(135deg, ${themes[themeName]['--color-card-gradient-from']}, ${themes[themeName]['--color-card-gradient-to']})` }}
              ></div>
              <p className="font-medium">{themeName}</p>
            </button>
          ))}
        </div>
      </div>
      {/* Other settings sections can be added here */}
    </section>
  );
}

export default SettingsPage;