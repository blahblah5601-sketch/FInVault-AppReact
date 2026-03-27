 // src/api.js
 import { db, auth } from './firebase';
 import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, writeBatch, deleteDoc, setDoc } from 'firebase/firestore';

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

export const updateBudget = async (budgetId, newName, newLimit) => {
  if (!budgetId || !newName || newLimit <= 0 || !auth.currentUser) {
    return false;
  }
  try {
    const userId = auth.currentUser.uid;
    const budgetDocRef = doc(db, "users", userId, "budgets", budgetId);
    
    await updateDoc(budgetDocRef, {
      name: newName,
      limit: newLimit
    });

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
  if (!auth.currentUser) return null;
  const userDocRef = doc(db, "users", auth.currentUser.uid);
  const docSnap = await getDoc(userDocRef);
  return docSnap.exists() ? docSnap.data().settings : null;
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

    const accountsSnapshot = await getDoc(accountsQuery);
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
  };
};