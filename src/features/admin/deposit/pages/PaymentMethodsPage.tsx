import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { PaymentMethodData } from '../../types';
import { PaymentMethodModal } from '../components/PaymentMethodModal';

interface PaymentGatewayData {
  id: number;
  name: string;
  code: string;
}

interface TabPaymentMethodsProps {
  paymentMethods: PaymentMethodData[];
  onAddPayment: () => void;
  onEditPayment: (pm: PaymentMethodData) => void;
  onDeletePayment: (id: number) => void;
  onToggleScope: (id: number, payload: Partial<PaymentMethodData>) => void;
}

export const TabPaymentMethods: React.FC<TabPaymentMethodsProps> = ({
  paymentMethods,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  onToggleScope,
}) => {
  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="#00F0FF" className="flex items-center justify-between">
        <CardTitle className="text-base text-[var(--nb-text)]">LEVEL 5: METODE PEMBAYARAN & SCOPE USAGE</CardTitle>
        <Button variant="yellow" size="sm" onClick={onAddPayment}>
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>TAMBAH METODE BAYAR</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>KODE</TableHead>
              <TableHead>NAMA METODE</TableHead>
              <TableHead>TIPE</TableHead>
              <TableHead>GATEWAY</TableHead>
              <TableHead>BIAYA ADMIN</TableHead>
              <TableHead>STATUS MASTER</TableHead>
              <TableHead>CHECKOUT TOKO</TableHead>
              <TableHead>DEPOSIT USER</TableHead>
              <TableHead className="text-right">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentMethods.map((pm) => (
              <TableRow key={pm.id}>
                <TableCell className="font-black text-[var(--nb-text)]">{pm.code || '-'}</TableCell>
                <TableCell className="font-bold text-[var(--nb-text)]">{pm.name}</TableCell>
                <TableCell>
                  <Badge variant="purple" size="sm">{pm.type}</Badge>
                </TableCell>
                <TableCell className="font-bold text-pink-600">
                  {pm.gateway?.name || pm.paymentGatewayId || 'Manual / Saldo'}
                </TableCell>
                <TableCell className="font-black text-blue-700">
                  {pm.feePercent > 0 && pm.feeFlat > 0
                    ? `${pm.feePercent}% + Rp ${pm.feeFlat.toLocaleString('id-ID')}`
                    : pm.feePercent > 0
                    ? `${pm.feePercent}%`
                    : pm.feeFlat > 0
                    ? `Rp ${pm.feeFlat.toLocaleString('id-ID')}`
                    : 'Gratis (0)'}
                </TableCell>

                {/* Master Active Status */}
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onToggleScope(pm.id, { isActive: !pm.isActive })}
                    className="cursor-pointer"
                  >
                    <Badge variant={pm.isActive ? 'mint' : 'pink'} size="sm">
                      {pm.isActive ? 'AKTIF' : 'NONAKTIF'}
                    </Badge>
                  </button>
                </TableCell>

                {/* Checkout Scope */}
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onToggleScope(pm.id, { forTransaction: !pm.forTransaction })}
                    className="cursor-pointer"
                  >
                    <Badge variant={pm.forTransaction ? 'mint' : 'pink'} size="sm">
                      {pm.forTransaction ? 'CHECKOUT: ON' : 'CHECKOUT: OFF'}
                    </Badge>
                  </button>
                </TableCell>

                {/* Deposit Scope */}
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onToggleScope(pm.id, { forDeposit: !pm.forDeposit })}
                    className="cursor-pointer"
                  >
                    <Badge variant={pm.forDeposit ? 'yellow' : 'white'} size="sm">
                      {pm.forDeposit ? 'DEPOSIT: ON' : 'DEPOSIT: OFF'}
                    </Badge>
                  </button>
                </TableCell>

                <TableCell className="text-right flex items-center justify-end gap-2">
                  <Button variant="yellow" size="sm" onClick={() => onEditPayment(pm)}>
                    <Edit className="w-3.5 h-3.5 stroke-[3]" />
                    <span>EDIT</span>
                  </Button>
                  <Button variant="pink" size="sm" onClick={() => onDeletePayment(pm.id)}>
                    <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const PaymentMethodsPage: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [gateways, setGateways] = useState<PaymentGatewayData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodData | null>(null);

  const fetchAll = async () => {
    try {
      const [methodsData, gatewaysData] = await Promise.all([
        apiFetch<PaymentMethodData[]>('/admin/payment-methods')
          .catch(() => apiFetch<PaymentMethodData[]>('/payment-methods'))
          .catch(() => null),
        apiFetch<PaymentGatewayData[]>('/admin/payment-gateways').catch(() => null)
      ]);
      setPaymentMethods(Array.isArray(methodsData) ? methodsData : []);
      setGateways(Array.isArray(gatewaysData) ? gatewaysData : []);
    } catch (e) {
      console.error('Failed fetching payment methods and gateways:', e);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAddPayment = () => {
    setEditingMethod(null);
    setIsModalOpen(true);
  };

  const handleEditPayment = (pm: PaymentMethodData) => {
    setEditingMethod(pm);
    setIsModalOpen(true);
  };

  const handleToggleScope = async (id: number, payload: Partial<PaymentMethodData>) => {
    try {
      await apiFetch(`/admin/payment-methods/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      fetchAll();
    } catch (err) {
      console.error('Failed to toggle payment method scope:', err);
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus metode bayar ini?')) return;
    try {
      await apiFetch(`/admin/payment-methods/${id}`, { method: 'DELETE' });
      fetchAll();
    } catch (error) {
      console.error('Failed to delete', error);
      alert('Gagal menghapus metode bayar');
    }
  };

  return (
    <>
      <TabPaymentMethods
        paymentMethods={paymentMethods}
        onAddPayment={handleAddPayment}
        onEditPayment={handleEditPayment}
        onDeletePayment={handleDeletePayment}
        onToggleScope={handleToggleScope}
      />
      <PaymentMethodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paymentMethod={editingMethod}
        gateways={gateways}
        onSaved={fetchAll}
      />
    </>
  );
};
