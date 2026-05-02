// src/components/TransactionsPage.jsx
import TransactionRow from './TransactionRow';
import { FileSpreadsheet } from 'lucide-react';
import TransactionSkeleton from './skeletons/TransactionSkeleton';

function TransactionsPage({ transactions, isLoading = false }) {
  return (
    <section id="transactions" className="flex flex-col space-y-[22px]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium" style={{ fontFamily: "'Sora', sans-serif" }}>
            Transactions
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {transactions?.length || 0} transactions
          </p>
        </div>
        <button
          id="export-spending-btn"
          className="py-[10px] px-[18px] text-sm font-medium flex items-center transition-colors"
          style={{
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            background: 'transparent',
            fontFamily: "'Sora', sans-serif",
            color: 'var(--color-text-primary)',
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.target.style.borderColor = 'var(--color-gold)'}
          onMouseLeave={e => e.target.style.borderColor = 'var(--color-border)'}
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      <div className="rounded-panel border overflow-hidden" style={{
        backgroundColor: 'var(--color-panel)',
        borderColor: 'var(--color-border)'
      }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-bg)' }}>
              <th className="p-[14px] text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: "'Sora', sans-serif" }}>
                Date
              </th>
              <th className="p-[14px] text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: "'Sora', sans-serif" }}>
                Description
              </th>
              <th className="p-[14px] text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: "'Sora', sans-serif" }}>
                Category
              </th>
              <th className="p-[14px] text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: "'Sora', sans-serif" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => <TransactionSkeleton key={i} />)
            ) : transactions && transactions.length > 0 ? (
              transactions.map(tx => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-16" style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TransactionsPage;
