// src/components/AuthComponent.jsx
import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, writeBatch, collection } from 'firebase/firestore';
import Logo from './Logo';

// This is a simplified version of your setupNewUser function
// We'll move this to a better place later
const setupNewUser = async (user) => {
    const userDocRef = doc(db, "users", user.uid);
    const batch = writeBatch(db);
    batch.set(userDocRef, {
        email: user.email,
        createdAt: serverTimestamp(),
        settings: { theme: 'Slate' }
    });
    // Add default documents like accounts, budgets, etc.
    const accountsCol = collection(userDocRef, "accounts");
    batch.set(doc(accountsCol, "current"), { name: 'Current Account', balance: 50000, type: 'account', createdAt: serverTimestamp() });
    // You can add the other default documents here as well...
    await batch.commit();
};

function AuthComponent() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError("Invalid email or password.");
        }
    };
    
    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setupNewUser(userCredential.user);
        } catch (err) {
            setError("Failed to create an account. Password should be at least 6 characters.");
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setEmail('');
        setPassword('');
    };

    return (
        <div id="auth-container" className="fixed inset-0 bg-background flex items-center justify-center z-50 p-4">
            <div className="auth-card w-full max-w-sm space-y-6">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Logo className="h-8 w-8" /> {/* <-- Use Logo component */}
                        <h1 className="text-3xl font-bold ml-2">FinVault</h1>
                    </div>
                    <p id="auth-mode-label" className="text-text-secondary">{isLoginMode ? 'Sign in to continue' : 'Create a new account'}</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className={`space-y-4 ${isLoginMode ? '' : 'hidden'}`}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="auth-input" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="auth-input" />
                    <button type="submit" className="w-full btn-primary py-3 rounded-lg font-semibold">Login</button>
                </form>

                {/* Signup Form */}
                <form onSubmit={handleSignup} className={`space-y-4 ${isLoginMode ? 'hidden' : ''}`}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="auth-input" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min. 6 characters)" required className="auth-input" />
                    <button type="submit" className="w-full btn-primary py-3 rounded-lg font-semibold">Create Account</button>
                </form>

                {error && <p id="auth-error" className="error-message">{error}</p>}

                <p className="text-sm text-center text-text-secondary">
                    <span>{isLoginMode ? "Don't have an account?" : "Already have an account?"}</span>
                    <button type="button" onClick={toggleMode} className="font-medium hover:underline" style={{ color: 'var(--color-primary)', marginLeft: '4px' }}>
                        {isLoginMode ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default AuthComponent;