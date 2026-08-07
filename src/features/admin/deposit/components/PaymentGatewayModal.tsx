import React, { useState, useEffect } from 'react';
import { Dialog } from '../../../../components/ui/Dialog';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { useToast } from '../../../../components/ui/ToastContext';
import { updateAdminPaymentGateway } from '../../../../utils/api';
import { Key, ShieldAlert } from 'lucide-react';

export interface PaymentGatewayData {
  id: number;
  name: string;
  code: string;
  merchantId?: string;
  secretKey?: string;
  balance?: number;
  isActive: boolean;
  isConnected?: boolean;
  lastSync?: string | null;
  webhookUrl?: string;
}

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gateway: PaymentGatewayData | null;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  gateway,
}) => {
  const { addToast } = useToast();
  const [merchantId, setMerchantId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (gateway && isOpen) {
      setMerchantId(gateway.merchantId || '');
      setSecretKey(gateway.secretKey || '');
    }
  }, [gateway, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateway) return;

    setIsSubmitting(true);
    try {
      const res = await updateAdminPaymentGateway(gateway.id, {
        merchantId: merchantId.trim(),
        secretKey: secretKey.trim(),
      });

      if (res.isConnected) {
        addToast({
          title: 'KREDENSIAL DISIMPAN & TERHUBUNG! 🟢',
          message: res.connectionMessage || 'Merchant ID dan Secret Key valid. Saldo berhasil disinkronkan.',
          type: 'success',
        });
      } else {
        addToast({
          title: 'KREDENSIAL DISIMPAN (TIDAK TERHUBUNG) ⚠️',
          message: res.connectionMessage || 'Kredensial disimpan, namun koneksi ke TokoPay tidak valid / ditolak.',
          type: 'error',
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast({
        title: 'GAGAL MENYIMPAN',
        message: err.message || 'Terjadi kesalahan saat menyimpan kredensial TokoPay.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!gateway) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`KELOLA KREDENSIAL ${gateway.name.toUpperCase()}`}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="text-left font-sans space-y-4">
        {/* Banner Alert Spesifikasi Dokumen */}
        <div className="bg-[var(--nb-yellow)] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 stroke-[3] text-black shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black uppercase text-xs text-black mb-1">
                Spesifikasi API & Advance Order TokoPay
              </h4>
              <p className="text-[11px] font-bold text-black/90 leading-snug">
                Sistem otomatis menggunakan mode <b>Order Advanced</b> (redirect otomatis setelah bayar) dan memvalidasi Webhook dengan MD5 Signature.
              </p>
            </div>
          </div>
        </div>

        {/* Input Merchant ID */}
        <div>
          <Input
            label="TokoPay Merchant ID"
            type="text"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            placeholder="Contoh: M1234567890"
            required
          />
          <p className="text-[10px] font-bold text-neutral-500 mt-1">
            *Didapatkan dari halaman Pengaturan Merchant TokoPay.
          </p>
        </div>

        {/* Input Secret Key */}
        <div>
          <Input
            label="TokoPay Secret Key"
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Masukkan Secret Key TokoPay"
            required
          />
          <p className="text-[10px] font-bold text-neutral-500 mt-1">
            *Digunakan untuk enkripsi MD5 Signature API & pengecekan Webhook.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t-[3px] border-black">
          <Button type="button" variant="white" size="md" onClick={onClose} disabled={isSubmitting}>
            BATAL
          </Button>
          <Button type="submit" variant="yellow" size="md" disabled={isSubmitting}>
            <Key className="w-4 h-4 stroke-[3]" />
            <span>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN KREDENSIAL'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
