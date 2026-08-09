import React, { useState, useEffect } from 'react';
import { Dialog } from '../../../../components/ui/Dialog';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Switch } from '../../../../components/ui/Switch';
import { Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminVoucher, updateAdminVoucher } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import type { VoucherData } from '../../types';

interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: VoucherData | null;
  onSuccess: (message: string) => void;
}

export const VoucherFormModal: React.FC<VoucherFormModalProps> = ({
  isOpen,
  onClose,
  voucher,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'FLAT' as 'FLAT' | 'PERCENT',
    discountValue: 0,
    minPurchase: 0,
    maxDiscount: 0,
    maxUsage: 100,
    expiredAt: '',
    isActive: true,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (voucher) {
        // Format ISO date string into HTML datetime-local string (YYYY-MM-DDTHH:mm)
        let formattedDate = '';
        if (voucher.expiredAt) {
          try {
            const d = new Date(voucher.expiredAt);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toISOString().slice(0, 16);
            }
          } catch (e) {
            formattedDate = '';
          }
        }

        setFormData({
          code: voucher.code || '',
          discountType: (voucher.discountType === 'PERCENT' ? 'PERCENT' : 'FLAT'),
          discountValue: voucher.discountValue ?? 0,
          minPurchase: voucher.minPurchase ?? 0,
          maxDiscount: voucher.maxDiscount ?? 0,
          maxUsage: voucher.maxUsage ?? 100,
          expiredAt: formattedDate,
          isActive: voucher.isActive !== undefined ? voucher.isActive : true,
        });
      } else {
        setFormData({
          code: '',
          discountType: 'FLAT',
          discountValue: 0,
          minPurchase: 0,
          maxDiscount: 0,
          maxUsage: 100,
          expiredAt: '',
          isActive: true,
        });
      }
      setErrorMsg(null);
    }
  }, [isOpen, voucher]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const numVal = value === '' ? 0 : parseFloat(value);
      setFormData((prev) => ({ ...prev, [name]: numVal }));
    } else if (name === 'code') {
      setFormData((prev) => ({ ...prev, code: value.toUpperCase().trim() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchase: Number(formData.minPurchase),
        maxDiscount: Number(formData.maxDiscount),
        maxUsage: Number(formData.maxUsage),
        isActive: formData.isActive,
      };

      if (formData.expiredAt) {
        payload.expiredAt = new Date(formData.expiredAt).toISOString();
      } else {
        payload.expiredAt = null;
      }

      if (voucher?.id) {
        return updateAdminVoucher(voucher.id, payload);
      }
      return createAdminVoucher(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.vouchers.all });
      onSuccess(voucher ? 'Voucher berhasil diperbarui!' : 'Voucher baru berhasil dibuat!');
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || err.response?.data?.error || 'Gagal menyimpan voucher');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      setErrorMsg('Kode voucher minimal 3 karakter');
      return;
    }

    if (formData.discountValue < 0) {
      setErrorMsg('Nilai diskon tidak boleh kurang dari 0');
      return;
    }

    if (formData.discountType === 'PERCENT' && formData.discountValue > 100) {
      setErrorMsg('Diskon persentase tidak boleh lebih dari 100%');
      return;
    }

    if (formData.minPurchase < 0) {
      setErrorMsg('Minimal pembelian tidak boleh kurang dari 0');
      return;
    }

    if (formData.maxDiscount < 0) {
      setErrorMsg('Maksimal diskon tidak boleh kurang dari 0');
      return;
    }

    if (formData.maxUsage < 1) {
      setErrorMsg('Batas penggunaan minimal 1');
      return;
    }

    saveMutation.mutate();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={voucher ? 'EDIT KODE VOUCHER' : 'TAMBAH VOUCHER BARU'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {errorMsg && (
          <div className="p-3.5 bg-red-100 border-[3px] border-red-600 text-red-900 font-black text-xs uppercase tracking-wide shadow-[3px_3px_0px_0px_var(--nb-shadow)]">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Kode Voucher & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Kode Voucher"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Contoh: DISKON10K, NEON30"
            required
            className="font-mono uppercase font-black"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
              Tipe Diskon
            </label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="w-full p-2.5 font-bold text-xs bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[2px_2px_0px_0px_var(--nb-shadow)]"
            >
              <OptionValue value="FLAT">FLAT (Potongan Nominal Rp)</OptionValue>
              <OptionValue value="PERCENT">PERCENT (Potongan Persentase %)</OptionValue>
            </select>
          </div>
        </div>

        {/* Nilai Diskon & Maksimal Diskon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={formData.discountType === 'FLAT' ? 'Nilai Diskon (Rp)' : 'Nilai Diskon (%)'}
            name="discountValue"
            type="number"
            value={formData.discountValue}
            onChange={handleChange}
            placeholder="0"
            min={0}
            max={formData.discountType === 'PERCENT' ? 100 : undefined}
            required
          />

          <Input
            label="Maksimal Diskon Rp (0 = Tanpa Batas)"
            name="maxDiscount"
            type="number"
            value={formData.maxDiscount}
            onChange={handleChange}
            placeholder="0"
            min={0}
          />
        </div>

        {/* Minimal Pembelian & Maksimal Penggunaan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Minimal Pembelian (Rp)"
            name="minPurchase"
            type="number"
            value={formData.minPurchase}
            onChange={handleChange}
            placeholder="0"
            min={0}
          />

          <Input
            label="Kuota Maksimal Penggunaan"
            name="maxUsage"
            type="number"
            value={formData.maxUsage}
            onChange={handleChange}
            placeholder="100"
            min={1}
            required
          />
        </div>

        {/* Tanggal Kedaluwarsa */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
            Tanggal Kedaluwarsa (Opsional)
          </label>
          <input
            type="datetime-local"
            name="expiredAt"
            value={formData.expiredAt}
            onChange={handleChange}
            className="w-full p-2.5 font-bold text-xs bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[2px_2px_0px_0px_var(--nb-shadow)]"
          />
          <span className="text-[10px] font-bold text-[var(--nb-text-muted)]">
            Kosongkan jika voucher tidak memiliki batas waktu kedaluwarsa.
          </span>
        </div>

        {/* Status Active Toggle */}
        <div className="flex items-center justify-between p-3 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)]">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
              Status Voucher
            </label>
            <span className="text-xs font-bold text-[var(--nb-text-muted)]">
              {formData.isActive ? 'Voucher Aktif (Dapat Digunakan)' : 'Voucher Nonaktif (Di-suspend)'}
            </span>
          </div>
          <Switch checked={formData.isActive} onChange={handleToggle} />
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t-[3px] border-[var(--nb-border)]">
          <Button
            type="button"
            variant="white"
            size="md"
            onClick={onClose}
            disabled={saveMutation.isPending}
          >
            BATAL
          </Button>
          <Button
            type="submit"
            variant="yellow"
            size="md"
            isLoading={saveMutation.isPending}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2 stroke-[3]" />
            {saveMutation.isPending ? 'MENYIMPAN...' : 'SIMPAN VOUCHER 🚀'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

const OptionValue: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
  <option value={value} className="font-bold text-xs bg-white text-black">
    {children}
  </option>
);
