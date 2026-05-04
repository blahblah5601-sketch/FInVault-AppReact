// Test for SettingsPage Email Verification Feature
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '../SettingsPage';
import { updateUserPreferences } from '../../api';

// Mock Firebase auth
jest.mock('../../firebase', () => ({
  auth: {
    currentUser: {
      email: 'test@example.com',
      emailVerified: false,
      uid: 'test-uid-123',
    }
  },
  db: {}
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  sendEmailVerification: jest.fn(() => Promise.resolve())
}));

// Mock API
jest.mock('../../api', () => ({
  updateUserPreferences: jest.fn(() => Promise.resolve(true)),
  getUserPreferences: jest.fn(() => Promise.resolve({}))
}));

describe('SettingsPage Email Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders email verification section for unverified users', () => {
    render(
      <SettingsPage
        currentTheme="Slate"
        setCurrentTheme={jest.fn()}
        preferences={{}}
      />
    );

    // Check for verification section
    expect(screen.getByText(/Account Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Email Verification Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Send Verification/i)).toBeInTheDocument();
  });

  test('hides email verification section for verified users', () => {
    // Mock verified user
    const { auth } = require('../../firebase');
    auth.currentUser.emailVerified = true;

    const { container } = render(
      <SettingsPage
        currentTheme="Slate"
        setCurrentTheme={jest.fn()}
        preferences={{}}
      />
    );

    // Verification section should not be present
    expect(container.querySelector('#settings-account')).toBeNull();
  });


  test('shows loading state while sending verification email', async () => {
    render(
      <SettingsPage
        currentTheme="Slate"
        setCurrentTheme={jest.fn()}
        preferences={{}}
      />
    );

    const sendButton = screen.getByText(/Send Verification/i);
    fireEvent.click(sendButton);

    // Should show loading state
    expect(screen.getByText(/Sending\.\.\./i)).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });

  test('shows success state after verification email is sent', async () => {
    const { sendEmailVerification } = require('firebase/auth');

    render(
      <SettingsPage
        currentTheme="Slate"
        setCurrentTheme={jest.fn()}
        preferences={{}}
      />
    );

    const sendButton = screen.getByText(/Send Verification/i);
    fireEvent.click(sendButton);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText(/Sent!/i)).toBeInTheDocument();
    });

    expect(sendButton).toBeDisabled();
    expect(sendEmailVerification).toHaveBeenCalledTimes(1);
  });

  test('resets button after 5 seconds', async () => {
    jest.useFakeTimers();

    const { sendEmailVerification } = require('firebase/auth');

    render(
      <SettingsPage
        currentTheme="Slate"
        setCurrentTheme={jest.fn()}
        preferences={{}}
      />
    );

    const sendButton = screen.getByText(/Send Verification/i);
    fireEvent.click(sendButton);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText(/Sent!/i)).toBeInTheDocument();
    });

    // Fast-forward time
    jest.advanceTimersByTime(5000);

    // Button should be enabled again
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });

    jest.useRealTimers();
  });

  test('shows error alert when verification fails', async () => {
    const { sendEmailVerification } = require('firebase/auth');
    sendEmailVerification.mockRejectedValueOnce(new Error('Failed to send'));

    // Mock alert
    global.alert = jest.fn();

    render(
      <SettingsPage
        currentTheme="Slate"
        setCurrentTheme={jest.fn()}
        preferences={{}}
      />
    );

    const sendButton = screen.getByText(/Send Verification/i);
    fireEvent.click(sendButton);

    // Wait for error handling
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to send verification email. Please try again.');
    });
  });
});
});