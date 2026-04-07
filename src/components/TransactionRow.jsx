// src/components/TransactionRow.jsx

function TransactionRow({ transaction }) {
  const amount = transaction.amount || 0;
  const isCredit = amount >= 0;
  const sign = isCredit ? '+' : '';
  const txDate = new Date(transaction.date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <tr className="border-b transition-colors hover:bg-background/10"
      style={{ borderColor: 'var(--color-border)' }}>
      <td className="p-[14px]">
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{txDate}</div>
      </td>
      <td className="p-[14px]">
        <p className="text-sm font-medium">{transaction.desc}</p>
      </td>
      <td className="p-[14px]" style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
        {transaction.cat}
      </td>
      <td className="p-[14px] text-right font-mono text-sm" style={{
        fontFamily: "'Space Mono', monospace",
        fontWeight: 700,
        color: isCredit ? 'var(--color-teal)' : 'var(--color-text-primary)'
      }}>
        {sign}Rs {Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
    </tr>
  );
}

export default TransactionRow;
