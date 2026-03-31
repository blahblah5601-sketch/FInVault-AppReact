// src/utils/platformUtils.js
// Utility to detect if running inside Capacitor native app
export const isNative = () => window.Capacitor !== undefined;
export const isAndroid = () => isNative() && window.Capacitor.getPlatform() === 'android';
export const isIOS = () => isNative() && window.Capacitor.getPlatform() === 'ios';
export const isWeb = () => !isNative();