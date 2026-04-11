// src/services/raastService.js

import axios from 'axios';

// RAAST Sandbox API Configuration
const RAAST_BASE_URL = 'https://sandboxapi.1link.net.pk/uat-1link/sandbox/1Link';
const RAAST_CLIENT_ID = import.meta.env.VITE_RAAST_CLIENT_ID;
const RAAST_CLIENT_SECRET = import.meta.env.VITE_RAAST_CLIENT_SECRET;

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
            'https://sandboxapi.1link.net.pk/uat-1link/sandbox/oauth2/token',
            new URLSearchParams({
                'grant_type': 'client_credentials',
                'scope': '1LinkApi'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                auth: {
                    username: RAAST_CLIENT_ID,
                    password: RAAST_CLIENT_SECRET
                }
            }
        );

        const { access_token, expires_in } = response.data;
        accessToken = access_token;
        tokenExpiresAt = Date.now() + (expires_in * 1000); // Convert seconds to milliseconds

        return accessToken;
    } catch (error) {
        console.error('Error obtaining RAAST access token:', error);
        throw error;
    }
};

// Function to create payment request (RTP Now Merchant)
export const createRtpNowPayment = async (paymentDetails) => {
    try {
        const accessToken = await getAccessToken();

        const response = await axios.post(
            `${RAAST_BASE_URL}/rtpNowMerchant`,
            paymentDetails,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-IBM-Client-Id': RAAST_CLIENT_ID,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error creating RTP Now payment:', error.response?.data || error.message);
        throw error;
    }
};

// Function to check payment status
export const checkPaymentStatus = async (stan, rtpId, merchantID) => {
    try {
        const accessToken = await getAccessToken();

        const response = await axios.post(
            `${RAAST_BASE_URL}/statusInquiry`,
            {
                info: {
                    stan,
                    rtpId
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-IBM-Client-Id': RAAST_CLIENT_ID,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error checking payment status:', error.response?.data || error.message);
        throw error;
    }
};

// Function to validate beneficiary/account details (Pre-RTP Alias Inquiry)
export const validateBeneficiary = async (aliasType, aliasValue) => {
    try {
        const accessToken = await getAccessToken();

        const response = await axios.post(
            `${RAAST_BASE_URL}/preRTPAliasInquiry`,
            {
                alias: {
                    type: aliasType,
                    value: aliasValue
                },
                info: {
                    // These would typically be generated per request
                    // For simplicity, using placeholder values - in production these should be unique
                    rrn: Math.random().toString(36).substring(2, 14),
                    stan: Math.floor(Math.random() * 900000) + 100000
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-IBM-Client-Id': RAAST_CLIENT_ID,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error validating beneficiary:', error.response?.data || error.message);
        throw error;
    }
};

// Function to get account title from IBAN (Pre-RTP Title Fetch)
export const getAccountTitle = async (memberId, iban) => {
    try {
        const accessToken = await getAccessToken();

        const response = await axios.post(
            `${RAAST_BASE_URL}/preRTPTitleFetch`,
            {
                customerDetails: {
                    memberid: memberId,
                    iban: iban
                },
                info: {
                    rrn: Math.random().toString(36).substring(2, 14),
                    stan: Math.floor(Math.random() * 900000) + 100000
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-IBM-Client-Id': RAAST_CLIENT_ID,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching account title:', error.response?.data || error.message);
        throw error;
    }
};
