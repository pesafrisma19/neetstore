import React, { useState, useEffect } from 'react';
import { Dialog } from '../../../../components/ui/Dialog';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { updateAdminProvider } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface ProviderData {
  id: number;
  name: string;
  code: string;
  apiUsername: string;
  apiKey: string;
  balance: number;
  isActive: boolean;
  updatedAt?: string;
}

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderData | null;
  onSuccess: () => void;
}

export const ProviderModal: React.FC<ProviderModalProps> = ({ isOpen, onClose, provider, onSuccess }) => {
  const { addToast } = useToast();
  const [apiUsername, setApiUsername] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (provider) {
      setApiUsername(provider.apiUsername || '');
      setApiKey(provider.apiKey || '');
    }
  }, [provider, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider?.id) return;
    setIsSubmitting(true);
    
    try {
      const res = await updateAdminProvider(provider.id, {
        apiUsername: apiUsername.trim(),
        apiKey: apiKey.trim(),
      });

      if ((res as any)?.error) {
        addToast({ title: 'GAGAL DISIMPAN', message: (res as any).error, type: 'error' });
        setIsSubmitting(false);
        return;
      }

      addToast({
        title: 'CREDENTIAL DISIMPAN',
        message: 'Konfigurasi Username & API Key Digiflazz berhasil diperbarui!',
        type: 'success'
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Gagal menyimpan credential provider', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !provider) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="KELOLA CREDENTIAL: DIGIFLAZZ (PPOB & GAME)"
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left font-sans">
        {/* Info Header Box */}
        <div className="bg-[var(--nb-pink)] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center gap-2 font-black uppercase text-xs text-black mb-1">
            <ShieldAlert className="w-4 h-4 stroke-[3]" />
            <span>Penting: IP Whitelist & Webhook URL</span>
          </div>
          <p className="text-[11px] font-bold text-black opacity-90 leading-relaxed">
            Sesuai dokumentasi resmi Digiflazz, Anda <b>WAJIB</b> mendaftarkan IP statis server Anda pada menu <i>Koneksi API</i> di Dasbor Digiflazz agar tidak terkena error akses ditolak.
          </p>
          <div className="mt-2.5 p-2 bg-black text-[var(--nb-mint)] font-mono text-[11px] border-2 border-black flex items-center justify-between">
            <span>Webhook: <code>/api/digiflazz/webhook</code></span>
            <span className="text-[9px] bg-[var(--nb-yellow)] text-black px-1.5 py-0.5 font-black uppercase">AUTO SYNC</span>
          </div>
        </div>

        {/* Input Fields (FIXED: Only Username and API Key) */}
        <div className="space-y-4">
          <Input 
            label="Digiflazz Username" 
            placeholder="Contoh: netstore_dev123"
            value={apiUsername} 
            onChange={e => setApiUsername(e.target.value)} 
            required 
          />

          <div>
            <Input 
              label="Digiflazz API Key (Production / Dev Key)" 
              type="password"
              placeholder="Masukkan API Key rahasia dari menu Koneksi API Digiflazz"
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              required 
            />
            <p className="text-[10px] font-bold text-neutral-500 mt-1 ml-1">
              *Gunakan Development Key untuk mode uji coba, atau Production Key untuk transaksi asli.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="white" size="md" onClick={onClose} disabled={isSubmitting}>
            BATAL
          </Button>
          <Button type="submit" variant="purple" size="md" disabled={isSubmitting}>
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN CREDENTIAL'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
