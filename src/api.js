 // src/api.js
 import { db, auth } from './firebase';
 import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';

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
  if (actionType === 'deposit') {
    const newBalance = vault.current + amount;
    if (currentAccount.balance < amount) return { success: false, message: 'Insufficient funds in Current Account.' };
    if (!vault.isSavingsAccount && vault.target) {
      const remainingGoal = vault.target - vault.current;
      if (amount > remainingGoal) {
        return { success: false, message: `Deposit exceeds goal. You can deposit up to Rs ${remainingGoal.toLocaleString()}.` };
      }
    }
    const goalReached = !vault.isSavingsAccount && vault.target && newBalance >= vault.target && vault.current < vault.target;
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
    return { success: true, message: 'Transaction successful!' };
    return { success: true, goalReached: goalReached, vaultName: vault.name };
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
    await updateDoc(userDocRef, { settings: prefs }, { merge: true });
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
