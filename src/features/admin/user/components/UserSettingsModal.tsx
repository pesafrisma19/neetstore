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

export const UserSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [enabled, setEnabled] = useState(true);
  const [resellerPrice, setResellerPrice] = useState(50000);
  const [vipPrice, setVipPrice] = useState(150000);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAdminSettings()
        .then((data) => {
          if (data) {
            setEnabled(Boolean(data.level_upgrade_enabled));
            setResellerPrice(Number(data.upgrade_reseller_price) || 50000);
            setVipPrice(Number(data.upgrade_vip_price) || 150000);
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
    const resPrice = Number(resellerPrice);
    const vPrice = Number(vipPrice);

    if (isNaN(resPrice) || resPrice < 0) {
      addToast({ title: 'Validasi Gagal', message: 'Harga upgrade Reseller tidak valid.', type: 'error' });
      return;
    }
    if (isNaN(vPrice) || vPrice < 0) {
      addToast({ title: 'Validasi Gagal', message: 'Harga upgrade VIP tidak valid.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await updateAdminSettings({
        level_upgrade_enabled: Boolean(enabled),
        upgrade_reseller_price: resPrice,
        upgrade_vip_price: vPrice,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.settings });
      addToast({ title: 'Setting Disimpan', message: 'Pengaturan Level User berhasil diperbarui.', type: 'success' });
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
            <SlidersHorizontal className="w-5 h-5 text-black" /> Pengaturan Level User
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
            <div className="p-3 bg-yellow-50 border-[2px] border-black">
              <label className="flex items-center gap-2 font-black uppercase cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-5 h-5 accent-black"
                />
                <span>Aktifkan Fitur Self-Upgrade Level User</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Harga Upgrade Reseller (Rp)</label>
                <input
                  type="number"
                  value={resellerPrice}
                  onChange={(e) => setResellerPrice(Number(e.target.value))}
                  placeholder="50000"
                  className="w-full p-2.5 bg-neutral-50 border-[2px] border-black font-mono text-xs font-bold outline-none focus:bg-yellow-50"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Harga Upgrade VIP (Rp)</label>
                <input
                  type="number"
                  value={vipPrice}
                  onChange={(e) => setVipPrice(Number(e.target.value))}
                  placeholder="150000"
                  className="w-full p-2.5 bg-neutral-50 border-[2px] border-black font-mono text-xs font-bold outline-none focus:bg-yellow-50"
                />
              </div>
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
