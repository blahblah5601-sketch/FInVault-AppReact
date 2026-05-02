// src/components/panels/SendMoneyPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Wired to the new transferEngine.js:
//   • Generates a stable idempotency key per submission (re-submitting is safe)
//   • Shows PENDING → COMPLETE / FAILED lifecycle in the UI
//   • All transfer paths (IBAN, Email, User-IBAN, Internal) unified
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { getAccounts }           from '../../api';
import {
  transferBetweenAccounts,
  transferToUser,
  findUserByEmail,
  findUserByIBAN,
}                                from '../../utils/transferEngine';
import { validateIBAN, formatIBAN } from '../../utils/ibanUtils';
import { auth }                  from '../../firebase';

// ── Transfer-type options ────────────────────────────────────────────────────
const TRANSFER_TYPES = [
  { value: 'iban',      label: 'External IBAN'        },
  { value: 'account',   label: 'My Accounts'           },
  { value: 'email',     label: 'FinVault User (Email)' },
  { value: 'user-iban', label: 'FinVault User (IBAN)'  },
];

// ── Status badge helper ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    idle:       null,
    loading:    { bg: 'rgba(201,168,76,0.12)', color: '#c9a84c', label: 'Processing…'  },
    success:    { bg: 'rgba(14,124,110,0.15)', color: '#0e7c6e', label: '✓ Sent'        },
    error:      { bg: 'rgba(214,59,59,0.12)',  color: '#d63b3b', label: 'Failed'        },
    duplicate:  { bg: 'rgba(32,86,212,0.12)',  color: '#2056d4', label: '✓ Already sent' },
  };
  const cfg = map[status];
  if (!cfg) return null;
  return (
    <div
      style={{
        borderRadius: 10, padding: '8px 14px', fontSize: 13,
        backgroundColor: cfg.bg, color: cfg.color, fontWeight: 500,
        textAlign: 'center', marginBottom: 8,
      }}
    >
      {cfg.label}
    </div>
  );
};

// ── Mock beneficiaries (shown as quick-select avatars) ───────────────────────
const MOCK_BENEFICIARIES = [
  { id: '1', name: 'Ali Hassan',   iban: 'PK36FNVT0000123456789012' },
  { id: '2', name: 'Fatima Khan',  iban: 'PK36HABB0000987654321098' },
  { id: '3', name: 'Ahmed Malik',  iban: 'PK36MUCB0000555555555555' },
];

// ── Idempotency key generator ────────────────────────────────────────────────
const makeIdempotencyKey = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;


export default function SendMoneyPanel({ isOpen, onClose, onSuccess, showToast }) {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [transferType,   setTransferType]   = useState('iban');
  const [recipient,      setRecipient]      = useState('');
  const [amount,         setAmount]         = useState('');
  const [description,    setDescription]    = useState('');
  const [fromAccountId,  setFromAccountId]  = useState('');
  const [toAccountId,    setToAccountId]    = useState('');

  // ── UI state ───────────────────────────────────────────────────────────────
  const [accounts,       setAccounts]       = useState([]);
  const [status,         setStatus]         = useState('idle'); // idle | loading | success | error | duplicate
  const [errorMsg,       setErrorMsg]       = useState('');
  const [ibanError,      setIbanError]      = useState('');
  const [txId,           setTxId]           = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState(makeIdempotencyKey);

  // ── Load user accounts ─────────────────────────────────────────────────────
  const loadAccounts = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (e) {
      
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
      // Fresh idempotency key each time the panel opens
      setIdempotencyKey(makeIdempotencyKey());
      resetForm();
    }
  }, [isOpen, loadAccounts]);

  // ── IBAN live-validation (for external IBAN + user-iban modes) ────────────
  useEffect(() => {
    if (transferType !== 'iban' && transferType !== 'user-iban') {
      setIbanError('');
      return;
    }
    const clean = recipient.replace(/\s/g, '');
    if (clean.length === 24) {
      const result = validateIBAN(clean);
      setIbanError(result.valid ? '' : result.error);
    } else {
      setIbanError('');
    }
  }, [recipient, transferType]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setRecipient('');
    setAmount('');
    setDescription('');
    setFromAccountId('');
    setToAccountId('');
    setStatus('idle');
    setErrorMsg('');
    setIbanError('');
    setTxId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectBeneficiary = (b) => {
    setRecipient(b.iban);
    const result = validateIBAN(b.iban);
    setIbanError(result.valid ? '' : result.error);
  };

  const parsedAmount = parseFloat(amount);
  const amountValid  = !isNaN(parsedAmount) && parsedAmount > 0;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    setErrorMsg('');
    setStatus('loading');

    try {
      let result;

      // ── Internal: between own accounts ───────────────────────────────────
      if (transferType === 'account') {
        if (!fromAccountId || !toAccountId) {
          setErrorMsg('Please select both source and destination accounts.');
          setStatus('error');
          return;
        }
        if (fromAccountId === toAccountId) {
          setErrorMsg('Source and destination accounts must be different.');
          setStatus('error');
          return;
        }

        const fromAccObj = accounts.find(a => a.id === fromAccountId);
        const toAccObj   = accounts.find(a => a.id === toAccountId);

        result = await transferBetweenAccounts(
          fromAccObj?.id || fromAccountId,
          toAccObj?.id   || toAccountId,
          parsedAmount,
          description || `Transfer to ${toAccObj?.name || 'Account'}`,
          idempotencyKey,
        );
      }

      // ── P2P: email ────────────────────────────────────────────────────────
      else if (transferType === 'email') {
        if (!recipient.trim()) {
          setErrorMsg('Please enter the recipient email.');
          setStatus('error');
          return;
        }
        result = await transferToUser(
          recipient.trim().toLowerCase(),
          parsedAmount,
          description,
          'email',
          idempotencyKey,
        );
      }

      // ── P2P: IBAN lookup inside FinVault ──────────────────────────────────
      else if (transferType === 'user-iban') {
        if (!recipient.trim()) {
          setErrorMsg('Please enter the recipient IBAN.');
          setStatus('error');
          return;
        }
        result = await transferToUser(
          recipient.replace(/\s/g, '').toUpperCase(),
          parsedAmount,
          description,
          'iban',
          idempotencyKey,
        );
      }

      // ── External IBAN (same as user-iban lookup — FinVault network) ───────
      else {
        if (!recipient.trim() || ibanError) {
          setErrorMsg(ibanError || 'Please enter a valid IBAN.');
          setStatus('error');
          return;
        }
        result = await transferToUser(
          recipient.replace(/\s/g, '').toUpperCase(),
          parsedAmount,
          description,
          'iban',
          idempotencyKey,
        );
      }

      // ── Handle result ─────────────────────────────────────────────────────
      if (result.success) {
        const isDuplicate = result.message?.includes('already');
        setTxId(result.txId);
        setStatus(isDuplicate ? 'duplicate' : 'success');
        showToast(result.message);

        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1800);

      } else {
        setErrorMsg(result.message);
        setStatus('error');
        // Rotate idempotency key so the user can retry cleanly
        setIdempotencyKey(makeIdempotencyKey());
      }

    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
      setStatus('error');
      setIdempotencyKey(makeIdempotencyKey());
    }
  };

  // ── Disabled-state guard ───────────────────────────────────────────────────
  const isSubmitting = status === 'loading' || status === 'success' || status === 'duplicate';

  const canSubmit = (() => {
    if (!amountValid || isSubmitting) return false;
    if (transferType === 'account') return !!fromAccountId && !!toAccountId && fromAccountId !== toAccountId;
    if (transferType === 'email')   return !!recipient.trim();
    return !!recipient.trim() && !ibanError; // iban / user-iban
  })();

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inputStyle = {
    borderRadius: '10px',
    border:       '1px solid var(--color-border)',
    background:   'var(--color-bg)',
    color:        'var(--color-text-primary)',
    fontFamily:   "'Sora', sans-serif",
    padding:      '10px 12px',
    fontSize:     '14px',
    width:        '100%',
    outline:      'none',
  };

  const labelStyle = {
    fontSize:     '12px',
    color:        'var(--color-text-muted)',
    marginBottom: 4,
    display:      'block',
    letterSpacing: '0.3px',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 mb-6">
        {/* Drag handle */}
        <div className="w-12 h-0.5 bg-white/20 rounded mb-4" />

        <div
          className="rounded-panel p-6 border max-h-[85vh] overflow-y-auto"
          style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="flex justify-between items-start mb-5 gap-3">
            <button
              onClick={handleClose}
              className="px-2 py-1 text-xs rounded-sm-panel shrink-0 self-start"
              style={{ background: 'var(--color-red-accent)', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              ←
            </button>
            <h3 className="text-sm font-medium flex-1 text-center" style={{ fontFamily: "'Sora', sans-serif" }}>
              Send Money
            </h3>
            <div className="w-10 shrink-0" />
          </div>

          {/* ── Transfer type selector ───────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mb-5">
            {TRANSFER_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => { setTransferType(t.value); setRecipient(''); setIbanError(''); }}
                disabled={isSubmitting}
                style={{
                  padding:         '5px 12px',
                  borderRadius:    '99px',
                  fontSize:        '11px',
                  fontWeight:      500,
                  border:          '1px solid var(--color-border)',
                  backgroundColor:  transferType === t.value ? 'var(--color-accent, #1a1f3a)' : 'transparent',
                  color:            transferType === t.value ? 'white' : 'var(--color-text-muted)',
                  cursor:          'pointer',
                  transition:      'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Status badge ────────────────────────────────────────────────── */}
          <StatusBadge status={status} />
          {status === 'error' && errorMsg && (
            <div style={{
              borderRadius: 10, padding: '8px 14px', fontSize: 12, marginBottom: 10,
              backgroundColor: 'rgba(214,59,59,0.08)', color: 'var(--color-red-accent)',
            }}>
              {errorMsg}
            </div>
          )}
          {txId && (status === 'success' || status === 'duplicate') && (
            <div style={{
              borderRadius: 10, padding: '6px 12px', fontSize: 11, marginBottom: 10,
              backgroundColor: 'rgba(14,124,110,0.06)', color: 'var(--color-text-muted)',
              fontFamily: "'Space Mono', monospace",
            }}>
              Ref: {txId}
            </div>
          )}

          {/* ── Internal account selectors ──────────────────────────────────── */}
          {transferType === 'account' && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>From Account</label>
                <select
                  value={fromAccountId}
                  onChange={e => { setFromAccountId(e.target.value); setToAccountId(''); }}
                  disabled={isSubmitting}
                  className="form-input"
                  style={{ ...inputStyle }}
                >
                  <option value="">Select source account…</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} — Rs {(a.balance ?? 0).toLocaleString()}
                      {a.ibanNumber ? ` (${formatIBAN(a.ibanNumber).slice(-9)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>To Account</label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  disabled={isSubmitting || !fromAccountId}
                  className="form-input"
                  style={{ ...inputStyle }}
                >
                  <option value="">Select destination account…</option>
                  {accounts
                    .filter(a => a.id !== fromAccountId)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} — Rs {(a.balance ?? 0).toLocaleString()}
                        {a.ibanNumber ? ` (${formatIBAN(a.ibanNumber).slice(-9)})` : ''}
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}

          {/* ── Recent beneficiaries (shown for all non-internal modes) ──────── */}
          {transferType !== 'account' && (
            <>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: 8 }}>
                Recent recipients
              </p>
              <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
                {MOCK_BENEFICIARIES.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBeneficiary(b)}
                    disabled={isSubmitting}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div
                        style={{
                          width: 38, height: 38, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 600,
                          background:   recipient === b.iban ? 'var(--color-gold)' : 'rgba(255,255,255,0.06)',
                          color:        'var(--color-text-primary)',
                          border:       recipient === b.iban ? '2px solid var(--color-gold)' : '2px solid transparent',
                          transition:   'all 0.15s',
                        }}
                      >
                        {b.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                        {b.name.split(' ')[0]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Recipient field ─────────────────────────────────────────────── */}
          {transferType !== 'account' && (
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginBottom: 12 }}>
              <label style={labelStyle}>
                {transferType === 'email'
                  ? 'Recipient Email'
                  : 'Recipient IBAN'}
              </label>
              <input
                type={transferType === 'email' ? 'email' : 'text'}
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder={
                  transferType === 'email'
                    ? 'user@example.com'
                    : 'PK36 FNVT 0000 1234 5678 9012'
                }
                disabled={isSubmitting}
                style={inputStyle}
              />
              {ibanError && (
                <p style={{ fontSize: 11, color: 'var(--color-red-accent)', marginTop: 4 }}>
                  {ibanError}
                </p>
              )}
            </div>
          )}

          {/* ── Amount + Note ────────────────────────────────────────────────── */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Amount (PKR)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Rs 0.00"
              disabled={isSubmitting}
              className="form-mono-input"
              style={{ ...inputStyle, fontFamily: "'Space Mono', monospace", fontSize: 22 }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Note (optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's it for?"
              disabled={isSubmitting}
              style={inputStyle}
            />
          </div>

          {/* ── Send button ──────────────────────────────────────────────────── */}
          <button
            onClick={handleSend}
            disabled={!canSubmit}
            style={{
              width:           '100%',
              padding:         '12px 16px',
              borderRadius:    '10px',
              border:          'none',
              fontFamily:      "'Sora', sans-serif",
              fontSize:        14,
              fontWeight:      500,
              color:           'white',
              cursor:          canSubmit ? 'pointer' : 'not-allowed',
              opacity:         canSubmit ? 1 : 0.5,
              backgroundColor: status === 'success' || status === 'duplicate'
                ? 'var(--color-teal, #0e7c6e)'
                : '#1a1f3a',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              gap:             8,
              transition:      'background-color 0.2s',
            }}
            onMouseEnter={e => { if (canSubmit && status === 'idle') e.currentTarget.style.backgroundColor = '#262d52'; }}
            onMouseLeave={e => { if (status === 'idle') e.currentTarget.style.backgroundColor = '#1a1f3a'; }}
          >
            {status === 'loading' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                </path>
              </svg>
            )}
            {status === 'loading'   && 'Sending…'}
            {status === 'success'   && '✓ Sent'}
            {status === 'duplicate' && '✓ Already sent'}
            {(status === 'idle' || status === 'error') && (
              <>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M1.5 7.5H13.5M13.5 7.5L9 3M13.5 7.5L9 12"
                    stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Send Money
              </>
            )}
          </button>

          {/* ── Small print ──────────────────────────────────────────────────── */}
          <p style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 10 }}>
            Transfers are final. FinVault uses ACID transactions — re-submitting is safe.
          </p>
        </div>
      </div>
    </div>
  );
}
