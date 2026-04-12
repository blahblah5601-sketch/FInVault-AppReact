// src/components/panels/NFCPaymentPanel.jsx
import { createPayment } from '../../api';
import { useState } from 'react';
import { CreditCard, Check } from 'lucide-react';

const NFCPaymentPanel = ({ isOpen, onClose, onSuccess, showToast }) => {
  const [nfcState, setNfcState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'success'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);
  const [showCardPicker, setShowCardPicker] = useState(false);

  const mockCards = [
    { id: 'c1', label: 'Visa Platinum', color: '#1a1f3a', net: '\u2022\u2022\u2022\u2022 4821', expiry: '09/28', type: 'VISA' },
    { id: 'c2', label: 'Mastercard Gold', color: '#2c3550', net: '\u2022\u2022\u2022\u2022 3317', expiry: '03/27', type: 'MASTERCARD' },
    { id: 'c3', label: 'Amex Black', color: '#1c1c1c', net: '\u2022\u2022\u2022\u2022 9902', expiry: '11/29', type: 'AMEX' },
  ];

  const activeCard = mockCards[selectedCardIdx];

  const handleNFCTap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount');
      return;
    }
    if (!description) {
      showToast('Please enter a description');
      return;
    }
    if (!activeCard) {
      showToast('Please select a card');
      return;
    }

    setNfcState('listening');
    // Simulate NFC tap detection
    setTimeout(() => {
      setNfcState('processing');
      setTimeout(async () => {
        try {
          // For card payments, we'll use the existing createPayment function for now
          // TODO: Replace with actual card payment API integration (e.g., SafePay sandbox)
          const success = await createPayment(
            parseFloat(amount), 'PKR', description, 'NFC Payment',
            activeCard?.id || 'default', 'nfc-tap'
          );
          if (success) {
            setNfcState('success');
            setTimeout(() => {
              onClose();
              onSuccess();
            }, 1500);
          } else {
            showToast('Failed to process NFC payment.');
            setNfcState('idle');
          }
        } catch (error) {
          console.error('Error processing NFC payment:', error);
          showToast('Failed to process NFC payment.');
          setNfcState('idle');
        }
      }, 2000);
    }, 2500);
  };

  const resetState = () => {
    setNfcState('idle');
    setAmount('');
    setDescription('');
    setShowCardPicker(false);
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
      {/* Keyframe animation for NFC pulse rings */}
      <style>{`
        @keyframes nfcPulse1 {
          0% { opacity: 0.8; transform: scale(0.8); }
          100% { opacity: 0; transform: scale(1.2); }
        }
        @keyframes nfcPulse2 {
          0% { opacity: 0.6; transform: scale(0.85); }
          100% { opacity: 0; transform: scale(1.3); }
        }
      `}</style>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm" onClick={handleClose}>
          <div className="relative w-full max-w-lg mx-4 mb-6" onClick={e => e.stopPropagation()}>
            {/* Drag handle */}
            <div className="w-12 h-0.5 bg-white/20 rounded mb-4" />

            {/* Panel content matching reference design */}
            <div className="rounded-panel p-6 border max-h-[80vh] overflow-y-auto" style={{
              backgroundColor: 'var(--color-panel)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex justify-between items-start mb-5 gap-3">
                <button onClick={handleClose} className="px-2 py-1 text-xs rounded-sm-panel transition-colors shrink-0 self-start"
                  style={{ background: 'var(--color-red-accent)', color: 'white', border: 'none', cursor: 'pointer' }}>←</button>
                <h3 className="text-sm font-medium flex-1 text-center" style={{ fontFamily: "'Sora', sans-serif" }}>NFC Payment</h3>
                <div className="w-10 shrink-0" />
              </div>

              {/* NFC Hero - gradient dark card like reference nfc-hero */}
              <div className="rounded-panel p-5 mb-5" style={{
                background: 'linear-gradient(135deg, var(--color-accent, #1a1f3a) 0%, #0d0f1a 100%)'
              }}>
                {/* Mini card display - tap to change */}
                <div style={{
                  background: activeCard?.color || '#1a1f3a',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)'
                }} onClick={() => setShowCardPicker(true)}>
                  {/* Decorative circles like reference vc-deco */}
                  <div style={{
                    position: 'absolute', width: '80px', height: '80px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)', top: '-30px', right: '-15px'
                  }}></div>
                  <div style={{
                    position: 'absolute', width: '50px', height: '50px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)', bottom: '-15px', left: '15px'
                  }}></div>

                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '14px', letterSpacing: '1px' }}>
                    TAP TO CHANGE CARD
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>
                    {activeCard?.net}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{activeCard?.label}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace" }}>
                      EXP {activeCard?.expiry}
                    </div>
                  </div>
                </div>

                {/* NFC Status Ring matching reference design */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  {/* Status ring container */}
                  {nfcState === 'idle' && (
                    <div style={{
                      background: 'rgba(201,168,76,0.12)',
                      borderRadius: '50%',
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      flexShrink: 0
                    }}>
                      {/* Pulse ring 1 */}
                      <div style={{
                        position: 'absolute',
                        border: '2px solid var(--color-gold)',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        animation: 'nfcPulse1 2s ease-out infinite',
                        opacity: 0.6
                      }}></div>
                      {/* Pulse ring 2 */}
                      <div style={{
                        position: 'absolute',
                        border: '1.5px solid var(--color-gold)',
                        borderRadius: '50%',
                        width: '100px',
                        height: '100px',
                        animation: 'nfcPulse2 2s ease-out infinite 0.5s',
                        opacity: 0.3
                      }}></div>
                      {/* NFC icon */}
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <path d="M7 14c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M3 14C3 7.92 7.92 3 14 3s11 4.92 11 11-4.92 11-11 11" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
                      </svg>
                    </div>
                  )}
                  {nfcState === 'listening' && (
                    <div style={{
                      background: 'rgba(201,168,76,0.2)',
                      borderRadius: '50%',
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="6" stroke="#c9a84c" strokeWidth="2" opacity="0.5">
                          <animate attributeName="r" dur="1.2s" repeatCount="indefinite" values="4;10;4"/>
                          <animate attributeName="opacity" dur="1.2s" repeatCount="indefinite" values="0.8;0.2;0.8"/>
                        </circle>
                        <path d="M7 14c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )}
                  {nfcState === 'processing' && (
                    <div style={{
                      background: 'rgba(201,168,76,0.15)',
                      borderRadius: '50%',
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="8" stroke="#c9a84c" strokeWidth="2" strokeDasharray="40" strokeDashoffset="40">
                          <animate attributeName="stroke-dashoffset" dur="1.5s" repeatCount="indefinite" values="40;0"/>
                        </circle>
                      </svg>
                    </div>
                  )}
                  {nfcState === 'success' && (
                    <div style={{
                      background: 'rgba(14,124,110,0.2)',
                      borderRadius: '50%',
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Check size={28} color="#0e7c6e" strokeWidth={2.5} />
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'white', marginBottom: '2px' }}>
                      {nfcState === 'idle' && 'Ready to pay'}
                      {nfcState === 'listening' && 'Listening...'}
                      {nfcState === 'processing' && 'Processing...'}
                      {nfcState === 'success' && 'Payment Sent!'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {nfcState === 'idle' && 'Hold your phone near the terminal'}
                      {nfcState === 'listening' && 'Tap your device now'}
                      {nfcState === 'processing' && 'Confirming payment'}
                      {nfcState === 'success' && 'Transaction complete'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment form - matching reference style */}
              <div className="space-y-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                <div>
                  <label style={labelStyle}>Amount (PKR)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="Rs 0.00" className="form-input form-mono-input"
                    style={{ ...inputStyle, fontFamily: "'Space Mono', monospace", fontSize: 22 }}
                    disabled={nfcState !== 'idle'} />
                </div>

                <div>
                  <label style={labelStyle}>Note (optional)</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="What's it for?" className="form-input"
                    style={inputStyle}
                    disabled={nfcState !== 'idle'} />
                </div>

                <button onClick={handleNFCTap}
                  className="w-full py-3 px-4 text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors"
                  style={{
                    borderRadius: '10px',
                    backgroundColor: nfcState === 'idle' ? '#1a1f3a' :
                      nfcState === 'success' ? 'var(--color-teal)' : 'var(--color-gold)',
                    border: 'none',
                    fontFamily: "'Sora', sans-serif",
                    opacity: (nfcState === 'processing') ? 0.7 : 1
                  }}
                  disabled={nfcState === 'processing'}
                  onMouseEnter={e => nfcState === 'idle' && (e.target.style.backgroundColor = '#262d52')}
                  onMouseLeave={e => nfcState === 'idle' && (e.target.style.backgroundColor = '#1a1f3a')}>
                  {nfcState === 'idle' && (
                    <>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                        <path d="M1 8c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      Tap to Pay
                    </>
                  )}
                  {nfcState === 'listening' && <>
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M1 8c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    Listening for tap...
                  </>}
                  {nfcState === 'processing' && <>Processing...</>}
                  {nfcState === 'success' && <>Payment Successful!</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Picker Overlay matching reference picker-overlay */}
      {showCardPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCardPicker(false)}>
          <div className="rounded-panel p-5 w-full max-w-sm mx-4" style={{
            backgroundColor: 'var(--color-panel)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
            borderStyle: 'solid'
          }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-medium" style={{ fontFamily: "'Sora', sans-serif" }}>Choose card for this payment</h4>
              <button onClick={() => setShowCardPicker(false)}
                style={{ background: 'var(--color-red-accent)', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>x</button>
            </div>
            <div className="space-y-3">
              {mockCards.map((card, idx) => (
                <div key={card.id}
                  className="flex items-center gap-3 p-3 rounded-panel cursor-pointer transition-colors"
                  style={{
                    border: selectedCardIdx === idx ? '2px solid var(--color-gold)' : '1px solid var(--color-border)',
                    backgroundColor: selectedCardIdx === idx ? 'rgba(201,168,76,0.1)' : 'var(--color-bg)'
                  }}
                  onClick={() => { setSelectedCardIdx(idx); setShowCardPicker(false); }}>
                  {/* Mini card preview */}
                  <div style={{
                    width: '48px',
                    height: '32px',
                    borderRadius: '6px',
                    background: card.color,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute', width: '20px', height: '20px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.06)', top: '-8px', right: '-5px'
                    }}></div>
                    <CreditCard size={20} color="rgba(255,255,255,0.4)" />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '13px', fontWeight: 500 }}>{card.label}</p>
                    <p style={{ fontSize: '11px', fontFamily: "'Space Mono', monospace", color: 'var(--color-text-muted)' }}>{card.net}</p>
                  </div>
                  {selectedCardIdx === idx && (
                    <div style={{
                      fontSize: '9px', padding: '2px 8px', borderRadius: '99px',
                      background: 'var(--color-accent, #1a1f3a)', color: 'var(--gold2, #f0d080)',
                      fontWeight: 500
                    }}>Default</div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => setShowCardPicker(false)}
              className="w-full mt-3 py-2.5 text-xs font-medium transition-colors"
              style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontFamily: "'Sora', sans-serif", borderRadius: '10px', cursor: 'pointer' }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--color-gold)'; e.target.style.color = 'var(--color-text-primary)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.color = 'var(--color-text-muted)'; }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NFCPaymentPanel;
