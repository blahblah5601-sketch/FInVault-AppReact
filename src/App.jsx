import { useState, useEffect } from 'react';
import ToastNotification from './components/ToastNotification';
import './App.css';
import { auth, db } from './firebase'; // Import from your new firebase.js file
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import AuthComponent from './components/AuthComponent';
import AppLayout from './components/AppLayout';
import { signOut } from 'firebase/auth';

// --- Helper Components (we will move these to their own files later) ---

const LoadingSpinner = () => (
  <div id="loading-spinner" className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
    <div className="w-8 h-8 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin"></div>
    <p className="text-slate-400 mt-4">Connecting...</p>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
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
      />
      <ToastNotification
        message={toast.message}
        isVisible={toast.isVisible} 
      />
      </>
  );
}

export default App;