import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
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
          title: 'SINKRONISASI BERHASIL',
          message: `Berhasil menyinkronkan ${res.count || 'katalog'} produk dari server Digiflazz.`,
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
          title: nextStatus ? 'PROVIDER AKTIF' : 'PROVIDER NONAKTIF',
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
      <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
        <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--nb-text)]">
          MANAJEMEN PROVIDER
        </h1>
        <p className="text-sm font-bold text-[var(--nb-text-muted)] mt-1">
          Kelola kredensial API, saldo deposit, dan status operasional.
        </p>
      </div>

      {/* Loading Screen */}
      {isLoading ? (
        <div className="bg-white border-[3px] border-black p-12 text-center shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
          <p className="font-black uppercase text-sm">MEMUAT DATA PROVIDER...</p>
        </div>
      ) : isError ? (
        <div className="bg-[var(--nb-pink)] border-[3px] border-black p-8 text-center shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
          <h3 className="text-xl font-black uppercase">GAGAL MEMUAT DATA PROVIDER</h3>
          <p className="text-xs font-bold mt-1">{(error as any)?.message || 'Terjadi kesalahan sistem'}</p>
        </div>
      ) : !digiflazzProvider ? (
        <div className="bg-[var(--nb-pink)] border-[3px] border-black p-8 text-center shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
          <h3 className="text-xl font-black uppercase">PROVIDER DIGIFLAZZ BELUM DIKONFIGURASI</h3>
          <p className="text-xs font-bold mt-1">Jalankan seed migration atau periksa tabel Provider Anda.</p>
        </div>
      ) : (
        /* DIGIFLAZZ MAIN CARD */
        <Card variant="white" className="border-[3px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden">
          {/* Card Top Banner */}
          <div className="bg-[var(--nb-purple)] p-6 border-b-[3px] border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {digiflazzProvider.isActive ? (
                  <Badge variant="mint" size="sm" className="border-2 font-black uppercase">WEB: AKTIF</Badge>
                ) : (
                  <Badge variant="pink" size="sm" className="border-2 font-black uppercase">WEB: NON-AKTIF</Badge>
                )}
                {digiflazzProvider.isConnected ? (
                  <Badge variant="mint" size="sm" className="border-2 font-black uppercase">API: TERHUBUNG</Badge>
                ) : (
                  <Badge variant="pink" size="sm" className="border-2 font-black uppercase">API: TIDAK TERHUBUNG</Badge>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                DIGIFLAZZ
              </h2>
              <p className="text-xs font-bold text-white/90">
                Provider produk Digiflazz
              </p>
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
                <span>{digiflazzProvider.isActive ? 'DISABLE WEB STATUS' : 'ENABLE WEB STATUS'}</span>
              </Button>
            </div>
          </div>

          <CardContent className="p-6 md:p-8 space-y-8">
            {/* 3 Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Metric 1: Saldo Deposit */}
              <div className="bg-[var(--nb-mint)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-xs font-black uppercase text-black/80 block mb-1">
                  Saldo Deposit
                </span>
                <div className="text-2xl font-black uppercase tracking-tight text-black">
                  Rp {(digiflazzProvider.balance || 0).toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] font-bold text-black/80 mt-1">
                  {refreshBalanceMutation.isPending ? 'Memperbarui saldo live...' : 'Saldo terverifikasi dari Digiflazz'}
                </p>
              </div>

              {/* Metric 2: Jumlah Produk */}
              <div className="bg-[var(--nb-cyan)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-xs font-black uppercase text-black/80 block mb-1">
                  Jumlah Produk
                </span>
                <div className="text-2xl font-black uppercase tracking-tight text-black">
                  {(digiflazzProvider._count?.products || 0).toLocaleString('id-ID')} produk
                </div>
                <p className="text-[11px] font-bold text-black/80 mt-1">
                  Tersinkron di katalog lokal
                </p>
              </div>

              {/* Metric 3: Terakhir Sync Catalog */}
              <div className="bg-[var(--nb-yellow)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-xs font-black uppercase text-black/80 block mb-1">
                  Terakhir Sync Catalog
                </span>
                <div className="text-xl font-black uppercase tracking-tight text-black">
                  {digiflazzProvider.lastSync ? new Date(digiflazzProvider.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Belum Sync'}
                </div>
                <p className="text-[11px] font-bold text-black/80 mt-1">
                  Sync katalog produk berkala
                </p>
              </div>
            </div>

            {/* ACTION MENU BAR */}
            <div className="bg-neutral-100 border-[3px] border-black p-6 shadow-[4px_4px_0px_0px_#000]">
              <h3 className="text-sm font-black uppercase text-[var(--nb-text)] mb-4 tracking-tight">
                AKSI KELOLA PROVIDER DIGIFLAZZ
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
                  <span>KELOLA CREDENTIAL</span>
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
                  <span>{syncProductsMutation.isPending ? 'SYNCING...' : 'SYNC PRODUK'}</span>
                </Button>

                {/* Aksi 3: Top Up Saldo Digiflazz */}
                <Button
                  variant="white"
                  size="md"
                  onClick={() => setDepositModalOpen(true)}
                  fullWidth
                  className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000] bg-white hover:bg-neutral-50"
                >
                  <span>TOP UP SALDO DIGIFLAZZ</span>
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

      {/* Modal 2: Deposit Ticket Creator */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all })}
      />
    </div>
  );
};
