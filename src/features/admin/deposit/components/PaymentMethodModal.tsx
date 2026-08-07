import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { X, Save } from 'lucide-react';
import type { PaymentMethodData } from '../../types';

interface PaymentGatewayData {
  id: number;
  name: string;
  code: string;
}

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod?: PaymentMethodData | null;
  gateways: PaymentGatewayData[];
  onSaved: () => void;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  paymentMethod,
  gateways,
  onSaved,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'EWALLET',
    feeFlat: 0,
    feePercent: 0,
    instructions: '',
    isActive: true,
    forTransaction: true,
    forDeposit: false,
    paymentGatewayId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        name: paymentMethod.name || '',
        code: paymentMethod.code || '',
        type: paymentMethod.type || 'EWALLET',
        feeFlat: paymentMethod.feeFlat || 0,
        feePercent: paymentMethod.feePercent || 0,
        instructions: paymentMethod.instructions || '',
        isActive: paymentMethod.isActive ?? true,
        forTransaction: paymentMethod.forTransaction ?? true,
        forDeposit: paymentMethod.forDeposit ?? false,
        paymentGatewayId: paymentMethod.paymentGatewayId ? String(paymentMethod.paymentGatewayId) : '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        type: 'EWALLET',
        feeFlat: 0,
        feePercent: 0,
        instructions: '',
        isActive: true,
        forTransaction: true,
        forDeposit: false,
        paymentGatewayId: '',
      });
    }
  }, [paymentMethod, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        feeFlat: Number(formData.feeFlat),
        feePercent: Number(formData.feePercent),
        paymentGatewayId: formData.paymentGatewayId ? Number(formData.paymentGatewayId) : undefined,
      };

      if (paymentMethod) {
        await apiFetch(`/admin/payment-methods/${paymentMethod.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/admin/payment-methods', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save payment method', error);
      alert('Gagal menyimpan metode pembayaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card variant="white" shadow="xl" borderWidth="4" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader headerBg="#00F0FF" className="flex items-center justify-between sticky top-0 z-10">
          <CardTitle className="text-xl text-[var(--nb-text)]">
            {paymentMethod ? 'EDIT METODE BAYAR' : 'TAMBAH METODE BAYAR'}
          </CardTitle>
          <Button variant="pink" size="sm" onClick={onClose}>
            <X className="w-5 h-5 stroke-[3]" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">NAMA METODE</label>
                <Input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: QRIS TokoPay"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">KODE (Unik)</label>
                <Input 
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: QRIS"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">TIPE KATEGORI</label>
                <Select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  options={[
                    { value: 'EWALLET', label: 'E-Wallet' },
                    { value: 'VIRTUAL_ACCOUNT', label: 'Virtual Account' },
                    { value: 'RETAIL', label: 'Retail (Alfamart/Indomaret)' },
                    { value: 'QRIS', label: 'QRIS' },
                    { value: 'MANUAL', label: 'Transfer Manual' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">GATEWAY PROVIDER</label>
                <Select
                  value={formData.paymentGatewayId}
                  onChange={e => setFormData({ ...formData, paymentGatewayId: e.target.value })}
                  options={[
                    { value: '', label: '-- Manual / Tanpa Gateway --' },
                    ...gateways.map(g => ({ value: String(g.id), label: g.name }))
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">BIAYA ADMIN FLAT (Rp)</label>
                <Input 
                  type="number"
                  required
                  value={formData.feeFlat}
                  onChange={e => setFormData({ ...formData, feeFlat: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">BIAYA ADMIN PERSEN (%)</label>
                <Input 
                  type="number"
                  step="0.01"
                  required
                  value={formData.feePercent}
                  onChange={e => setFormData({ ...formData, feePercent: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">INSTRUKSI / CARA BAYAR</label>
              <textarea 
                className="w-full border-4 border-black p-2 bg-white text-black font-bold focus:outline-none focus:ring-0 focus:border-[var(--nb-primary)] transition-all resize-y"
                rows={4}
                value={formData.instructions}
                onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Cara pembayaran..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">STATUS MASTER</label>
                <Select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  options={[
                    { value: 'true', label: 'AKTIF' },
                    { value: 'false', label: 'NONAKTIF' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">CHECKOUT TOKO</label>
                <Select
                  value={formData.forTransaction ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, forTransaction: e.target.value === 'true' })}
                  options={[
                    { value: 'true', label: 'TAMPIL' },
                    { value: 'false', label: 'SEMBUNYI' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">DEPOSIT USER</label>
                <Select
                  value={formData.forDeposit ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, forDeposit: e.target.value === 'true' })}
                  options={[
                    { value: 'true', label: 'TAMPIL' },
                    { value: 'false', label: 'SEMBUNYI' }
                  ]}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="white" onClick={onClose} disabled={isSubmitting}>
                BATAL
              </Button>
              <Button type="submit" variant="yellow" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN METODE'}
              </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
