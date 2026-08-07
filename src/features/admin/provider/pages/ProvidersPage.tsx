import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { queryKeys } from '../../../../services/queryKeys';
import { useToast } from '../../../../components/ui/ToastContext';

export const ProvidersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Modals state
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  // Ref for 1x background live refresh on mount (prevents infinite refetch loops)
  const hasRefreshedOnMount = useRef(false);

  // 1. TanStack Query for Providers list
  const {
    data: providers = [],
    isLoading,
    isError,
    error,
  } = useQuery<ProviderData[]>({
    queryKey: queryKeys.admin.providers.all,
    queryFn: async () => {
      const res = await getAdminProviders();
      return (res as ProviderData[]) || [];
    },
  });

  // Digiflazz Provider instance
  const digiflazzProvider = providers.find((p) => p.code?.toLowerCase() === 'digiflazz') || providers[0] || null;

  // 2. TanStack Mutation for Live Balance Refresh (Background 1x Check)
  const refreshBalanceMutation = useMutation({
    mutationFn: () => checkDigiflazzBalance(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all });
    },
    onError: (err: any) => {
      console.error('[BACKGROUND BALANCE REFRESH ERROR]', err);
    },
  });

  // 1x Background Live Balance Refresh on initial mount (runs once after provider data loads)
  useEffect(() => {
    if (digiflazzProvider && !hasRefreshedOnMount.current) {
      hasRefreshedOnMount.current = true;
      refreshBalanceMutation.mutate();
    }
  }, [digiflazzProvider]);

  // 3. TanStack Mutation for Catalog Sync
  const syncProductsMutation = useMutation({
    mutationFn: () => syncDigiflazzProducts(),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all });
      if (res?.success) {
        addToast({
          title: 'SINKRONISASI BERHASIL ⚡',
          message: `Berhasil menyinkronkan ${res.count || 'katalog'} produk langsung dari server Digiflazz.`,
          type: 'success',
        });
      } else {
        addToast({
          title: 'SINKRONISASI GAGAL',
          message: res?.error || 'Gagal menyinkronkan katalog produk.',
          type: 'error',
        });
      }
    },
    onError: (err: any) => {
      addToast({ title: 'ERROR', message: err.message || 'Gagal melakukan sync produk.', type: 'error' });
    },
  });

  // 4. TanStack Mutation for Web Status Toggle (Minimal Payload: ONLY { isActive })
  const toggleStatusMutation = useMutation({
    mutationFn: async (nextStatus: boolean) => {
      if (!digiflazzProvider) return;
      return updateAdminProvider(digiflazzProvider.id, {
        isActive: nextStatus,
      });
    },
    onSuccess: (res: any, nextStatus: boolean) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all });
      if (res?.error) {
        addToast({ title: 'GAGAL', message: res.error, type: 'error' });
      } else {
        addToast({
          title: nextStatus ? 'PROVIDER AKTIF 🟢' : 'PROVIDER NONAKTIF 🔴',
          message: nextStatus
            ? 'Digiflazz diaktifkan. Sistem siap bertransaksi produk.'
            : 'Digiflazz dinonaktifkan. Seluruh produk Digiflazz berhenti dijual sementara.',
          type: 'success',
        });
      }
    },
    onError: (err: any) => {
      addToast({ title: 'ERROR', message: err.message || 'Gagal mengubah status provider', type: 'error' });
    },
  });

  // Handlers
  const handleOpenCredential = () => {
    if (!digiflazzProvider) return;
    setSelectedProvider(digiflazzProvider);
    setCredentialModalOpen(true);
  };

  const handleToggleStatus = () => {
    if (!digiflazzProvider) return;
    toggleStatusMutation.mutate(!digiflazzProvider.isActive);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
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
            <span>MANAJEMEN PROVIDER (DIGIFLAZZ)</span>
          </h1>
          <p className="text-sm font-bold text-[var(--nb-text-muted)] mt-1">
            Provider sistem ditetapkan secara permanen. Kelola kredensial API, saldo deposit, dan status operasional.
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
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[var(--nb-purple)] mb-3 stroke-[3]" />
          <p className="font-black uppercase text-sm">MEMUAT DATA PROVIDER...</p>
        </div>
      ) : isError ? (
        <div className="bg-[var(--nb-pink)] border-[3px] border-black p-8 text-center shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 stroke-[3]" />
          <h3 className="text-xl font-black uppercase">Gagal Memuat Data Provider</h3>
          <p className="text-xs font-bold mt-1">{(error as any)?.message || 'Terjadi kesalahan sistem'}</p>
        </div>
      ) : !digiflazzProvider ? (
        <div className="bg-[var(--nb-pink)] border-[3px] border-black p-8 text-center shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 stroke-[3]" />
          <h3 className="text-xl font-black uppercase">Provider Digiflazz Belum Dikonfigurasi di Database</h3>
          <p className="text-xs font-bold mt-1">Jalankan seed migration atau periksa tabel Provider Anda.</p>
        </div>
      ) : (
        /* DIGIFLAZZ MAIN CARD */
        <Card variant="white" className="border-[3px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden">
          {/* Card Top Banner */}
          <div className="bg-[var(--nb-purple)] p-6 border-b-[3px] border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center font-black text-2xl text-[var(--nb-purple)] tracking-tighter">
                DF
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="yellow" size="sm" className="border-2 font-black uppercase">
                    PPOB & GAME API
                  </Badge>
                  {digiflazzProvider.isActive ? (
                    <Badge variant="mint" size="sm" className="border-2 font-black uppercase">WEB: AKTIF 🟢</Badge>
                  ) : (
                    <Badge variant="pink" size="sm" className="border-2 font-black uppercase">WEB: NON-AKTIF 🔴</Badge>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                  DIGIFLAZZ INDONESIA
                </h2>
                <p className="text-xs font-bold text-white/90">
                  Koneksi resmi ke katalog 1.000+ produk game digital, voucher, pulsa & token listrik PPOB.
                </p>
              </div>
            </div>

            {/* Toggle Web Status Button */}
            <div className="flex items-center">
              <Button
                variant={digiflazzProvider.isActive ? 'pink' : 'mint'}
                size="md"
                onClick={handleToggleStatus}
                disabled={toggleStatusMutation.isPending}
                isLoading={toggleStatusMutation.isPending}
                className="font-black uppercase shadow-[4px_4px_0px_0px_#000] border-[3px] border-black"
              >
                <Power className="w-4 h-4 stroke-[3]" />
                <span>{digiflazzProvider.isActive ? 'DISABLE WEB STATUS' : 'ENABLE WEB STATUS'}</span>
              </Button>
            </div>
          </div>

          <CardContent className="p-6 md:p-8 space-y-8">
            {/* 4 Key Status Metric Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Metric 1: Status Koneksi Server DB/Backend (isConnected) */}
              <div className="bg-[var(--nb-surface-alt)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-xs font-black uppercase text-[var(--nb-text-muted)] block mb-1">
                  Status Koneksi API (isConnected)
                </span>
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border-2 border-black ${digiflazzProvider.isConnected ? 'bg-[var(--nb-mint)] animate-pulse' : 'bg-[var(--nb-pink)]'}`} />
                  <span className="text-base font-black uppercase">
                    {digiflazzProvider.isConnected ? 'API: TERHUBUNG 🟢' : 'API: TIDAK TERHUBUNG 🔴'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[var(--nb-text-muted)] mt-1">
                  {digiflazzProvider.isConnected ? 'Kredensial API Digiflazz valid' : 'Periksa Username / API Key / Whitelist IP'}
                </p>
              </div>

              {/* Metric 2: Saldo Deposit */}
              <div className="bg-[var(--nb-mint)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-xs font-black uppercase text-black/80 block mb-1 flex items-center justify-between">
                  <span>Saldo Deposit Digiflazz</span>
                  {refreshBalanceMutation.isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin stroke-[3]" />}
                </span>
                <div className="text-2xl font-black uppercase tracking-tight text-black">
                  Rp {(digiflazzProvider.balance || 0).toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] font-bold text-black/80 mt-1">
                  {refreshBalanceMutation.isPending ? 'Memperbarui saldo live...' : 'Saldo terverifikasi dari Digiflazz'}
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

              {/* Metric 4: Last Sync (Catalog Cron Sync) */}
              <div className="bg-[var(--nb-yellow)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-xs font-black uppercase text-black/80 block mb-1">
                  Terakhir Sync Catalog
                </span>
                <div className="text-base font-black uppercase tracking-tight text-black flex items-center gap-1.5">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                  <span>{digiflazzProvider.lastSync ? new Date(digiflazzProvider.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Belum Sync'}</span>
                </div>
                <p className="text-[11px] font-bold text-black/80 mt-1">
                  Sync katalog produk berkala
                </p>
              </div>
            </div>

            {/* ACTION MENU BAR (CLEAN 3 BUTTON LAYOUT) */}
            <div className="bg-neutral-100 border-[3px] border-black p-6 shadow-[4px_4px_0px_0px_#000]">
              <h3 className="text-sm font-black uppercase text-[var(--nb-text)] mb-4 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--nb-purple)]" />
                <span>AKSI KELOLA PROVIDER DIGIFLAZZ</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                {/* Aksi 2: Sync Produk */}
                <Button
                  variant="cyan"
                  size="md"
                  onClick={() => syncProductsMutation.mutate()}
                  disabled={syncProductsMutation.isPending}
                  isLoading={syncProductsMutation.isPending}
                  fullWidth
                  className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
                >
                  <Zap className={`w-4 h-4 stroke-[3] ${syncProductsMutation.isPending ? 'animate-spin' : ''}`} />
                  <span>{syncProductsMutation.isPending ? 'SYNCING...' : '2. SYNC PRODUK'}</span>
                </Button>

                {/* Aksi 3: Top Up Saldo Digiflazz */}
                <Button
                  variant="white"
                  size="md"
                  onClick={() => setDepositModalOpen(true)}
                  fullWidth
                  className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000] bg-white hover:bg-neutral-50"
                >
                  <Wallet className="w-4 h-4 stroke-[3] text-[var(--nb-mint)]" />
                  <span>3. TOP UP SALDO DIGIFLAZZ</span>
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
        onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all })}
      />

      {/* Modal 2: Real Interactive Deposit Ticket Creator */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all })}
      />
    </div>
  );
};
