import { useState, useEffect } from 'react';
import ToastNotification from './components/ToastNotification';
import './App.css';
import { auth, db } from './firebase'; // Import from your new firebase.js file
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import AuthComponent from './components/AuthComponent';
import AppLayout from './components/AppLayout';
import { getUserPreferences } from './api'; // <-- Import getUserSettings
import { applyTheme } from './components/theme'; // <-- Import applyTheme

// --- Helper Components (we will move these to their own files later) ---

const LoadingSpinner = () => (
  <div id="loading-spinner" className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
    <div className="w-8 h-8 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin"></div>
    <p className="text-text-secondary mt-4">Connecting...</p>
  </div>
);

function App( ) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('Slate');

  // Toast Notification State
  const [toast, setToast] = useState({ message: '', isVisible: false });

  const showToast = (message) => {
    setToast({ message, isVisible: true });
    // Hide the toast after 3 seconds
    setTimeout(() => {
      setToast({ message: '', isVisible: false });
    }, 3000);
  };
  
  // States to hold your application data
  const [accounts, setAccounts] = useState([]);
  const [budgetsData, setBudgetsData] = useState([]);
  const [vaultsData, setVaultsData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    // onAuthStateChanged is the Firebase listener for login/logout events
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const settings = await getUserPreferences();
        if (settings && settings.theme) {
          setTheme(settings.theme);
          applyTheme(settings.theme);
        } else {
          applyTheme('Slate'); // Apply default
        }
        
        // This is the direct replacement for your loadAndInitializeAppData function
        const collectionsToSync = {
          accounts: setAccounts,
          budgets: setBudgetsData,
          vaults: setVaultsData,
          transactions: setTransactionsData,
          history: setHistoryData,
        };

        const unsubscribers = [];
        for (const [colName, setter] of Object.entries(collectionsToSync)) {
          const q = query(collection(db, 'users', currentUser.uid, colName), orderBy("createdAt", "desc"));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setter(data); // Update the component's state with the new data
          });
          unsubscribers.push(unsubscribe);
        }
        
      } else {
        setUser(null);
        // Clear all data on logout
        setAccounts([]);
        setBudgetsData([]);
        setVaultsData([]);
        setTransactionsData([]);
        setHistoryData([]);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribeAuth();
  }, []); // The empty array ensures this effect runs only once

  const handleLogout = () => {
    signOut(auth).catch(error => console.error("Logout Error:", error));
  };

  // --- Conditional Rendering ---
  // Based on the state, we decide what to show the user.
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <AuthComponent />;
  }

  return (
    <><AppLayout
      user={user}
      onLogout={handleLogout}
      accounts={accounts}
      budgets={budgetsData}
      vaults={vaultsData}
      transactions={transactionsData}
      history={historyData}
      showToast={showToast} 
      theme={theme}
      setTheme={setTheme}

      />
      <ToastNotification
        message={toast.message}
        isVisible={toast.isVisible} 
      />
      </>
  );
}

export default App;