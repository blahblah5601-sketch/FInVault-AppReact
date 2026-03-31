// src/components/PaymentsPage.jsx
import { createPayment, createBiller, deleteBiller, createBeneficiary } from '../api';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import HintTooltip from './HintTooltip.jsx';
import { formatIBAN } from '../utils/ibanUtils';

function PaymentsPage({ showToast }) {
  const [isAddBillerModalOpen, setIsAddBillerModalOpen] = useState(false);
  const [isAddBeneficiaryModalOpen, setIsAddBeneficiaryModalOpen] = useState(false);
  const [billers, setBillers] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  // In a real implementation, we would fetch these from Firestore
  // For now, we'll use mock data to demonstrate the structure

  const handleAddBiller = async (name, category, accountRef) => {
    const success = await createBiller(name, category, accountRef);
    if (success) {
      setIsAddBillerModalOpen(false);
      // In a real app, we would refetch the billers list
      showToast(`Biller '${name}' added successfully.`);
    } else {
      alert("Failed to add biller.");
    }
  };

  const handleDeleteBiller = async (billerId) => {
    const success = await deleteBiller(billerId);
    if (success) {
      // In a real app, we would refetch the billers list
      showToast("Biller deleted successfully.");
    } else {
      alert("Failed to delete biller.");
    }
  };

  const handleAddBeneficiary = async (beneficiaryName, nickname, destinationType, destinationValue) => {
    const success = await createBeneficiary(beneficiaryName, nickname, destinationType, destinationValue);
    if (success) {
      setIsAddBeneficiaryModalOpen(false);
      // In a real app, we would refetch the beneficiaries list
      showToast(`Beneficiary '${beneficiaryName}' added successfully.`);
    } else {
      alert("Failed to add beneficiary.");
    }
  };

  // Mock data for demonstration
  // In a real implementation, this data would come from Firestore listeners
  const mockBillers = [
    { id: '1', name: 'Electricity Company', category: 'Utilities', accountRef: 'ACC-001', lastAmount: 2500 },
    { id: '2', name: 'Gas Provider', category: 'Utilities', accountRef: 'ACC-002', lastAmount: 1800 },
    { id: '3', name: 'Internet Service', category: 'Telecom', accountRef: 'ACC-003', lastAmount: 1500 },
    { id: '4', name: 'Mobile Top-up', category: 'Telecom', accountRef: 'ACC-004', lastAmount: 500 }
  ];

  const mockBeneficiaries = [
    { id: '1', name: 'Ali Hassan', nickname: 'Ali', destinationType: 'IBAN', destinationValue: 'PK36FNVT0000123456789012' },
    { id: '2', name: 'Fatima Khan', nickname: 'Fatima', destinationType: 'IBAN', destinationValue: 'PK36HABB0000987654321098' },
    { id: '3', name: 'Ahmed Malik', nickname: 'Ahmed', destinationType: 'IBAN', destinationValue: 'PK36MUCB0000555555555555' }
  ];

  const mockRecentPayments = [
    { id: '1', amount: 2500, description: 'Electricity Bill', date: '2026-03-25' },
    { id: '2', amount: 500, description: 'Mobile Top-up', date: '2026-03-24' },
    { id: '3', amount: 1500, description: 'Internet Bill', date: '2026-03-23' },
    { id: '4', amount: 1800, description: 'Gas Bill', date: '2026-03-22' }
  ];

  return (
    <>
      <section id="payments" className="page-section space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Payments</h2>
            <p className="text-sm text-text-secondary mt-1">
              Manage your payments, billers, and beneficiaries
            </p>
          </div>
          <button
            onClick={() => setIsAddBillerModalOpen(true)}
            className="btn-secondary py-2 px-4 rounded-lg flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Biller
          </button>
        </div>

        {/* Quick Actions row - same as dashboard hero */}
        <div className="bg-background/50 p-6 rounded-2xl">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            {/* Send Money */}
            <div className="flex-1 flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200">
              {/* Using the same icon as DashboardPage */}
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8l4 4-4 4"/>
              </svg>
              <span className="text-xs text-text-secondary">Send Money</span>
              {/* Tooltip would be added here in a real implementation */}
            </div>

            {/* Add Funds */}
            <div className="flex-1 flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              <span className="text-xs text-text-secondary">Add Funds</span>
            </div>

            {/* QR Payment */}
            <div className="flex-1 flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M6 6h.01M18 6h.01M6 12h12M6 18h.01M18 18h.01"/>
              </svg>
              <span className="text-xs text-text-secondary">QR Payment</span>
            </div>

            {/* NFC Payment */}
            <div className="flex-1 flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 16.5 21.75 21.75M9 12a3 3 0 100-6 3 3 0 000 6zm0-3a1 1 0 11-2 0 1 1 0 012 0z"/>
              </svg>
              <span className="text-xs text-text-secondary">NFC Payment</span>
            </div>
          </div>
        </div>

        {/* Billing section */}
        <div className="bg-background/50 p-6 rounded-2xl">
          <h3 className="font-semibold text-lg mb-4">Billers</h3>
          <div className="space-y-4">
            {mockBillers.map(biller => (
              <div key={biller.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{biller.name}</h4>
                    <p className="text-xs text-text-secondary">{biller.category}</p>
                    <p className="text-xs text-text-muted">Account: {biller.accountRef}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <p className="text-sm font-mono">Rs {biller.lastAmount.toLocaleString('en-US')}</p>
                    <button
                      onClick={() => {
                        // In a real implementation, this would open SendMoneyPanel with pre-filled data
                        alert('Send money to biller functionality would go here');
                      }}
                      className="btn-primary py-1 px-3 rounded"
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => handleDeleteBiller(biller.id)}
                      className="btn-danger py-1 px-2 rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {mockBillers.length === 0 && (
              <p className="text-text-secondary">No billers added yet. Click "Add Biller" to get started.</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-background/50 p-6 rounded-2xl">
          <h3 className="font-semibold text-lg mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {mockRecentPayments.map(payment => (
              <div key={payment.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{payment.description}</p>
                    <p className="text-xs text-text-muted">{payment.date}</p>
                  </div>
                  <p className="font-mono text-lg">Rs {payment.amount.toLocaleString('en-US')}</p>
                </div>
              </div>
            ))}
            {mockRecentPayments.length === 0 && (
              <p className="text-text-secondary">No recent payments yet.</p>
            )}
          </div>
        </div>

        {/* Beneficiaries */}
        <div className="bg-background/50 p-6 rounded-2xl">
          <h3 className="font-semibold text-lg mb-4">Beneficiaries</h3>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-text-secondary">
                Saved beneficiaries for quick payments
              </p>
            </div>
            <button
              onClick={() => setIsAddBeneficiaryModalOpen(true)}
              className="btn-secondary py-2 px-4 rounded-lg flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Beneficiary
            </button>
          </div>
          <div className="space-y-3">
            {mockBeneficiaries.map(beneficiary => (
              <div key={beneficiary.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{beneficiary.name}</h4>
                    <p className="text-xs text-text-secondary">{beneficiary.nickname}</p>
                    <p className="text-xs text-text-muted">
                      {beneficiary.destinationType}: {formatIBAN(beneficiary.destinationValue)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // In a real implementation, this would open SendMoneyPanel with pre-filled data
                      alert('Send money to beneficiary functionality would go here');
                    }}
                    className="btn-primary py-1 px-3 rounded text-xs"
                  >
                    Send Money
                  </button>
                </div>
              </div>
            ))}
            {mockBeneficiaries.length === 0 && (
              <p className="text-text-secondary">No beneficiaries added yet. Click "Add Beneficiary" to get started.</p>
            )}
          </div>
        </div>
      </section>

      {/* Modals */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        {/* Add Biller Modal */}
        <div className="relative bg-background/90 backdrop-blur-sm rounded-3xl p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Add Biller</h3>
            <button
              onClick={() => setIsAddBillerModalOpen(false)}
              className="text-xs btn-danger py-1 px-2 rounded"
            >
              ×
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-text-primary mb-2">Biller Name</label>
              <input
                type="text"
                placeholder="Enter biller name"
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-text-primary mb-2">Category</label>
              <select
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
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
              <label className="block text-text-primary mb-2">Account Reference</label>
              <input
                type="text"
                placeholder="Enter account reference"
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-text-primary mb-2">Last Amount (Optional)</label>
              <input
                type="number"
                placeholder="Enter last amount paid"
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
              />
            </div>
            <button
              onClick={() => {
                // In a real implementation, we would get values from form inputs
                handleAddBiller('Test Biller', 'Utilities', 'ACC-005');
              }}
              className="w-full btn-primary py-2 px-4 rounded-lg"
            >
              Add Biller
            </button>
          </div>
        </div>

        {/* Add Beneficiary Modal */}
        <div className="relative bg-background/90 backdrop-blur-sm rounded-3xl p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Add Beneficiary</h3>
            <button
              onClick={() => setIsAddBeneficiaryModalOpen(false)}
              className="text-xs btn-danger py-1 px-2 rounded"
            >
              ×
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-text-primary mb-2">Beneficiary Name</label>
              <input
                type="text"
                placeholder="Enter beneficiary name"
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-text-primary mb-2">Nickname</label>
              <input
                type="text"
                placeholder="Enter nickname"
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-text-primary mb-2">Destination Type</label>
              <select
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
              >
                <option value="">Select type</option>
                <option value="IBAN">IBAN</option>
                <option value="Account Number">Account Number</option>
                <option value="Phone Number">Phone Number</option>
                <option value="Email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-text-primary mb-2">Destination Value</label>
              <input
                type="text"
                placeholder="Enter destination value"
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-gray-300"
              />
            </div>
            <button
              onClick={() => {
                // In a real implementation, we would get values from form inputs
                handleAddBeneficiary('Test Beneficiary', 'Test', 'IBAN', 'PK36FNVT0000123456789012');
              }}
              className="w-full btn-primary py-2 px-4 rounded-lg"
            >
              Add Beneficiary
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentsPage;