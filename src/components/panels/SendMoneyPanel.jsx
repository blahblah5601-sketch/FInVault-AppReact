// src/components/panels/SendMoneyPanel.jsx
import { createPayment } from '../../api';
import { useState } from 'react';
import { validateIBAN, formatIBAN } from '../../utils/ibanUtils';
import { Search, Users, CreditCard, Phone, Mail } from 'lucide-react';

const SendMoneyPanel = ({ isOpen, onClose, onSuccess }) => {
  const [recipient, setRecipient] = useState(''); // Can be name, IBAN, etc.
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [ibanError, setIbanError] = useState(null);
  const [isValidIBAN, setIsValidIBAN] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Mock beneficiaries data - in a real app this would come from Firestore
  const mockBeneficiaries = [
    { id: '1', name: 'Ali Hassan', iban: 'PK36FNVT0000123456789012' },
    { id: '2', name: 'Fatima Khan', iban: 'PK36HABB0000987654321098' },
    { id: '3', name: 'Ahmed Malik', iban: 'PK36MUCB0000555555555555' }
  ];

  const handleRecipientChange = (e) => {
    const value = e.target.value;
    setRecipient(value);

    // Reset validation when user is typing
    setIbanError(null);
    setIsValidIBAN(false);

    // Search beneficiaries if more than 2 characters
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

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleIBANValidation = () => {
    if (!recipient) {
      setIbanError('Please enter an IBAN');
      setIsValidIBAN(false);
      return;
    }

    const validationResult = validateIBAN(recipient);
    if (validationResult.valid) {
      setIsValidIBAN(true);
      setIbanError(null);
    } else {
      setIsValidIBAN(false);
      setIbanError(validationResult.error || 'Invalid IBAN');
    }
  };

  const handleSelectBeneficiary = (beneficiary) => {
    setRecipient(beneficiary.iban);
    setIsSearching(false);
    setSearchResults([]);
    // Auto-validate the selected IBAN
    handleIBANValidation();
  };

  const handleSendMoney = async () => {
    // Validate inputs
    if (!recipient) {
      alert('Please enter a recipient');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!description) {
      alert('Please enter a description');
      return;
    }

    // Validate IBAN if it looks like an IBAN
    if (recipient.length >= 14 && recipient.toUpperCase().startsWith('PK')) {
      const validationResult = validateIBAN(recipient);
      if (!validationResult.valid) {
        alert(`Invalid IBAN: ${validationResult.error}`);
        return;
      }
    }

    // In a real implementation, we would determine the source account
    // For now, we'll use a mock source account ID
    const sourceAccountId = 'current'; // This would come from the active account

    try {
      const success = await createPayment(
        parseFloat(amount),
        'PKR',
        description,
        'Transfer',
        sourceAccountId,
        recipient,
        'iban', // destinationType
        'bank-transfer' // paymentMethod
      );

      if (success) {
        onClose();
        onSuccess();
      } else {
        alert('Failed to send money. Please try again.');
      }
    } catch (error) {
      console.error('Error sending money:', error);
      alert('An error occurred while sending money.');
    }
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
                <h3 className="text-lg font-semibold">Send Money</h3>
                <button
                  onClick={onClose}
                  className="text-xs btn-danger py-1 px-2 rounded"
                >
                  ×
                </button>
              </div>

              {/* Recipient field */}
              <div className="space-y-3">
                <label className="block text-text-primary mb-2">Recipient</label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipient}
                    onChange={handleRecipientChange}
                    placeholder="Enter name, IBAN, or search beneficiaries"
                    className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                  />
                  {isSearching && (
                    <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
                  )}
                  {!isSearching && recipient && (
                    <div className="absolute right-3 top-3 flex items-center space-x-2">
                      {isValidIBAN ? (
                        <span className="text-green-400">
                          ✓ Valid IBAN
                        </span>
                      ) : (
                        <span className="text-red-400">
                          ✗ Invalid IBAN
                        }
                      )}
                      <button
                        onClick={handleIBANValidation}
                        className="text-xs btn-secondary py-1 px-2 rounded"
                        disabled={!recipient}
                      >
                        Validate
                      </button>
                    </div>
                  )}
                </div>
                {ibanError && (
                  <p className="text-red-500 text-xs mt-1">{ibanError}</p>
                )}
                {isSearching && searchResults.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="font-semibold text-text-primary">Select beneficiary:</p>
                    {searchResults.map(beneficiary => (
                      <div
                        key={beneficiary.id}
                        onClick={() => handleSelectBeneficiary(beneficiary)}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold">{beneficiary.name}</p>
                            <p className="text-xs text-text-secondary">{formatIBAN(beneficiary.iban)}</p>
                          </div>
                          <Users className="h-4 w-4 text-text-secondary" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount field */}
              <div className="space-y-3">
                <label className="block text-text-primary mb-2">Amount (PKR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-text-secondary">Rs</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                  />
                </div>
              </div>

              {/* Description field */}
              <div className="space-y-3">
                <label className="block text-text-primary mb-2">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Enter payment description"
                  className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                />
              </div>

              {/* Send button */}
              <div className="mt-6">
                <button
                  onClick={handleSendMoney}
                  className="w-full btn-primary py-2 px-4 rounded-lg"
                  disabled={!recipient || !amount || parseFloat(amount) <= 0 || !description || !isValidIBAN}
                >
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