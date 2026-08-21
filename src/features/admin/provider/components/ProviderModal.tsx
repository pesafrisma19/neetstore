import React, { useState, useEffect } from 'react';
import { Dialog } from '../../../../components/ui/Dialog';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { updateAdminProvider } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';
import { ShieldAlert, CheckCircle2, Copy, Check } from 'lucide-react';

import { getPublicBackendUrl } from '../../../../services/api';

export interface ProviderData {
  id: number;
  name: string;
  code: string;
  apiUsername: string;
  apiKey: string;
  balance: number;
  isActive: boolean;
  isConnected?: boolean;
  updatedAt?: string;
  lastSync?: string | null;
  _count?: {
    products: number;
  };
  connectionInfo?: {
    webhookUrl?: string | null;
    outboundIp?: string | null;
  } | null;
}

const DIGIFLAZZ_WEBHOOK_PATH = '/api/digiflazz/webhook';

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
  const [webhookSecret, setWebhookSecret] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyWebhook = () => {
    const fullUrl = `${getPublicBackendUrl()}${DIGIFLAZZ_WEBHOOK_PATH}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (provider) {
      setApiUsername(provider.apiUsername || '');
      setApiKey(provider.apiKey || '');
      setWebhookSecret((provider as any).webhookSecret || '');
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
        webhookSecret: webhookSecret.trim() || undefined,
      });

      if ((res as any)?.error) {
        addToast({ title: 'GAGAL DISIMPAN', message: (res as any).error, type: 'error' });
        setIsSubmitting(false);
        return;
      }

      const isWartopcoin = provider.code?.toLowerCase() === 'wartopcoin';
      addToast({
        title: 'CREDENTIAL DISIMPAN',
        message: `Konfigurasi ${isWartopcoin ? 'Member Code' : 'Username'} & API Key ${provider.name || 'Provider'} berhasil diperbarui!`,
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

  const isWartopcoin = provider.code?.toLowerCase() === 'wartopcoin';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isWartopcoin ? "KELOLA CREDENTIAL: WARTOPCOIN (H2H GAME)" : "KELOLA CREDENTIAL: DIGIFLAZZ (PPOB & GAME)"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left font-sans">
        {/* Info Header Box */}
        <div className="bg-[var(--nb-pink)] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center gap-2 font-black uppercase text-xs text-black mb-1">
            <ShieldAlert className="w-4 h-4 stroke-[3]" />
            <span>Penting: IP Whitelist & Keamanan API</span>
          </div>
          <p className="text-[11px] font-bold text-black opacity-90 leading-relaxed">
            {isWartopcoin ? (
              <>Pastikan IP publik server Anda sudah didaftarkan pada menu <b>Whitelist IP</b> di dasbor akun <b>Wartopcoin</b> Anda agar request cek saldo tidak diblokir.</>
            ) : (
              <>Sesuai dokumentasi resmi Digiflazz, Anda <b>WAJIB</b> mendaftarkan IP statis server Anda pada menu <i>Koneksi API</i> di Dasbor Digiflazz agar tidak terkena error akses ditolak.</>
            )}
          </p>
          {!isWartopcoin && (
            <div className="mt-2.5 p-2 bg-black text-[var(--nb-mint)] font-mono text-[11px] border-2 border-black flex items-center justify-between gap-2">
              <span className="truncate">{getPublicBackendUrl()}{DIGIFLAZZ_WEBHOOK_PATH}</span>
              <button
                type="button"
                onClick={handleCopyWebhook}
                title="Salin URL Webhook"
                className="flex-shrink-0 flex items-center gap-1 text-[9px] bg-[var(--nb-yellow)] text-black px-1.5 py-0.5 font-black uppercase border border-black hover:bg-yellow-300 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3 stroke-[3]" />}
                {copied ? 'DISALIN!' : 'SALIN'}
              </button>
            </div>
          )}
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <Input 
            label={isWartopcoin ? "Wartopcoin Member Code" : "Digiflazz Username"} 
            placeholder={isWartopcoin ? "Contoh: M5702643513" : "Contoh: netstore_dev123"}
            value={apiUsername} 
            onChange={e => setApiUsername(e.target.value)} 
            required 
          />

          <div>
            <Input 
              label={isWartopcoin ? "Wartopcoin API Key" : "Digiflazz API Key (Production / Dev Key)"} 
              type="password"
              placeholder={isWartopcoin ? "Masukkan API Key dari dasbor Wartopcoin" : "Masukkan API Key rahasia dari menu Koneksi API Digiflazz"}
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              required 
            />
            <p className="text-[10px] font-bold text-neutral-500 mt-1 ml-1">
              {isWartopcoin 
                ? "*API Key rahasia digunakan untuk meng-generate signature SHA-256 saat cek saldo."
                : "*Gunakan Development Key untuk mode uji coba, atau Production Key untuk transaksi asli."}
            </p>
          </div>

          {!isWartopcoin && (
            <div>
              <Input 
                label="Webhook Secret (dari panel Digiflazz)"
                type="password"
                placeholder="Contoh: Neetstore"
                value={webhookSecret}
                onChange={e => setWebhookSecret(e.target.value)}
              />
              <p className="text-[10px] font-bold text-neutral-500 mt-1 ml-1">
                *Harus sama persis dengan Secret yang Anda daftarkan di panel Webhook Digiflazz.
              </p>
            </div>
          )}
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
