import React from 'react';
import { Badge } from '../../../../components/ui/Badge';

interface TransactionStatusBadgeProps {
  type: 'order' | 'payment';
  status: string;
}

export const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({ type, status }) => {
  if (type === 'payment') {
    const isPaid = status === 'PAID';
    const isRefund = status === 'REFUND';
    return (
      <Badge
        variant={isPaid ? 'mint' : isRefund ? 'purple' : 'yellow'}
        size="sm"
        className="font-black uppercase text-[10px]"
      >
        {status}
      </Badge>
    );
  }

  // Order Status: SUCCESS | PROCESS | PENDING | FAILED
  let variant: 'mint' | 'purple' | 'yellow' | 'pink' = 'yellow';
  if (status === 'SUCCESS') variant = 'mint';
  else if (status === 'PROCESS') variant = 'purple';
  else if (status === 'FAILED') variant = 'pink';

  return (
    <Badge variant={variant} size="sm" className="font-black uppercase text-[10px]">
      {status}
    </Badge>
  );
};
