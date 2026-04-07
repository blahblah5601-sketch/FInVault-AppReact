// src/components/panels/AddFundsPanel.jsx
import { useState } from 'react';

const AddFundsPanel = ({ isOpen, onClose, onSuccess, showToast }) => {
  const [activeTab, setActiveTab] = useState('from-card');
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
    showToast('Tokenization note: Card details would be sent to payment gateway for processing.');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose(); onSuccess();
    } catch (error) { console.error('Error processing card payment:', error); showToast('Failed to process card payment.'); }
  };

  const handleAddFundsFromBankTransfer = async () => {
    if (!sourceIBAN) { showToast('Please enter source IBAN'); return; }
    if (!validateIBAN(sourceIBAN)) { showToast('Please enter a valid IBAN'); return; }
    if (!amount || parseFloat(amount) <= 0) { showToast('Please enter a valid amount'); return; }
    if (!referenceNumber) { showToast('Please enter a reference number'); return; }
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose(); onSuccess();
    } catch (error) { console.error('Error processing bank transfer:', error); showToast('Failed to process bank transfer.'); }
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

              {/* Quick Fund Options — reference style grid */}
              {activeTab === 'from-card' ? (
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
