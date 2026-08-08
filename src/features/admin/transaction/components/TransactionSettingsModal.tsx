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

export const TransactionSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prefix, setPrefix] = useState('TRX');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAdminSettings()
        .then((data) => {
          if (data) {
            setPrefix(data.transaction_reference_prefix || 'TRX');
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
    if (!cleanPrefix) {
      addToast({ title: 'Validasi Gagal', message: 'Prefix transaksi tidak boleh kosong.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await updateAdminSettings({
        transaction_reference_prefix: cleanPrefix,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.settings });
      addToast({ title: 'Setting Disimpan', message: 'Prefix transaksi berhasil diperbarui.', type: 'success' });
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
            <SlidersHorizontal className="w-5 h-5 text-black" /> Pengaturan Transaksi
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
              <label className="block text-xs font-black uppercase mb-1">Prefix Kode Referensi Transaksi</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="TRX"
                className="w-full p-2.5 bg-neutral-50 border-[2px] border-black font-mono text-sm font-bold outline-none focus:bg-yellow-50"
              />
              <p className="text-[10px] font-bold text-neutral-500 mt-1">
                Contoh hasil invoice reference: <span className="font-mono text-black font-bold">{prefix.toUpperCase() || 'TRX'}-174123456-A1B2</span>
              </p>
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
