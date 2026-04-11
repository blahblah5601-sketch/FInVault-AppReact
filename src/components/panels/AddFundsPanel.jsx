// src/components/panels/AddFundsPanel.jsx
import { useState } from 'react';
import { createRtpNowPayment, validateBeneficiary } from '../../services/raastService';
import { processPayPakPurchase } from '../../services/paypakService';

const AddFundsPanel = ({ isOpen, onClose, onSuccess, showToast }) => {
  const [paymentMethodType, setPaymentMethodType] = useState('card'); // 'card' or 'bank-transfer'
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCVV] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceIBAN, setSourceIBAN] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [ibanError, setIbanError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanCard = () => {
    setIsScanning(true);
    setTimeout(() => {
      setCardNumber('4242 4242 4242 4242');
      setExpiryDate('12/25');
      setCardHolderName('JOHN DOE');
      setIsScanning(false);
    }, 2000);
  };

  const handleTapCard = () => {
    showToast('NFC functionality would be implemented here in Capacitor');
    setCardNumber('4242 4242 4242 4242');
    setExpiryDate('12/25');
    setCardHolderName('JOHN DOE');
  };

  const validateIBAN = (iban) => {
    const cleanIban = iban.replace(/\s+/g, '').toUpperCase();
    return cleanIban.length === 24 && cleanIban.startsWith('PK');
  };

  const handleAddFundsFromCard = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardHolderName) { showToast('Please fill in all card details'); return; }
    if (!amount || parseFloat(amount) <= 0) { showToast('Please enter a valid amount'); return; }

    try {
      // Prepare payment data for PayPak API
      // Remove spaces from card number and format as required
      const cleanCardNumber = cardNumber.replace(/\s/g, '');

      const paymentData = {
        // Based on PayPak ECommerce Purchase API specification
        TransactionAmount: amount.padStart(12, '0'), // 12 digits with leading zeros
        PersonalIdentificationNumber: '000000000000', // PIN - for now using placeholder as this is add funds
        PosConditionCode: '000000000000', // Position condition code
        ReservedforNationalUse6: '000000000000', // Reserved for national use
        TrackData2: cleanCardNumber, // Track data 2 (card number)
        TransactionDescription: 'FinVault Add Funds', // Transaction description
        TransmissionDateAndTime: new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 10), // MMDDhhmmss format
        STAN: Math.floor(Math.random() * 900000) + 100000, // System Trace Audit Number (6 digits)
        Time: new Date().toTimeString().slice(0, 6).replace(/:/g, ''), // hhmmss format
        Date: new Date().toISOString().slice(5, 7) + new Date().toISOString().slice(8, 10), // MMDD format
        MerchantType: '0000', // Merchant type (to be configured)
        AdditionalEMVInformation: '', // Additional EMV information
        RRN: Math.random().toString(36).substring(2, 10).toUpperCase(), // Retrieval Reference Number
        AuthorizationIdentificationResponse: '000000', // Authorization identification response
        CardAcceptorTerminalId: 'TERMINAL01', // Terminal ID
        CardAcceptorIdCode: 'MERCHANT001', // Merchant ID
        CardAcceptorNameLocation: {
          // Card acceptor name and location
          Location: 'FinVault Wallet',
          City: 'Islamabad',
          State: 'ICT',
          ZipCode: '44000',
          AgentName: 'FinVault',
          ADCLiteral: 'Internet',
          AgentCity: 'Islamabad',
          BankName: 'FinVault Bank',
          Country: 'PK'
        },
        AdditionalResponseData: '',
        AmountTransactionFee: '0', // Transaction fee
        CurrencyCodeTransaction: '586', // PKR currency code
        AccountIdentification1: '', // Account number from
        AcquiringInstitutionIDCode: '00000000000', // Acquiring institution ID
        PANSequenceNumber: '00000000000', // PAN sequence number
        PAN: cleanCardNumber, // Primary Account Number
        AdditionalDataNational: '', // Additional national data
        PosEntryMode: '000', // Point of service entry mode
        AdditionalAmounts: '', // Additional amounts
        DateExpiration: expiryDate.replace('/', ''), // Date expiration (YYMM format from MM/YY)
        DateSettlement: '', // Date settlement
        EMVData: '', // EMV data
        ForwardingInstitutionIdentificationCode: '', // Forwarding institution ID
        CardholderAuthenticationInformation: '', // Cardholder authentication info
        SenderName: cardHolderName, // Sender name
        NetworkInstitutionIdentifier: '', // Network institution ID
        RecordData: {
          CAVVData: '', // CAVV data
          ECI: '' // ECI indicator
        }
      };

      // Process the payment via PayPak API
      const result = await processPayPakPurchase(paymentData);

      if (result && result.ResponseCode === '00') {
        showToast('Funds added successfully!');
        onClose(); onSuccess();
      } else {
        showToast('Failed to add funds: ' + (result?.ResponseDetail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error processing card payment:', error);
      showToast('Failed to process card payment: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAddFundsFromBankTransfer = async () => {
    if (!sourceIBAN) { showToast('Please enter source IBAN'); return; }
    if (!validateIBAN(sourceIBAN)) { showToast('Please enter a valid IBAN'); return; }
    if (!amount || parseFloat(amount) <= 0) { showToast('Please enter a valid amount'); return; }
    if (!referenceNumber) { showToast('Please enter a reference number'); return; }

    try {
      // For adding funds via bank transfer, we would typically:
      // 1. Validate the source IBAN (already done)
      // 2. Initiate a transfer from the external bank to the user's FinVault account
      // 3. This would usually involve the external bank's API, not RAAS directly
      // 4. For demo purposes, we'll simulate using RAAS as if we're receiving money

      // In a real implementation, adding funds would involve:
      // - User initiating transfer from their external bank app to their FinVault IBAN
      // - Or using a payment gateway/API to pull funds from external account

      // For this simulation, we'll treat it as receiving a payment via RAAS
      const paymentDetails = {
        merchantDetails: {
          merchantId: 'MERCHANT001', // FinVault merchant ID
          subDept: '0001',
          dbaName: 'FinVault Wallet',
          merchantName: 'FinVault Wallet',
          iban: sourceIBAN, // The source IBAN (where money is coming FROM)
          bankBic: 'UNKNOWN', // Would extract from IBAN
          merchantCategoryCode: '0000',
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
          rtpId: Math.random().toString(36).substring(2, 15),
          billNo: `FV-ADD${Date.now()}`,
          instructedAmount: parseFloat(amount),
          transactionType: '0003' // Funds addition / wallet load
        },
        info: {
          stan: Math.floor(Math.random() * 900000) + 100000,
          rrn: Math.random().toString(36).substring(2, 14)
        }
      };

      const result = await createRtpNowPayment(paymentDetails);

      if (result && result.responseCode === '00') {
        onClose(); onSuccess();
      } else {
        showToast('Failed to add funds: ' + (result?.responseDescription || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error processing bank transfer:', error);
      showToast('Failed to process bank transfer: ' + (error.message || 'Unknown error'));
    }
  };

  const inputStyle = {
    borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg)',
    color: 'var(--color-text-primary)', fontFamily: "'Sora', sans-serif", padding: '10px 12px',
    fontSize: '14px', width: '100%', outline: 'none'
  };

  const labelStyle = { fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block', letterSpacing: '0.3px' };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 mb-6">
            <div className="w-12 h-0.5 bg-white/20 rounded mb-4" />
            <div className="rounded-panel p-6 border" style={{
              backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)'
            }}>
              <div className="flex justify-between items-start mb-5 gap-3">
                <button onClick={onClose} className="px-2 py-1 text-xs rounded-sm-panel transition-colors shrink-0 self-start"
                  style={{ background: 'var(--color-red-accent)', color: 'white', border: 'none', cursor: 'pointer' }}>←</button>
                <h3 className="text-lg font-medium flex-1 text-center" style={{ fontFamily: "'Sora', sans-serif" }}>Add Funds</h3>
                <div className="w-10 shrink-0" />
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio"
                      checked={paymentMethodType === 'card'}
                      onChange={() => setPaymentMethodType('card')}
                      className="h-4 w-4 text-primary-600"
                    />
                    <span className="ml-2 text-sm font-medium">Card Payment</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio"
                      checked={paymentMethodType === 'bank-transfer'}
                      onChange={() => setPaymentMethodType('bank-transfer')}
                      className="h-4 w-4 text-primary-600"
                    />
                    <span className="ml-2 text-sm font-medium">Bank Transfer</span>
                  </label>
                </div>
              </div>

              {/* Quick Fund Options — reference style grid */}
              {paymentMethodType === 'card' ? (
                <div className="space-y-5">
                  {/* Card/NFC/QR Options Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-panel p-4 cursor-pointer transition-colors border"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                      onClick={() => {}}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                      <div className="w-9 h-9 rounded-sm-panel flex items-center justify-center mb-3"
                        style={{ backgroundColor: 'var(--color-teal2)' }}>
                        <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
                          <rect x="2" y="5" width="14" height="10" rx="1.5" stroke="#0e7c6e" strokeWidth="1.4"/>
                          <path d="M5 5V4a3 3 0 016 0v1" stroke="#0e7c6e" strokeWidth="1.4" strokeLinecap="round"/>
                          <path d="M2 9h14" stroke="#0e7c6e" strokeWidth="1.4"/>
                        </svg>
                      </div>
                      <p className="text-xs font-medium">Debit / Credit Card</p>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Instant · Up to Rs 10,000</p>
                    </div>
                    <div className="rounded-panel p-4 cursor-pointer transition-colors border"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                      <div className="w-9 h-9 rounded-sm-panel flex items-center justify-center mb-3"
                        style={{ backgroundColor: 'var(--color-blue2)' }}>
                        <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
                          <path d="M3 9C3 5.69 5.69 3 9 3s6 2.69 6 6-2.69 6-6 6" stroke="#2056d4" strokeWidth="1.4" strokeLinecap="round"/>
                          <path d="M9 6v3l2 2" stroke="#2056d4" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <p className="text-xs font-medium">Bank Transfer</p>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>1–2 days · No limit</p>
                    </div>
                    <div className="rounded-panel p-4 cursor-pointer transition-colors border"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                      <div className="w-9 h-9 rounded-sm-panel flex items-center justify-center mb-3"
                        style={{ backgroundColor: '#fef3d8' }}>
                        <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
                          <rect x="2" y="2" width="5" height="5" rx="1" stroke="#c9a84c" strokeWidth="1.4"/>
                          <rect x="11" y="2" width="5" height="5" rx="1" stroke="#c9a84c" strokeWidth="1.4"/>
                          <rect x="2" y="11" width="5" height="5" rx="1" stroke="#c9a84c" strokeWidth="1.4"/>
                          <path d="M11 11h1.5M11 14h5M14 11v4" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <p className="text-xs font-medium">Scan QR Code</p>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Instant · Peer transfer</p>
                    </div>
                    <div className="rounded-panel p-4 cursor-pointer transition-colors border"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                      <div className="w-9 h-9 rounded-sm-panel flex items-center justify-center mb-3"
                        style={{ backgroundColor: '#ede8fe' }}>
                        <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
                          <path d="M4 9c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round"/>
                          <path d="M1.5 9C1.5 4.31 5.31.5 10 .5S18.5 4.31 18.5 9" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <p className="text-xs font-medium">NFC Tap</p>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Instant · Near field</p>
                    </div>
                  </div>

                  {/* Card Form */}
                  <div className="space-y-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                    <div>
                      <label style={labelStyle}>Card Number</label>
                      <input type="text" value={cardNumber}
                        onChange={e => {
                          let v = e.target.value.replace(/\s/g, '');
                          if (v.length > 0) v = v.match(/.{1,4}/g).join(' ');
                          setCardNumber(v);
                        }}
                        placeholder="4242 4242 4242 4242" className="form-input" style={{ ...inputStyle, fontFamily: "'Space Mono', monospace" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={labelStyle}>Expiry Date</label>
                        <input type="text" value={expiryDate}
                          onChange={e => {
                            let v = e.target.value;
                            if (v.length === 2 && /^\d{2}$/.test(v)) v = v + '/';
                            if (v.length > 5) v = v.substring(0, 5);
                            setExpiryDate(v);
                          }}
                          placeholder="MM/YY" className="form-input" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>CVV</label>
                        <input type="text" value={cvv}
                          onChange={e => setCVV(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          placeholder="123" className="form-input" style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Name on Card</label>
                      <input type="text" value={cardHolderName}
                        onChange={e => setCardHolderName(e.target.value)}
                        placeholder="JOHN DOE" className="form-input" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Amount (PKR)</label>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        placeholder="Rs 0.00" className="form-input form-mono-input" style={{ ...inputStyle, fontFamily: "'Space Mono', monospace", fontSize: 22 }} />
                    </div>

                    <div className="flex gap-3">
                      <button onClick={handleAddFundsFromCard}
                        className="flex-1 py-[10px] text-sm font-medium text-white transition-colors"
                        style={{ borderRadius: '10px', backgroundColor: '#1a1f3a', border: 'none', fontFamily: "'Sora', sans-serif" }}
                        disabled={!cardNumber || !expiryDate || !cvv || !cardHolderName || !amount || parseFloat(amount) <= 0}
                        onMouseEnter={e => e.target.style.backgroundColor = '#262d52'}
                        onMouseLeave={e => e.target.style.backgroundColor = '#1a1f3a'}>
                        Add from Card
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Bank Transfer Tab */
                <div className="space-y-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                  <div>
                    <label style={labelStyle}>Source IBAN</label>
                    <input type="text" value={sourceIBAN} onChange={e => setSourceIBAN(e.target.value)}
                      placeholder="PK36 FNVT 0000 1234 5678 9012" className="form-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Amount (PKR)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder="Rs 0.00" className="form-input form-mono-input" style={{ ...inputStyle, fontFamily: "'Space Mono', monospace", fontSize: 22 }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Reference Number</label>
                    <input type="text" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)}
                      placeholder="Enter reference number" className="form-input" style={inputStyle} />
                  </div>
                  <button onClick={handleAddFundsFromBankTransfer}
                    className="w-full py-[10px] text-sm font-medium text-white transition-colors"
                    style={{ borderRadius: '10px', backgroundColor: '#1a1f3a', border: 'none', fontFamily: "'Sora', sans-serif" }}
                    disabled={!sourceIBAN || !validateIBAN(sourceIBAN) || !amount || parseFloat(amount) <= 0 || !referenceNumber}
                    onMouseEnter={e => e.target.style.backgroundColor = '#262d52'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#1a1f3a'}>
                    Add from Bank Transfer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddFundsPanel;
