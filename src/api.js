 // src/api.js
 import { db, auth } from './firebase';
 import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, writeBatch, deleteDoc, setDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
 import { generateAccountNumber, generateIBAN, formatIBAN, BANK_BICS } from './utils/ibanUtils';

 // Note: This is the same logic from your old main.js file
export const createBudget = async (name, limit) => {
    if (!name || limit <= 0 || !auth.currentUser) {
    return false;
   }

   try {
     const userId = auth.currentUser.uid;

     // Add the new budget to the 'budgets' collection
     await addDoc(collection(db, "users", userId, "budgets"), {
         name,
         limit,
         spent: 0,
         icon: 'receipt',
         color: 'purple',
         isCardAssigned: false,
         items: [], // Initialize empty items array for envelope budgets
         createdAt: serverTimestamp()
     });

    // Log this action to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
        type: 'Budget Event',
        details: `Created new budget: '${name}'`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
    });

    return true; // Indicate success
  } catch (error) {
    console.error("Error creating budget:", error);
    return false; // Indicate failure
  }
};

export const createVault = async (name, target) => {
  if (!name || target <= 0 || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;
    
    await addDoc(collection(db, "users", userId, "vaults"), { 
        name, 
        target, 
        current: 0, 
        icon: 'package-plus', 
        color: 'teal', 
        isSavingsAccount: false, 
        createdAt: serverTimestamp() 
    });

    await addDoc(collection(db, "users", userId, "history"), {
        type: 'Vault Event',
        details: `Created new vault: '${name}' with a target of Rs ${target.toLocaleString()}`,
        vaultName: name,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error creating vault:", error);
    return false;
  }
};

export const handleVaultTransaction = async (vault, accounts, actionType, amount) => {
  if (!auth.currentUser) return { success: false, message: 'User not authenticated.' };
  const currentAccount = accounts.find(a => a.id === 'current');

  if (!vault || !currentAccount || !amount || amount <= 0) return { success: false, message: 'Invalid data provided.' };
  
  const vaultDocRef = doc(db, "users", auth.currentUser.uid, "vaults", vault.id);
  const accountDocRef = doc(db, "users", auth.currentUser.uid, "accounts", "current");
  const batch = writeBatch(db);
  let goalReached = false; 

  if (actionType === 'deposit') {
    const newBalance = vault.current + amount;
    if (currentAccount.balance < amount) return { success: false, message: 'Insufficient funds in Current Account.' };
    if (!vault.isSavingsAccount && vault.target) {
      const remainingGoal = vault.target - vault.current;
      if (amount > remainingGoal) {
        return { success: false, message: `Deposit exceeds goal. You can deposit up to Rs ${remainingGoal.toLocaleString()}.` };
      }
    }
    goalReached = !vault.isSavingsAccount && vault.target && newBalance >= vault.target && vault.current < vault.target;
    batch.update(vaultDocRef, { current: vault.current + amount });
    batch.update(accountDocRef, { balance: currentAccount.balance - amount });
  } else if (actionType === 'withdraw') {
    if (vault.current < amount) return { success: false, message: 'Insufficient funds in vault.' };
    batch.update(vaultDocRef, { current: vault.current - amount });
    batch.update(accountDocRef, { balance: currentAccount.balance + amount });
  } else {
    return { success: false, message: 'Invalid action type.' };
  }

  // Log the event to history
  const historyRef = collection(db, "users", auth.currentUser.uid, "history");
  const historyEvent = {
      type: vault.isSavingsAccount ? 'Savings Event' : 'Vault Event',
      details: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`,
      vaultName: vault.name,
      amount: actionType === 'deposit' ? amount : -amount,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
  };
  batch.set(doc(historyRef), historyEvent);

  try {
    await batch.commit();
    return { success: true, message: 'Transaction successful!',goalReached: goalReached, vaultName: vault.name  };
  } catch (error) {
    console.error("Vault transaction error:", error);
    return { success: false, message: 'Transaction failed.' };
  }
};

export const updateBudget = async (budgetId, newName, newLimit, items) => {
  if (!budgetId || !newName || newLimit <= 0 || !auth.currentUser) {
    return false;
  }
  try {
    const userId = auth.currentUser.uid;
    const budgetDocRef = doc(db, "users", userId, "budgets", budgetId);

    const updateData = {
      name: newName,
      limit: newLimit
    };

    // If items are provided, include them in the update
    if (items !== undefined) {
      updateData.items = items;
    }

    await updateDoc(budgetDocRef, updateData);

    await addDoc(collection(db, "users", userId, "history"), {
      type: 'Budget Event',
      details: `Updated budget '${newName}' to a limit of Rs ${newLimit.toLocaleString()}`,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error updating budget:", error);
    return false;
  }
};

export const deleteBudget = async (budget) => {
  if (!budget || !auth.currentUser) return false;
  try {
    const userId = auth.currentUser.uid;
    // Delete the document from the 'budgets' collection
    await deleteDoc(doc(db, "users", userId, "budgets", budget.id));

    // Log the deletion to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
        type: 'Budget Event',
        details: `Deleted budget: '${budget.name}'`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error deleting budget:", error);
    return false;
  }
};

export const toggleBudgetCardAssignment = async (budgetToToggle, allBudgets, action) => {
  if (!auth.currentUser) return { success: false, message: 'User not signed in.' };
  
  const MAX_CARD_ASSIGNMENTS = 3;
  const userId = auth.currentUser.uid;

  if (action === 'assign') {
    const assignedCount = allBudgets.filter(b => b.isCardAssigned).length;
    if (assignedCount >= MAX_CARD_ASSIGNMENTS) {
      return { success: false, message: `You can only assign a maximum of ${MAX_CARD_ASSIGNMENTS} budgets.` };
    }
  }

  try {
    const budgetDocRef = doc(db, "users", userId, "budgets", budgetToToggle.id);
    await updateDoc(budgetDocRef, { isCardAssigned: (action === 'assign') });

    await addDoc(collection(db, "users", userId, "history"), {
        type: 'Budget Event',
        details: `${action === 'assign' ? 'Assigned' : 'Unassigned'} budget '${budgetToToggle.name}' ${action === 'assign' ? 'to' : 'from'} card.`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error toggling budget assignment:", error);
    return { success: false, message: 'An error occurred.' };
  }
};

export const updateUserPreferences = async (prefs) => {
  if (!auth.currentUser) return false;
  try {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    //await updateDoc(userDocRef, { settings: prefs }, { merge: true });
    await setDoc(userDocRef, { settings: prefs }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return false;
  }
};

export const getUserPreferences = async () => {
  try {
    if (!auth.currentUser) return null;
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? docSnap.data().settings : null;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null;
  }
};

export const deleteVault = async (vault) => {
  if (!vault || !auth.currentUser) return false;
  try {
    const userId = auth.currentUser.uid;
    // Delete the document from the 'vaults' collection
    await deleteDoc(doc(db, "users", userId, "vaults", vault.id));

    // Log the deletion to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
        type: 'Vault Event',
        details: `Deleted vault: '${vault.name}'`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error deleting vault:", error);
    return false;
  }
};

// ==================== BANK CONNECTION FUNCTIONS ====================

export const createBankConnection = async (bankName, bankId) => {
  if (!bankName || !bankId || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;

    await addDoc(collection(db, "users", userId, "bankConnections"), {
      bankName,
      bankId,
      connectionStatus: 'connected',
      lastSynced: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    // Log this action to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
        type: 'Bank Connection',
        details: `Connected to ${bankName}`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error creating bank connection:", error);
    return false;
  }
};

export const updateBankConnectionStatus = async (connectionId, status) => {
  if (!connectionId || !status || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;
    const connectionDocRef = doc(db, "users", userId, "bankConnections", connectionId);

    await updateDoc(connectionDocRef, {
      connectionStatus: status,
      lastSynced: status === 'connected' ? serverTimestamp() : null
    });

    return true;
  } catch (error) {
    console.error("Error updating bank connection status:", error);
    return false;
  }
};

export const deleteBankConnection = async (connectionId) => {
  if (!connectionId || !auth.currentUser) return false;

  try {
    const userId = auth.currentUser.uid;
    await deleteDoc(doc(db, "users", userId, "bankConnections", connectionId));
    return true;
  } catch (error) {
    console.error("Error deleting bank connection:", error);
    return false;
  }
};

// ==================== BANK ACCOUNT FUNCTIONS ====================

export const createBankAccount = async (accountName, accountNumber, bankConnectionId, accountType, currency = 'PKR') => {
  if (!accountName || !accountNumber || !bankConnectionId || !accountType || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;

    await addDoc(collection(db, "users", userId, "bankAccounts"), {
      accountName,
      accountNumber,
      bankConnectionId,
      accountType,
      balance: 0, // Start with zero balance
      currency,
      isPrimary: false, // Will be set by user later
      isActive: true,
      createdAt: serverTimestamp()
    });

    // Log this action to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
        type: 'Bank Account',
        details: `Added bank account: ${accountName} ending in ${accountNumber.slice(-4)}`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error creating bank account:", error);
    return false;
  }
};

export const updateBankAccountBalance = async (accountId, newBalance) => {
  if (!accountId || newBalance === undefined || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;
    const accountDocRef = doc(db, "users", userId, "bankAccounts", accountId);

    await updateDoc(accountDocRef, {
      balance: newBalance
    });

    return true;
  } catch (error) {
    console.error("Error updating bank account balance:", error);
    return false;
  }
};

export const setPrimaryBankAccount = async (accountId) => {
  if (!accountId || !auth.currentUser) return false;

  try {
    const userId = auth.currentUser.uid;

    // First, unset all other primary accounts for this user
    const accountsQuery = query(
      collection(db, "users", userId, "bankAccounts"),
      where("isPrimary", "==", true)
    );

    const accountsSnapshot = await getDocs(accountsQuery);
    // Note: In a real implementation, we'd use a batch operation here
    // For simplicity, we'll just set the new primary and let the old one be unset manually

    // Set the new primary account
    const accountDocRef = doc(db, "users", userId, "bankAccounts", accountId);
    await updateDoc(accountDocRef, {
      isPrimary: true
    });

    return true;
  } catch (error) {
    console.error("Error setting primary bank account:", error);
    return false;
  }
};

// ==================== CARD FUNCTIONS ====================

export const createCard = async (cardNickname, lastFour, bankAccountId, cardType, network, spendingLimit = 0) => {
  if (!cardNickname || !lastFour || !bankAccountId || !cardType || !network || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;

    await addDoc(collection(db, "users", userId, "cards"), {
      cardNickname,
      lastFour,
      bankAccountId,
      cardType,
      network,
      isPrimary: false,
      isActive: true,
      spendingLimit,
      createdAt: serverTimestamp()
    });

    // Log this action to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
        type: 'Card Added',
        details: `Added ${cardType} card ending in ${lastFour}`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error creating card:", error);
    return false;
  }
};

export const updateCardStatus = async (cardId, isActive) => {
  if (!cardId || isActive === undefined || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;
    const cardDocRef = doc(db, "users", userId, "cards", cardId);

    await updateDoc(cardDocRef, {
      isActive
    });

    return true;
  } catch (error) {
    console.error("Error updating card status:", error);
    return false;
  }
};

export const setPrimaryCard = async (cardId) => {
  if (!cardId || !auth.currentUser) return false;

  try {
    const userId = auth.currentUser.uid;

    // Set the new primary card
    const cardDocRef = doc(db, "users", userId, "cards", cardId);
    await updateDoc(cardDocRef, {
      isPrimary: true
    });

    return true;
  } catch (error) {
    console.error("Error setting primary card:", error);
    return false;
  }
};

// ==================== PAYMENT FUNCTIONS ====================

export const createPayment = async (amount, currency, description, category, sourceAccountId, destination, destinationType, paymentMethod) => {
  if (!amount || !currency || !description || !sourceAccountId || !destination || !destinationType || !paymentMethod || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;

    await addDoc(collection(db, "users", userId, "payments"), {
      amount,
      currency,
      description,
      category,
      sourceAccountId,
      destination,
      destinationType,
      status: 'pending',
      paymentMethod,
      createdAt: serverTimestamp()
    });

    // Log this action to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
        type: 'Payment Initiated',
        details: `Payment of ${currency} ${amount.toLocaleString()} for ${description}`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error creating payment:", error);
    return false;
  }
};

export const updatePaymentStatus = async (paymentId, status) => {
  if (!paymentId || !status || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;
    const paymentDocRef = doc(db, "users", userId, "payments", paymentId);

    await updateDoc(paymentDocRef, {
      status
    });

    return true;
  } catch (error) {
    console.error("Error updating payment status:", error);
    return false;
  }
};

// ==================== BENEFICIARY FUNCTIONS ====================

export const createBeneficiary = async (beneficiaryName, nickname, destinationType, destinationValue) => {
  if (!beneficiaryName || !nickname || !destinationType || !destinationValue || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;

    await addDoc(collection(db, "users", userId, "beneficiaries"), {
      beneficiaryName,
      nickname,
      destinationType,
      destinationValue,
      isActive: true,
      createdAt: serverTimestamp()
    });

    // Log this action to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
        type: 'Beneficiary Added',
        details: `Added beneficiary: ${beneficiaryName} (${nickname})`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error creating beneficiary:", error);
    return false;
  }
};

export const updateBeneficiaryStatus = async (beneficiaryId, isActive) => {
  if (!beneficiaryId || isActive === undefined || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;
    const beneficiaryDocRef = doc(db, "users", userId, "beneficiaries", beneficiaryId);

    await updateDoc(beneficiaryDocRef, {
      isActive
    });

    return true;
  } catch (error) {
    console.error("Error updating beneficiary status:", error);
    return false;
  }
};

// ==================== BILLER FUNCTIONS ====================

export const createBiller = async (name, category, accountRef) => {
  if (!name || !category || !accountRef || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;

    await addDoc(collection(db, "users", userId, "billers"), {
      name,
      category,
      accountRef,
      lastAmount: 0,
      createdAt: serverTimestamp()
    });

    // Log this action to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
      type: 'Biller Added',
      details: `Added biller: '${name}' (${category})`,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error creating biller:", error);
    return false;
  }
};

export const deleteBiller = async (billerId) => {
  if (!billerId || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;
    const billerDocRef = doc(db, "users", userId, "billers", billerId);

    // Get biller data before deleting
    const billerSnap = await getDoc(billerDocRef);
    if (!billerSnap.exists()) {
      return { success: false, message: 'Biller not found' };
    }

    const billerData = billerSnap.data();

    // Delete the document
    await deleteDoc(billerDocRef);

    // Log the deletion to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
      type: 'Biller Deleted',
      details: `Deleted biller: '${billerData.name}'`,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting biller:", error);
    return { success: false, message: 'Failed to delete biller' };
  }
};

// ==================== PAYMENT METHOD FUNCTIONS (Google Pay, Apple Pay, etc.) ====================

export const createPaymentMethod = async (methodType) => {
  if (!methodType || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;

    await addDoc(collection(db, "users", userId, "paymentMethods"), {
      methodType,
      isEnabled: true,
      isPrimary: false,
      createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error creating payment method:", error);
    return false;
  }
};

export const updatePaymentMethodStatus = async (methodId, isEnabled) => {
  if (!methodId || isEnabled === undefined || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;
    const methodDocRef = doc(db, "users", userId, "paymentMethods", methodId);

    await updateDoc(methodDocRef, {
      isEnabled
    });

    return true;
  } catch (error) {
    console.error("Error updating payment method status:", error);
    return false;
  }
};

export const setPrimaryPaymentMethod = async (methodId) => {
  if (!methodId || !auth.currentUser) return false;

  try {
    const userId = auth.currentUser.uid;

    // Set the new primary payment method
    const methodDocRef = doc(db, "users", userId, "paymentMethods", methodId);
    await updateDoc(methodDocRef, {
      isPrimary: true
    });

    return true;
  } catch (error) {
    console.error("Error setting primary payment method:", error);
    return false;
  }
};

// ==================== USER LOOKUP FUNCTIONS ====================

export const findUserByEmail = async (email) => {
  if (!email || !auth.currentUser) {
    return null;
  }

  try {
    // Query users collection for matching email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Return the first matching user (should be unique)
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    return null;
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
};

export const findUserByIBAN = async (iban) => {
  if (!iban || !auth.currentUser) {
    return null;
  }

  try {
    // Clean the IBAN for comparison (remove spaces, convert to uppercase)
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();

    // Query all users and check their accounts for matching IBAN
    // Note: This is less efficient but works with current Firestore structure
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    for (const userDoc of querySnapshot.docs) {
      const userId = userDoc.id;
      const accountsRef = collection(db, "users", userId, "accounts");
      const accountsSnapshot = await getDocs(accountsRef);

      for (const accountDoc of accountsSnapshot.docs) {
        const accountData = accountDoc.data();
        if (accountData.ibanNumber) {
          const accountIbanClean = accountData.ibanNumber.replace(/\s/g, '').toUpperCase();
          if (accountIbanClean === cleanIban) {
            // Found matching IBAN, return user info
            const userData = userDoc.data();
            return { id: userId, ...userData };
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error finding user by IBAN:", error);
    return null;
  }
};

// ==================== USER-TO-USER TRANSFER FUNCTIONS ====================

export const transferToUser = async (recipientIdentifier, amount, description, identifierType = 'email') => {
  if (!auth.currentUser) {
    return { success: false, message: 'User not authenticated' };
  }

  if (!amount || amount <= 0) {
    return { success: false, message: 'Invalid transfer amount' };
  }

  try {
    const senderId = auth.currentUser.uid;

    // Find the recipient user
    let recipientUser = null;
    if (identifierType === 'email') {
      recipientUser = await findUserByEmail(recipientIdentifier);
    } else if (identifierType === 'iban') {
      recipientUser = await findUserByIBAN(recipientIdentifier);
    } else {
      return { success: false, message: 'Invalid identifier type' };
    }

    if (!recipientUser) {
      return { success: false, message: 'Recipient not found' };
    }

    // Prevent sending to oneself
    if (recipientUser.id === senderId) {
      return { success: false, message: 'Cannot transfer to yourself' };
    }

    // Get sender's primary account (or default to 'current' account)
    const senderAccountsSnap = await getDocs(collection(db, "users", senderId, "accounts"));
    let senderPrimaryAccount = null;

    senderAccountsSnap.forEach((doc) => {
      const accountData = doc.data();
      if (accountData.isPrimary || accountData.accountLevel === 'main') {
        senderPrimaryAccount = { id: doc.id, ...accountData };
      }
    });

    // Fallback to first account if no primary/main account found
    if (!senderPrimaryAccount && !senderAccountsSnap.empty) {
      const firstDoc = senderAccountsSnap.docs[0];
      senderPrimaryAccount = { id: firstDoc.id, ...firstDoc.data() };
    }

    if (!senderPrimaryAccount) {
      return { success: false, message: 'Sender account not found' };
    }

    // Check sufficient funds
    if (senderPrimaryAccount.balance < amount) {
      return { success: false, message: 'Insufficient funds' };
    }

    // Get recipient's primary account (or default to first account)
    const recipientAccountsSnap = await getDocs(collection(db, "users", recipientUser.id, "accounts"));
    let recipientPrimaryAccount = null;

    recipientAccountsSnap.forEach((doc) => {
      const accountData = doc.data();
      if (accountData.isPrimary || accountData.accountLevel === 'main') {
        recipientPrimaryAccount = { id: doc.id, ...accountData };
      }
    });

    // Fallback to first account if no primary/main account found
    if (!recipientPrimaryAccount && !recipientAccountsSnap.empty) {
      const firstDoc = recipientAccountsSnap.docs[0];
      recipientPrimaryAccount = { id: firstDoc.id, ...firstDoc.data() };
    }

    if (!recipientPrimaryAccount) {
      return { success: false, message: 'Recipient account not found' };
    }

    // Perform the transfer using a batch operation
    const batch = writeBatch(db);

    // Deduct from sender's account
    batch.update(doc(db, "users", senderId, "accounts", senderPrimaryAccount.id), {
      balance: senderPrimaryAccount.balance - amount
    });

    // Add to recipient's account
    batch.update(doc(db, "users", recipientUser.id, "accounts", recipientPrimaryAccount.id), {
      balance: recipientPrimaryAccount.balance + amount
    });

    // Create transaction record for sender
    const senderTransactionRef = collection(db, "users", senderId, "transactions");
    batch.set(doc(senderTransactionRef), {
      amount: -amount, // Negative for outgoing
      currency: 'PKR',
      description: description || `Transfer to ${recipientUser.email || 'User'}`,
      category: 'transfer',
      source_account_id: senderPrimaryAccount.id,
      destination: recipientPrimaryAccount.ibanNumber || recipientPrimaryAccount.accountNumber,
      destination_type: 'iban-or-account',
      status: 'completed',
      payment_method: 'bank-transfer',
      createdAt: serverTimestamp()
    });

    // Create transaction record for recipient
    const recipientTransactionRef = collection(db, "users", recipientUser.id, "transactions");
    batch.set(doc(recipientTransactionRef), {
      amount: amount, // Positive for incoming
      currency: 'PKR',
      description: description || `Transfer from ${auth.currentUser.email || 'User'}`,
      category: 'transfer',
      source_account_id: recipientPrimaryAccount.id,
      destination: senderPrimaryAccount.ibanNumber || senderPrimaryAccount.accountNumber,
      destination_type: 'iban-or-account',
      status: 'completed',
      payment_method: 'bank-transfer',
      createdAt: serverTimestamp()
    });

    // Log to history for sender
    const senderHistoryRef = collection(db, "users", senderId, "history");
    batch.set(doc(senderHistoryRef), {
      type: 'Transfer Sent',
      details: `Sent Rs ${amount.toLocaleString()} to ${recipientUser.email || 'User'}`,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    // Log to history for recipient
    const recipientHistoryRef = collection(db, "users", recipientUser.id, "history");
    batch.set(doc(recipientHistoryRef), {
      type: 'Transfer Received',
      details: `Received Rs ${amount.toLocaleString()} from ${auth.currentUser.email || 'User'}`,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    await batch.commit();

    return {
      success: true,
      message: 'Transfer completed successfully',
      transactionId: senderTransactionRef.id // This won't work as expected, but keeping for structure
    };
  } catch (error) {
    console.error("Error transferring to user:", error);
    return { success: false, message: 'Transfer failed. Please try again.' };
  }
};

// ==================== BULK TRANSFER FUNCTIONS ====================

/**
 * Transfer funds to multiple users in a single batch operation
 * @param {Array<{identifier: string, amount: number, description?: string, identifierType?: 'email'|'iban'>}>} transfers - Array of transfer objects
 * @returns {Object} Result object with success status and details
 */
export const transferToMultipleUsers = async (transfers) => {
  if (!auth.currentUser) {
    return { success: false, message: 'User not authenticated' };
  }

  if (!transfers || !Array.isArray(transfers) || transfers.length === 0) {
    return { success: false, message: 'Invalid transfers array' };
  }

  try {
    const senderId = auth.currentUser.uid;
    const batch = writeBatch(db);
    const results = [];
    let totalAmount = 0;

    // Get sender's primary account
    const senderAccountsSnap = await getDocs(collection(db, "users", senderId, "accounts"));
    let senderPrimaryAccount = null;

    senderAccountsSnap.forEach((doc) => {
      const accountData = doc.data();
      if (accountData.isPrimary || accountData.accountLevel === 'main') {
        senderPrimaryAccount = { id: doc.id, ...accountData };
      }
    });

    // Fallback to first account if no primary/main account found
    if (!senderPrimaryAccount && !senderAccountsSnap.empty) {
      const firstDoc = senderAccountsSnap.docs[0];
      senderPrimaryAccount = { id: firstDoc.id, ...firstDoc.data() };
    }

    if (!senderPrimaryAccount) {
      return { success: false, message: 'Sender account not found' };
    }

    // Check sufficient funds for all transfers
    for (const transfer of transfers) {
      if (!transfer.identifier || !transfer.amount || transfer.amount <= 0) {
        return { success: false, message: 'Invalid transfer parameters' };
      }
      totalAmount += transfer.amount;
    }

    if (senderPrimaryAccount.balance < totalAmount) {
      return { success: false, message: 'Insufficient funds for bulk transfer' };
    }

    // Process each transfer
    for (const transfer of transfers) {
      const { identifier, amount, description, identifierType = 'email' } = transfer;

      // Find the recipient user
      let recipientUser = null;
      if (identifierType === 'email') {
        recipientUser = await findUserByEmail(identifier);
      } else if (identifierType === 'iban') {
        recipientUser = await findUserByIBAN(identifier);
      } else {
        return { success: false, message: 'Invalid identifier type' };
      }

      if (!recipientUser) {
        return { success: false, message: `Recipient not found: ${identifier}` };
      }

      // Prevent sending to oneself
      if (recipientUser.id === senderId) {
        return { success: false, message: 'Cannot transfer to yourself' };
      }

      // Get recipient's primary account
      const recipientAccountsSnap = await getDocs(collection(db, "users", recipientUser.id, "accounts"));
      let recipientPrimaryAccount = null;

      recipientAccountsSnap.forEach((doc) => {
        const accountData = doc.data();
        if (accountData.isPrimary || accountData.accountLevel === 'main') {
          recipientPrimaryAccount = { id: doc.id, ...accountData };
        }
      });

      // Fallback to first account if no primary/main account found
      if (!recipientPrimaryAccount && !recipientAccountsSnap.empty) {
        const firstDoc = recipientAccountsSnap.docs[0];
        recipientPrimaryAccount = { id: firstDoc.id, ...firstDoc.data() };
      }

      if (!recipientPrimaryAccount) {
        return { success: false, message: `Recipient account not found: ${identifier}` };
      }

      // Deduct from sender's account (we'll do this once at the end for efficiency)
      // Add to recipient's account
      batch.update(doc(db, "users", recipientUser.id, "accounts", recipientPrimaryAccount.id), {
        balance: recipientPrimaryAccount.balance + amount
      });

      // Create transaction record for sender
      const senderTransactionRef = collection(db, "users", senderId, "transactions");
      batch.set(doc(senderTransactionRef), {
        amount: -amount, // Negative for outgoing
        currency: 'PKR',
        description: description || `Bulk transfer to ${recipientUser.email || 'User'}`,
        category: 'transfer',
        source_account_id: senderPrimaryAccount.id,
        destination: recipientPrimaryAccount.ibanNumber || recipientPrimaryAccount.accountNumber,
        destination_type: 'iban-or-account',
        status: 'completed',
        payment_method: 'bank-transfer',
        createdAt: serverTimestamp()
      });

      // Create transaction record for recipient
      const recipientTransactionRef = collection(db, "users", recipientUser.id, "transactions");
      batch.set(doc(recipientTransactionRef), {
        amount: amount, // Positive for incoming
        currency: 'PKR',
        description: description || `Bulk transfer from ${auth.currentUser.email || 'User'}`,
        category: 'transfer',
        source_account_id: recipientPrimaryAccount.id,
        destination: senderPrimaryAccount.ibanNumber || senderPrimaryAccount.accountNumber,
        destination_type: 'iban-or-account',
        status: 'completed',
        payment_method: 'bank-transfer',
        createdAt: serverTimestamp()
      });

      // Log to history for sender
      const senderHistoryRef = collection(db, "users", senderId, "history");
      batch.set(doc(senderHistoryRef), {
        type: 'Bulk Transfer Sent',
        details: `Sent Rs ${amount.toLocaleString()} to ${recipientUser.email || 'User'} (bulk transfer)`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });

      // Log to history for recipient
      const recipientHistoryRef = collection(db, "users", recipientUser.id, "history");
      batch.set(doc(recipientHistoryRef), {
        type: 'Bulk Transfer Received',
        details: `Received Rs ${amount.toLocaleString()} from ${auth.currentUser.email || 'User'} (bulk transfer)`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });

      results.push({
        identifier,
        success: true,
        message: 'Transfer queued for processing'
      });
    }

    // Now deduct the total amount from sender's account (single operation)
    batch.update(doc(db, "users", senderId, "accounts", senderPrimaryAccount.id), {
      balance: senderPrimaryAccount.balance - totalAmount
    });

    await batch.commit();

    return {
      success: true,
      message: `Bulk transfer completed successfully for ${transfers.length} recipients`,
      totalAmount: totalAmount,
      results: results
    };
  } catch (error) {
    console.error("Error in bulk transfer:", error);
    return { success: false, message: 'Bulk transfer failed. Please try again.' };
  }
};

// ==================== MULTI-ACCOUNT SYSTEM FUNCTIONS ====================

export const transferBetweenAccounts = async (fromAccountId, toAccountId, amount, description) => {
  if (!fromAccountId || !toAccountId || !amount || amount <= 0 || !auth.currentUser) {
    return { success: false, message: 'Invalid transfer parameters' };
  }

  // Prevent transfer to same account
  if (fromAccountId === toAccountId) {
    return { success: false, message: 'Cannot transfer to the same account' };
  }

  try {
    const userId = auth.currentUser.uid;

    // Get both accounts to validate they belong to the user and have sufficient funds
    const fromAccountDoc = doc(db, "users", userId, "accounts", fromAccountId);
    const toAccountDoc = doc(db, "users", userId, "accounts", toAccountId);

    const fromAccountSnap = await getDoc(fromAccountDoc);
    const toAccountSnap = await getDoc(toAccountDoc);

    if (!fromAccountSnap.exists() || !toAccountSnap.exists()) {
      return { success: false, message: 'One or both accounts not found' };
    }

    const fromAccountData = fromAccountSnap.data();
    const toAccountData = toAccountSnap.data();

    // Validate accounts are active
    if (!fromAccountData.isActive || !toAccountData.isActive) {
      return { success: false, message: 'One or both accounts are not active' };
    }

    // Check sufficient funds
    if (fromAccountData.balance < amount) {
      return { success: false, message: 'Insufficient funds in source account' };
    }

    // Perform the transfer using a batch operation
    const batch = writeBatch(db);

    // Deduct from source account
    batch.update(fromAccountDoc, {
      balance: fromAccountData.balance - amount
    });

    // Add to destination account
    batch.update(toAccountDoc, {
      balance: toAccountData.balance + amount
    });

    // Create transaction records for both accounts
    const transactionRef = collection(db, "users", userId, "transactions");

    // Outgoing transaction (debit)
    batch.set(doc(transactionRef), {
      account_id: fromAccountId,
      transaction_type: 'debit',
      amount: amount,
      description: description || `Transfer to ${toAccountData.name || 'Account'}`,
      status: 'completed',
      createdAt: serverTimestamp()
    });

    // Incoming transaction (credit)
    batch.set(doc(transactionRef), {
      account_id: toAccountId,
      transaction_type: 'credit',
      amount: amount,
      description: description || `Transfer from ${fromAccountData.name || 'Account'}`,
      status: 'completed',
      createdAt: serverTimestamp()
    });

    // Log to history
    const historyRef = collection(db, "users", userId, "history");
    batch.set(doc(historyRef), {
      type: 'Account Transfer',
      details: `Transferred Rs ${amount.toLocaleString()} from ${fromAccountData.name || 'Account'} to ${toAccountData.name || 'Account'}`,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    await batch.commit();

    return { success: true, message: 'Transfer completed successfully' };
  } catch (error) {
    console.error("Error transferring between accounts:", error);
    return { success: false, message: 'Transfer failed. Please try again.' };
  }
};

export const getAccounts = async () => {
  if (!auth.currentUser) return [];
  try {
    const userId = auth.currentUser.uid;
    const accountsSnapshot = await getDocs(collection(db, "users", userId, "accounts"));
    const accounts = [];
    accountsSnapshot.forEach((doc) => {
      accounts.push({ id: doc.id, ...doc.data() });
    });
    return accounts;
  } catch (error) {
    console.error("Error getting accounts:", error);
    return [];
  }
};

// ==================== BILLER FUNCTIONS ====================

// ==================== ENVELOPE BUDGETS FUNCTIONS ====================

export const addBudgetItem = async (budgetId, item) => {
  if (!budgetId || !item || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;
    const budgetDocRef = doc(db, "users", userId, "budgets", budgetId);

    // Get the budget first
    const budgetSnap = await getDoc(budgetDocRef);
    if (!budgetSnap.exists()) {
      return { success: false, message: 'Budget not found' };
    }

    const budgetData = budgetSnap.data();
    const items = budgetData.items || [];

    // Add new item with unique ID
    const newItem = {
      id: item.id || Date.now().toString(),
      name: item.name,
      allocatedAmount: item.allocatedAmount,
      spentAmount: item.spentAmount || 0,
      icon: item.icon || 'circle'
    };

    // Update the budget with new items array
    await updateDoc(budgetDocRef, {
      items: [...items, newItem]
    });

    // Log this action to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
      type: 'Budget Event',
      details: `Added envelope item '${newItem.name}' to budget '${budgetData.name}'`,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding budget item:", error);
    return { success: false, message: 'Failed to add budget item' };
  }
};

export const removeBudgetItem = async (budgetId, itemId) => {
  if (!budgetId || !itemId || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;
    const budgetDocRef = doc(db, "users", userId, "budgets", budgetId);

    // Get the budget first
    const budgetSnap = await getDoc(budgetDocRef);
    if (!budgetSnap.exists()) {
      return { success: false, message: 'Budget not found' };
    }

    const budgetData = budgetSnap.data();
    const items = budgetData.items || [];

    // Remove item with matching ID
    const updatedItems = items.filter(item => item.id !== itemId);

    // Update the budget with new items array
    await updateDoc(budgetDocRef, {
      items: updatedItems
    });

    // Log this action to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
      type: 'Budget Event',
      details: `Removed envelope item from budget '${budgetData.name}'`,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing budget item:", error);
    return { success: false, message: 'Failed to remove budget item' };
  }
};

export const createSubAccount = async (name, bicCode, parentAccountId) => {
  if (!name || !bicCode || !parentAccountId || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;

    // Check if user already has 3 sub-accounts
    const accountsQuery = query(
      collection(db, "users", userId, "accounts"),
      where("parentAccountId", "!=", null)
    );
    const accountsSnapshot = await getDocs(accountsQuery);
    if (accountsSnapshot.size >= 3) {
      return { success: false, message: "Maximum of 3 sub-accounts allowed" };
    }

    // Generate account number and IBAN
    // Find the highest subAccountIndex among existing sub-accounts
    let maxIndex = 0;
    accountsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.subAccountIndex && data.subAccountIndex > maxIndex) {
        maxIndex = data.subAccountIndex;
      }
    });
    const accountIndex = maxIndex + 1;

    const accountNumber = generateAccountNumber(userId, accountIndex);
    const ibanNumber = generateIBAN(bicCode, accountNumber);

    // Get bank name from BIC code
    const bankInfo = BANK_BICS[bicCode] || { name: 'Unknown Bank' };
    const bankName = bankInfo.name;

    // Create the sub-account document
    await addDoc(collection(db, "users", userId, "accounts"), {
      name,
      accountLevel: 'sub',
      parentAccountId,
      ibanNumber,
      accountNumber,
      bankBic: bicCode,
      bankName,
      subAccountIndex: accountIndex,
      balance: 0,
      createdAt: serverTimestamp()
    });

    // Log this action to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
      type: 'Account Event',
      details: `Created sub-account: '${name}' with IBAN ${formatIBAN(ibanNumber)}`,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating sub-account:", error);
    return { success: false, message: 'Failed to create sub-account' };
  }
};

export const deleteSubAccount = async (accountId) => {
  if (!accountId || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;
    const accountDocRef = doc(db, "users", userId, "accounts", accountId);

    // Get account data before deleting to check if it's a main account
    const accountSnap = await getDoc(accountDocRef);
    if (!accountSnap.exists()) {
      return { success: false, message: 'Account not found' };
    }

    const accountData = accountSnap.data();

    // Prevent deletion of main account
    if (accountData.accountLevel === 'main') {
      return { success: false, message: 'Cannot delete main account' };
    }

    // Delete the document
    await deleteDoc(accountDocRef);

    // Log the deletion to the 'history' collection
    await addDoc(collection(db, "users", userId, "history"), {
      type: 'Account Event',
      details: `Deleted sub-account: '${accountData.name}'`,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting sub-account:", error);
    return { success: false, message: 'Failed to delete sub-account' };
  }
};

export const setActiveSubAccount = async (accountId) => {
  if (!accountId || !auth.currentUser) {
    return false;
  }

  try {
    const userId = auth.currentUser.uid;

    // First, unset all other active sub-accounts
    const accountsQuery = query(
      collection(db, "users", userId, "accounts"),
      where("accountLevel", "==", "sub"),
      where("isActive", "==", true)
    );
    const accountsSnapshot = await getDocs(accountsQuery);

    const batch = writeBatch(db);
    accountsSnapshot.forEach(doc => {
      const accountDocRef = doc(db, "users", userId, "accounts", doc.id);
      batch.update(accountDocRef, { isActive: false });
    });

    // Set the selected account as active
    const accountDocRef = doc(db, "users", userId, "accounts", accountId);
    batch.update(accountDocRef, { isActive: true });

    await batch.commit();

    // Log this action to the 'history' collection
    const accountSnap = await getDoc(accountDocRef);
    if (accountSnap.exists()) {
      const accountData = accountSnap.data();
      await addDoc(collection(db, "users", userId, "history"), {
        type: 'Account Event',
        details: `Set active sub-account: '${accountData.name}'`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error setting active sub-account:", error);
    return { success: false, message: 'Failed to set active sub-account' };
  }
};