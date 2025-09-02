import './style.css';
import { createIcons, icons } from 'lucide';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, limit as firestoreLimit } from 'firebase/firestore';

"use strict";

// --- 1. PASTE YOUR FIREBASE CONFIGURATION HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyBCB9Vk_N5p0qNlzzEZbd3txvP7SW7bMVo",
  authDomain: "finvaultapp.firebaseapp.com",
  projectId: "finvaultapp",
  storageBucket: "finvaultapp.firebasestorage.app",
  messagingSenderId: "384326381113",
  appId: "1:384326381113:web:a5341f1961dcbd77fc67e8",
  measurementId: "G-ZV817H8CTC"
};
// ---------------------------------------------

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let userDocRef = null;

// --- GLOBAL APP STATE ---
let accountData = {};
let budgetsData = [];
let vaultsData = [];
let transactionsData = [];
let notificationsData = [];
let accounts = []; // This will be rebuilt dynamically
let activeAccountId = 'current';
let isCardFrozen = false;
let itemToDelete = { id: null, type: null };

// --- DOM ELEMENTS ---
const authScreen = document.getElementById('auth-screen');
const appWrapper = document.getElementById('app-wrapper');
const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const userEmailDisplay = document.getElementById('user-email-display');
const pageSections = document.querySelectorAll('.page-section');
const navLinks = document.querySelectorAll('.nav-link');
const pageTitle = document.getElementById('page-title');
const mobileSidebar = document.getElementById('mobile-sidebar');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const closeMobileMenuButton = document.getElementById('close-mobile-menu');
const cardDisplay = document.getElementById('smart-card-display');
const activeAccountName = document.getElementById('active-account-name');
const cardBalance = document.getElementById('card-balance');
const cardNumber = document.getElementById('card-number');
const cardFrozenOverlay = document.getElementById('card-frozen-overlay');
const cardDisplayControl = document.getElementById('smart-card-display-control');
const activeAccountNameControl = document.getElementById('active-account-name-control');
const cardFrozenOverlayControl = document.getElementById('card-frozen-overlay-control');
const freezeToggle = document.getElementById('freeze-toggle');
const accountSelector = document.getElementById('account-selector');
const onboardingModal = document.getElementById('onboarding-modal');
const newBudgetForm = document.getElementById('new-budget-form');
const newVaultForm = document.getElementById('new-vault-form');
const updateBudgetForm = document.getElementById('update-budget-form');
const vaultActionForm = document.getElementById('vault-action-form');
const addMoneyForm = document.getElementById('add-money-form');
const sendMoneyForm = document.getElementById('send-money-form');
const toastNotification = document.getElementById('toast-notification');
const toastMessage = document.getElementById('toast-message');
const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const transactionList = document.getElementById('transaction-list');
const themeSelector = document.getElementById('theme-selector');
const newBudgetModal = document.getElementById('new-budget-modal');
const newVaultModal = document.getElementById('new-vault-modal');
const updateBudgetModal = document.getElementById('update-budget-modal');
const vaultActionModal = document.getElementById('vault-action-modal');
const addMoneyModal = document.getElementById('add-money-modal');
const sendMoneyModal = document.getElementById('send-money-modal');
const qrScannerModal = document.getElementById('qr-scanner-modal');

// --- AUTHENTICATION ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        userDocRef = doc(db, 'users', currentUser.uid);
        authScreen.classList.add('hidden');
        appWrapper.classList.remove('hidden');
        userEmailDisplay.textContent = currentUser.email;

        await loadDataFromFirestore();
        initializeAppUI();
    } else {
        currentUser = null;
        userDocRef = null;
        authScreen.classList.remove('hidden');
        appWrapper.classList.add('hidden');
    }
});

loginForm.addEventListener('submit', (e) => { e.preventDefault(); const email = loginForm['login-email'].value; const password = loginForm['login-password'].value; signInWithEmailAndPassword(auth, email, password).catch((error) => alert(`Login Failed: ${error.message}`)); });
signupForm.addEventListener('submit', (e) => { e.preventDefault(); const email = signupForm['signup-email'].value; const password = signupForm['signup-password'].value; createUserWithEmailAndPassword(auth, email, password).then((cred) => createInitialUserData(cred.user.uid)).catch((error) => alert(`Signup Failed: ${error.message}`)); });
logoutBtn.addEventListener('click', (e) => { e.preventDefault(); signOut(auth); });
showSignup.addEventListener('click', (e) => { e.preventDefault(); loginContainer.classList.add('hidden'); signupContainer.classList.remove('hidden'); });
showLogin.addEventListener('click', (e) => { e.preventDefault(); signupContainer.classList.add('hidden'); loginContainer.classList.remove('hidden'); });

async function createInitialUserData(userId) {
    const newUserDocRef = doc(db, 'users', userId);
    await setDoc(newUserDocRef, { account: { balance: 1000, cardNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}` } });
    await addDoc(collection(newUserDocRef, 'vaults'), { name: 'Savings Account', current: 5000, target: null, icon: 'piggy-bank', color: 'green', isSavingsAccount: true, returnRate: 0.10, createdAt: serverTimestamp() });
}

// --- DATA HANDLING (FIRESTORE) ---
async function loadDataFromFirestore() {
    if (!userDocRef) return;
    try {
        const userDoc = await getDoc(userDocRef);
        accountData = userDoc.exists() ? userDoc.data().account : { balance: 0, cardNumber: 'N/A' };
        
        const budgetsQuery = query(collection(userDocRef, 'budgets'), orderBy('createdAt', 'desc'));
        budgetsData = (await getDocs(budgetsQuery)).docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const vaultsQuery = query(collection(userDocRef, 'vaults'), orderBy('createdAt', 'desc'));
        vaultsData = (await getDocs(vaultsQuery)).docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const transactionsQuery = query(collection(userDocRef, 'transactions'), orderBy('createdAt', 'desc'), firestoreLimit(50));
        transactionsData = (await getDocs(transactionsQuery)).docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error("Error loading data from Firestore:", error);
    }
}

// --- MAIN APPLICATION LOGIC (Refactored for Firestore) ---
const MAX_BUDGETS = 5;
const MAX_CARD_ASSIGNMENTS = 3;

async function createBudget(name, limit) {
    if (budgetsData.length >= MAX_BUDGETS || !name || limit <= 0 || !userDocRef) return false;
    await addDoc(collection(userDocRef, 'budgets'), {
        name: name,
        limit: parseFloat(limit),
        spent: 0,
        icon: 'receipt',
        color: 'purple',
        isCardAssigned: false,
        createdAt: serverTimestamp()
    });
    await loadDataFromFirestore();
    updateUI();
}

async function updateBudget(id, newName, newLimit) {
    if(!userDocRef || !id) return false;
    await updateDoc(doc(userDocRef, 'budgets', id), {
        name: newName,
        limit: parseFloat(newLimit)
    });
    await loadDataFromFirestore();
    updateUI();
}

async function deleteBudget(id) {
    if (!userDocRef || !id) return;
    await deleteDoc(doc(userDocRef, 'budgets', id));
}

async function createVault(name, target) {
    if (!name || target <= 0 || !userDocRef) return false;
    await addDoc(collection(userDocRef, 'vaults'), {
        name: name,
        target: parseFloat(target),
        current: 0,
        icon: 'package-plus',
        color: 'teal',
        createdAt: serverTimestamp()
    });
    await loadDataFromFirestore();
    updateUI();
}

async function deleteVault(id) {
    if (!userDocRef || !id) return;
    const vaultToDelete = vaultsData.find(v => v.id === id);
    if (vaultToDelete && vaultToDelete.current > 0) {
        const newBalance = accountData.balance + vaultToDelete.current;
        await updateDoc(userDocRef, { "account.balance": newBalance });
    }
    await deleteDoc(doc(userDocRef, 'vaults', id));
    
}

async function handleVaultTransaction(vaultId, actionType, amount) {
    if (!userDocRef || !vaultId || !amount || amount <= 0) return false;
    const vaultRef = doc(userDocRef, 'vaults', vaultId);
    const vault = vaultsData.find(v => v.id === vaultId);
    
    if (actionType === 'deposit') {
        if (accountData.balance >= amount) {
            await updateDoc(userDocRef, { "account.balance": accountData.balance - amount });
            await updateDoc(vaultRef, { current: vault.current + amount });
            return true;
        } else {
            showToast('Insufficient funds in Current Account.');
            return false;
        }
    } else if (actionType === 'withdraw') {
        if (vault.current >= amount) {
            await updateDoc(userDocRef, { "account.balance": accountData.balance + amount });
            await updateDoc(vaultRef, { current: vault.current - amount });
            return true;
        } else {
            showToast('Insufficient funds in vault.');
            return false;
        }
    }
    await loadDataFromFirestore();
    updateUI();
}
// ... (All your original data manipulation functions, now refactored for Firestore)

// --- UI RENDERING & HELPERS ---
    
    function getCurrentDate() {
        return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    function showToast(message) {
        toastMessage.textContent = message;
        toastNotification.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => {
            toastNotification.classList.add('translate-y-20', 'opacity-0');
        }, 3000); // Hide after 3 seconds
    }

    function exportToCsv(filename, headers, data) {
        const rows = data.map(item =>
            headers.map(header => {
                let val = item[header.toLowerCase()];
                if (typeof val === 'number') val = val.toLocaleString('en-IN');
                return `"${(val || '').toString().replace(/"/g, '""')}"`;
            }).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function showPage(targetId) {
        pageSections.forEach(section => section.classList.toggle('hidden', section.id !== targetId));
        const targetLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
        if (targetLink) pageTitle.textContent = targetLink.querySelector('span').textContent;
        navLinks.forEach(link => {
            link.classList.remove('bg-slate-700');
            if (link.dataset.target === targetId) link.classList.add('bg-slate-700');
        });
        mobileSidebar.classList.add('-translate-x-full');
    }

    function rebuildCardAccounts() {
        const assignedBudgets = budgetsData.filter(b => b.isCardAssigned);
        const currentAccount = { id: 'current', name: 'Current Account', balance: accountData.balance, type: 'account' };
        
        accounts = [currentAccount, ...assignedBudgets.map(b => ({
            id: b.id, name: `${b.name} Jar`, balance: b.limit - b.spent, type: 'budget'
        }))];
    }

    function populateAccountSelector() {
        if (!accountSelector) return;
        accountSelector.innerHTML = '';
        accounts.forEach(account => {
            const isChecked = account.id === activeAccountId;
            accountSelector.insertAdjacentHTML('beforeend', `
                <label for="acc-${account.id}" class="flex items-center p-4 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-green-500/20 border-green-500' : 'bg-slate-800 border-transparent'} border hover:bg-slate-700">
                    <input type="radio" id="acc-${account.id}" name="activeAccount" value="${account.id}" class="hidden" ${isChecked ? 'checked' : ''}>
                    <div class="flex-1">
                        <p class="font-medium">${account.name}</p>
                        <p class="text-sm text-slate-400">Available: Rs ${account.balance.toLocaleString('en-IN')}</p>
                    </div>
                    ${isChecked ? '<i data-lucide="check-circle-2" class="w-6 h-6 text-green-500"></i>' : ''}
                </label>
            `);
        });
    }
    
    function populateTransactions() {
        if (!transactionList) return;
        transactionList.innerHTML = '';
        transactionsData.forEach(tx => {
            const amountClass = tx.amount > 0 ? 'text-green-400' : 'text-slate-300';
            const sign = tx.amount > 0 ? '+' : '';
            transactionList.insertAdjacentHTML('beforeend', `
                <tr class="border-b last:border-b-0" style="border-color: var(--color-border);">
                    <td class="p-4">${tx.date}</td>
                    <td class="p-4 font-medium">${tx.desc}</td>
                    <td class="p-4 text-slate-400">${tx.cat}</td>
                    <td class="p-4 text-right font-mono ${amountClass}">${sign}Rs ${Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
            `);
        });
    }
    
    function renderDashboardItems() {
        const dashboardBudgets = document.getElementById('dashboard-budgets');
        const dashboardVaults = document.getElementById('dashboard-vaults');
        if (!dashboardBudgets || !dashboardVaults) return;
        
        dashboardBudgets.innerHTML = '';
        budgetsData.slice(0, 3).forEach(budget => {
            const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
            const progressBarColor = percentage > 90 ? 'bg-red-500' : 'progress-bar-fill';
            const percentageColor = percentage > 90 ? '#f87171' : 'var(--color-primary)';
            dashboardBudgets.insertAdjacentHTML('beforeend', `
                 <div class="bg-slate-900/50 p-4 rounded-xl flex flex-col h-full">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-${budget.color}-500/20 rounded-lg"><i data-lucide="${budget.icon}" class="w-5 h-5 text-${budget.color}-400"></i></div>
                        <span class="font-medium">${budget.name}</span>
                    </div>
                    <div class="text-center my-auto py-2">
                        <p class="text-2xl font-bold font-mono">Rs ${budget.spent.toLocaleString('en-IN')}</p>
                        <p class="font-medium text-sm mt-1" style="color: ${percentageColor}">${percentage}% Used</p>
                    </div>
                    <div class="w-full progress-bar-bg rounded-full h-2.5 mt-auto">
                        <div class="${progressBarColor} h-2.5 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `);
        });

        dashboardVaults.innerHTML = '';
        let totalSaved = 0;
        vaultsData.forEach(vault => {
            totalSaved += vault.current;
            const isSavings = vault.isSavingsAccount;
            const percentage = !isSavings && vault.target > 0 ? Math.round((vault.current / vault.target) * 100) : 0;
            dashboardVaults.insertAdjacentHTML('beforeend', `
                 <div class="bg-slate-900/50 p-4 rounded-xl flex flex-col h-full ${isSavings ? 'border border-green-500/30' : ''}">
                    <div class="flex items-center space-x-3">
                         <div class="p-2 bg-${vault.color}-500/20 rounded-lg"><i data-lucide="${vault.icon}" class="w-5 h-5 text-${vault.color}-400"></i></div>
                        <span class="font-medium">${vault.name}</span>
                    </div>
                    <div class="text-center my-auto py-2">
                        <p class="text-2xl font-bold font-mono">Rs ${isSavings ? Math.floor(vault.current).toLocaleString('en-IN') : vault.current.toLocaleString('en-IN')}</p>
                        <p class="font-medium text-sm mt-1" style="color: var(--color-primary)">${isSavings ? `${(vault.returnRate * 100).toFixed(0)}% APR` : `${percentage}% Complete`}</p>
                    </div>
                    ${!isSavings ? `
                    <div class="w-full progress-bar-bg rounded-full h-2.5 mt-auto">
                        <div class="progress-bar-fill h-2.5 rounded-full" style="width: ${percentage}%"></div>
                    </div>` : '<div class="h-2.5 mt-auto"></div>' }
                </div>
            `);
        });
        
        const totalSavedVaultsPage = document.getElementById('total-saved-vaults-page');
        if(totalSavedVaultsPage) totalSavedVaultsPage.textContent = `Rs ${totalSaved.toLocaleString('en-IN')}`;
    }
    
    function renderBudgetTotals() {
        const totalBudgetedEl = document.getElementById('total-budgeted');
        if (!totalBudgetedEl) return;
        
        const totalBudgeted = budgetsData.reduce((sum, b) => sum + b.limit, 0);
        const totalSpent = budgetsData.reduce((sum, b) => sum + b.spent, 0);
        const totalRemaining = totalBudgeted - totalSpent;
        
        totalBudgetedEl.textContent = `Rs ${totalBudgeted.toLocaleString('en-IN')}`;
        document.getElementById('total-spent').textContent = `Rs ${totalSpent.toLocaleString('en-IN')}`;
        document.getElementById('total-remaining').textContent = `Rs ${totalRemaining.toLocaleString('en-IN')}`;
    }

    function renderBudgets() {
        const container = document.getElementById('budgets-list');
        if (!container) return;
        
        container.innerHTML = '';
        const assignedCount = budgetsData.filter(b => b.isCardAssigned).length;
        const canAssignMore = assignedCount < MAX_CARD_ASSIGNMENTS;
        const baseButtonClasses = "card-assign-btn text-xs py-1 px-2 rounded";

        budgetsData.forEach((budget, index) => {
            const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
            const progressBarColor = percentage > 90 ? 'bg-red-500' : 'progress-bar-fill';
            const borderClass = index > 0 ? 'border-t pt-6 mt-6' : '';
            
            let cardAssignmentButton;
            if (budget.isCardAssigned) {
                cardAssignmentButton = `<button class="${baseButtonClasses} btn-secondary" data-id="${budget.id}" data-action="unassign">Unassign</button>`;
            } else if (canAssignMore) {
                cardAssignmentButton = `<button class="${baseButtonClasses} btn-primary" data-id="${budget.id}" data-action="assign">Assign to Card</button>`;
            } else {
                cardAssignmentButton = `<button class="${baseButtonClasses} btn-disabled" disabled>Slots Full</button>`;
            }

            container.insertAdjacentHTML('beforeend', `
                <div class="budget-item-full ${borderClass}" style="border-color: var(--color-border);">
                    <div class="flex items-start justify-between mb-2">
                         <div class="flex items-center space-x-4">
                            <div class="p-3 bg-${budget.color}-500/20 rounded-lg"><i data-lucide="${budget.icon}" class="w-6 h-6 text-${budget.color}-400"></i></div>
                            <div>
                                <h4 class="font-semibold text-lg flex items-center">${budget.name} ${budget.isCardAssigned ? '<i data-lucide="credit-card" class="w-4 h-4 text-green-400 ml-2"></i>' : ''}</h4>
                                <p class="text-sm text-slate-400">Spent <span class="font-mono">Rs ${budget.spent.toLocaleString('en-IN')}</span> of <span class="font-mono">Rs ${budget.limit.toLocaleString('en-IN')}</span></p>
                            </div>
                        </div>
                        <div class="text-right">
                             <p class="font-medium text-lg ${percentage > 90 ? 'text-red-400' : ''}">${percentage}% Used</p>
                             <div class="flex gap-2 mt-2">
                                ${cardAssignmentButton}
                                <button class="update-budget-btn text-xs btn-secondary py-1 px-2 rounded" data-id="${budget.id}">Update</button>
                                <button class="delete-item-btn text-xs btn-danger py-1 px-2 rounded" data-id="${budget.id}" data-type="budget">Delete</button>
                             </div>
                        </div>
                    </div>
                    <div class="w-full progress-bar-bg rounded-full h-3">
                        <div class="${progressBarColor} h-3 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `);
        });

        const newBudgetBtn = document.getElementById('new-budget-btn');
        const budgetCountText = document.getElementById('budget-count-text');
        if (!newBudgetBtn || !budgetCountText) return;

        if (budgetsData.length >= MAX_BUDGETS) {
            newBudgetBtn.classList.add('btn-disabled');
            newBudgetBtn.disabled = true;
            budgetCountText.textContent = `You have reached the maximum of ${MAX_BUDGETS} budgets.`;
        } else {
            newBudgetBtn.classList.remove('btn-disabled');
            newBudgetBtn.disabled = false;
            budgetCountText.textContent = `${budgetsData.length} of ${MAX_BUDGETS} budgets created.`;
        }

        renderBudgetTotals();
    }

    function renderVaults() {
        const savingsContainer = document.getElementById('savings-account-container');
        const goalsContainer = document.getElementById('vaults-list');
        if (!savingsContainer || !goalsContainer) return;
        
        savingsContainer.innerHTML = '';
        goalsContainer.innerHTML = '';
        
        const savingsAccount = vaultsData.find(v => v.isSavingsAccount);
        const goalVaults = vaultsData.filter(v => !v.isSavingsAccount);

        if (savingsAccount) {
            savingsContainer.insertAdjacentHTML('beforeend', `
                <div class="bg-slate-900/50 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between border-2 border-green-500/50">
                    <div class="flex items-center space-x-4 mb-4 md:mb-0">
                        <div class="p-3 bg-green-500/20 rounded-lg"><i data-lucide="${savingsAccount.icon}" class="w-8 h-8 text-green-400"></i></div>
                        <div>
                            <h4 class="font-semibold text-lg">${savingsAccount.name}</h4>
                            <p class="text-sm text-slate-400">Saved: Rs ${Math.floor(savingsAccount.current).toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    <div class="text-center md:text-right mb-4 md:mb-0 md:mx-auto">
                        <p class="text-2xl font-bold font-mono">Rs ${Math.floor(savingsAccount.current).toLocaleString('en-IN')}</p>
                        <p class="font-medium mt-1 text-green-400">Interest Bearing (${(savingsAccount.returnRate * 100).toFixed(0)}% APR)</p>
                    </div>
                    <div class="flex gap-4 md:flex-col md:w-36">
                        <button class="vault-action-btn flex-1 btn-secondary py-2 rounded-lg" data-id="${savingsAccount.id}" data-type="withdraw">Withdraw</button>
                        <button class="vault-action-btn flex-1 btn-primary py-2 rounded-lg" data-id="${savingsAccount.id}" data-type="deposit">Deposit</button>
                    </div>
                </div>
            `);
        }

        goalVaults.forEach(vault => {
            const percentage = vault.target > 0 ? Math.round((vault.current / vault.target) * 100) : 0;
            goalsContainer.insertAdjacentHTML('beforeend', `
                <div class="bg-slate-900/50 p-6 rounded-2xl flex flex-col">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center space-x-4">
                            <div class="p-3 bg-${vault.color}-500/20 rounded-lg"><i data-lucide="${vault.icon}" class="w-8 h-8 text-${vault.color}-400"></i></div>
                                <div>
                                <h4 class="font-semibold text-lg">${vault.name}</h4>
                                <p class="text-sm text-slate-400">Target: Rs ${vault.target.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <button class="delete-item-btn text-slate-500 hover:text-red-500" data-id="${vault.id}" data-type="vault"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                    </div>
                    <div class="text-center my-4 flex-1">
                        <p class="text-3xl font-bold font-mono">Rs ${vault.current.toLocaleString('en-IN')}</p>
                        <p class="font-medium mt-1" style="color: var(--color-primary)">${percentage}% Complete</p>
                    </div>
                    <div class="w-full progress-bar-bg rounded-full h-3 mb-4">
                        <div class="progress-bar-fill h-3 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                        <div class="flex gap-4">
                            <button class="vault-action-btn flex-1 btn-secondary py-2 rounded-lg" data-id="${vault.id}" data-type="withdraw">Withdraw</button>
                            <button class="vault-action-btn flex-1 btn-primary py-2 rounded-lg" data-id="${vault.id}" data-type="deposit">Deposit</button>
                        </div>
                </div>
            `);
        });
    }
    
    function renderAllHistory() {
        const savingsHistoryList = document.getElementById('savings-history-list');
        const vaultHistoryList = document.getElementById('vault-history-list');
        const budgetHistoryList = document.getElementById('budget-history-list');
        if (!savingsHistoryList || !vaultHistoryList || !budgetHistoryList) return;
        
        savingsHistoryList.innerHTML = '';
        savingsAccountHistoryData.forEach(item => {
            const amountClass = item.amount > 0 ? 'text-green-400' : 'text-red-400';
            const sign = item.amount > 0 ? '+' : '-';
            savingsHistoryList.insertAdjacentHTML('beforeend', `
                <tr class="border-b last:border-b-0" style="border-color: var(--color-border);">
                    <td class="p-3 text-slate-400">${item.date}</td>
                    <td class="p-3 font-medium">${item.action}</td>
                    <td class="p-3">${item.details}</td>
                    <td class="p-3 text-right font-mono ${amountClass}">${sign}Rs ${Math.abs(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
            `);
        });

        vaultHistoryList.innerHTML = '';
        vaultHistoryData.forEach(item => {
            vaultHistoryList.insertAdjacentHTML('beforeend', `
                <tr class="border-b last:border-b-0" style="border-color: var(--color-border);">
                    <td class="p-3 text-slate-400">${item.date}</td>
                    <td class="p-3 font-medium">${item.action}</td>
                    <td class="p-3">${item.details}</td>
                </tr>
            `);
        });
        
        budgetHistoryList.innerHTML = '';
        budgetHistoryData.forEach(item => {
            budgetHistoryList.insertAdjacentHTML('beforeend', `
                 <tr class="border-b last:border-b-0" style="border-color: var(--color-border);">
                    <td class="p-3 text-slate-400">${item.date}</td>
                    <td class="p-3 font-medium">${item.action}</td>
                    <td class="p-3">${item.details}</td>
                </tr>
            `);
        });
    }

    function displayAIAdvice() {
        const advice = getSmartAIAdvice();
        if (!aiAdviceContent) return;

        aiAdviceContent.innerHTML = `<p class="text-sm">${advice.text}</p>`;
        if (advice.action === 'move') {
            aiActionButton.textContent = `Move Savings`;
            aiActionButton.classList.remove('hidden');
        } else {
            aiActionButton.classList.add('hidden');
        }
    }

    function renderNotifications() {
        if (!notificationList) return;
        notificationList.innerHTML = '';
        notificationsData.forEach(notif => {
            notificationList.insertAdjacentHTML('beforeend', `
                <div class="p-3 border-b border-slate-600 hover:bg-slate-600/50 flex items-start space-x-3">
                    <div class="p-1.5 bg-blue-500/20 rounded-full mt-1">
                        <i data-lucide="${notif.icon}" class="w-4 h-4 text-blue-400"></i>
                    </div>
                    <div>
                        <p class="text-sm">${notif.text}</p>
                        <p class="text-xs text-slate-400">${notif.time}</p>
                    </div>
                </div>
            `);
        });
    }


const themes = {
        'Slate': {
            '--color-bg': '#0f172a', '--color-sidebar': '#1e293b', '--color-panel': '#1e293b',
            '--color-card-gradient-from': '#334155', '--color-card-gradient-to': '#0f172a',
            '--color-primary': '#22c55e', '--color-primary-hover': '#16a34a',
            '--color-progress-fill': '#22c55e',
        },
        'Ocean': {
            '--color-bg': '#0B2545', '--color-sidebar': '#13315C', '--color-panel': '#13315C',
            '--color-card-gradient-from': '#1E4976', '--color-card-gradient-to': '#0B2545',
            '--color-primary': '#37BEEB', '--color-primary-hover': '#24A8D6',
            '--color-progress-fill': '#37BEEB',
        },
        'Forest': {
            '--color-bg': '#1a2e29', '--color-sidebar': '#243b35', '--color-panel': '#243b35',
            '--color-card-gradient-from': '#2f5d51', '--color-card-gradient-to': '#1a2e29',
            '--color-primary': '#34d399', '--color-primary-hover': '#10b981',
            '--color-progress-fill': '#34d399',
        },
        'Sunset': {
            '--color-bg': '#4c1d3d', '--color-sidebar': '#6b2a57', '--color-panel': '#6b2a57',
            '--color-card-gradient-from': '#9d3d7a', '--color-card-gradient-to': '#4c1d3d',
            '--color-primary': '#f472b6', '--color-primary-hover': '#ec4899',
            '--color-progress-fill': '#f472b6',
        }
    };
function applyTheme(themeName) {
        const theme = themes[themeName];
        if (!theme) return;
        for (const [key, value] of Object.entries(theme)) {
            document.documentElement.style.setProperty(key, value);
        }
    }
function saveTheme(themeName) {
    localStorage.setItem('finvaultTheme', themeName);
 }
function loadTheme() { const savedTheme = localStorage.getItem('finvaultTheme') || 'Slate'; applyTheme(savedTheme); return savedTheme; }
function generateThemeSelector() {
        const currentTheme = loadTheme();
        if (!themeSelector) return;
        themeSelector.innerHTML = '';
        for (const themeName in themes) {
            const theme = themes[themeName];
            const isActive = themeName === currentTheme;
            const button = document.createElement('button');
            button.className = `theme-btn p-4 rounded-lg border-2 ${isActive ? 'border-white' : 'border-transparent'} transition-all`;
            button.dataset.theme = themeName;
            button.innerHTML = `
                <div class="h-12 w-full rounded-md mb-2" style="background: linear-gradient(135deg, ${theme['--color-card-gradient-from']}, ${theme['--color-card-gradient-to']})"></div>
                <p class="font-medium">${themeName}</p>
            `;
            themeSelector.appendChild(button);
        }
    }
function updateUI() {
        try {
            rebuildCardAccounts();
            
            const activeAccount = accounts.find(acc => acc.id === activeAccountId);
            if (!activeAccount) activeAccountId = 'current';
            
            const currentActiveAccount = accounts.find(acc => acc.id === activeAccountId);
            if(activeAccountName) activeAccountName.textContent = currentActiveAccount.name;
            if(activeAccountNameControl) activeAccountNameControl.textContent = currentActiveAccount.name;
            
            if(cardBalance) cardBalance.textContent = `Rs ${accountData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            if(cardFrozenOverlay) cardFrozenOverlay.classList.toggle('hidden', !isCardFrozen);
            if(cardFrozenOverlayControl) cardFrozenOverlayControl.classList.toggle('hidden', !isCardFrozen);
            if(freezeToggle) freezeToggle.checked = isCardFrozen;
            [cardDisplay, cardDisplayControl].forEach(el => { if(el) el.classList.toggle('grayscale', isCardFrozen) });

            populateAccountSelector();
            renderDashboardItems();
            renderBudgets();
            renderVaults();
            renderAllHistory();
            populateTransactions();
            renderNotifications();
            displayAIAdvice();

            lucide.createIcons();
        } catch (error) {
            console.error("Failed to update UI:", error);
        }
}

// ... (All your other rendering functions: renderDashboardItems, renderBudgets, renderVaults, etc.)

// --- EVENT LISTENERS ---
function setupEventListeners() {
        document.body.addEventListener('click', (e) => {
            // Navigation
            const navLink = e.target.closest('.nav-link');
            if (navLink) {
                e.preventDefault();
                showPage(navLink.dataset.target);
            }

            // Quick Actions
            if (e.target.closest('#add-money-btn')) addMoneyModal.classList.remove('hidden');
            if (e.target.closest('#send-money-btn')) sendMoneyModal.classList.remove('hidden');
            if (e.target.closest('#qr-pay-btn')) qrScannerModal.classList.remove('hidden');

            
            // AI Advisor
            if(e.target.closest('#new-advice-btn')) {
                displayAIAdvice(); // Will get a new smart advice
            }
            if(e.target.closest('#ai-action-btn')) {
                const advice = getSmartAIAdvice(); // Re-evaluate to be sure
                if (advice.action === 'move' && advice.amount && advice.targetVault) {
                    const success = handleVaultTransaction(advice.targetVault, 'deposit', advice.amount);
                    if (success) {
                        showToast(`Successfully moved Rs ${advice.amount.toLocaleString('en-IN')} to ${advice.targetVault} vault.`);
                        updateUI();
                    }
                }
            }

            // New Item Buttons
            if (e.target.closest('#new-vault-btn')) {
                newVaultModal.classList.remove('hidden');
                document.getElementById('vault-name').focus();
            }
            if (e.target.closest('#new-budget-btn')) {
                newBudgetModal.classList.remove('hidden');
                document.getElementById('budget-name').focus();
            }

            // Modal Close Buttons
            const modal = e.target.closest('.fixed.inset-0');
            if (e.target.dataset.action === 'close' || e.target === modal) {
                modal.classList.add('hidden');
            }

            // Update Budget Button
            const updateBtn = e.target.closest('.update-budget-btn');
            if(updateBtn) {
                const budgetId = updateBtn.dataset.id;
                const budget = budgetsData.find(b => b.id === budgetId);
                if(budget) {
                    document.getElementById('update-budget-id').value = budget.id;
                    document.getElementById('update-budget-name').value = budget.name;
                    document.getElementById('update-budget-limit').value = budget.limit;
                    updateBudgetModal.classList.remove('hidden');
                }
            }

            // Vault Action Button (Deposit/Withdraw)
            const vaultActionBtn = e.target.closest('.vault-action-btn');
            if(vaultActionBtn) {
                const vaultId = vaultActionBtn.dataset.id;
                const actionType = vaultActionBtn.dataset.type;
                const vault = vaultsData.find(v => v.id === vaultId);
                if(vault) {
                    document.getElementById('vault-action-title').textContent = `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} to ${vault.name}`;
                    document.getElementById('vault-action-id').value = vault.id;
                    document.getElementById('vault-action-type').value = actionType;
                    document.getElementById('vault-action-submit').textContent = `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`;
                    vaultActionModal.classList.remove('hidden');
                    document.getElementById('vault-action-amount').focus();
                }
            }

            // Delete Item Button
            const deleteBtn = e.target.closest('.delete-item-btn');
            if (deleteBtn) {
                itemToDelete = { id: deleteBtn.dataset.id, type: deleteBtn.dataset.type };
                const item = itemToDelete.type === 'budget' 
                    ? budgetsData.find(b => b.id === itemToDelete.id)
                    : vaultsData.find(v => v.id === itemToDelete.id);
                
                if (item.isSavingsAccount) {
                    alert("The main Savings Account cannot be deleted.");
                    return;
                }

                document.getElementById('confirm-delete-title').textContent = `Delete ${item.name}?`;
                let message = `This will permanently delete the ${itemToDelete.type}.`;
                if (itemToDelete.type === 'vault' && item.current > 0) {
                    message += ` The remaining balance of Rs ${item.current.toLocaleString('en-IN')} will be returned to your Current Account.`
                }
                document.getElementById('confirm-delete-message').textContent = message;
                confirmDeleteModal.classList.remove('hidden');
            }

            // Card Assignment Button
            const assignBtn = e.target.closest('.card-assign-btn');
            if (assignBtn) {
                const budgetId = assignBtn.dataset.id;
                const action = assignBtn.dataset.action;
                const budget = budgetsData.find(b => b.id === budgetId);
                if (budget) {
                    budget.isCardAssigned = (action === 'assign');
                    updateUI();
                }
            }

            // Notifications
            if (e.target.closest('#notifications-btn')) {
                notificationsDropdown.classList.toggle('hidden');
            } else if (!e.target.closest('#notifications-dropdown')) {
                notificationsDropdown.classList.add('hidden');
            }

            // Onboarding
            const onboardingNext = e.target.closest('.onboarding-next');
            if(onboardingNext) {
                const currentStep = onboardingNext.closest('[id^="onboarding-step-"]');
                const nextStepNumber = parseInt(currentStep.id.split('-')[2]) + 1;
                currentStep.classList.add('hidden');
                document.getElementById(`onboarding-step-${nextStepNumber}`).classList.remove('hidden');
            }
            const onboardingPrev = e.target.closest('.onboarding-prev');
            if(onboardingPrev) {
                const currentStep = onboardingPrev.closest('[id^="onboarding-step-"]');
                const prevStepNumber = parseInt(currentStep.id.split('-')[2]) - 1;
                currentStep.classList.add('hidden');
                document.getElementById(`onboarding-step-${prevStepNumber}`).classList.remove('hidden');
            }
            if(e.target.closest('.onboarding-finish')) {
                onboardingModal.classList.add('hidden');
                localStorage.setItem('finvault_onboarding_complete', 'true');
            }
        });

        confirmDeleteBtn.addEventListener('click', () => {
            const { id, type } = itemToDelete;
            if (type === 'budget') {
                deleteBudget(id);
            } else if (type === 'vault') {
                deleteVault(id);
            }
            
            confirmDeleteModal.classList.add('hidden');
            updateUI();
            itemToDelete = { id: null, type: null };
        });

        accountSelector.addEventListener('change', (e) => {
            if(e.target.name === 'activeAccount') {
                activeAccountId = e.target.value;
                updateUI();
            }
        });
        
        freezeToggle.addEventListener('change', () => { isCardFrozen = !isCardFrozen; updateUI(); });
        
        locateCardBtnSettings.addEventListener('click', () => mapModal.classList.remove('hidden'));
        closeMapModalBtn.addEventListener('click', () => mapModal.classList.add('hidden'));
        
        mobileMenuButton.addEventListener('click', () => mobileSidebar.classList.remove('-translate-x-full'));
        closeMobileMenuButton.addEventListener('click', () => mobileSidebar.classList.add('-translate-x-full'));
        
        addMoneyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(e.target.elements['add-money-amount'].value);
            if (amount > 0) {
                accounts.find(a => a.id === 'current').balance += amount;
                transactionsData.unshift({
                    date: getCurrentDate(), desc: 'Deposit from external source', cat: 'Income', amount: amount
                });
                showToast(`Rs ${amount.toLocaleString('en-IN')} added successfully.`);
                updateUI();
                addMoneyModal.classList.add('hidden');
                e.target.reset();
            }
        });
        
        sendMoneyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(e.target.elements['send-money-amount'].value);
            const recipient = e.target.elements['send-money-recipient'].value;
            const currentAccount = accounts.find(a => a.id === 'current');
            
            if (amount > 0 && recipient && currentAccount.balance >= amount) {
                currentAccount.balance -= amount;
                transactionsData.unshift({
                    date: getCurrentDate(), desc: `Sent to ${recipient}`, cat: 'Transfer', amount: -amount
                });
                showToast(`Rs ${amount.toLocaleString('en-IN')} sent successfully.`);
                updateUI();
                sendMoneyModal.classList.add('hidden');
                e.target.reset();
            } else if (currentAccount.balance < amount) {
                showToast('Insufficient funds.');
            }
        });

        newVaultForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = e.target.elements['vault-name'].value;
            const target = parseFloat(e.target.elements['vault-target'].value);
            if (createVault(name, target)) {
                updateUI();
                newVaultModal.classList.add('hidden');
                e.target.reset();
            }
        });

        newBudgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = e.target.elements['budget-name'].value;
            const limit = parseFloat(e.target.elements['budget-limit'].value);
            if (createBudget(name, limit)) {
                updateUI();
                newBudgetModal.classList.add('hidden');
                e.target.reset();
            }
        });

        updateBudgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const budgetId = e.target.elements['update-budget-id'].value;
            const newName = e.target.elements['update-budget-name'].value;
            const newLimit = parseFloat(e.target.elements['update-budget-limit'].value);
            
            if(updateBudget(budgetId, newName, newLimit)) {
                updateUI();
                updateBudgetModal.classList.add('hidden');
                e.target.reset();
            }
        });

        vaultActionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const vaultId = e.target.elements['vault-action-id'].value;
            const actionType = e.target.elements['vault-action-type'].value;
            const amount = parseFloat(e.target.elements['vault-action-amount'].value);

            if (handleVaultTransaction(vaultId, actionType, amount)) {
                updateUI();
                vaultActionModal.classList.add('hidden');
                e.target.reset();
            }
        });
        
        showSavingsHistoryBtn.addEventListener('click', () => {
            savingsHistoryContainer.classList.toggle('hidden');
            vaultHistoryContainer.classList.add('hidden');
            budgetHistoryContainer.classList.add('hidden');
        });

        showVaultHistoryBtn.addEventListener('click', () => {
            vaultHistoryContainer.classList.toggle('hidden');
            savingsHistoryContainer.classList.add('hidden');
            budgetHistoryContainer.classList.add('hidden');
        });

        showBudgetHistoryBtn.addEventListener('click', () => {
            budgetHistoryContainer.classList.toggle('hidden');
            vaultHistoryContainer.classList.add('hidden');
            savingsHistoryContainer.classList.add('hidden');
        });
        
        simulatePayoutBtn.addEventListener('click', () => {
            calculateAndApplyMonthlyReturns();
            updateUI();
        });
        
        exportSpendingBtn.addEventListener('click', () => exportToCsv('spending_history.csv', ['date', 'desc', 'cat', 'amount'], transactionsData));
        exportSavingsHistoryBtn.addEventListener('click', () => exportToCsv('savings_account_history.csv', ['date', 'action', 'details', 'amount'], savingsAccountHistoryData));
        exportVaultHistoryBtn.addEventListener('click', () => exportToCsv('vault_history.csv', ['date', 'action', 'details'], vaultHistoryData));
        exportBudgetHistoryBtn.addEventListener('click', () => exportToCsv('budget_history.csv', ['date', 'action', 'details'], budgetHistoryData));
        
        themeSelector.addEventListener('click', (e) => {
            const themeBtn = e.target.closest('.theme-btn');
            if (themeBtn) {
                const themeName = themeBtn.dataset.theme;
                applyTheme(themeName);
                saveTheme(themeName);
                document.querySelectorAll('.theme-btn').forEach(btn => {
                    btn.classList.toggle('border-white', btn.dataset.theme === themeName);
                    btn.classList.toggle('border-transparent', btn.dataset.theme !== themeName);
                });
            }
        });
    }
// --- INITIALIZATION ---
function initializeAppUI() {
    createIcons({ icons });
    generateThemeSelector();
    loadTheme();
    setupEventListeners();
    updateUI();
    showPage('dashboard');

    if (localStorage.getItem('finvault_onboarding_complete') !== 'true') {
        if(onboardingModal) onboardingModal.classList.remove('hidden');
    }
    console.log("Main App UI Initialized!");
}
