// src/components/panels/SendMoneyPanel.jsx
import { createPayment } from '../../api';
import { useState, useEffect } from 'react';
import { validateIBAN, formatIBAN } from '../../utils/ibanUtils';
import { Users } from 'lucide-react';

const SendMoneyPanel = ({ isOpen, onClose, onSuccess, showToast }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [ibanError, setIbanError] = useState(null);
  const [isValidIBAN, setIsValidIBAN] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const mockBeneficiaries = [
    { id: '1', name: 'Ali Hassan', iban: 'PK36FNVT0000123456789012' },
    { id: '2', name: 'Fatima Khan', iban: 'PK36HABB0000987654321098' },
    { id: '3', name: 'Ahmed Malik', iban: 'PK36MUCB0000555555555555' }
  ];

  const handleRecipientChange = (e) => {
    const value = e.target.value;
    setRecipient(value);
    setIbanError(null);
    setIsValidIBAN(false);
    if (value.length >= 2) {
      setIsSearching(true);
      const results = mockBeneficiaries.filter(b =>
        b.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const clean = recipient.replace(/\s/g, '');
    if (clean.length === 24) {
      const result = validateIBAN(clean);
      setIsValidIBAN(result.valid);
      setIbanError(result.valid ? null : result.error);
    } else {
      setIsValidIBAN(false);
      setIbanError(null);
    }
  }, [recipient]);

  const handleSelectBeneficiary = (beneficiary) => {
    setRecipient(beneficiary.iban);
    setIsSearching(false);
    setSearchResults([]);
    const result = validateIBAN(beneficiary.iban);
    setIsValidIBAN(result.valid);
    setIbanError(result.valid ? null : result.error);
  };

  const handleSendMoney = async () => {
    if (!recipient) { showToast('Please enter a recipient'); return; }
    if (!amount || parseFloat(amount) <= 0) { showToast('Please enter a valid amount'); return; }
    if (!description) { showToast('Please enter a description'); return; }
    if (recipient.length >= 14 && recipient.toUpperCase().startsWith('PK')) {
      const validationResult = validateIBAN(recipient);
      if (!validationResult.valid) { showToast(`Invalid IBAN: ${validationResult.error}`); return; }
    }
    const sourceAccountId = 'current';
    try {
      const success = await createPayment(
        parseFloat(amount), 'PKR', description, 'Transfer',
        sourceAccountId, recipient, 'iban', 'bank-transfer'
      );
      if (success) { onClose(); onSuccess(); }
      else showToast('Failed to send money. Please try again.');
    } catch (error) {
      console.error('Error sending money:', error);
      showToast('An error occurred while sending money.');
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 mb-6">
            <div className="w-12 h-0.5 bg-white/20 rounded mb-4" />
            <div className="rounded-panel p-6 border" style={{
              backgroundColor: 'var(--color-panel)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex justify-between items-start mb-5 gap-3">
                <button onClick={onClose} className="px-2 py-1 text-xs rounded-sm-panel transition-colors shrink-0 self-start"
                  style={{ background: 'var(--color-red-accent)', color: 'white', border: 'none', cursor: 'pointer' }}>←</button>
                <h3 className="text-sm font-medium flex-1 text-center" style={{ fontFamily: "'Sora', sans-serif" }}>Send Money</h3>
                <div className="w-10 shrink-0" />
              </div>

              {/* Recent recipients */}
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Recent recipients</p>
              <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
                {mockBeneficiaries.map(b => (
                  <div key={b.id} className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => handleSelectBeneficiary(b)}>
                    <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-xs font-semibold border-2 border-transparent transition-colors"
                      style={{ background: `${recipient === b.iban ? 'var(--color-gold)' : 'rgba(255,255,255,0.06)'}`,
                        borderColor: recipient === b.iban ? 'var(--color-gold)' : 'transparent',
                        color: 'var(--color-text-primary)'
                      }}>
                      {b.name.substring(0, 2).toUpperCase()}
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{b.name.split(' ')[0]}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                <div>
                  <label className="block text-[12px] mb-1 tracking-[0.3px]" style={{ color: 'var(--color-text-muted)', fontFamily: "'Sora', sans-serif" }}>
                    Recipient name or account
                  </label>
                  <input type="text" value={recipient} onChange={handleRecipientChange}
                    placeholder="Search name, phone, or account #"
                    className="form-input w-full" style={{ borderRadius: '10px' }} />
                  {ibanError && <p className="text-red-500 text-xs mt-1">{ibanError}</p>}
                </div>
                <div>
                  <label className="block text-[12px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Amount (PKR)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="Rs 0.00" className="form-input w-full form-mono-input" style={{ borderRadius: '10px', fontSize: 22 }} />
                </div>
                <div>
                  <label className="block text-[12px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Note (optional)</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="What's it for?" className="form-input w-full" style={{ borderRadius: '10px' }} />
                </div>

                <button onClick={handleSendMoney}
                  className="w-full py-3 px-4 text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors"
                  style={{ borderRadius: '10px', backgroundColor: '#1a1f3a', border: 'none', fontFamily: "'Sora', sans-serif" }}
                  disabled={!recipient || !amount || parseFloat(amount) <= 0 || !description}
                  onMouseEnter={e => e.target.style.backgroundColor = '#262d52'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#1a1f3a'}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M1.5 7.5H13.5M13.5 7.5L9 3M13.5 7.5L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Send Money
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SendMoneyPanel;