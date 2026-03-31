// src/components/AuthComponent.jsx - ENHANCED VERSION
import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, writeBatch, collection } from 'firebase/firestore';
import { validateEmail, validatePassword } from '../utils/validation';
import { generateAccountNumber, generateIBAN } from '../utils/ibanUtils';
import Logo from './Logo';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const setupNewUser = async (user) => {
  const userDocRef = doc(db, "users", user.uid);
  const batch = writeBatch(db);
  
  batch.set(userDocRef, {
    email: user.email,
    createdAt: serverTimestamp(),
    settings: { 
      theme: 'Slate',
      notifications: true,
      currency: 'PKR'
    }
  });
  
  // Add default account with IBAN
  const accountsCol = collection(userDocRef, "accounts");
  const accountNumber = generateAccountNumber(user.uid, 0); // 0 for main account
  const ibanNumber = generateIBAN('FNVT', accountNumber); // Using FinVault's BIC

  batch.set(doc(accountsCol, "current"), {
    name: 'Current Account',
    balance: 50000,
    type: 'account',
    accountLevel: 'main',
    parentAccountId: null,
    ibanNumber,
    accountNumber,
    bankBic: 'FNVT',
    bankName: 'FinVault',
    subAccountIndex: 0,
    createdAt: serverTimestamp()
  });
  
  // Add default savings account
  const vaultsCol = collection(userDocRef, "vaults");
  batch.set(doc(vaultsCol), {
    name: 'Savings Account',
    target: 0,
    current: 0,
    icon: 'piggy-bank',
    color: 'teal',
    isSavingsAccount: true,
    returnRate: 0.05, // 5% APR
    createdAt: serverTimestamp()
  });
  
  await batch.commit();
};

function AuthComponent() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Real-time email validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value) {
      const validation = validateEmail(value);
      setEmailError(validation.valid ? '' : validation.error);
    } else {
      setEmailError('');
    }
  };

  // Real-time password validation (only for signup)
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (!isLoginMode && value) {
      const validation = validatePassword(value);
      setPasswordError(validation.valid ? '' : validation.error);
    } else {
      setPasswordError('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate before submission
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setupNewUser(userCredential.user);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setEmail('');
    setPassword('');
    setEmailError('');
    setPasswordError('');
  };

  const getPasswordStrength = () => {
    if (!password || isLoginMode) return null;
    
    const strength = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ].filter(Boolean).length;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['red', 'orange', 'yellow', 'blue', 'green'];
    
    return { strength, label: labels[strength - 1] || 'Very Weak', color: colors[strength - 1] || 'red' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div id="auth-container" className="fixed inset-0 bg-background flex items-center justify-center z-50 p-4">
      <div className="auth-card w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Logo className="h-8 w-8" />
            <h1 className="text-3xl font-bold ml-2">FinVault</h1>
          </div>
          <p className="text-text-secondary">
            {isLoginMode ? 'Sign in to continue' : 'Create a new account'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className={`space-y-4 ${isLoginMode ? '' : 'hidden'}`}>
          <div>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Email"
              className={`auth-input ${emailError ? 'border-red-500' : ''}`}
              required
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-red-400 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {emailError}
              </p>
            )}
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Password"
              className="auth-input pr-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <button
            type="submit"
            className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !!emailError}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className={`space-y-4 ${isLoginMode ? 'hidden' : ''}`}>
          <div>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Email"
              className={`auth-input ${emailError ? 'border-red-500' : ''}`}
              required
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-red-400 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {emailError}
              </p>
            )}
          </div>
          
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Password"
                className={`auth-input pr-10 ${passwordError ? 'border-red-500' : ''}`}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && passwordStrength && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-text-secondary">Password Strength</span>
                  <span className={`text-xs font-medium text-${passwordStrength.color}-400`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-sidebar rounded-full h-1.5">
                  <div
                    className={`bg-${passwordStrength.color}-500 h-1.5 rounded-full transition-all duration-300`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {passwordError && (
              <p className="text-red-400 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {passwordError}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !!emailError || !!passwordError}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Toggle Mode */}
        <p className="text-sm text-center text-text-secondary">
          <span>{isLoginMode ? "Don't have an account?" : "Already have an account?"}</span>
          <button
            type="button"
            onClick={toggleMode}
            className="font-medium hover:underline ml-1"
            style={{ color: 'var(--color-primary)' }}
            disabled={isLoading}
          >
            {isLoginMode ? 'Sign up' : 'Log in'}
          </button>
        </p>

        {/* Terms & Privacy */}
        {!isLoginMode && (
          <p className="text-xs text-center text-text-muted">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthComponent;