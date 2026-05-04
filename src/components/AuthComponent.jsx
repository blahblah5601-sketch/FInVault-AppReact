// src/components/AuthComponent.jsx - Fixed UI with Slate dark theme
import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';
import { validateEmail, validatePassword, validateUsername } from '../utils/validation';
import { generateAccountNumber, generateIBAN } from '../utils/ibanUtils';
import { findUserByEmail } from '../utils/transferEngine';
import Logo from './Logo';
import { Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

const setupNewUser = async (user, username) => {
  const userDocRef = doc(db, "users", user.uid);
  const batch = writeBatch(db);

  batch.set(userDocRef, {
    email: user.email,
    username: username,
    createdAt: serverTimestamp(),
    settings: {
      theme: 'Slate',
      notifications: true,
      currency: 'PKR'
    }
  });

  const accountsCol = collection(userDocRef, "accounts");
  const accountNumber = generateAccountNumber(user.uid, 0);
  const ibanNumber = generateIBAN('FNVT', accountNumber);

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

  const vaultsCol = collection(userDocRef, "vaults");
  batch.set(doc(vaultsCol), {
    name: 'Savings Account',
    target: 0,
    current: 0,
    icon: 'piggy-bank',
    color: 'teal',
    isSavingsAccount: true,
    returnRate: 0.05,
    createdAt: serverTimestamp()
  });

  await batch.commit();
};

const findUserByIdentifier = async (identifier) => {
  const emailValidation = validateEmail(identifier);
  if (emailValidation.valid) {
    const q = query(collection(db, 'users'), where('email', '==', identifier.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  const usernameValidation = validateUsername(identifier);
  if (usernameValidation.valid) {
    const q = query(collection(db, 'users'), where('username', '==', usernameValidation.sanitized));
    const snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  return null;
};

function AuthComponent() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    setIdentifier(value);
    setError('');

    if (value) {
      const emailValidation = validateEmail(value);
      const usernameValidation = validateUsername(value);

      if (value.includes('@')) {
        setIdentifierError(emailValidation.valid ? '' : emailValidation.error);
      } else if (value.length >= 3) {
        setIdentifierError(usernameValidation.valid ? '' : usernameValidation.error);
      } else {
        setIdentifierError('');
      }
    } else {
      setIdentifierError('');
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    if (!isLoginMode && value) {
      const validation = validateUsername(value);
      setUsernameError(validation.valid ? '' : validation.error);
    } else {
      setUsernameError('');
    }
  };

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

    const emailValidation = validateEmail(identifier);
    const usernameValidation = validateUsername(identifier);

    if (!emailValidation.valid && !usernameValidation.valid) {
      setError('Please enter a valid email or username (3+ characters)');
      setIdentifierError('Please enter a valid email or username');
      return;
    }

    if (!password) {
      setError('Password is required');
      setPasswordError('Password is required');
      return;
    }

    setIsLoading(true);
    setIdentifierError('');
    setPasswordError('');

    try {
      if (emailValidation.valid) {
        const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
        if (!userCredential.user.emailVerified) {
          signOut(auth).catch(() => {});
          setError('Email not verified. Please check your inbox and click the verification link to activate your account. You can request a new verification email in Settings → Account Verification.');
          return;
        }
      } else {
        const user = await findUserByIdentifier(identifier);
        if (!user) {
          setError('Invalid username or password');
          setIsLoading(false);
          return;
        }
        const userCredential = await signInWithEmailAndPassword(auth, user.email, password);
        if (!userCredential.user.emailVerified) {
          signOut(auth).catch(() => {});
          setError('Email not verified. Please check your inbox and click the verification link to activate your account. You can request a new verification email in Settings → Account Verification.');
          return;
        }
      }
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid username/email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this username/email');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!identifier) {
      setError('Please enter your email address first');
      return;
    }
    try {
      const user = auth.currentUser;
      if (user && user.email === identifier) {
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
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.emailVerified) {
        signOut(auth).catch(() => {});
        setError('Email not verified. Please verify your Google account email.');
        return;
      }

      // Check if user exists in our system, if not create profile
      // If email already exists, login proceeds normally (no duplicate account created)
      if (user.email) {
        const existingUser = await findUserByEmail(user.email);
        if (!existingUser) {
          // Create new user profile with Google account
          const namePart = (user.displayName || user.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '');
          const baseUsername = namePart || 'user';
          let username = `${baseUsername}_${Math.random().toString(36).substring(2, 7)}`;
          await setupNewUser(user, username);
        }
      }
    } catch (err) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email. Please sign in with email/password.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in cancelled. Please try again.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    const emailValidation = validateEmail(identifier);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      setIdentifierError(emailValidation.error);
      return;
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.error);
      setUsernameError(usernameValidation.error);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      setPasswordError(passwordValidation.error);
      return;
    }

    setIsLoading(true);
    setIdentifierError('');
    setUsernameError('');
    setPasswordError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, identifier, password);
      await sendEmailVerification(userCredential.user, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });
      await setupNewUser(userCredential.user, usernameValidation.sanitized);
      setError('Account created! A verification email has been sent to ' + identifier + '. Please check your inbox (and spam folder) and click the verification link to activate your account before logging in.');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
        setIdentifierError('This email is already registered');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
        setPasswordError('Password is too weak');
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
    setIdentifier('');
    setUsername('');
    setPassword('');
    setIdentifierError('');
    setUsernameError('');
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
    setIdentifier('');
    setIdentifierError('');
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccess(false);

    const emailValidation = validateEmail(identifier);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      setIdentifierError(emailValidation.error);
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, identifier, {
        url: window.location.origin + '/login',
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
    const colors = ['#EF4444', '#F5A623', '#F5A623', '#10B981', '#10B981'];
    return { strength, label: labels[strength - 1] || 'Very Weak', color: colors[strength - 1] || '#EF4444' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div id="auth-container" className="fixed inset-0 bg-[#0B0F1A] flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="w-full max-w-sm">
        <div className="bg-[#111827] border border-[#1E293B] shadow-2xl shadow-black/50 rounded-2xl p-9 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F5A623] flex items-center justify-center shadow-lg shadow-[#F5A623]/30">
                <Logo className="h-5 w-5 text-[#0B0F1A]" />
              </div>
              <h1 className="text-2xl font-bold text-white">FinVault</h1>
            </div>
            <p className="text-[#64748B] text-sm">
              {isLoginMode ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {!isResetMode ? (
            <>
              {/* Login Form */}
              <form onSubmit={handleLogin} className={`space-y-4 ${isLoginMode ? '' : 'hidden'}`}>
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={identifier}
                      onChange={handleIdentifierChange}
                      placeholder="Email or Username"
                      className={`w-full bg-[#0F172A] border ${identifierError ? 'border-[#EF4444]' : 'border-[#1E293B]'} text-white placeholder-[#475569] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent transition-all text-sm`}
                      required
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </div>
                  {identifierError && (
                    <p className="text-[#EF4444] text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {identifierError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Password"
                      className={`w-full bg-[#0F172A] border ${passwordError ? 'border-[#EF4444]' : 'border-[#1E293B]'} text-white placeholder-[#475569] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent transition-all text-sm pr-10`}
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-[#EF4444] text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {passwordError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F5A623] hover:bg-[#E8991D] text-[#0B0F1A] font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#F5A623]/30"
                  disabled={isLoading || !!identifierError || !!passwordError}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

              {/* Google Sign In */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1E293B]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#111827] px-2 text-[#475569]">or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#334155] border border-[#1E293B] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              </div>

              {/* Forgot Password Link - only on login form */}
              {isLoginMode && (
                <p className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-[#F5A623] hover:text-[#E8991D] transition-colors font-medium"
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </button>
                </p>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSignup} className={`space-y-4 ${isLoginMode ? 'hidden' : ''}`}>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block">Email</label>
                  <input
                    type="email"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    placeholder="you@example.com"
                    className={`w-full bg-[#0F172A] border ${identifierError ? 'border-[#EF4444]' : 'border-[#1E293B]'} text-white placeholder-[#475569] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent transition-all text-sm`}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  {identifierError && (
                    <p className="text-[#EF4444] text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {identifierError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="john_doe"
                    className={`w-full bg-[#0F172A] border ${usernameError ? 'border-[#EF4444]' : 'border-[#1E293B]'} text-white placeholder-[#475569] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent transition-all text-sm`}
                    required
                    disabled={isLoading}
                    autoComplete="username"
                  />
                  {usernameError && (
                    <p className="text-[#EF4444] text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {usernameError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Create a password"
                    className={`w-full bg-[#0F172A] border ${passwordError ? 'border-[#EF4444]' : 'border-[#1E293B]'} text-white placeholder-[#475569] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent transition-all text-sm`}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  {passwordError && (
                    <p className="text-[#EF4444] text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {passwordError}
                    </p>
                  )}
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${password && passwordStrength ? 'opacity-100 max-h-24 mt-2' : 'opacity-0 max-h-0'}`}
                >
                  <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium" style={{ color: passwordStrength?.color }}>
                        Password Strength
                      </span>
                      <span className="text-xs font-semibold" style={{ color: passwordStrength?.color }}>
                        {passwordStrength?.label}
                      </span>
                    </div>
                    <div className="w-full bg-[#1E293B] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${(passwordStrength?.strength / 5) * 100}%`,
                          backgroundColor: passwordStrength?.color
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F5A623] hover:bg-[#E8991D] text-[#0B0F1A] font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#F5A623]/30"
                  disabled={isLoading || !!identifierError || !!usernameError || !!passwordError}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : 'Create Account'}
                </button>
              </form>
            </>
          ) : (
            !resetSuccess && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="text-center mb-4">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="flex items-center justify-center gap-2 text-[#64748B] hover:text-white transition-colors mb-3"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back</span>
                  </button>
                  <h3 className="text-lg font-semibold text-white">Reset Password</h3>
                  <p className="text-sm text-[#64748B]">Enter your email to receive a reset link</p>
                </div>

                <div className="space-y-1">
                  <input
                    type="email"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    placeholder="Email address"
                    className={`w-full bg-[#0F172A] border ${identifierError ? 'border-[#EF4444]' : 'border-[#1E293B]'} text-white placeholder-[#475569] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent transition-all text-sm`}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  {identifierError && (
                    <p className="text-[#EF4444] text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {identifierError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F5A623] hover:bg-[#E8991D] text-[#0B0F1A] font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#F5A623]/30"
                  disabled={isLoading || !!identifierError}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )
          )}

          {resetSuccess && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#10B981] mb-1">Password Reset Email Sent</h3>
              <p className="text-sm text-[#64748B] mb-3">
                We've sent a password reset link to<br />
                <span className="text-white font-medium">{identifier}</span>
              </p>
              <p className="text-xs text-[#475569]">
                Please check your email and click the link to reset your password.
              </p>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="mt-4 w-full bg-[#1E293B] hover:bg-[#334155] text-white font-semibold py-2.5 rounded-lg border border-[#1E293B] transition-all duration-200"
              >
                Back to Login
              </button>
            </div>
          )}

          {error && !error.toLowerCase().includes('verify') && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              <p className="text-[#EF4444] text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {!isResetMode && (
            <p className="text-center pt-1">
              <span className="text-[#64748B] text-sm">{isLoginMode ? "Don't have an account?" : "Already have an account?"}</span>
              <button
                type="button"
                onClick={toggleMode}
                className="text-[#F5A623] hover:text-[#E8991D] transition-colors font-semibold text-sm ml-1"
                disabled={isLoading}
              >
                {isLoginMode ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthComponent;