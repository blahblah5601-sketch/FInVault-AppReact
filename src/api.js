 // src/api.js
 import { db, auth } from './firebase';
 import { collection, addDoc, serverTimestamp, doc, updateDoc, writeBatch } from 'firebase/firestore';

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
    if (currentAccount.balance < amount) return { success: false, message: 'Insufficient funds in Current Account.' };
    if (!vault.isSavingsAccount && vault.target) {
      const remainingGoal = vault.target - vault.current;
      if (amount > remainingGoal) {
        return { success: false, message: `Deposit exceeds goal. You can deposit up to Rs ${remainingGoal.toLocaleString()}.` };
      }
    }
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
  } catch (error) {
    console.error("Vault transaction error:", error);
    return { success: false, message: 'Transaction failed.' };
  }
};

