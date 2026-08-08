import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { SlidersHorizontal, Save, X } from 'lucide-react';
import { getAdminSettings, updateAdminSettings } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';
import { queryClient } from '../../../../services/queryClient';
import { queryKeys } from '../../../../services/queryKeys';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [prefix, setPrefix] = useState('DEP');
  const [minAmount, setMinAmount] = useState(10000);
  const [maxAmount, setMaxAmount] = useState(5000000);
  const [expiryHours, setExpiryHours] = useState(24);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAdminSettings()
        .then((data) => {
          if (data) {
            setPrefix(data.deposit_reference_prefix || 'DEP');
            setMinAmount(Number(data.min_deposit_amount) || 10000);
            setMaxAmount(Number(data.max_deposit_amount) || 5000000);
            setExpiryHours(Number(data.manual_deposit_expiry_hours) || 24);
          }
        })
        .catch((err: any) => {
          addToast({ title: 'Gagal Memuat Setting', message: err.message, type: 'error' });
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const cleanPrefix = prefix.trim().toUpperCase();
    const min = Number(minAmount);
    const max = Number(maxAmount);
    const expiry = Number(expiryHours);

    if (!cleanPrefix) {
      addToast({ title: 'Validasi Gagal', message: 'Prefix deposit tidak boleh kosong.', type: 'error' });
      return;
    }
    if (isNaN(min) || min < 0) {
      addToast({ title: 'Validasi Gagal', message: 'Minimum deposit tidak boleh negatif.', type: 'error' });
      return;
    }
    if (isNaN(max) || max < min) {
      addToast({ title: 'Validasi Gagal', message: 'Maksimum deposit harus lebih besar atau sama dengan Minimum deposit.', type: 'error' });
      return;
    }
    if (isNaN(expiry) || expiry <= 0) {
      addToast({ title: 'Validasi Gagal', message: 'Masa berlaku deposit manual harus lebih besar dari 0 jam.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await updateAdminSettings({
        deposit_reference_prefix: cleanPrefix,
        min_deposit_amount: min,
        max_deposit_amount: max,
        manual_deposit_expiry_hours: expiry,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.settings });
      addToast({ title: 'Setting Disimpan', message: 'Pengaturan Deposit berhasil diperbarui.', type: 'success' });
      onClose();
    } catch (err: any) {
      addToast({ title: 'Gagal Menyimpan', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-6 max-w-md w-full space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h3 className="text-base font-black uppercase flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-black" /> Pengaturan Deposit
          </h3>
          <button 
            onClick={onClose}
            className="font-black text-lg hover:text-red-600"
            title="Tutup Modal"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <p className="text-xs font-bold text-neutral-500 py-4 text-center">Memuat pengaturan...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase mb-1">Prefix Referensi Deposit</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="DEP"
                className="w-full p-2.5 bg-neutral-50 border-[2px] border-black font-mono text-xs font-bold outline-none focus:bg-yellow-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Minimum Deposit (Rp)</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  placeholder="10000"
                  className="w-full p-2.5 bg-neutral-50 border-[2px] border-black font-mono text-xs font-bold outline-none focus:bg-yellow-50"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Maksimum Deposit (Rp)</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  placeholder="5000000"
                  className="w-full p-2.5 bg-neutral-50 border-[2px] border-black font-mono text-xs font-bold outline-none focus:bg-yellow-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">Masa Berlaku Deposit Manual (Jam)</label>
              <input
                type="number"
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number(e.target.value))}
                placeholder="24"
                className="w-full p-2.5 bg-neutral-50 border-[2px] border-black font-mono text-xs font-bold outline-none focus:bg-yellow-50"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t-2 border-dashed border-black/20">
          <Button 
            variant="white" 
            size="sm" 
            onClick={onClose}
            className="font-black uppercase"
          >
            Batal
          </Button>
          <Button 
            variant="mint" 
            size="sm" 
            onClick={handleSave} 
            disabled={saving || loading}
            className="font-black uppercase"
          >
            <Save className="w-4 h-4 stroke-[3]" />
            <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
