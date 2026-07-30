import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Key, 
  RefreshCw, 
  Power, 
  Wallet, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Database 
} from 'lucide-react';
import { ProviderModal } from '../components/ProviderModal';
import { DepositModal } from '../components/DepositModal';
import type { ProviderData } from '../components/ProviderModal';
import { 
  getAdminProviders, 
  updateAdminProvider, 
  checkDigiflazzBalance, 
  syncDigiflazzProducts 
} from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export const ProvidersPage: React.FC = () => {
  const { addToast } = useToast();
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  // Action loading states
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(true);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminProviders();
      setProviders((data as ProviderData[]) || []);
    } catch (e) {
      console.error(e);
      addToast({ title: 'ERROR', message: 'Gagal mengambil data provider', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Filter for Digiflazz (Fixed Provider in System)
  const digiflazzProvider = providers.find(p => p.code.toLowerCase() === 'digiflazz') || providers[0] || null;

  // Handler 1: Kelola Credential
  const handleOpenCredential = () => {
    if (!digiflazzProvider) return;
    setSelectedProvider(digiflazzProvider);
    setCredentialModalOpen(true);
  };

  // Handler 2: Test Connection & Cek Saldo Live
  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await checkDigiflazzBalance();
      if ((res as any)?.error) {
        setApiConnected(false);
        addToast({ 
          title: 'KONEKSI GAGAL', 
          message: (res as any).error || 'Periksa kembali Username atau API Key Digiflazz Anda.', 
          type: 'error' 
        });
      } else {
        setApiConnected(true);
        addToast({ 
          title: 'KONEKSI BERHASIL 🚀', 
          message: `Koneksi API valid! Saldo Digiflazz saat ini: Rp ${((res as any)?.data?.deposit || 0).toLocaleString('id-ID')}`, 
          type: 'success' 
        });
        fetchProviders();
      }
    } catch (err: any) {
      setApiConnected(false);
      addToast({ title: 'KONEKSI GAGAL', message: err.message || 'Gagal menghubungi server Digiflazz.', type: 'error' });
    } finally {
      setTestingConnection(false);
    }
  };

  // Handler 3: Sync Katalog Produk
  const handleSyncProducts = async () => {
    setSyncingProducts(true);
    try {
      const res = await syncDigiflazzProducts();
      if ((res as any)?.success) {
        addToast({ 
          title: 'SINKRONISASI BERHASIL ⚡', 
          message: `Berhasil menyinkronkan ${(res as any)?.count || 'katalog'} produk langsung dari server Digiflazz.`, 
          type: 'success' 
        });
        fetchProviders();
      } else {
        addToast({ 
          title: 'SINKRONISASI GAGAL', 
          message: (res as any)?.error || 'Gagal menyinkronkan katalog produk.', 
          type: 'error' 
        });
      }
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Gagal melakukan sync produk.', type: 'error' });
    } finally {
      setSyncingProducts(false);
    }
  };

  // Handler 4: Toggle Enable / Disable
  const handleToggleStatus = async () => {
    if (!digiflazzProvider) return;
    const nextStatus = !digiflazzProvider.isActive;
    try {
      const res = await updateAdminProvider(digiflazzProvider.id, {
        isActive: nextStatus,
        apiUsername: digiflazzProvider.apiUsername,
        apiKey: digiflazzProvider.apiKey,
      });

      if ((res as any)?.error) {
        addToast({ title: 'GAGAL', message: (res as any).error, type: 'error' });
      } else {
        addToast({ 
          title: nextStatus ? 'PROVIDER AKTIF 🟢' : 'PROVIDER NONAKTIF 🔴', 
          message: nextStatus 
            ? 'Digiflazz diaktifkan. Sistem siap bertransaksi produk.' 
            : 'Digiflazz dinonaktifkan. Seluruh produk Digiflazz berhenti dijual sementara.', 
          type: 'success' 
        });
        fetchProviders();
      }
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Gagal merubah status provider', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header — Fixed System Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="yellow" size="sm" className="border-2 font-black uppercase">
              FIXED SYSTEM PROVIDER
            </Badge>
            <Badge variant="cyan" size="sm" className="border-2 font-mono">
              OFFICIAL API v1.0
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--nb-text)] flex items-center gap-2">
            <Zap className="w-8 h-8 text-[var(--nb-yellow)] fill-[var(--nb-yellow)] stroke-black stroke-[2.5]" />
            <span>MANAJEMEN PROVIDER (FIXED)</span>
          </h1>
          <p className="text-sm font-bold text-[var(--nb-text-muted)] mt-1">
            Provider sistem ditetapkan secara permanen (Hardcoded in System). Anda hanya mengelola konfigurasi credential dan operasional produk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="white" size="md" className="border-2 font-mono text-xs uppercase">
            1 SUPPORTED PROVIDER
          </Badge>
        </div>
      </div>

      {/* Loading Screen */}
      {isLoading ? (
        <div className="bg-white border-[3px] border-black p-12 text-center shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[var(--nb-purple)] mb-3" />
          <p className="font-black uppercase text-sm">MEMUAT DATA PROVIDER...</p>
        </div>
      ) : !digiflazzProvider ? (
        <div className="bg-[var(--nb-pink)] border-[3px] border-black p-8 text-center shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 stroke-[3]" />
          <h3 className="text-xl font-black uppercase">Provider Digiflazz Belum Dikonfigurasi di Database</h3>
          <p className="text-xs font-bold mt-1">Jalankan seed migration atau periksa tabel Provider Anda.</p>
        </div>
      ) : (
        /* DIGIFLAZZ MAIN CARD (NEON BRUTALISM WOW DESIGN) */
        <Card variant="white" className="border-[3px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden">
          {/* Card Top Banner with Official Logo Branding */}
          <div className="bg-[var(--nb-purple)] p-6 border-b-[3px] border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo Box */}
              <div className="w-16 h-16 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center font-black text-2xl text-[var(--nb-purple)] tracking-tighter">
                DF
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="yellow" size="sm" className="border-2 font-black uppercase">
                    PPOB & GAME API
                  </Badge>
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                  DIGIFLAZZ INDONESIA
                </h2>
                <p className="text-xs font-bold text-white/90">
                  Koneksi resmi ke katalog 1.000+ produk game digital, voucher, pulsa & token listrik PPOB.
                </p>
              </div>
            </div>

            {/* Single Master Enable / Disable Toggle Button */}
            <div className="flex items-center">
              <Button
                variant={digiflazzProvider.isActive ? 'pink' : 'mint'}
                size="md"
                onClick={handleToggleStatus}
                className="font-black uppercase shadow-[4px_4px_0px_0px_#000] border-[3px] border-black"
              >
                <Power className="w-4 h-4 stroke-[3]" />
                <span>{digiflazzProvider.isActive ? 'DISABLE PROVIDER' : 'ENABLE PROVIDER'}</span>
              </Button>
            </div>
          </div>

          <CardContent className="p-6 md:p-8 space-y-8">
            {/* 4 Key Status Metric Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Metric 1: Status Koneksi Server Web <-> Digiflazz */}
              <div className="bg-[var(--nb-surface-alt)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-xs font-black uppercase text-[var(--nb-text-muted)] block mb-1">
                  Status Koneksi Server
                </span>
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border-2 border-black ${apiConnected !== false ? 'bg-[var(--nb-mint)] animate-pulse' : 'bg-[var(--nb-pink)]'}`} />
                  <span className="text-lg font-black uppercase">
                    {apiConnected !== false ? 'TERHUBUNG 🟢' : 'ERROR 🔴'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[var(--nb-text-muted)] mt-1">
                  {apiConnected !== false ? 'Koneksi ke server Digiflazz valid' : 'Cek kembali API Key & Whitelist IP'}
                </p>
              </div>

              {/* Metric 2: Saldo Deposit */}
              <div className="bg-[var(--nb-mint)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-xs font-black uppercase text-black/80 block mb-1">
                  Saldo Deposit Digiflazz
                </span>
                <div className="text-2xl font-black uppercase tracking-tight text-black">
                  Rp {(digiflazzProvider.balance || 0).toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] font-bold text-black/80 mt-1">
                  Saldo riil di akun Digiflazz Anda
                </p>
              </div>

              {/* Metric 3: Jumlah Produk */}
              <div className="bg-[var(--nb-cyan)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-xs font-black uppercase text-black/80 block mb-1">
                  Jumlah Produk Ter-Sync
                </span>
                <div className="text-2xl font-black uppercase tracking-tight text-black flex items-center gap-1.5">
                  <Database className="w-6 h-6 stroke-[2.5]" />
                  <span>{(digiflazzProvider._count?.products || 0).toLocaleString('id-ID')} SKU</span>
                </div>
                <p className="text-[11px] font-bold text-black/80 mt-1">
                  Tersinkron di katalog lokal
                </p>
              </div>

              {/* Metric 4: Last Sync */}
              <div className="bg-[var(--nb-yellow)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-xs font-black uppercase text-black/80 block mb-1">
                  Terakhir Sinkronisasi
                </span>
                <div className="text-base font-black uppercase tracking-tight text-black flex items-center gap-1.5">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                  <span>{digiflazzProvider.lastSync ? new Date(digiflazzProvider.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Belum Pernah Sync'}</span>
                </div>
                <p className="text-[11px] font-bold text-black/80 mt-1">
                  Jadwal otomatis setiap 15 menit
                </p>
              </div>
            </div>

            {/* ACTION MENU BAR (EXACTLY AS REQUESTED: 5 BUTTONS) */}
            <div className="bg-neutral-100 border-[3px] border-black p-6 shadow-[4px_4px_0px_0px_#000]">
              <h3 className="text-sm font-black uppercase text-[var(--nb-text)] mb-4 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--nb-purple)]" />
                <span>AKSI KELOLA PROVIDER DIGIFLAZZ</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Aksi 1: Kelola Credential */}
                <Button
                  variant="purple"
                  size="md"
                  onClick={handleOpenCredential}
                  fullWidth
                  className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
                >
                  <Key className="w-4 h-4 stroke-[3]" />
                  <span>1. KELOLA CREDENTIAL</span>
                </Button>

                {/* Aksi 2: Test Connection */}
                <Button
                  variant="yellow"
                  size="md"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  fullWidth
                  className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
                >
                  <RefreshCw className={`w-4 h-4 stroke-[3] ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>{testingConnection ? 'TESTING...' : '2. TEST CONNECTION'}</span>
                </Button>

                {/* Aksi 3: Sync Produk */}
                <Button
                  variant="cyan"
                  size="md"
                  onClick={handleSyncProducts}
                  disabled={syncingProducts}
                  fullWidth
                  className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
                >
                  <Zap className={`w-4 h-4 stroke-[3] ${syncingProducts ? 'animate-spin' : ''}`} />
                  <span>{syncingProducts ? 'SYNCING...' : '3. SYNC PRODUK'}</span>
                </Button>

                {/* Aksi 4: Deposit Saldo Digiflazz */}
                <Button
                  variant="white"
                  size="md"
                  onClick={() => setDepositModalOpen(true)}
                  fullWidth
                  className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000 bg-white hover:bg-neutral-50"
                >
                  <Wallet className="w-4 h-4 stroke-[3] text-[var(--nb-mint)]" />
                  <span>4. DEPOSIT SALDO</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal 1: Kelola Credential Digiflazz */}
      <ProviderModal
        isOpen={credentialModalOpen}
        onClose={() => setCredentialModalOpen(false)}
        provider={selectedProvider}
        onSuccess={fetchProviders}
      />

      {/* Modal 2: Real Interactive Deposit Ticket Creator */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSuccess={fetchProviders}
      />
    </div>
  );
};
