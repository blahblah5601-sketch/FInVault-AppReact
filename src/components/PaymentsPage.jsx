// src/components/PaymentsPage.jsx
import { createPayment, createBiller, deleteBiller, createBeneficiary } from '../api';
import { validateBeneficiary, getAccountTitle, createRtpNowPayment, checkPaymentStatus } from '../services/raastService';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import HintTooltip from './HintTooltip.jsx';
import { formatIBAN } from '../utils/ibanUtils';

function PaymentsPage({ showToast, billers, beneficiaries, history, onSendMoney, onAddFunds, onQRPayment, onNFCPayment, setActivePage }) {
  const [isAddBillerModalOpen, setIsAddBillerModalOpen] = useState(false);
  const [isAddBeneficiaryModalOpen, setIsAddBeneficiaryModalOpen] = useState(false);
  const [billersState, setBillersState] = useState(billers || []);
  const [beneficiariesState, setBeneficiariesState] = useState(beneficiaries || []);

  // Controlled state for biller form
  const [billerName, setBillerName] = useState('');
  const [billerCategory, setBillerCategory] = useState('');
  const [billerAccountRef, setBillerAccountRef] = useState('');
  const [billerLastAmount, setBillerLastAmount] = useState('');

  // Controlled state for beneficiary form
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryNickname, setBeneficiaryNickname] = useState('');
  const [beneficiaryType, setBeneficiaryType] = useState('');
  const [beneficiaryValue, setBeneficiaryValue] = useState('');

  // Sync billers from props when they update
  useEffect(() => {
    setBillersState(billers || []);
  }, [billers]);

  // Sync beneficiaries from props when they update
  useEffect(() => {
    setBeneficiariesState(beneficiaries || []);
  }, [beneficiaries]);

  // Computed recent payments (filtered and sliced from history)
  const recentPayments = (history || [])
    .filter(h => h.type === 'Payment Initiated')
    .slice(0, 10);

  // In a real implementation, we would fetch these from Firestore
  // For now, we'll use mock data to demonstrate the structure

  const handleAddBiller = async () => {
    try {
      // Optional: Validate the account reference using RAAS API if it's an IBAN
      // For now, we'll just create the biller locally since biller validation might need different API endpoints
      const success = await createBiller(billerName, billerCategory, billerAccountRef);

      if (success) {
        setIsAddBillerModalOpen(false);
        // In a real app, we would refetch the billers list
        showToast(`Biller '${billerName}' added successfully.`);
        // Reset form
        setBillerName('');
        setBillerCategory('');
        setBillerAccountRef('');
        setBillerLastAmount('');
      } else {
        showToast("Failed to add biller.");
      }
    } catch (error) {
      console.error('Error adding biller:', error);
      showToast(`Failed to add biller: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteBiller = async (billerId) => {
    const success = await deleteBiller(billerId);
    if (success) {
      // In a real app, we would refetch the billers list
      showToast("Biller deleted successfully.");
    } else {
      showToast("Failed to delete biller.");
    }
  };

  const handleAddBeneficiary = async () => {
    try {
      // First validate the beneficiary details using RAAS API
      const validationResult = await validateBeneficiary(beneficiaryType, beneficiaryValue);

      // If validation successful, create the beneficiary in our local Firestore
      const success = await createBeneficiary(beneficiaryName, beneficiaryNickname, beneficiaryType, beneficiaryValue);

      if (success) {
        setIsAddBeneficiaryModalOpen(false);
        // In a real app, we would refetch the beneficiaries list
        showToast(`Beneficiary '${beneficiaryName}' added and validated successfully.`);
        // Reset form
        setBeneficiaryName('');
        setBeneficiaryNickname('');
        setBeneficiaryType('');
        setBeneficiaryValue('');
      } else {
        showToast("Failed to add beneficiary to local database.");
      }
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      showToast(`Validation failed: ${error.message || 'Invalid beneficiary details'}`);
    }
  };

  // Data comes from props (passed from AppLayout)

  return (
    <>
      <section id="payments" className="flex flex-col overflow-y-auto p-4" style={{ color: 'var(--color-text-primary)' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Payments</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Manage your payments, billers, and beneficiaries
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddBeneficiaryModalOpen(true)}
              className="btn-secondary py-2 px-4 rounded-panel flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Beneficiary
            </button>
            <button
              onClick={() => setIsAddBillerModalOpen(true)}
              className="btn-secondary py-2 px-4 rounded-panel flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Biller
            </button>
          </div>
        </div>

        {/* Quick Actions row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Send Money', desc: 'Transfer funds', icon: 'send', onClick: onSendMoney },
            { label: 'Add Funds', desc: 'Top up account', icon: 'add', onClick: onAddFunds },
            { label: 'QR Payment', desc: 'Scan to pay', icon: 'qr', onClick: onQRPayment },
            { label: 'NFC Payment', desc: 'Tap to pay', icon: 'nfc', onClick: onNFCPayment },
          ].map(action => (
            <div
              key={action.icon}
              className="rounded-panel p-4 border cursor-pointer transition-all duration-200"
              style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}
              onClick={action.onClick}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{
                background: action.icon === 'send' ? 'var(--color-accent, #1a1f3a)' :
                  action.icon === 'add' ? '#e1f5f2' :
                  action.icon === 'qr' ? 'var(--color-blue2, #dde8ff)' : '#ede8fe',
                color: action.icon === 'send' ? 'white' :
                  action.icon === 'add' ? 'var(--color-teal)' :
                  action.icon === 'qr' ? 'var(--color-blue-accent)' : '#7c3aed',
              }}>
                {action.icon === 'send' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8l4 4-4 4"/></svg>}
                {action.icon === 'add' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>}
                {action.icon === 'qr' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm13 0h1v3h-3v1h3v3h1v-3h1v-1h-1v-3z"/></svg>}
                {action.icon === 'nfc' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 16.5L21.75 21.75M9 12a3 3 0 100-6 3 3 0 000 6zm0-3a1 1 0 11-2 0 1 1 0 012 0z"/></svg>}
              </div>
              <h4 className="text-sm font-medium">{action.label}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{action.desc}</p>
            </div>
          ))}
        </div>

        {/* Billers section */}
        <div className="rounded-panel p-5 border mb-4" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Billers</h3>
            {billersState.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: 'var(--color-gold)' }}>
                {billersState.length} active
              </span>
            )}
          </div>
          {billersState.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {billersState.map(biller => (
                <div
                  key={biller.id}
                  className="rounded-sm-panel p-4 border transition-all duration-150"
                  style={{ backgroundColor: 'rgba(13,15,26,0.06)', borderColor: 'var(--color-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold">{biller.name}</h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{biller.category}</p>
                    </div>
                    <p className="text-sm font-mono font-semibold">Rs {biller.lastAmount.toLocaleString('en-US')}</p>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>Account: {biller.accountRef}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        showToast('Send money to biller functionality would go here');
                      }}
                      className="flex-1 py-1.5 rounded text-xs font-medium transition-colors"
                      style={{ backgroundColor: 'var(--color-accent, #1a1f3a)', color: 'white' }}
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => handleDeleteBiller(biller.id)}
                      className="py-1.5 px-3 rounded text-xs font-medium transition-colors"
                      style={{ backgroundColor: 'rgba(214,59,59,0.15)', color: 'var(--color-red-accent)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--color-interactive)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14h6M10 5h4a2 2 0 012 2v9a2 2 0 01-2 2h-4a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1">No billers yet</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Click "Add Biller" to get started</p>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="rounded-panel p-5 border mb-4" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Payments</h3>
            <button
              onClick={() => setActivePage?.('transactions')}
              className="text-xs font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--color-blue-accent)' }}
            >
              View all transactions
            </button>
          </div>
          {recentPayments.length > 0 ? (
            <div className="space-y-2">
              {recentPayments.map(payment => (
                <div
                  key={payment.id}
                  className="rounded-sm-panel p-3 flex justify-between items-center transition-colors"
                  style={{ backgroundColor: 'rgba(13,15,26,0.06)' }}
                >
                  <div>
                    <p className="text-sm font-medium">{payment.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{payment.date}</p>
                  </div>
                  <p className="text-sm font-mono font-semibold">Rs {payment.amount.toLocaleString('en-US')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--color-interactive)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1">No recent payments</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Your payment history will appear here</p>
            </div>
          )}
        </div>

        {/* Beneficiaries */}
        <div className="rounded-panel p-5 border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Beneficiaries</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Saved beneficiaries for quick payments</p>
            </div>
            {beneficiariesState.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(14,124,110,0.15)', color: 'var(--color-teal)' }}>
                {beneficiariesState.length} saved
              </span>
            )}
          </div>
          {beneficiariesState.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {beneficiariesState.map(beneficiary => (
                <div
                  key={beneficiary.id}
                  className="rounded-sm-panel p-4 border transition-all duration-150"
                  style={{ backgroundColor: 'rgba(13,15,26,0.06)', borderColor: 'var(--color-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold">{beneficiary.name}</h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{beneficiary.nickname}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-blue-accent)', color: 'white' }}>
                      {beneficiary.destinationType}
                    </span>
                  </div>
                  <p className="text-xs font-mono mb-3" style={{ color: 'var(--color-text-secondary)' }}>{formatIBAN(beneficiary.destinationValue)}</p>
                  <button
                    onClick={() => {
                      showToast('Send money to beneficiary functionality would go here');
                    }}
                    className="w-full py-1.5 rounded text-xs font-medium transition-colors"
                    style={{ backgroundColor: 'var(--color-accent, #1a1f3a)', color: 'white' }}
                  >
                    Send Money
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--color-interactive)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1">No beneficiaries yet</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Click "Add Beneficiary" to get started</p>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      {isAddBillerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75" onClick={() => setIsAddBillerModalOpen(false)}>
          <div className="relative rounded-panel p-6 w-full max-w-md mx-4" style={{ backgroundColor: 'var(--color-panel)', color: 'var(--color-text-primary)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-lg font-semibold">Add Biller</h3>
              <button
                onClick={() => setIsAddBillerModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(214,59,59,0.15)', color: 'var(--color-red-accent)' }}
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Biller Name</label>
                <input
                  value={billerName}
                  onChange={(e) => setBillerName(e.target.value)}
                  type="text"
                  placeholder="Enter biller name"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select
                  value={billerCategory}
                  onChange={(e) => setBillerCategory(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select category</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Telecom">Telecom</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Account Reference</label>
                <input
                  value={billerAccountRef}
                  onChange={(e) => setBillerAccountRef(e.target.value)}
                  type="text"
                  placeholder="Enter account reference"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Last Amount (Optional)</label>
                <input
                  value={billerLastAmount}
                  onChange={(e) => setBillerLastAmount(e.target.value)}
                  type="number"
                  placeholder="Enter last amount paid"
                  className="form-input"
                />
              </div>
              <button
                onClick={handleAddBiller}
                className="w-full btn-primary py-2.5 px-4 rounded-panel font-medium"
              >
                Add Biller
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddBeneficiaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75" onClick={() => setIsAddBeneficiaryModalOpen(false)}>
          <div className="relative rounded-panel p-6 w-full max-w-md mx-4" style={{ backgroundColor: 'var(--color-panel)', color: 'var(--color-text-primary)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-lg font-semibold">Add Beneficiary</h3>
              <button
                onClick={() => setIsAddBeneficiaryModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(214,59,59,0.15)', color: 'var(--color-red-accent)' }}
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Beneficiary Name</label>
                <input
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  type="text"
                  placeholder="Enter beneficiary name"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Nickname</label>
                <input
                  value={beneficiaryNickname}
                  onChange={(e) => setBeneficiaryNickname(e.target.value)}
                  type="text"
                  placeholder="Enter nickname"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Destination Type</label>
                <select
                  value={beneficiaryType}
                  onChange={(e) => setBeneficiaryType(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select type</option>
                  <option value="IBAN">IBAN</option>
                  <option value="Account Number">Account Number</option>
                  <option value="Phone Number">Phone Number</option>
                  <option value="Email">Email</option>
                </select>
              </div>
              <div>
                <label className="form-label">Destination Value</label>
                <input
                  value={beneficiaryValue}
                  onChange={(e) => setBeneficiaryValue(e.target.value)}
                  type="text"
                  placeholder="Enter destination value"
                  className="form-input"
                />
              </div>
              <button
                onClick={handleAddBeneficiary}
                className="w-full btn-primary py-2.5 px-4 rounded-panel font-medium"
              >
                Add Beneficiary
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PaymentsPage;