// src/components/panels/SendMoneyPanel.jsx
import { createPayment, getAccounts, transferBetweenAccounts, transferToUser, findUserByEmail, findUserByIBAN } from '../../api';
import { createRtpNowPayment, validateBeneficiary } from '../../services/raastService';
import { useState, useEffect } from 'react';
import { validateIBAN, formatIBAN } from '../../utils/ibanUtils';
import { Users, Search, Mail, Phone } from 'lucide-react';
import { auth } from '../../firebase';

const SendMoneyPanel = ({ isOpen, onClose, onSuccess, showToast }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [ibanError, setIbanError] = useState(null);
  const [isValidIBAN, setIsValidIBAN] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [transferType, setTransferType] = useState('iban'); // 'iban', 'account', 'email', or 'user-iban'
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [fromAccountError, setFromAccountError] = useState(null);
  const [toAccountError, setToAccountError] = useState(null);

  const mockBeneficiaries = [
    { id: '1', name: 'Ali Hassan', iban: 'PK36FNVT0000123456789012' },
    { id: '2', name: 'Fatima Khan', iban: 'PK36HABB0000987654321098' },
    { id: '3', name: 'Ahmed Malik', iban: 'PK36MUCB0000555555555555' }
  ];

  const handleRecipientChange = async (e) => {
    const value = e.target.value;
    setRecipient(value);
    setIbanError(null);
    setIsValidIBAN(false);

    // Reset search results for user lookup modes
    if (transferType === 'email' || transferType === 'user-iban') {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    if (value.length >= 2) {
      setIsSearching(true);
      // Search both mock beneficiaries and user accounts
      const ibanMatches = mockBeneficiaries.filter(b =>
        b.name.toLowerCase().includes(value.toLowerCase()) ||
        b.iban.includes(value.replace(/\s/g, '').toUpperCase())
      );

      const accountMatches = accounts.filter(acc =>
        acc.name.toLowerCase().includes(value.toLowerCase()) ||
        acc.ibanNumber?.includes(value.replace(/\s/g, '').toUpperCase()) ||
        acc.accountNumber?.includes(value.replace(/\s/g, ''))
      ).map(acc => ({
        id: acc.id,
        name: acc.name,
        iban: acc.ibanNumber
      }));

      setSearchResults([...ibanMatches, ...accountMatches]);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    // Only validate IBAN for IBAN transfer type
    if (transferType !== 'iban' && transferType !== 'user-iban') {
      setIsValidIBAN(false);
      setIbanError(null);
      return;
    }

    const clean = recipient.replace(/\s/g, '');
    if (clean.length === 24) {
      const result = validateIBAN(clean);
      setIsValidIBAN(result.valid);
      setIbanError(result.valid ? null : result.error);
    } else {
      setIsValidIBAN(false);
      setIbanError(null);
    }
  }, [recipient, transferType]);

  const handleSelectBeneficiary = (beneficiary) => {
    setRecipient(beneficiary.iban);
    setIsSearching(false);
    setSearchResults([]);
    const result = validateIBAN(beneficiary.iban);
    setIsValidIBAN(result.valid);
    setIbanError(result.valid ? null : result.error);
  };

  const loadAccounts = async () => {
    if (!auth.currentUser) return;
    setIsLoadingAccounts(true);
    try {
      const accountsData = await getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
      showToast('Failed to load accounts');
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleFromAccountChange = (e) => {
    setFromAccountId(e.target.value);
    // Reset destination account when source changes
    setToAccountId('');
    setToAccountError(null);
    setFromAccountError(null);
  };

  const handleToAccountChange = (e) => {
    setToAccountId(e.target.value);
    setToAccountError(null);
  };

  useEffect(() => {
    loadAccounts();
  }, [auth.currentUser]); // Reload accounts when auth state changes

  const handleSendMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) { showToast('Please enter a valid amount'); return; }
    if (!description) { showToast('Please enter a description'); return; }

    // Check if this is an internal account transfer (by account selection)
    if (transferType === 'account') {
      // Handle transfer between user's own accounts
      if (!fromAccountId) {
        showToast('Please select a source account');
        return;
      }
      if (!toAccountId) {
        showToast('Please select a destination account');
        return;
      }
      if (fromAccountId === toAccountId) {
        showToast('Source and destination accounts must be different');
        return;
      }

      try {
        const fromAccount = accounts.find(acc => acc.ibanNumber === fromAccountId);
        const toAccount = accounts.find(acc => acc.ibanNumber === toAccountId);

        if (!fromAccount) {
          showToast('Source account not found');
          return;
        }
        if (!toAccount) {
          showToast('Destination account not found');
          return;
        }

        // Use the transferBetweenAccounts function from api
        const transferResult = await transferBetweenAccounts(
          fromAccount.id,
          toAccount.id,
          parseFloat(amount),
          description || `Transfer from ${fromAccount.name} to ${toAccount.name}`
        );

        if (transferResult.success) {
          onClose();
          onSuccess();
          showToast(transferResult.message);
        } else {
          showToast(transferResult.message || 'Internal transfer failed');
        }
        return;
      } catch (error) {
        console.error('Error in internal transfer:', error);
        showToast('Internal transfer failed');
        return;
      }
    }

    // Handle different transfer types
    if (transferType === 'email' || transferType === 'user-iban') {
      // Handle user-to-user transfers
      if (!recipient) { showToast('Please enter recipient identifier'); return; }

      try {
        const identifierType = transferType === 'email' ? 'email' : 'iban';
        const transferResult = await transferToUser(
          recipient,
          parseFloat(amount),
          description || `Transfer to ${recipient}`,
          identifierType
        );

        if (transferResult.success) {
          onClose();
          onSuccess();
          showToast(transferResult.message);
        } else {
          showToast(transferResult.message || 'Transfer failed');
        }
        return;
      } catch (error) {
        console.error('Error in user-to-user transfer:', error);
        showToast('Transfer failed. Please try again.');
        return;
      }
    }

    // For IBAN or other transfers, we need a recipient
    if (!recipient) { showToast('Please enter a recipient'); return; }

    // Validate IBAN if it looks like one
    if (recipient.length >= 14 && recipient.toUpperCase().startsWith('PK')) {
      const validationResult = validateIBAN(recipient);
      if (!validationResult.valid) { showToast(`Invalid IBAN: ${validationResult.error}`); return; }
    }

    try {
      // Handle transfer between user's own accounts
      if (!fromAccountId) {
        showToast('Please select a source account');
        return;
      }
      if (!toAccountId) {
        showToast('Please select a destination account');
        return;
      }
      if (fromAccountId === toAccountId) {
        showToast('Source and destination accounts must be different');
        return;
      }

      try {
        const fromAccount = accounts.find(acc => acc.ibanNumber === fromAccountId);
        const toAccount = accounts.find(acc => acc.ibanNumber === toAccountId);

        if (!fromAccount) {
          showToast('Source account not found');
          return;
        }
        if (!toAccount) {
          showToast('Destination account not found');
          return;
        }

        // Use the transferBetweenAccounts function from api
        const transferResult = await transferBetweenAccounts(
          fromAccount.id,
          toAccount.id,
          parseFloat(amount),
          description || `Transfer from ${fromAccount.name} to ${toAccount.name}`
        );

        if (transferResult.success) {
          onClose();
          onSuccess();
          showToast(transferResult.message);
        } else {
          showToast(transferResult.message || 'Internal transfer failed');
        }
        return;
      } catch (error) {
        console.error('Error in internal transfer:', error);
        showToast('Internal transfer failed');
        return;
      }
    } catch (error) {
      console.error('Error in account transfer handling:', error);
      showToast('An error occurred during transfer processing');
      return;
    }

    // Validate IBAN if it looks like one
    if (recipient.length >= 14 && recipient.toUpperCase().startsWith('PK')) {
      const validationResult = validateIBAN(recipient);
      if (!validationResult.valid) { showToast(`Invalid IBAN: ${validationResult.error}`); return; }
    }

    try {
      // For now, we'll use the existing createPayment function for local transfers
      // In a full implementation, we would use RAAS APIs for interbank transfers
      // and local API for intrabank transfers

      // Check if this is likely an interbank transfer (different bank prefix)
      // For demo purposes, we'll treat all IBAN transfers as potentially interbank
      if (recipient.length >= 14 && recipient.toUpperCase().startsWith('PK')) {
        // Use RAAS API for interbank transfers
        const paymentDetails = {
          merchantDetails: {
            merchantId: 'MERCHANT001', // Placeholder
            subDept: '0001',
            dbaName: 'FinVault User',
            merchantName: 'FinVault User',
            iban: recipient, // The recipient's IBAN
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
            billNo: `FV${Date.now()}`,
            instructedAmount: parseFloat(amount),
            transactionType: '0002' // Interbank transfer
          },
          info: {
            stan: Math.floor(Math.random() * 900000) + 100000,
            rrn: Math.random().toString(36).substring(2, 14)
          }
        };

        const result = await createRtpNowPayment(paymentDetails);

        if (result && result.responseCode === '00') {
          onClose();
          onSuccess();
        } else {
          showToast('Failed to send money: ' + (result?.responseDescription || 'Unknown error'));
        }
      } else {
        // For non-IBAN transfers (phone numbers, etc.), use local API
        const sourceAccountId = 'current';
        const success = await createPayment(
          parseFloat(amount), 'PKR', description, 'Transfer',
          sourceAccountId, recipient, 'iban-or-other', 'bank-transfer'
        );
        if (success) { onClose(); onSuccess(); }
        else showToast('Failed to send money. Please try again.');
      }
    } catch (error) {
      console.error('Error sending money:', error);
      showToast('An error occurred while sending money: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 mb-6">
            <div className="w-12 h-0.5 bg-white/20 rounded mb-4" />
            <div className="rounded-panel p-6 border max-h-[80vh] overflow-y-auto" style={{
              backgroundColor: 'var(--color-panel)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex justify-between items-start mb-5 gap-3">
                <button onClick={onClose} className="px-2 py-1 text-xs rounded-sm-panel transition-colors shrink-0 self-start"
                  style={{ background: 'var(--color-red-accent)', color: 'white', border: 'none', cursor: 'pointer' }}>←</button>
                <h3 className="text-sm font-medium flex-1 text-center" style={{ fontFamily: "'Sora', sans-serif" }}>Send Money</h3>
                <div className="w-10 shrink-0" />
              </div>

              {/* Transfer Type Selector */}
              <div className="flex gap-3 mb-5">
                <label className="flex items-center cursor-pointer text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                  <input type="radio"
                    checked={transferType === 'iban'}
                    onChange={() => setTransferType('iban')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">To External Account (IBAN)</span>
                </label>
                <label className="flex items-center cursor-pointer text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                  <input type="radio"
                    checked={transferType === 'account'}
                    onChange={() => setTransferType('account')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">To My Accounts</span>
                </label>
                <label className="flex items-center cursor-pointer text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                  <input type="radio"
                    checked={transferType === 'email'}
                    onChange={() => setTransferType('email')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">To FinVault User (Email)</span>
                </label>
                <label className="flex items-center cursor-pointer text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                  <input type="radio"
                    checked={transferType === 'user-iban'}
                    onChange={() => setTransferType('user-iban')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">To FinVault User (IBAN)</span>
                </label>
              </div>

              {/* Account Selection (when transferring to my accounts) */}
              {transferType === 'account' && (
                <>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>From Account</p>
                  <select
                    value={fromAccountId}
                    onChange={handleFromAccountChange}
                    className="form-input w-full"
                    style={{ borderRadius: '10px', marginBottom: 16 }}
                    disabled={isLoadingAccounts}
                  >
                    <option value="">Select source account</option>
                    {accounts.map(account => {
                      const accountType = account.accountLevel === 'main' ? 'Main' : 'Sub';
                      let optionText = `${account.name} (${accountType} Account)`;

                      if (account.ibanNumber) {
                        optionText += ` (PK ${account.ibanNumber.substring(0, 4)} ${formatIBAN(account.ibanNumber)})`;
                      }

                      if (account.balance !== undefined) {
                        optionText += ` - Balance: Rs ${account.balance.toLocaleString()}`;
                      }

                      return (
                        <option key={account.id} value={account.ibanNumber}>
                          {optionText}
                        </option>
                      );
                    })}
                  </select>
                  {fromAccountError && <p className="text-red-500 text-xs mt-1">{fromAccountError}</p>}

                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>To Account</p>
                  <select
                    value={toAccountId}
                    onChange={handleToAccountChange}
                    className="form-input w-full"
                    style={{ borderRadius: '10px', marginBottom: 16 }}
                    disabled={isLoadingAccounts || !fromAccountId}
                  >
                    <option value="">Select destination account</option>
                    {accounts.map(account => {
                      if (account.ibanNumber === fromAccountId) {
                        return null; // Skip the source account
                      }

                      const accountType = account.accountLevel === 'main' ? 'Main' : 'Sub';
                      const ibanInfo = account.ibanNumber
                        ? ` (PK ${account.ibanNumber.substring(0, 4)} ${formatIBAN(account.ibanNumber)})`
                        : '';
                      const balanceInfo = account.balance !== undefined
                        ? ` - Balance: Rs ${account.balance.toLocaleString()}`
                        : '';

                      return (
                        <option key={account.id} value={account.ibanNumber}>
                          {account.name} ({accountType} Account){ibanInfo}{balanceInfo}
                        </option>
                      );
                    }).filter(Boolean)} {/* Filter out null values */}
                  </select>
                  {toAccountError && <p className="text-red-500 text-xs mt-1">{toAccountError}</p>}
                </>
              )}

              {transferType !== 'account' && (
                <>
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
                </>
              )}

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
                  disabled={
                    transferType === 'account'
                      ? (!fromAccountId || !toAccountId || !amount || parseFloat(amount) <= 0 || !description)
                      : (!recipient || !amount || parseFloat(amount) <= 0 || !description)
                  }
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