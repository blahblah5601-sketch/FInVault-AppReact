// src/components/panels/QRPaymentPanel.jsx
import { createPayment } from '../../api';
import { createRtpNowPayment, validateBeneficiary } from '../../services/raastService';
import { processPayPakPurchase } from '../../services/paypakService';
import { useState } from 'react';
import { QrCode, ScanLine, Share2, Download } from 'lucide-react';

const QRPaymentPanel = ({ isOpen, onClose, onSuccess, showToast }) => {
  const [activeTab, setActiveTab] = useState('show-qr');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [paymentMethodType, setPaymentMethodType] = useState('bank-transfer'); // 'bank-transfer' or 'card'
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [paymentSent, setPaymentSent] = useState(false);

  // Mock user IBAN for "show my QR"
  const mockUserIban = 'PK36FNVT0000123456789012';
  const mockUserName = 'John Doe';

  const handleScanQR = () => {
    setIsScanning(true);
    setTimeout(() => {
      setScannedData({
        type: 'iban',
        value: 'PK36HABB0000987654321098',
        formatted: 'PK36 HABB 0000 9876 5432 1098',
        name: 'Recipient Name'
      });
      setIsScanning(false);
    }, 2000);
  };

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setIsScanning(true);
      setTimeout(() => {
        setScannedData({
          type: 'iban',
          value: 'PK36MUCB0000555555555555',
          formatted: 'PK36 MUCB 0000 5555 5555 5555',
          name: 'Recipient from Image'
        });
        setIsScanning(false);
      }, 1500);
    }
  };

  const handleShareQR = () => {
    if (navigator.share) {
      navigator.share({
        title: 'FinVault QR Payment',
        text: `Scan my QR code to send me money. IBAN: ${mockUserIban}`
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(mockUserIban);
    }
  };

  const handleDownloadQR = () => {
    // In a real app, this would download the actual QR code image
    showToast('QR code download would generate the actual QR image here');
  };

  const handleScanPay = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount');
      return;
    }
    if (!scannedData) {
      showToast('Please scan a QR code first');
      return;
    }

    setPaymentSent(true);
    try {
      if (paymentMethodType === 'bank-transfer') {
        // Process bank transfer using RAAS API
        // First validate the beneficiary using RAAS API (if it's an IBAN)
        let validationResult = null;
        if (scannedData.type === 'iban') {
          try {
            // We would need the memberId (BIC) for proper validation
            // For demo purposes, we'll skip validation or use a placeholder
            // In a real implementation, you'd get the memberId from a directory or have the user select their bank
            validationResult = await validateBeneficiary('IBAN', scannedData.value);
          } catch (validationError) {
            console.warn('Beneficiary validation warning:', validationError);
            // Continue with payment even if validation fails - might be due to missing memberId
          }
        }

        // Process payment using RAAS API
        const paymentDetails = {
          merchantDetails: {
            // For P2M payments, we need merchant details
            // In a P2P scenario, we'd use different endpoints
            // This is a simplified version - in reality you'd need proper merchant registration
            merchantId: 'MERCHANT001', // Placeholder - should come from user profile/business registration
            subDept: '0001',
            dbaName: 'FinVault User',
            merchantName: 'FinVault User',
            iban: scannedData.value, // Using scanned IBAN as merchant IBAN for demo
            bankBic: 'UNKNOWN', // Would need to extract from IBAN or have user select bank
            merchantCategoryCode: '0000', // Placeholder
            postalAddress: {
              townName: 'Unknown',
              subDept: '0001',
              addressLine: 'Unknown'
            },
            contactDetails: {
              phoneNo: '00000000000',
              mobileNo: '00000000000',
              email: 'user@finvault.pk',
              dept: 'Personal',
              website: 'www.finvault.pk',
              merchantChannelId: 'WEB'
            },
            geoLocation: {
              lat: '0.000000',
              long: '0.000000'
            }
          },
          payerDetails: {
            additionalRequiredDetails: 'NON',
            identificationDetails: {
              loyaltyNo: '',
              customerLabel: 'FinVault Customer'
            }
          },
          paymentDetails: {
            executionDateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            expiryDateTime: new Date(Date.now() + 3600000).toISOString().replace('T', ' ').substring(0, 19), // 1 hour expiry
            rtpId: Math.random().toString(36).substring(2, 15), // Simplified ID generation
            instructedAmount: parseFloat(amount),
            billNo: `FV${Date.now()}`,
            transactionType: '0001' // Would need to map to proper transaction types
          },
          info: {
            stan: Math.floor(Math.random() * 900000) + 100000,
            rrn: Math.random().toString(36).substring(2, 14)
          }
        };

        const result = await createRtpNowPayment(paymentDetails);

        if (result && result.responseCode === '00') {
          setTimeout(() => {
            onClose();
            onSuccess();
          }, 1500);
        } else {
          showToast('Failed to process QR payment: ' + (result?.responseDescription || 'Unknown error'));
          setPaymentSent(false);
        }
      } else if (paymentMethodType === 'card') {
        // Process card payment using PayPak API
        // Format data according to PayPak ECommerce Purchase specification
        const paypakData = {
          // Required fields based on the API specification
          TransactionAmount: String(parseFloat(amount * 100)).padStart(12, '0'), // Amount in paisa (multiply by 100)
          PersonalIdentificationNumber: '000000', // PIN (not typically used in QR payments, placeholder)
          PosConditionCode: '00', // Normal condition
          ReservedforNationalUse6: '000000', // Reserved for national use
          TrackData2: '', // Track 2 data (not typically available in QR payments)
          TransactionDescription: description || 'QR Card Payment',
          TransmissionDateAndTime: new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 10), // MMDDhhmmss format
          STAN: Math.floor(Math.random() * 900000) + 100000, // System Trace Audit Number
          Time: new Date().toTimeString().slice(0, 6).replace(/:/g, ''), // hhmmss format
          Date: new Date().toISOString().slice(5, 10).replace(/-/g, ''), // MMDD format
          MerchantType: '0000', // Default merchant type (would need proper mapping)
          AdditionalEMVInformation: '', // Additional EMV information
          RRN: Math.random().toString(36).substring(2, 14), // Retrieval Reference Number
          AuthorizationIdentificationResponse: '000000', // Authorization response (placeholder)
          CardAcceptorTerminalId: '00000000', // Terminal ID
          CardAcceptorIdCode: '000000000000000', // Acceptor ID
          CardAcceptorNameLocation: {
            Location: 'Unknown',
            City: 'Unknown',
            State: 'Unknown',
            ZipCode: '00000',
            AgentName: 'FinVault',
            ADCLiteral: 'QR Payment'
          },
          AdditionalResponseData: '',
          AmountTransactionFee: '0000', // Transaction fee
          CurrencyCodeTransaction: '586', // PKR currency code
          AccountIdentification1: '', // Account number from (would be merchant account)
          AcquiringInstitutionIDCode: '00000000000', // Acquiring institution ID
          PANSequenceNumber: '00000000000', // PAN sequence number
          PAN: '', // Primary Account Number (would be from card data in real scenario)
          AdditionalDataNational: '', // Additional national data
          PosEntryMode: '000', // Point-of-service entry mode
          AdditionalAmounts: '', // Additional amounts
          DateExpiration: '', // Date expiration
          DateSettlement: '', // Date settlement
          EMVData: '', // EMV data
          ForwardingInstitutionIdentificationCode: '000', // Forwarding institution ID
          CardholderAuthenticationInformation: '', // Cardholder authentication info
          SenderName: 'FinVault User', // Sender name
          NetworkInstitutionIdentifier: '000', // Network institution ID
          RecordData: {
            CAVVData: '', // Cardholder authentication verification value
            ECI: '' // Electronic commerce indicator
          }
        };

        const result = await processPayPakPurchase(paypakData);

        if (result && result.ResponseCode === '00') {
          setTimeout(() => {
            onClose();
            onSuccess();
          }, 1500);
        } else {
          showToast('Failed to process card payment: ' + (result?.ResponseDetail || 'Unknown error'));
          setPaymentSent(false);
        }
      }
    } catch (error) {
      showToast('Failed to process QR payment: ' + (error.message || 'Network error'));
      setPaymentSent(false);
    }
  };

  const resetState = () => {
    setActiveTab('show-qr');
    setAmount('');
    setDescription('');
    setScannedData(null);
    setIsScanning(false);
    setUploadedImage(null);
    setPaymentSent(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const inputStyle = {
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg)',
    color: 'var(--color-text-primary)',
    fontFamily: "'Sora', sans-serif",
    padding: '10px 12px',
    fontSize: '14px',
    width: '100%',
    outline: 'none'
  };

  const labelStyle = {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    marginBottom: 4,
    display: 'block',
    letterSpacing: '0.3px'
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm" onClick={handleClose}>
          <div className="relative w-full max-w-lg mx-4 mb-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-0.5 bg-white/20 rounded mb-4" />
            <div className="rounded-panel p-6 border max-h-[80vh] overflow-y-auto" style={{
              backgroundColor: 'var(--color-panel)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex justify-between items-start mb-5 gap-3">
                <button onClick={handleClose} className="px-2 py-1 text-xs rounded-sm-panel transition-colors shrink-0 self-start"
                  style={{ background: 'var(--color-red-accent)', color: 'white', border: 'none', cursor: 'pointer' }}>←</button>
                <h3 className="text-sm font-medium flex-1 text-center" style={{ fontFamily: "'Sora', sans-serif" }}>QR Payment</h3>
                <div className="w-10 shrink-0" />
              </div>

              {/* Tabs matching reference design */}
              <div className="flex mb-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <button
                  onClick={() => setActiveTab('show-qr')}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    textAlign: 'center',
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '13px',
                    fontWeight: 500,
                    color: activeTab === 'show-qr' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    borderBottom: activeTab === 'show-qr' ? '2px solid var(--color-gold)' : '2px solid transparent',
                    background: 'none',
                    border: 'none',
                    borderBottomColor: activeTab === 'show-qr' ? 'var(--color-gold)' : 'transparent',
                    borderBottomWidth: '2px',
                    borderBottomStyle: 'solid',
                    cursor: 'pointer',
                    transition: 'color 0.15s'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <QrCode size={14} /> Show My QR
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('scan-bank-transfer')}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    textAlign: 'center',
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '13px',
                    fontWeight: 500,
                    color: activeTab === 'scan-bank-transfer' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    borderBottom: activeTab === 'scan-bank-transfer' ? '2px solid var(--color-gold)' : '2px solid transparent',
                    borderBottomWidth: '2px',
                    borderBottomStyle: 'solid',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.15s'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <ScanLine size={14} /> Bank Transfer
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('scan-card')}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    textAlign: 'center',
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '13px',
                    fontWeight: 500,
                    color: activeTab === 'scan-card' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    borderBottom: activeTab === 'scan-card' ? '2px solid var(--color-gold)' : '2px solid transparent',
                    borderBottomWidth: '2px',
                    borderBottomStyle: 'solid',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.15s'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <ScanLine size={14} /> Card Payment
                  </span>
                </button>
              </div>

              {/* Show My QR Tab */}
              {activeTab === 'show-qr' && (
                <div className="flex flex-col items-center">
                  {/* QR Code placeholder matching reference */}
                  <div className="rounded-panel p-6 mb-4 w-full text-center" style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}>
                    {/* QR visual - styled like the reference qr-box */}
                    <div className="flex flex-col items-center justify-center mx-auto mb-4 p-4 rounded-panel" style={{
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      width: '160px',
                      height: '160px'
                    }}>
                      <QrCode size={80} color="#0d0f1a" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium mb-1">{mockUserName}</p>
                    <p className="text-xs font-mono mb-3" style={{ fontFamily: "'Space Mono', monospace", color: 'var(--color-text-muted)' }}>
                      {mockUserIban}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={handleShareQR}
                        className="flex-1 py-2 px-3 text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-colors"
                        style={{ borderRadius: '8px', backgroundColor: '#1a1f3a', border: 'none', fontFamily: "'Sora', sans-serif" }}
                        onMouseEnter={e => e.target.style.backgroundColor = '#262d52'}
                        onMouseLeave={e => e.target.style.backgroundColor = '#1a1f3a'}>
                        <Share2 size={12} /> Share QR
                      </button>
                      <button onClick={handleDownloadQR}
                        className="flex-1 py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        style={{ borderRadius: '8px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontFamily: "'Sora', sans-serif" }}
                        onMouseEnter={e => { e.target.style.borderColor = 'var(--color-gold)'; e.target.style.color = 'var(--color-accent)'; }}
                        onMouseLeave={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.color = 'var(--color-text-primary)'; }}>
                        <Download size={12} /> Download
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                    Others can scan this QR to send you money
                  </p>
                </div>
              )}

              {/* Scan QR Tab */}
              {activeTab === 'scan-qr' && (
                <div className="space-y-4">
                  {!scannedData ? (
                    <>
                      {/* Camera preview area */}
                      <div className="rounded-panel p-6 text-center" style={{
                        backgroundColor: 'var(--color-accent, #1a1f3a)',
                        minHeight: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                      }}>
                        {isScanning ? (
                          <>
                            <div className="rounded-sm-panel flex items-center justify-center" style={{
                              width: '64px', height: '64px', borderRadius: '50%',
                              background: 'rgba(201,168,76,0.15)'
                            }}>
                              <ScanLine size={28} color="#c9a84c" />
                            </div>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Scanning...</p>
                          </>
                        ) : (
                          <>
                            <div className="rounded-sm-panel flex items-center justify-center" style={{
                              width: '64px', height: '64px', borderRadius: '50%',
                              background: 'rgba(255,255,255,0.06)'
                            }}>
                              <ScanLine size={28} color="rgba(255,255,255,0.4)" />
                            </div>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Point camera at QR code</p>
                          </>
                        )}
                      </div>

                      <button onClick={handleScanQR}
                        className="w-full py-3 px-4 text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors"
                        style={{ borderRadius: '10px', backgroundColor: '#1a1f3a', border: 'none', fontFamily: "'Sora', sans-serif" }}
                        disabled={isScanning}
                        onMouseEnter={e => e.target.style.backgroundColor = '#262d52'}
                        onMouseLeave={e => e.target.style.backgroundColor = '#1a1f3a'}>
                        <ScanLine size={14} />
                        {isScanning ? 'Scanning...' : 'Scan QR Code'}
                      </button>

                      {/* Upload image option for desktop */}
                      <div className="rounded-sm-panel p-4 text-center" style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        borderWidth: '1px',
                        borderStyle: 'dashed',
                        borderRadius: '10px'
                      }}>
                        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                          Or upload a QR code image
                        </p>
                        <input type="file" accept="image/*" onChange={handleUploadImage}
                          style={{ fontSize: '12px', color: 'var(--color-text-muted)' }} className="w-full" />
                        {uploadedImage && (
                          <img src={uploadedImage} alt="Uploaded QR" className="mx-auto mt-3 rounded"
                            style={{ maxWidth: '120px', maxHeight: '120px', objectFit: 'contain' }} />
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Scanned result - payment form */}
                      <div className="rounded-sm-panel p-4" style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="rounded-sm-panel" style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'rgba(14,124,110,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <QrCode size={18} color="#0e7c6e" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{scannedData.name || 'Scanned Recipient'}</p>
                            <p className="text-xs font-mono" style={{ fontFamily: "'Space Mono', monospace", color: 'var(--color-text-muted)' }}>
                              {scannedData.formatted}
                            </p>
                          </div>
                        </div>

                        {/* Payment method selection */}
                        <div className="space-y-3" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <input
                                type="radio"
                                id="payment-method-bank"
                                checked={paymentMethodType === 'bank-transfer'}
                                onChange={(e) => setPaymentMethodType('bank-transfer')}
                                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="payment-method-bank" className="text-sm font-medium text-gray-700">
                                Bank Transfer (IBAN/RAAS)
                              </label>
                              <p className="text-xs text-gray-500">
                                Send money via bank account using RAAS network
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <input
                                type="radio"
                                id="payment-method-card"
                                checked={paymentMethodType === 'card'}
                                onChange={(e) => setPaymentMethodType('card')}
                                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="payment-method-card" className="text-sm font-medium text-gray-700">
                                Card Payment (PayPak)
                              </label>
                              <p className="text-xs text-gray-500">
                                Pay with credit/debit card using PayPak network
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                          <div>
                            <label style={labelStyle}>Amount (PKR)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                              placeholder="Rs 0.00" className="form-input form-mono-input"
                              style={{ ...inputStyle, fontFamily: "'Space Mono', monospace", fontSize: 22 }}
                              disabled={paymentSent} />
                          </div>

                          <div>
                            <label style={labelStyle}>Note (optional)</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                              placeholder="What's it for?" className="form-input"
                              style={inputStyle} disabled={paymentSent} />
                          </div>

                          <button onClick={handleScanPay}
                            className="w-full py-3 px-4 text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors"
                            style={{
                              borderRadius: '10px',
                              backgroundColor: paymentSent ? 'var(--color-teal)' :
                                paymentMethodType === 'card' ? '#1a1f3a' : '#1a1f3a',
                              border: 'none',
                              fontFamily: "'Sora', sans-serif"
                            }}
                            disabled={paymentSent ||
                              (paymentMethodType === 'bank-transfer' && (!amount || parseFloat(amount) <= 0)) ||
                              (paymentMethodType === 'card' && (!amount || parseFloat(amount) <= 0))
                            }
                            onMouseEnter={e => !paymentSent && (e.target.style.backgroundColor = '#262d52')}
                            onMouseLeave={e => !paymentSent && (e.target.style.backgroundColor = '#1a1f3a')}>
                            {paymentSent ? (
                              <>Payment Sent!</>
                            ) : (
                              <>
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                                  <path d="M1.5 7.5H13.5M13.5 7.5L9 3M13.5 7.5L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {paymentMethodType === 'card' ? 'Pay Card' : 'Pay Rs ' + (amount || '0.00')}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QRPaymentPanel;
