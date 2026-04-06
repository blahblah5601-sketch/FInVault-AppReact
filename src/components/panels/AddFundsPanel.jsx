// src/components/panels/AddFundsPanel.jsx
import { useState } from 'react';

const AddFundsPanel = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('from-card'); // 'from-card' or 'bank-transfer'
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCVV] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceIBAN, setSourceIBAN] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [ibanError, setIbanError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Mock card scanning functionality
  const handleScanCard = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      // In a real app, this would come from the camera/NFC scan
      setCardNumber('4242 4242 4242 4242');
      setExpiryDate('12/25');
      setCardHolderName('JOHN DOE');
      setIsScanning(false);
    }, 2000);
  };

  // Mock NFC tap functionality
  const handleTapCard = () => {
    // In a real Capacitor app, this would trigger NFC plugin
    alert('NFC functionality would be implemented here in Capacitor');
    // Simulate successful read
    setCardNumber('4242 4242 4242 4242');
    setExpiryDate('12/25');
    setCardHolderName('JOHN DOE');
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSourceIBANChange = (e) => {
    setSourceIBAN(e.target.value);
  };

  const handleReferenceNumberChange = (e) => {
    setReferenceNumber(e.target.value);
  };

  const handleCardNumberChange = (e) => {
    // Format card number with spaces every 4 digits
    let value = e.target.value.replace(/\s/g, ''); // Remove all spaces
    if (value.length > 0) {
      value = value.match(/.{1,4}/g).join(' ');
    }
    setCardNumber(value);
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value;
    // Auto-add slash after 2 characters if typing numbers
    if (value.length === 2 && /^\d{2}$/.test(value)) {
      value = value + '/';
    }
    // Limit to 5 characters (MM/YY)
    if (value.length > 5) {
      value = value.substring(0, 5);
    }
    setExpiryDate(value);
  };

  const handleCVVChange = (e) => {
    // Limit to 3 digits and only allow numbers
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) {
      value = value.substring(0, 3);
    }
    setCVV(value);
  };

  const handleCardHolderNameChange = (e) => {
    setCardHolderName(e.target.value);
  };

  const validateIBAN = (iban) => {
    // Simplified IBAN validation for demo
    // In a real app, we would use the validateIBAN function from ibanUtils
    const cleanIban = iban.replace(/\s+/g, '').toUpperCase();
    return cleanIban.length === 24 && cleanIban.startsWith('PK');
  };

  const handleAddFundsFromCard = async () => {
    // Validate card form
    if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
      alert('Please fill in all card details');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Tokenization note: In a real app, we would send card details to a payment gateway
    // and receive a token, never storing actual card details
    alert('Tokenization note: Card details would be sent to payment gateway (e.g. Stripe, 2Checkout) for processing.');

    // Simulate processing delay
    try {
      // In a real implementation, we would call a payment gateway API here
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));

      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error processing card payment:', error);
      alert('Failed to process card payment. Please try again.');
    }
  };

  const handleAddFundsFromBankTransfer = async () => {
    // Validate bank transfer form
    if (!sourceIBAN) {
      alert('Please enter source IBAN');
      return;
    }

    if (!validateIBAN(sourceIBAN)) {
      alert('Please enter a valid IBAN');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!referenceNumber) {
      alert('Please enter a reference number');
      return;
    }

    // Simulate processing delay
    try {
      // In a real implementation, we would initiate a bank transfer here
      await new Promise(resolve => setTimeout(resolve, 1500));

      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error processing bank transfer:', error);
      alert('Failed to process bank transfer. Please try again.');
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
                <h3 className="text-lg font-semibold">Add Funds</h3>
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
                    onClick={() => setActiveTab('from-card')}
                    className={`flex-1 py-3 px-4 text-center font-medium ${
                      activeTab === 'from-card'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    From Card
                  </button>
                  <button
                    onClick={() => setActiveTab('bank-transfer')}
                    className={`flex-1 py-3 px-4 text-center font-medium ${
                      activeTab === 'bank-transfer'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    Bank Transfer
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'from-card' && (
                <>
                  {/* Card Scan/Tap Section */}
                  <div className="mb-6 text-center">
                    {/* Android Capacitor NFC */}
                    <button
                      onClick={handleTapCard}
                      className="w-full mb-4 btn-secondary py-2 px-4 rounded flex items-center justify-center"
                    >
                      {/* In a real Capacitor Android app, this would trigger NFC */}
                      <span className="mr-2">📱</span> Tap Card to Read
                    </button>

                    {/* Camera Scan Section */}
                    <div className="space-y-3">
                      <button
                        onClick={handleScanCard}
                        className="w-full btn-secondary py-2 px-4 rounded flex items-center justify-center"
                        disabled={isScanning}
                      >
                        {(isScanning ? <><span className="mr-2">🔄</span>Scanning</> : <><span className="mr-2">📷</span>Scan Card with Camera</>)}
                      </button>
                      <p className="text-xs text-text-muted mt-2">
                        Hold card to back of phone or use camera to scan card details
                      </p>
                    </div>
                  </div>

                  {/* Card Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-text-primary mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-text-primary mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                          placeholder="MM/YY"
                          className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-text-primary mb-1">CVV</label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={handleCVVChange}
                          placeholder="123"
                          className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-text-primary mb-1">Name on Card</label>
                      <input
                        type="text"
                        value={cardHolderName}
                        onChange={handleCardHolderNameChange}
                        placeholder="JOHN DOE"
                        className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Amount Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-text-primary mb-1">Amount (PKR)</label>
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
                  </div>
                </>
              )}

              {activeTab === 'bank-transfer' && (
                <>
                  {/* Bank Transfer Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-text-primary mb-1">Source IBAN</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={sourceIBAN}
                          onChange={handleSourceIBANChange}
                          placeholder="PK36 FNVT 0000 1234 5678 9012"
                          className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                        />
                        {sourceIBAN && (
                          <button
                            onClick={() => {
                              // In a real app, we would validate the IBAN here
                              const isValid = validateIBAN(sourceIBAN);
                              alert(isValid ? 'Valid IBAN format' : 'Invalid IBAN format');
                            }}
                            className="absolute right-3 top-3 text-xs btn-secondary py-1 px-2 rounded"
                          >
                            Validate
                          </button>
                        )}
                      </div>
                      {ibanError && (
                        <p className="text-red-500 text-xs mt-1">{ibanError}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-text-primary mb-1">Amount (PKR)</label>
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

                    <div className="space-y-2">
                      <label className="block text-text-primary mb-1">Reference Number</label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={handleReferenceNumberChange}
                        placeholder="Enter reference number"
                        className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  onClick={activeTab === 'from-card' ? handleAddFundsFromCard : handleAddFundsFromBankTransfer}
                  className="w-full btn-primary py-2 px-4 rounded-lg"
                  disabled={
                    activeTab === 'from-card'
                      ? !(cardNumber && expiryDate && cvv && cardHolderName && amount && parseFloat(amount) > 0)
                      : !(sourceIBAN && validateIBAN(sourceIBAN) && amount && parseFloat(amount) > 0 && referenceNumber)
                  }
                >
                  {activeTab === 'from-card' ? 'Add Funds from Card' : 'Add Funds from Bank Transfer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddFundsPanel;