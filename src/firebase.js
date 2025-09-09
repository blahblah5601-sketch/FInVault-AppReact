// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Make sure to fill this with your actual config details
const firebaseConfig = {
    apiKey: "AIzaSyBCB9Vk_N5p0qNlzzEZbd3txvP7SW7bMVo",
    authDomain: "finvaultapp.firebaseapp.com",
    projectId: "finvaultapp",
    storageBucket: "finvaultapp.firebasestorage.app",
    messagingSenderId: "384326381113",
    appId: "1:384326381113:web:a5341f1961dcbd77fc67e8",
    measurementId: "G-ZV817H8CTC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need in your components
export const auth = getAuth(app);
export const db = getFirestore(app);