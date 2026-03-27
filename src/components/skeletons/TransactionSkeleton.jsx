// src/components/skeletons/TransactionSkeleton.jsx
import LoadingSkeleton from '../LoadingSkeleton';

function TransactionSkeleton() {
  return (
    <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
      <td className="p-4">
        <LoadingSkeleton width="100px" height="16px" />
      </td>
      <td className="p-4">
        <LoadingSkeleton width="200px" height="16px" />
      </td>
      <td className="p-4">
        <LoadingSkeleton width="80px" height="16px" />
      </td>
      <td className="p-4 text-right">
        <LoadingSkeleton width="100px" height="16px" className="ml-auto" />
      </td>
    </tr>
  );
}

export default TransactionSkeleton;