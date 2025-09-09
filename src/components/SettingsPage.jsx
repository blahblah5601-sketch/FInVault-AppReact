// src/components/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Theme data and helper functions, now scoped to this component
const themes = {
    'Slate': { '--color-card-gradient-from': '#334155', '--color-card-gradient-to': '#0f172a' },
    'Ocean': { '--color-card-gradient-from': '#1E4976', '--color-card-gradient-to': '#0B2545' },
    'Forest': { '--color-card-gradient-from': '#2f5d51', '--color-card-gradient-to': '#1a2e29' },
    'Sunset': { '--color-card-gradient-from': '#9d3d7a', '--color-card-gradient-to': '#4c1d3d' }
};

const applyTheme = (themeName) => {
    // This is a simplified version of your original theme logic
    const root = document.documentElement;
    root.style.setProperty('--color-card-gradient-from', themes[themeName]['--color-card-gradient-from']);
    root.style.setProperty('--color-card-gradient-to', themes[themeName]['--color-card-gradient-to']);
    // You can add the other CSS variables here as needed
};

function SettingsPage() {
  const [currentTheme, setCurrentTheme] = useState('Slate');

  // Fetch the user's saved theme when the component loads
  useEffect(() => {
    const fetchTheme = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().settings?.theme) {
          const savedTheme = docSnap.data().settings.theme;
          setCurrentTheme(savedTheme);
          applyTheme(savedTheme);
        }
      }
    };
    fetchTheme();
  }, []); // The empty array [] means this runs only once

  const handleThemeSelect = async (themeName) => {
    setCurrentTheme(themeName);
    applyTheme(themeName);
    // Save the new theme to Firestore
    await updateDoc(doc(db, "users", auth.currentUser.uid), { "settings.theme": themeName });
  };

  return (
    <section id="settings" className="page-section">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      <div className="bg-slate-900/50 p-6 rounded-2xl">
        <h3 className="font-semibold text-lg mb-4">Appearance</h3>
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