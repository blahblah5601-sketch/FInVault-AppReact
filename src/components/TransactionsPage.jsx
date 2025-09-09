// src/components/TransactionsPage.jsx
import TransactionRow from './TransactionRow';

function TransactionsPage({ transactions }) {
  return (
    <section id="transactions" className="page-section space-y-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Spending History</h2>
          <button id="export-spending-btn" className="btn-secondary py-2 px-4 rounded-lg flex items-center">
            <i data-lucide="file-spreadsheet" className="w-5 h-5 mr-2"></i>
            Export
          </button>
        </div>
        <div className="bg-slate-900/50 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800">
              <tr>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody id="transaction-list">
              {transactions.map(tx => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TransactionsPage;