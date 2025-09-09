// src/components/TransactionRow.jsx

function TransactionRow({ transaction }) {
  const amount = transaction.amount || 0;
  const amountClass = amount >= 0 ? 'text-green-400' : 'text-slate-300';
  const sign = amount >= 0 ? '+' : '';
  const txDate = new Date(transaction.date).toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <tr className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
      <td className="p-4">{txDate}</td>
      <td className="p-4 font-medium">{transaction.desc}</td>
      <td className="p-4 text-slate-400">{transaction.cat}</td>
      <td className={`p-4 text-right font-mono ${amountClass}`}>
        {sign}Rs {Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
    </tr>
  );
}

export default TransactionRow;
