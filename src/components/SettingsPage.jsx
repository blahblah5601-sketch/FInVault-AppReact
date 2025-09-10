// src/components/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { themes, applyTheme } from './theme'; // Import the applyTheme function
import { updateUserPreferences } from '../api';

// --- 1. Use the COMPLETE themes object from your original project ---
function SettingsPage( ) {
  //const [currentTheme, setCurrentTheme] = useState('Slate');

  const handleThemeSelect = async (themeName) => {
    setCurrentTheme(themeName); // Update the state in App.jsx
    applyTheme(themeName); // Apply the theme visually
    await updateUserSettings({ theme: themeName }); // Save to Firestore
  };
  
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

  // const handleThemeSelect = async (themeName) => {
  //   setCurrentTheme(themeName);
  //   applyTheme(themeName);
  //   // Save to Firestore
  //   const userDocRef = doc(db, "users", auth.currentUser.uid);
  //   await updateDoc(userDocRef, { "settings.theme": themeName });
  // };

  return (
    <section id="settings" className="page-section">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      <div className="bg-background/50 p-6 rounded-2xl">
        <h3 className="font-semibold text-lg mb-4">Appearance</h3>
        <p className="text-sm text-text-secondary mb-6">Choose a color theme for your application.</p>
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
              <p className="font-medium text-text-secondary">{themeName}</p>
            </button>
          ))}
        </div>
      </div>
      {/* Other settings sections can be added here */}
    </section>
  );
}

export default SettingsPage;