// src/components/panels/NFCPaymentPanel.jsx
import { useState, useEffect } from 'react';
import { isNative, isAndroid, isIOS, isWeb } from '../../utils/platformUtils';

const NFCPaymentPanel = ({ isOpen, onClose, onSuccess }) => {
  const [activeMode, setActiveMode] = useState('receive'); // 'receive' or 'send'
  const [isProcessing, setIsProcessing] = useState(false);
  const [nfcData, setNfcData] = useState(null);
  const [platformMessage, setPlatformMessage] = useState('');

  // Check platform on mount
  // In a real implementation, this would be done in a useEffect hook
  // For now, we'll just set the message based on mock functions

  // Initialize platform message
  // In a real implementation, this would be in a useEffect
  // For demo purposes, we'll simulate different platforms
  // You would uncomment the following lines in a real implementation:
  /*
  useEffect(() => {
    if (isWeb()) {
      setPlatformMessage('NFC payments require the FinVault mobile app. Download on Android or iOS.');
    } else if (isAndroid()) {
      setPlatformMessage('Ready to scan NFC tags');
    } else if (isIOS()) {
      setPlatformMessage('Ready to scan NFC tags');
    }
  }, []);
  */

  // For demo, let's simulate being on web
  const [platform, setPlatform] = useState('web'); // 'web', 'android', or 'ios'

  // Simulate platform detection
  // In a real app, remove this and use the actual Capacitor detection above
  // setPlatform(isWeb() ? 'web' : isAndroid() ? 'android' : 'ios');

  // Set initial platform message
  // useEffect(() => {
  //   if (platform === 'web') {
  //     setPlatformMessage('NFC payments require the FinVault mobile app. Download on Android or iOS.');
  //   } else {
  //     setPlatformMessage('Ready to scan NFC tags');
  //   }
  // }, [platform]);

  // Mock data for demonstration
  const mockNfcData = {
    type: 'iban',
    value: 'PK36HABB0000987654321098',
    formatted: 'PK36 HABB 0000 9876 5432 1098'
  };

  const handleReceivePayment = () => {
    setIsProcessing(true);
    // Simulate NFC read delay
    setTimeout(() => {
      // In a real Capacitor app, this would read from NFC tag
      setNfcData(mockNfcData);
      setIsProcessing(false);
    }, 2000);
  };

  const handleSendViaNFC = () => {
    setIsProcessing(true);
    // Simulate NFC write delay
    setTimeout(() => {
      // In a real Capacitor app, this would write to NFC tag
      setIsProcessing(false);
      alert('Payment information written to NFC tag successfully!');
      onClose();
      onSuccess();
    }, 2000);
  };

  const handleUseNfcData = () => {
    // In a real implementation, this would pre-fill the appropriate panel
    // For example, if it's an IBAN, pre-fill SendMoneyPanel
    // If it's card data, pre-fill AddFundsPanel
    alert(`NFC data received: ${nfcData.type.toUpperCase()} - ${nfcData.value}`);
    // In a real app:
    // if (nfcData.type === 'iban') {
    //   // Pre-fill SendMoneyPanel with this IBAN
    // } else if (nfcData.type === 'card') {
    //   // Pre-fill AddFundsPanel with card details
    // }
    onClose();
    onSuccess();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 mb-6">
            {/* Drag handle */}
            <div className="w-12 h-0.5 bg-white/20 rounded mb-4" />

            {/* Panel content */}
            <div className="bg-background/90 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">NFC Payment</h3>
                <button
                  onClick={onClose}
                  className="text-xs btn-danger py-1 px-2 rounded"
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setActiveMode('receive')}
                    className={`flex-1 py-3 px-4 text-center font-medium ${
                      activeMode === 'receive'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    Receive Payment
                  </button>
                  <button
                    onClick={() => setActiveMode('send')}
                    className={`flex-1 py-3 px-4 text-center font-medium ${
                      activeMode === 'send'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    Send via NFC
                  </button>
                </div>
              </div>

              {/* Platform detection message */}
              {platform === 'web' && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600">
                    NFC payments require the FinVault mobile app. Download on Android or iOS.
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <button
                      className="flex-1 btn-secondary py-2 px-4 rounded-lg"
                    >
                      Get on Android
                    </button>
                    <button
                      className="flex-1 btn-secondary py-2 px-4 rounded-lg"
                    >
                      Get on iOS
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Content */}
              {platform !== 'web' && (
                <>
                  {activeMode === 'receive' && (
                    <>
                      <div className="text-center mb-6">
                        <p className="text-sm text-text-muted">
                          Hold another device or card near the back of your phone
                        </p>
                        {/* Animated NFC rings would go here in a real implementation */}
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                          <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse" />
                          <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse delay-200" />
                          <span className="relative z-10 text-xs">NFC</span>
                        </div>
                        {isProcessing && (
                          <p className="mt-2 text-xs text-text-muted">
                            Scanning
                          </p>
                        )}
                        {!isProcessing && nfcData && (
                          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                            <p className="font-semibold mb-2">NFC Data Received:</p>
                            <p className="text-xs text-text-muted mb-1">
                              Type: {nfcData.type.toUpperCase()}
                            </p>
                            <p className="font-mono mb-1">
                              Value: {nfcData.value}
                            </p>
                            <p className="text-xs text-text-muted">
                              Formatted: {nfcData.formatted}
                            </p>
                            <button
                              onClick={handleUseNfcData}
                              className="mt-3 w-full btn-primary py-2 px-4 rounded-lg"
                            >
                              Use This Data
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleReceivePayment}
                        className="w-full btn-secondary py-2 px-4 rounded-lg"
                        disabled={isProcessing || !!nfcData}
                      >
                        {(!isProcessing && !nfcData) ? (
                            <><span className="mr-2">📱</span>Ready to Scan</>
                          ) : isProcessing ? (
                            <><span className="mr-2">🔄</span>Scanning</>
                          ) : (
                            <><span className="mr-2">✓</span>Scan Another</>
                          )}
                      </button>
                    </>
                  )}

                  {activeMode === 'send' && (
                    <>
                      <div className="text-center mb-6">
                        <p className="text-sm text-text-muted">
                          Hold another device near the back of your phone to send payment info
                        </p>
                        {/* Animated phone graphic with NFC rings would go here */}
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                          {/* Simple phone representation */}
                          <div className="w-4 h-6 bg-white/20 rounded-t-lg mb-1" />
                          <div className="w-6 h-8 bg-white/20 rounded" />
                          {/* NFC rings */}
                          <div className="absolute -2 -2 w-28 h-28 rounded-full border-2 border-white/20 animate-pulse" />
                          <div className="absolute -4 -4 w-32 h-32 rounded-full border-2 border-white/20 animate-pulse delay-200" />
                          <span className="relative z-10 text-xs">📱</span>
                        </div>
                        {isProcessing && (
                          <p className="mt-2 text-xs text-text-muted">
                            Sending...
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleSendViaNFC}
                        className="w-full btn-primary py-2 px-4 rounded-lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <><span className="mr-2">🔄</span>Processing...</>
                        ) : (
                          <><span className="mr-2">📡</span>Send via NFC</>
                        )}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NFCPaymentPanel;