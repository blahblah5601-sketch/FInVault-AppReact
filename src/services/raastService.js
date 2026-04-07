// src/services/raastService.js

import axios from 'axios';

const RAAS_API_KEY = import.meta.env.VITE_RAAS_API_KEY;
const RAAS_BASE_URL = 'https://api.raast.com/v1'; // Replace with actual Raast API base URL

// Function to create a payment request
export const createPaymentRequest = async (amount, receiver) => {
    try {
        const response = await axios.post(`${RAAS_BASE_URL}/payment/request`, {
            amount,
            receiver,
        }, {
            headers: {
                'Authorization': `Bearer ${RAAS_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating payment request:', error);
        throw error;
    }
};

// Additional services can be added here.