import { useState, useEffect, useCallback } from 'react';
import ToastNotification from './components/ToastNotification';
import ErrorBoundary from './components/ErrorBoundary';
import VerificationRequiredModal from './components/modals/VerificationRequiredModal';
import './App.css';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, sendEmailVerification, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import AuthComponent from './components/AuthComponent';
import AppLayout from './components/AppLayout';
import { getUserPreferences } from './api';
import { applyTheme } from './theme.js';
import OnboardingController from './components/onboarding/OnboardingController';

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
  const [preferences, setPreferences] = useState({}); // User preferences
  const [isDataLoading, setIsDataLoading] = useState(true); // NEW - Track data loading

  // Toast Notification State
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [pageHistory, setPageHistory] = useState(['dashboard']);
  const [page, setPage] = useState('dashboard');

  // Verification Modal State
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [unverifiedUserEmail, setUnverifiedUserEmail] = useState('');

  const navigate = (newPage) => {
    setPageHistory(prev => [...prev, newPage]);
    setPage(newPage);
  };

  const goBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = pageHistory.slice(0, -1);
      setPageHistory(newHistory);
      setPage(newHistory[newHistory.length - 1]);
    }
  };

  const showToast = useCallback((message) => {
    setToast({ message, isVisible: true });
    // Hide the toast after 3 seconds
    setTimeout(() => {
      setToast({ message: '', isVisible: false });
    }, 3000);
  }, []);

  // States to hold your application data
  const [accounts, setAccounts] = useState([]);
  const [budgetsData, setBudgetsData] = useState([]);
  const [vaultsData, setVaultsData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [billersData, setBillersData] = useState([]);
  const [beneficiariesData, setBeneficiariesData] = useState([]);

  useEffect(() => {
    // onAuthStateChanged is the Firebase listener for login/logout events
    let firestoreUnsubscribers = [];
    let dataUnsubscribers = []; // Track Firestore listener unsubscribers for cleanup

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // When auth state changes, first unsubscribe from any old Firestore listeners
      firestoreUnsubscribers.forEach(unsub => unsub());
      firestoreUnsubscribers = []; // Then clear the array

      // Also unsubscribe any existing data listeners
      dataUnsubscribers.forEach(unsub => unsub());
      dataUnsubscribers = [];

      if (currentUser) {
        // Check email verification before allowing app access
        await currentUser.reload();
        if (!currentUser.emailVerified) {
          // Unverified user - show verification modal instead of silently signing out
          setUnverifiedUserEmail(currentUser.email);
          setShowVerificationModal(true);
          setUser(null);
          applyTheme('Slate');
          setAccounts([]);
          setBudgetsData([]);
          setVaultsData([]);
          setTransactionsData([]);
          setHistoryData([]);
          setIsDataLoading(false);
          setIsLoading(false);
          return; // Block access, stay on auth screen
        }

        setUser(currentUser);
        setIsDataLoading(true); // NEW - Start data loading

        const prefs = await getUserPreferences();
        if (prefs) {
          setPreferences(prefs);
          if (prefs.theme) {
            setTheme(prefs.theme);
            applyTheme(prefs.theme);
          } else {
            applyTheme('Slate'); // Apply default
          }
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
          billers: setBillersData,
          beneficiaries: setBeneficiariesData,
        };

        let loadedCount = 0;
        const totalCollections = Object.keys(collectionsToSync).length;
        const hasCollectionLoaded = {}; // Track which collections have loaded at least once

        // Memoize expensive query creation - moved outside hook to use regular memoization
        const collectionQueries = {};
        for (const [colName] of Object.entries(collectionsToSync)) {
          collectionQueries[colName] = query(
            collection(db, 'users', currentUser.uid, colName),
            orderBy("createdAt", "desc")
          );
        }

        for (const [colName, setter] of Object.entries(collectionsToSync)) {
          const unsubscribe = onSnapshot(collectionQueries[colName], (querySnapshot) => {
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setter(data);

            // NEW - Track loading progress (only count first load per collection)
            if (!hasCollectionLoaded[colName]) {
              hasCollectionLoaded[colName] = true;
              loadedCount++;
              if (loadedCount === totalCollections) {
                setIsDataLoading(false); // All data loaded
              }
            }
          });
          dataUnsubscribers.push(unsubscribe);
        }

      } else {
        setUser(null);
        applyTheme('Slate'); // Reset to default theme on logout
        setAccounts([]);
        setBudgetsData([]);
        setVaultsData([]);
        setTransactionsData([]);
        setHistoryData([]);
        setIsDataLoading(false); // NEW
      }
      setIsLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => {
      unsubscribeAuth();
      // Also unsubscribe from all Firestore listeners
      dataUnsubscribers.forEach(unsub => unsub());
      firestoreUnsubscribers.forEach(unsub => unsub());
    };
  }, []); // The empty array ensures this effect runs only once

  const handleLogout = useCallback(() => {
    signOut(auth).catch(() => {
      showToast("Failed to sign out");
    });
  }, [showToast]);

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });
      setToast({ message: `Verification email sent to ${auth.currentUser.email}. Please check your inbox.`, isVisible: true });
      setShowVerificationModal(false);
    } catch (err) {
      setToast({ message: 'Failed to send verification email. Please try again.', isVisible: true });
    }
  };

  const handleCloseVerificationModal = () => {
    setShowVerificationModal(false);
    signOut(auth).catch(() => {});
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
    <ErrorBoundary>
      <OnboardingController>
        <AppLayout
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
          billers={billersData}
          beneficiaries={beneficiariesData}
          preferences={preferences}
          isDataLoading={isDataLoading}
          page={page}
          navigate={navigate}
          goBack={goBack}
        />
      </OnboardingController>
      <ToastNotification
        message={toast.message}
        isVisible={toast.isVisible}
      />
      <VerificationRequiredModal
        isOpen={showVerificationModal}
        onClose={handleCloseVerificationModal}
        userEmail={unverifiedUserEmail}
        onResend={handleResendVerification}
      />
    </ErrorBoundary>
  );
}

export default App;