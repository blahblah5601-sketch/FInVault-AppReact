# Raast Service Integration Proposal for FinVault Transfer Engine

## Overview
This document proposes how to integrate Raast (Real-time Automated Settlement System) for external bank transfers into the existing ACID-compliant transfer engine while maintaining the PENDING → COMMITTING → COMPLETE status flow.

## Current Implementation
The current `transferToUser` function in `transferEngine.js` only handles transfers between FinVault users (internal transfers). It uses Firestore transactions for atomicity and implements idempotency via intent documents.

## Proposed Changes
We need to modify the `transferToUser` function to:
1. Detect when a transfer is external (recipient is not a FinVault user)
2. Route external transfers through the Raast service
3. Maintain the same PENDING → COMMITTING → COMPLETE flow
4. Preserve idempotency and durability guarantees

## Implementation Approach

### Step 1: Detect External Transfers
Before attempting to find a recipient via `findUserByEmail` or `findUserByIBAN`, we should check if the recipient identifier matches patterns that indicate an external bank account (e.g., IBAN format for other Pakistani banks).

### Step 2: External Transfer Flow
For external transfers, we'll implement a similar intent-based workflow:
1. Write PENDING intent
2. Validate recipient account details via Raast Pre-RTP services
3. Update intent to COMMITTING
4. Execute transfer via Raast RTP Now
5. Update intent to COMPLETE with transaction details
6. Log transfer records (best-effort)

### Step 3: Error Handling and Retries
External transfers via Raast may have different failure modes, so we need to:
- Map Raast error codes to user-friendly messages
- Implement appropriate retry logic for transient failures
- Ensure failed transfers can be safely retried with the same idempotency key

## Detailed Implementation

### Modified transferToUser Function Structure

```javascript
export const transferToUser = async (
  recipientIdentifier,
  amount,
  description,
  identifierType = 'email',
  idempotencyKey = null,
) => {
  // ... existing validation and idempotency checks ...

  // NEW: Check if this is an external transfer
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

  // ... existing internal transfer logic ...
};

// NEW: Helper to detect external recipients
export const isExternalRecipient = async (identifier, type) => {
  // For IBAN transfers, check if it's a FinVault IBAN
  if (type === 'iban') {
    const cleanIban = identifier.replace(/\s/g, '').toUpperCase();
    // FinVault IBANs start with PK36FNVT
    return !cleanIban.startsWith('PK36FNVT');
  }
  
  // For email transfers, check if email domain is @finvault.app
  if (type === 'email') {
    return !identifier.toLowerCase().endsWith('@finvault.app');
  }
  
  return false;
};

// NEW: External transfer handler
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

  // ── Idempotency: already done? ──────────────────────────────────────────
  const existing = await checkIdempotency(senderId, txId);
  if (existing?.status === 'ALREADY_COMPLETE')
    return { success: true, message: 'Transfer already completed.', txId };

  // ── Write intent FIRST ──────────────────────────────────────────────────
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
    const validationResult = validateTransfer(senderAccount, amount);
    if (validationResult !== true) {
      await updateIntent(senderId, txId, { status: 'FAILED', error: validationResult });
      return { success: false, message: validationResult };
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
    
    // For now, return a mock successful response
    // In production, this would call the actual Raast service
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
```

## Integration Points

### 1. Firestore Security Rules
We need to update the Firestore security rules to allow:
- Writing to intent documents for external transfers (already covered by our existing rules)
- Reading account information needed for external transfers

### 2. Error Handling
We should map common Raast error codes to appropriate user messages:
- Insufficient funds
- Invalid account details
- Transaction limits exceeded
- Bank/service unavailable

### 3. Idempotency Considerations
For external transfers, idempotency is more complex because:
- The external system may not support idempotency keys
- We need to rely on our intent document to prevent duplicate attempts
- If a transfer times out, we need to be able to check its status with the external system

### 4. Logging and Audit Trail
External transfers should still create appropriate transaction and history records, with markers indicating they were external transfers.

## Benefits of This Approach

1. **Maintains ACID Properties**: Internal transfers remain fully ACID compliant
2. **Consistent User Experience**: Both internal and external transfers follow the same PENDING → COMMITTING → COMPLETE flow
3. **Idempotency Preserved**: Users can safely retry transfers with the same idempotency key
4. **Backward Compatibility**: Existing internal transfer functionality remains unchanged
5. **Extensible Design**: Makes it easier to add other payment methods in the future

## Next Steps

1. Implement the helper functions (`isExternalRecipient`, `handleExternalTransfer`, etc.)
2. Update the `transferToUser` function to delegate to the appropriate handler
3. Add necessary imports for the Raast service
4. Test both internal and external transfer flows
5. Update documentation and error messages as needed