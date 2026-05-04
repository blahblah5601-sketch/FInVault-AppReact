// src/components/AuthComponent.jsx - ENHANCED VERSION
import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, writeBatch, collection } from 'firebase/firestore';
import { validateEmail, validatePassword } from '../utils/validation';
import { generateAccountNumber, generateIBAN } from '../utils/ibanUtils';
import Logo from './Logo';
import { Eye, EyeOff, AlertCircle, Mail, ArrowLeft } from 'lucide-react';

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
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // User is not verified - block login and show clear message
        setError('Email not verified. Please check your inbox and click the verification link to activate your account. You can request a new verification email after logging in via Settings → Account Verification.');
        // Still sign them out since we don't want unverified access
        signOut(auth).catch(() => {});
        return;
      }
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

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      // Get current user or create a temporary one to resend
      const user = auth.currentUser;
      if (user && user.email === email) {
        await sendEmailVerification(user, {
          url: window.location.origin + '/login',
          handleCodeInApp: false,
        });
        setError('Verification email resent! Please check your inbox.');
      } else {
        setError('Please log in with your account to resend verification');
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
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

      // Send email verification to new user
      await sendEmailVerification(userCredential.user, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });

      await setupNewUser(userCredential.user);

      // Show success message about verification email
      setError('Account created! A verification email has been sent to ' + userCredential.user.email + '. Please check your inbox (and spam folder) and click the verification link to activate your account before logging in.');
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

  const handleForgotPassword = () => {
    setIsResetMode(true);
    setIsLoginMode(false);
    setError('');
    setResetSuccess(false);
  };

  const handleBackToLogin = () => {
    setIsResetMode(false);
    setIsLoginMode(true);
    setError('');
    setResetSuccess(false);
    setEmail('');
    setEmailError('');
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccess(false);

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      setEmailError(emailValidation.error);
      return;
    }

    setIsLoading(true);

    try {
      // Send password reset email
      // NOTE: Link expiration is determined by Firebase environment:
      // - Development (localhost): May expire in 10-15 minutes (Firebase default)
      // - Production (custom domain): Expires in 1 hour (or as configured in Firebase Console)
      // To increase expiration, configure in Firebase Console:
      //   Authentication → Templates → Password reset → Edit → Link expiration (hours)
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login',  // Use current origin for proper redirect
        handleCodeInApp: false,
      });
      setResetSuccess(true);
    } catch (err) {
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
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

        {/* Forgot Password Link */}
        <p className="text-sm text-center text-text-secondary">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="font-medium hover:underline"
            style={{ color: 'var(--color-primary)' }}
            disabled={isLoading}
          >
            Forgot Password?
          </button>
        </p>

        {/* Verification Resend Link - only shown when there's a verification error */}
        {error && error.includes('verify') && (
          <p className="text-sm text-center">
            <button
              type="button"
              onClick={() => {
                setIsResendingVerification(true);
                handleResendVerification();
                setIsResendingVerification(false);
              }}
              className="font-medium hover:underline"
              style={{ color: 'var(--color-primary)' }}
              disabled={isResendingVerification || isLoading}
            >
              {isResendingVerification ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </p>
        )}

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
                  <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-sidebar rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%`, backgroundColor: passwordStrength.color }}
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

        {/* Password Reset Form */}
        {isResetMode && !resetSuccess && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="text-center mb-4">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to login</span>
              </button>
              <h3 className="text-lg font-semibold">Reset Password</h3>
              <p className="text-sm text-text-secondary">Enter your email to receive a password reset link</p>
            </div>

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

            <button
              type="submit"
              className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !!emailError}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {/* Password Reset Success */}
        {resetSuccess && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-400">Password Reset Email Sent</h3>
              <p className="text-sm text-text-secondary mt-2">
                We've sent a password reset link to<br />
                <span className="text-text-primary font-medium">{email}</span>
              </p>
              <p className="text-xs text-text-muted mt-4">
                Please check your email and click the link to reset your password.<br />
                The link will expire in 1 hour.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full btn-primary py-3 rounded-lg font-semibold"
            >
              Back to Login
            </button>
          </div>
        )}

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
            <button type="button" className="text-primary hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button type="button" className="text-primary hover:underline">Privacy Policy</button>
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthComponent;