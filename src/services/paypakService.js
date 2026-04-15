// src/services/paypakService.js

import axios from 'axios';

// PayPak API Configuration
const PAYPAK_BASE_URL = 'https://sandboxapi.paypak.com.pk/';
const PAYPAK_CLIENT_ID = import.meta.env.VITE_PAYPAK_CLIENT_ID;
const PAYPAK_CLIENT_SECRET = import.meta.env.VITE_PAYPAK_CLIENT_SECRET;

// OAuth 2.0 token cache
let accessToken = null;
let tokenExpiresAt = 0;

// Function to get OAuth 2.0 access token
const getAccessToken = async () => {
    // Return cached token if still valid (with 60 second buffer)
    if (accessToken && Date.now() < tokenExpiresAt - 60000) {
        return accessToken;
    }

    try {
        const response = await axios.post(
            `${PAYPAK_BASE_URL}oauth2/token`,
            new URLSearchParams({
                'grant_type': 'client_credentials',
                'scope': 'paypak_api'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                auth: {
                    username: PAYPAK_CLIENT_ID,
                    password: PAYPAK_CLIENT_SECRET
                }
            }
        );

        const { access_token, expires_in } = response.data;
        accessToken = access_token;
        tokenExpiresAt = Date.now() + (expires_in * 1000); // Convert seconds to milliseconds

        return accessToken;
    } catch (error) {
        console.error('Error obtaining PayPak access token:', error);
        throw error;
    }
};

// Function to process PayPak purchase
export const processPayPakPurchase = async (paymentData) => {
    try {
        const accessToken = await getAccessToken();

        const response = await axios.post(
            `${PAYPAK_BASE_URL}api/v1/purchase`,
            paymentData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Client-Id': PAYPAK_CLIENT_ID,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error processing PayPak purchase:', error.response?.data || error.message);
        throw error;
    }
};

// Function to refund PayPak transaction
export const refundPayPakTransaction = async (transactionId, amount) => {
    try {
        const accessToken = await getAccessToken();

        const response = await axios.post(
            `${PAYPAK_BASE_URL}api/v1/refund`,
            {
                originalTransactionId: transactionId,
                refundAmount: amount
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Client-Id': PAYPAK_CLIENT_ID,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error refunding PayPak transaction:', error.response?.data || error.message);
        throw error;
    }
};

// Function to check PayPak transaction status
export const checkPayPakTransactionStatus = async (transactionId) => {
    try {
        const accessToken = await getAccessToken();

        const response = await axios.get(
            `${PAYPAK_BASE_URL}api/v1/transaction/${transactionId}/status`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Client-Id': PAYPAK_CLIENT_ID,
                    'Accept': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error checking PayPak transaction status:', error.response?.data || error.message);
        throw error;
    }
};