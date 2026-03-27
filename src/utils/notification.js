// src/utils/notification.js
import { toast } from 'react-toastify';

export const showToast = (message, type) => {
    toast(message, { type });
};

// Additional notification utilities can be added here.