// src/utils/transferEngine.js
// ─────────────────────────────────────────────────────────────────────────────
// ACID-safe transfer engine for FinVault.
//
// Properties implemented:
//   Atomicity   – Firestore runTransaction rolls back everything on failure
//   Consistency – ConsistencyGuard validates balance-floor & freeze rules
//   Isolation   – Firestore's optimistic concurrency retries on conflicts
//   Durability  – Intent document written BEFORE touching balances;
//                 recovery is possible after any crash point
//
// Idempotency   – pass the same idempotencyKey twice → no double-transfer
// ─────────────────────────────────────────────────────────────────────────────

import { db, auth } from '../firebase';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  updateDoc,
  runTransaction,
  writeBatch,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_COL    = '_transfer_intents';
const BALANCE_FIELD = 'balance';
const BALANCE_FLOOR = 0;           // PKR — accounts may not go below 0
const MAX_TRANSFER  = 10_000_000;  // Rs 10 million single-transfer cap

// ─────────────────────────────────────────────────────────────────────────────
// 1. Intent helpers  (Durability + Idempotency)
//    Pattern: write intent BEFORE touching any balance.
//    If the app crashes mid-way a recovery sweep can detect PENDING / COMMITTING.
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a stable transaction ID. Pass the same key → same txId (idempotent). */
export const makeTxId = (idempotencyKey = null) =>
  idempotencyKey
    ? `tx_${idempotencyKey}`
    : `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/** Write an intent document as the very first step of a transfer. */
export const writeIntent = (senderId, txId, payload) =>
  setDoc(doc(db, 'users', senderId, INTENT_COL, txId), {
    txId,
    status:    'PENDING',
    payload:   JSON.stringify(payload),
    createdAt: serverTimestamp(),
    attempts:  0,
  });

/** Update intent status (COMMITTING → COMPLETE | FAILED). */
export const updateIntent = (senderId, txId, update) =>
  updateDoc(doc(db, 'users', senderId, INTENT_COL, txId), {
    ...update,
    updatedAt: serverTimestamp(),
  }).catch(() => {
    // Intent updates are best-effort — never let them crash the main flow
  });

/**
 * Check whether a transfer with this txId already completed.
 * Returns { status: 'ALREADY_COMPLETE', txId } when it has, otherwise null.
 */
export const checkIdempotency = async (senderId, txId) => {
  const snap = await getDoc(doc(db, 'users', senderId, INTENT_COL, txId));
  if (!snap.exists()) return null;
  const intent = snap.data();
  if (intent.status === 'COMPLETE') {
    return {
      txId,
      status:  'ALREADY_COMPLETE',
      ...(intent.result ? JSON.parse(intent.result) : {}),
    };
  }
  return intent;
};


// ─────────────────────────────────────────────────────────────────────────────
// 2. Consistency Guard
//    Validates all business rules BEFORE any write touches a balance.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a proposed debit against a sender's account document.
 * Returns `true` on success, or a human-readable error string.
 *
 * @param {Object} senderData   Raw Firestore account document data
 * @param {number} amount       Proposed transfer amount (positive)
 * @param {Object} options      { balanceField, balanceFloor, maxAmount }
 */
export const validateTransfer = (senderData, amount, options = {}) => {
  const {
    balanceField = BALANCE_FIELD,
    balanceFloor = BALANCE_FLOOR,
    maxAmount    = MAX_TRANSFER,
  } = options;

  if (!amount || typeof amount !== 'number' || amount <= 0)
    return 'Amount must be a positive number.';

  if (amount > maxAmount)
    return `Single transfer cannot exceed Rs ${maxAmount.toLocaleString()}.`;

  if (senderData.frozen)
    return 'Your account is frozen. Please contact support.';

  const balance = Number(senderData[balanceField] ?? 0);
  if (balance - amount < balanceFloor)
    return `Insufficient funds. Available: Rs ${balance.toLocaleString()}, Required: Rs ${amount.toLocaleString()}.`;

  return true;
};


// ─────────────────────────────────────────────────────────────────────────────
// 3. Account helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return the primary (main) account for any userId.
 * Falls back to the first account if no primary is set.
 */
export const getPrimaryAccount = async (userId) => {
  const snap = await getDocs(collection(db, 'users', userId, 'accounts'));
  if (snap.empty) return null;

  let primary = null;
  snap.forEach((d) => {
    const data = d.data();
    if (data.accountLevel === 'main' || data.isPrimary) {
      primary = { id: d.id, ...data };
    }
  });

  if (!primary) {
    const first = snap.docs[0];
    primary = { id: first.id, ...first.data() };
  }

  return primary;
};


// ─────────────────────────────────────────────────────────────────────────────
// 4. Core ACID fund transfer
//    Uses Firestore runTransaction — gives us:
//      • Optimistic concurrency with automatic server-side retries
//      • All-or-nothing atomicity across both account documents
//      • Consistent reads (no stale balances)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Atomically move `amount` PKR from one Firestore account doc to another.
 *
 * @param {string} senderUserId
 * @param {string} senderAccountId
 * @param {string} recipientUserId
 * @param {string} recipientAccountId
 * @param {number} amount
 * @param {Object} options  { txId, balanceField, balanceFloor, currency, meta }
 * @returns {{ txId, timestamp, fromBalanceAfter, toBalanceAfter }}
 */
export const atomicFundTransfer = async (
  senderUserId,
  senderAccountId,
  recipientUserId,
  recipientAccountId,
  amount,
  options = {},
) => {
  const {
    txId         = makeTxId(),
    balanceField = BALANCE_FIELD,
    balanceFloor = BALANCE_FLOOR,
    currency     = 'PKR',
    meta         = {},
  } = options;

  const senderRef    = doc(db, 'users', senderUserId,    'accounts', senderAccountId);
  const recipientRef = doc(db, 'users', recipientUserId, 'accounts', recipientAccountId);
  const timestamp    = new Date().toISOString();

  let fromBalanceAfter;
  let toBalanceAfter;

  // runTransaction retries automatically on version conflicts (Firestore OCC)
  await runTransaction(db, async (t) => {
    const [senderSnap, recipientSnap] = await Promise.all([
      t.get(senderRef),
      t.get(recipientRef),
    ]);

    if (!senderSnap.exists())    throw new Error('Sender account not found.');
    if (!recipientSnap.exists()) throw new Error('Recipient account not found.');

    const senderData    = senderSnap.data();
    const recipientData = recipientSnap.data();

    // ── Consistency check BEFORE any write ─────────────────────────────────
    const validationResult = validateTransfer(senderData, amount, {
      balanceField,
      balanceFloor,
    });
    if (validationResult !== true) throw new Error(validationResult);

    const fromBal = Number(senderData[balanceField]    ?? 0);
    const toBal   = Number(recipientData[balanceField] ?? 0);

    fromBalanceAfter = fromBal - amount;
    toBalanceAfter   = toBal   + amount;

    // ── Atomic debit + credit ───────────────────────────────────────────────
    t.update(senderRef, {
      [balanceField]: fromBalanceAfter,
      _version:       (senderData._version ?? 0) + 1,
      lastTx:         { txId, type: 'DEBIT',  amount, currency, timestamp, ...meta },
    });

    t.update(recipientRef, {
      [balanceField]: toBalanceAfter,
      _version:       (recipientData._version ?? 0) + 1,
      lastTx:         { txId, type: 'CREDIT', amount, currency, timestamp, ...meta },
    });
  });

  return { txId, timestamp, fromBalanceAfter, toBalanceAfter };
};


// ─────────────────────────────────────────────────────────────────────────────
// 5. Ledger logging (best-effort, non-critical)
//    Writes transaction + history records for BOTH parties in a single batch.
//    Fires after the ACID transfer confirms — a logging failure never rolls
//    back the transfer itself.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record transaction + history entries for sender and recipient.
 * Call this AFTER atomicFundTransfer succeeds.
 */
export const logTransferRecords = async ({
  senderId,
  senderEmail,
  recipientId,
  recipientEmail,
  senderAccountId,
  recipientAccountId,
  senderIban,
  recipientIban,
  amount,
  description,
  txId,
  timestamp,
}) => {
  const batch = writeBatch(db);

  // ── Sender: outgoing transaction ────────────────────────────────────────
  batch.set(doc(collection(db, 'users', senderId, 'transactions')), {
    txId,
    amount:          -amount,
    currency:        'PKR',
    desc:             description || `Transfer to ${recipientEmail || 'User'}`,
    cat:             'Transfer',
    sourceAccountId: senderAccountId,
    destination:     recipientIban  || recipientEmail || '',
    destinationType: recipientIban  ? 'iban' : 'email',
    status:          'completed',
    paymentMethod:   'bank-transfer',
    date:             timestamp,
    createdAt:        serverTimestamp(),
  });

  // ── Recipient: incoming transaction ─────────────────────────────────────
  batch.set(doc(collection(db, 'users', recipientId, 'transactions')), {
    txId,
    amount:          amount,
    currency:        'PKR',
    desc:             description || `Transfer from ${senderEmail || 'User'}`,
    cat:             'Transfer',
    sourceAccountId: recipientAccountId,
    destination:     senderIban   || senderEmail || '',
    destinationType: senderIban   ? 'iban' : 'email',
    status:          'completed',
    paymentMethod:   'bank-transfer',
    date:             timestamp,
    createdAt:        serverTimestamp(),
  });

  // ── Sender history ───────────────────────────────────────────────────────
  batch.set(doc(collection(db, 'users', senderId, 'history')), {
    txId,
    type:      'Transfer Sent',
    details:   `Sent Rs ${amount.toLocaleString()} to ${recipientEmail || 'User'}`,
    amount:    -amount,
    date:       timestamp,
    createdAt:  serverTimestamp(),
  });

  // ── Recipient history ────────────────────────────────────────────────────
  batch.set(doc(collection(db, 'users', recipientId, 'history')), {
    txId,
    type:      'Transfer Received',
    details:   `Received Rs ${amount.toLocaleString()} from ${senderEmail || 'User'}`,
    amount,
    date:       timestamp,
    createdAt:  serverTimestamp(),
  });

  await batch.commit();
};


// ─────────────────────────────────────────────────────────────────────────────
// 6. External Transfer Helpers (Raast Integration)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if the recipient is external (not a FinVault user)
 * @param {string} identifier - Email or IBAN
 * @param {string} type - 'email' or 'iban'
 * @returns {Promise<boolean>} - true if external, false if FinVault user
 */
export const isExternalRecipient = async (identifier, type) => {
  // For IBAN transfers, check if it has a valid PK IBAN format
  if (type === 'iban') {
    const cleanIban = identifier.replace(/\s/g, '').toUpperCase();
    // Check if it matches the PK IBAN format: PK + 2 digits + 4 letters + 16 digits
    const isValidPkIbanFormat =
      cleanIban.length === 24 &&
      cleanIban.startsWith('PK') &&
      /^PK[0-9]{2}[A-Z]{4}[0-9]{16}$/.test(cleanIban);

    // If it's not even a valid PK IBAN format, it's definitely external/invalid
    // If it IS a valid PK IBAN format, we'll check if it exists in the system during user lookup
    return !isValidPkIbanFormat;
  }

  // For email transfers, check if email domain is @finvault.app
  if (type === 'email') {
    return !identifier.toLowerCase().endsWith('@finvault.app');
  }

  return false;
};

/**
 * Handle external transfers via Raast service
 * Maintains the same PENDING → COMMITTING → COMPLETE flow
 */
export const handleExternalTransfer = async (
  recipientIdentifier,
  amount,
  description,
  identifierType,
  idempotencyKey
) => {
  if (!auth.currentUser)
    return { success: false, message: 'User not authenticated.' };
  if (!amount || typeof amount !== 'number' || amount <= 0)
    return { success: false, message: 'Invalid transfer amount.' };

  const senderId = auth.currentUser.uid;
  const txId     = makeTxId(idempotencyKey);

  // ── Idempotency: already done? ──────────────────────────────────────────────
  const existing = await checkIdempotency(senderId, txId);
  if (existing?.status === 'ALREADY_COMPLETE')
    return { success: true, message: 'Transfer already completed.', txId };

  // ── Write intent FIRST ──────────────────────────────────────────────────────
  await writeIntent(senderId, txId, {
    recipientIdentifier, amount, description, identifierType,
    transferType: 'external'
  });

  try {
    // ── Validate recipient via Raast Pre-RTP services ───────────────────────
    let validationResult;
    if (identifierType === 'iban') {
      // Extract member ID and IBAN for validation
      // This would need to be mapped from the IBAN to the corresponding bank's member ID
      validationResult = await validateExternalBeneficiary(identifierType, recipientIdentifier);
    } else if (identifierType === 'email') {
      // For email, we might need to use a different approach or inform user to use IBAN
      await updateIntent(senderId, txId, { status: 'FAILED', error: 'External transfers require IBAN' });
      return { success: false, message: 'External transfers require IBAN' };
    }

    if (!validationResult.valid) {
      await updateIntent(senderId, txId, {
        status: 'FAILED',
        error: validationResult.error || 'Invalid recipient details'
      });
      return { success: false, message: validationResult.error || 'Invalid recipient details' };
    }

    // ── Get sender account details ────────────────────────────────────────
    const senderAccount = await getPrimaryAccount(senderId);
    if (!senderAccount) {
      await updateIntent(senderId, txId, { status: 'FAILED', error: 'Sender account not found' });
      return { success: false, message: 'Sender account not found.' };
    }

    // Check sufficient funds
    const fundsCheckResult = validateTransfer(senderAccount, amount);
    if (fundsCheckResult !== true) {
      await updateIntent(senderId, txId, { status: 'FAILED', error: fundsCheckResult });
      return { success: false, message: fundsCheckResult };
    }

    // ── Update intent to COMMITTING ───────────────────────────────────────
    await updateIntent(senderId, txId, { status: 'COMMITTING' });

    // ── Execute transfer via Raast RTP Now ────────────────────────────────
    const raastResult = await executeRaastTransfer(
      senderAccount,
      recipientIdentifier,
      amount,
      description
    );

    if (!raastResult.success) {
      await updateIntent(senderId, txId, {
        status: 'FAILED',
        error: raastResult.error || 'Transfer failed'
      });
      return { success: false, message: raastResult.error || 'Transfer failed' };
    }

    // ── Mark COMPLETE ────────────────────────────────────────────────────
    await updateIntent(senderId, txId, {
      status:      'COMPLETE',
      result:      JSON.stringify({
        txId,
        amount,
        timestamp: new Date().toISOString(),
        raastDetails: raastResult.details
      }),
      completedAt: serverTimestamp(),
    });

    // ── Log records (fire-and-forget) ─────────────────────────────────────
    logTransferRecords({
      senderId,
      senderEmail: auth.currentUser.email,
      recipientId: 'external', // Special marker for external transfers
      recipientEmail: recipientIdentifier, // For email, or could be empty for IBAN
      senderAccountId: senderAccount.id,
      recipientAccountId: 'external',
      senderIban: senderAccount.ibanNumber,
      recipientIban: identifierType === 'iban' ? recipientIdentifier.replace(/\s/g, '').toUpperCase() : '',
      amount,
      description,
      txId,
      timestamp: new Date().toISOString(),
      transferType: 'external'
    }).catch(console.error);

    return {
      success: true,
      message: 'External transfer completed successfully.',
      txId,
      raastDetails: raastResult.details
    };

  } catch (error) {
    const userMessage = _classifyError(error.message);
    await updateIntent(senderId, txId, {
      status:    'FAILED',
      error:     error.message,
      failedAt:  serverTimestamp(),
    });
    return { success: false, message: userMessage };
  }
};

// NEW: Validate external beneficiary via Raast Pre-RTP Alias Inquiry
export const validateExternalBeneficiary = async (aliasType, aliasValue) => {
  try {
    // For now, we'll do basic format validation
    // In production, this would call the actual Raast Pre-RTP Alias Inquiry service
    if (aliasType === 'iban') {
      const cleanIban = aliasValue.replace(/\s/g, '').toUpperCase();
      // Basic IBAN validation (length, country code, etc.)
      if (cleanIban.length !== 24 || !cleanIban.startsWith('PK')) {
        return { valid: false, error: 'Invalid IBAN format' };
      }

      // Additional MOD 97 validation could be added here
      // For now, we'll consider it valid if it passes basic checks
      return { valid: true };
    }

    return { valid: false, error: 'Unsupported alias type for external transfers' };
  } catch (error) {
    return { valid: false, error: 'Failed to validate beneficiary' };
  }
};

// NEW: Execute transfer via Raast RTP Now Merchant
export const executeRaastTransfer = async (senderAccount, recipientIdentifier, amount, description) => {
  try {
    // Import raastService functions (would need to be added)
    // const { createRtpNowPayment } = require('../../services/raastService');

    // For now, return a mock response that sometimes fails to simulate real conditions
    // In production, this would call the actual Raast service
    const randomFailure = Math.random() < 0.1; // 10% chance of failure

    if (randomFailure) {
      return {
        success: false,
        error: 'External transfer failed due to network timeout'
      };
    }

    return {
      success: true,
      details: {
        rtpId: `mock_rtp_${Date.now()}`,
        stan: Math.floor(Math.random() * 900000) + 100000,
        // Other Raast response fields would go here
      }
    };

    // Actual implementation would look like:
    /*
    const paymentDetails = {
      merchantDetails: {
        merchantId: 'MERCHANT001', // FinVault merchant ID
        iban: senderAccount.ibanNumber, // Sender's IBAN
        // ... other required merchant details
      },
      payerDetails: {
        // Would need to extract or generate payer details from recipientIdentifier
      },
      paymentDetails: {
        executionDateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        expiryDateTime: new Date(Date.now() + 3600000).toISOString().replace('T', ' ').substring(0, 19),
        rtpId: Math.random().toString(36).substring(2, 15),
        instructedAmount: amount,
        transactionType: '0001' // Standard funds transfer
      },
      info: {
        stan: Math.floor(Math.random() * 900000) + 100000,
        rrn: Math.random().toString(36).substring(2, 14)
      }
    };

    const result = await createRtpNowPayment(paymentDetails);

    if (result && result.responseCode === '00') {
      return {
        success: true,
        details: result
      };
    } else {
      return {
        success: false,
        error: result?.responseDescription || 'Unknown error'
      };
    }
    */
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to execute external transfer'
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. User-lookup helpers (re-exported so api.js imports from one place)
// ─────────────────────────────────────────────────────────────────────────────

/** Find a FinVault user document by email address. Returns { id, ...data } or null. */
export const findUserByEmail = async (email) => {
  if (!email || !auth.currentUser) return null;
  try {
    const q    = query(collection(db, 'users'), where('email', '==', email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  } catch (err) {
    console.error('findUserByEmail:', err);
    return null;
  }
};

/** Find a FinVault user by their IBAN (scans all user accounts). Returns { id, ...data } or null. */
export const findUserByIBAN = async (iban) => {
  if (!iban || !auth.currentUser) return null;
  try {
    const cleanIban  = iban.replace(/\s/g, '').toUpperCase();
    const usersSnap  = await getDocs(collection(db, 'users'));

    for (const userDoc of usersSnap.docs) {
      const accsSnap = await getDocs(collection(db, 'users', userDoc.id, 'accounts'));
      for (const accDoc of accsSnap.docs) {
        const accIban = (accDoc.data().ibanNumber ?? '').replace(/\s/g, '').toUpperCase();
        if (accIban === cleanIban) return { id: userDoc.id, ...userDoc.data() };
      }
    }
    return null;
  } catch (err) {
    console.error('findUserByIBAN:', err);
    return null;
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// 7. High-level transfer façades
//    These are the functions imported by api.js and the UI panels.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transfer funds to any FinVault user identified by email or IBAN.
 * Delegates to internal or external handler based on recipient type.
 *
 * @param {string}  recipientIdentifier  Email address or IBAN
 * @param {number}  amount               Amount in PKR (positive)
 * @param {string}  description          Payment note
 * @param {string}  identifierType       'email' | 'iban'
 * @param {string}  [idempotencyKey]     Stable key — re-submitting same key is safe
 * @returns {{ success, message, txId? }}
 */
export const transferToUser = async (
  recipientIdentifier,
  amount,
  description,
  identifierType  = 'email',
  idempotencyKey  = null,
) => {
  // Check if this is an external transfer
  const isExternalTransfer = await isExternalRecipient(recipientIdentifier, identifierType);

  if (isExternalTransfer) {
    return await handleExternalTransfer(
      recipientIdentifier,
      amount,
      description,
      identifierType,
      idempotencyKey
    );
  }

  // Handle internal transfer (existing logic)
  if (!auth.currentUser)
    return { success: false, message: 'User not authenticated.' };
  if (!amount || typeof amount !== 'number' || amount <= 0)
    return { success: false, message: 'Invalid transfer amount.' };

  const senderId = auth.currentUser.uid;
  const txId     = makeTxId(idempotencyKey);

  // ── Idempotency: already done? ──────────────────────────────────────────
  const existing = await checkIdempotency(senderId, txId);
  if (existing?.status === 'ALREADY_COMPLETE')
    return { success: true, message: 'Transfer already completed.', txId };

  // ── Write intent FIRST ──────────────────────────────────────────────────
  await writeIntent(senderId, txId, {
    recipientIdentifier, amount, description, identifierType,
  });

  try {
    // ── Resolve recipient ───────────────────────────────────────────────
    let recipientUser = null;
    if      (identifierType === 'email') recipientUser = await findUserByEmail(recipientIdentifier);
    else if (identifierType === 'iban')  recipientUser = await findUserByIBAN(recipientIdentifier);
    else {
      await updateIntent(senderId, txId, { status: 'FAILED', error: 'Invalid identifier type' });
      return { success: false, message: 'Invalid identifier type.' };
    }

    if (!recipientUser) {
      await updateIntent(senderId, txId, { status: 'FAILED', error: 'Recipient not found' });
      return { success: false, message: 'Recipient not found.' };
    }

    if (recipientUser.id === senderId) {
      await updateIntent(senderId, txId, { status: 'FAILED', error: 'Self-transfer' });
      return { success: false, message: 'Cannot transfer to yourself.' };
    }

    // ── Resolve accounts ────────────────────────────────────────────────
    const [senderAccount, recipientAccount] = await Promise.all([
      getPrimaryAccount(senderId),
      getPrimaryAccount(recipientUser.id),
    ]);

    if (!senderAccount) {
      await updateIntent(senderId, txId, { status: 'FAILED', error: 'Sender account not found' });
      return { success: false, message: 'Sender account not found.' };
    }
    if (!recipientAccount) {
      await updateIntent(senderId, txId, { status: 'FAILED', error: 'Recipient account not found' });
      return { success: false, message: 'Recipient account not found.' };
    }

    // ── ACID transfer (Firestore OCC handles isolation automatically) ───
    await updateIntent(senderId, txId, { status: 'COMMITTING' });

    const { timestamp } = await atomicFundTransfer(
      senderId,       senderAccount.id,
      recipientUser.id, recipientAccount.id,
      amount,
      { txId, meta: { description } },
    );

    // ── Mark COMPLETE ────────────────────────────────────────────────────
    await updateIntent(senderId, txId, {
      status:      'COMPLETE',
      result:      JSON.stringify({ txId, amount, timestamp }),
      completedAt: serverTimestamp(),
    });

    // ── Log records (fire-and-forget — never blocks the success response)
    logTransferRecords({
      senderId,
      senderEmail:       auth.currentUser.email,
      recipientId:       recipientUser.id,
      recipientEmail:    recipientUser.email,
      senderAccountId:   senderAccount.id,
      recipientAccountId: recipientAccount.id,
      senderIban:        senderAccount.ibanNumber,
      recipientIban:     recipientAccount.ibanNumber,
      amount,
      description,
      txId,
      timestamp,
    }).catch(console.error);

    return { success: true, message: 'Transfer completed successfully.', txId };

  } catch (error) {
    const userMessage = _classifyError(error.message);
    await updateIntent(senderId, txId, {
      status:    'FAILED',
      error:     error.message,
      failedAt:  serverTimestamp(),
    });
    return { success: false, message: userMessage };
  }
};


/**
 * Transfer funds between two of the current user's own accounts.
 *
 * @param {string}  fromAccountId     Firestore document ID of source account
 * @param {string}  toAccountId       Firestore document ID of destination account
 * @param {number}  amount
 * @param {string}  description
 * @param {string}  [idempotencyKey]
 * @returns {{ success, message, txId? }}
 */
export const transferBetweenAccounts = async (
  fromAccountId,
  toAccountId,
  amount,
  description,
  idempotencyKey = null,
) => {
  if (!auth.currentUser)
    return { success: false, message: 'User not authenticated.' };

  if (!fromAccountId || !toAccountId)
    return { success: false, message: 'Invalid account parameters.' };

  if (fromAccountId === toAccountId)
    return { success: false, message: 'Source and destination accounts must be different.' };

  if (!amount || typeof amount !== 'number' || amount <= 0)
    return { success: false, message: 'Invalid transfer amount.' };

  const userId = auth.currentUser.uid;
  const txId   = makeTxId(idempotencyKey);

  const existing = await checkIdempotency(userId, txId);
  if (existing?.status === 'ALREADY_COMPLETE')
    return { success: true, message: 'Transfer already completed.', txId };

  await writeIntent(userId, txId, {
    fromAccountId, toAccountId, amount, description, type: 'internal',
  });

  try {
    // Verify both accounts exist and are active
    const [fromSnap, toSnap] = await Promise.all([
      getDoc(doc(db, 'users', userId, 'accounts', fromAccountId)),
      getDoc(doc(db, 'users', userId, 'accounts', toAccountId)),
    ]);

    if (!fromSnap.exists() || !toSnap.exists()) {
      await updateIntent(userId, txId, { status: 'FAILED', error: 'Account not found' });
      return { success: false, message: 'One or both accounts not found.' };
    }

    const fromData = fromSnap.data();
    const toData   = toSnap.data();

    if (fromData.isActive === false || toData.isActive === false) {
      await updateIntent(userId, txId, { status: 'FAILED', error: 'Inactive account' });
      return { success: false, message: 'One or both accounts are inactive.' };
    }

    await updateIntent(userId, txId, { status: 'COMMITTING' });

    const { timestamp } = await atomicFundTransfer(
      userId, fromAccountId,
      userId, toAccountId,
      amount,
      { txId, meta: { description, type: 'internal' } },
    );

    await updateIntent(userId, txId, {
      status:      'COMPLETE',
      result:      JSON.stringify({ txId, amount, timestamp }),
      completedAt: serverTimestamp(),
    });

    // Log internal transfer records
    const batch = writeBatch(db);

    batch.set(doc(collection(db, 'users', userId, 'transactions')), {
      txId, amount: -amount, currency: 'PKR',
      desc:  description || `Transfer to ${toData.name || 'Account'}`,
      cat:  'Internal Transfer',
      accountId:  fromAccountId,
      transactionType: 'debit',
      status: 'completed', date: timestamp, createdAt: serverTimestamp(),
    });

    batch.set(doc(collection(db, 'users', userId, 'transactions')), {
      txId, amount, currency: 'PKR',
      desc:  description || `Transfer from ${fromData.name || 'Account'}`,
      cat:  'Internal Transfer',
      accountId:  toAccountId,
      transactionType: 'credit',
      status: 'completed', date: timestamp, createdAt: serverTimestamp(),
    });

    batch.set(doc(collection(db, 'users', userId, 'history')), {
      txId,
      type:    'Account Transfer',
      details: `Transferred Rs ${amount.toLocaleString()} from ${fromData.name || 'Account'} to ${toData.name || 'Account'}`,
      amount:  -amount,
      date:    timestamp,
      createdAt: serverTimestamp(),
    });

    batch.commit().catch(console.error); // fire-and-forget

    return { success: true, message: 'Transfer completed successfully.', txId };

  } catch (error) {
    await updateIntent(userId, txId, {
      status:   'FAILED',
      error:    error.message,
      failedAt: serverTimestamp(),
    });
    return { success: false, message: _classifyError(error.message) };
  }
};


/**
 * Transfer funds to multiple FinVault users in a single operation.
 * Each individual transfer is independently ACID; the batch is best-effort.
 *
 * @param {Array<{ identifier, amount, description?, identifierType? }>} transfers
 * @param {string} [bulkIdempotencyKey]  Stable key for the whole batch
 * @returns {{ success, message, totalAmount, results[] }}
 */
export const transferToMultipleUsers = async (transfers, bulkIdempotencyKey = null) => {
  if (!auth.currentUser)
    return { success: false, message: 'User not authenticated.' };

  if (!Array.isArray(transfers) || transfers.length === 0)
    return { success: false, message: 'Invalid transfers array.' };

  const senderId    = auth.currentUser.uid;
  const totalAmount = transfers.reduce((s, t) => s + (t.amount || 0), 0);

  // Quick up-front balance check against the sender's primary account
  const senderAccount = await getPrimaryAccount(senderId);
  if (!senderAccount)
    return { success: false, message: 'Sender account not found.' };

  const validationResult = validateTransfer(senderAccount, totalAmount);
  if (validationResult !== true)
    return { success: false, message: validationResult };

  const results = [];
  let  failed   = 0;

  for (let i = 0; i < transfers.length; i++) {
    const t = transfers[i];

    if (!t.identifier || !t.amount || t.amount <= 0) {
      results.push({ identifier: t.identifier, success: false, message: 'Invalid parameters.' });
      failed++;
      continue;
    }

    const key = bulkIdempotencyKey ? `${bulkIdempotencyKey}_${i}` : null;
    const res = await transferToUser(
      t.identifier,
      t.amount,
      t.description,
      t.identifierType || 'email',
      key,
    );

    results.push({ identifier: t.identifier, ...res });
    if (!res.success) failed++;
  }

  const succeeded = transfers.length - failed;

  return {
    success:     failed === 0,
    message:     failed === 0
      ? `Bulk transfer completed for ${succeeded} recipient(s).`
      : `${succeeded} transfer(s) succeeded, ${failed} failed.`,
    totalAmount,
    results,
  };
};


// ─────────────────────────────────────────────────────────────────────────────
// Internal: map raw error messages to friendly user-facing text
// ─────────────────────────────────────────────────────────────────────────────

function _classifyError(msg = '') {
  if (msg.includes('Insufficient'))  return msg; // already user-friendly from validateTransfer
  if (msg.includes('frozen'))        return 'Your account is frozen. Please contact support.';
  if (msg.includes('not found'))     return 'Account not found. Please try again.';
  if (msg.includes('floor'))         return msg;
  return 'Transfer failed. Please try again.';
}
