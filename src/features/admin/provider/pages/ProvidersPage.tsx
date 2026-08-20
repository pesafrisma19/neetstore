import React, { useState } from 'react';
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
  checkWartopcoinBalance,
  syncDigiflazzProducts,
  syncWartopcoinProducts,
} from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { useToast } from '../../../../components/ui/ToastContext';
import { RefreshCw, KeyRound, ArrowUpCircle } from 'lucide-react';

export const ProvidersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Modals state
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

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

  // 2. TanStack Mutation for Live Balance Refresh
  const refreshBalanceMutation = useMutation({
    mutationFn: async (providerCode: string) => {
      const code = providerCode?.toLowerCase();
      if (code === 'wartopcoin') {
        const res = await checkWartopcoinBalance();
        if (res?.error) throw new Error(res.error);
        return res;
      } else if (code === 'digiflazz') {
        const res = await checkDigiflazzBalance();
        if (res?.error) throw new Error(res.error);
        return res;
      }
      throw new Error(`Provider '${providerCode}' tidak mendukung refresh saldo langsung.`);
    },
    onSuccess: (_, providerCode) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all });
      addToast({
        title: 'SALDO TERPERBARUI',
        message: `Saldo ${providerCode.toUpperCase()} berhasil disinkronkan real-time.`,
        type: 'success',
      });
    },
    onError: (err: any) => {
      addToast({
        title: 'GAGAL REFRESH SALDO',
        message: err.message || 'Terjadi kesalahan saat mengecek saldo.',
        type: 'error',
      });
    },
  });

  // 3. TanStack Mutation for Digiflazz Catalog Sync
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

  // 4. TanStack Mutation for Wartopcoin Existing Products Sync
  const syncWartopcoinMutation = useMutation({
    mutationFn: async () => {
      const res = await syncWartopcoinProducts();
      if (res?.error) throw new Error(res.error);
      return res;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all });
      addToast({
        title: 'SYNC WARTOPCOIN SUKSES',
        message: data?.message || 'Produk Wartopcoin berhasil disinkronisasi!',
        type: 'success',
      });
    },
    onError: (err: any) => {
      addToast({
        title: 'SYNC GAGAL',
        message: err.message || 'Gagal sinkronisasi produk Wartopcoin.',
        type: 'error',
      });
    },
  });

  // 5. TanStack Mutation for Web Status Toggle
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, nextStatus }: { id: number; nextStatus: boolean; name: string }) => {
      return updateAdminProvider(id, {
        isActive: nextStatus,
      });
    },
    onSuccess: (res: any, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all });
      if (res?.error) {
        addToast({ title: 'GAGAL', message: res.error, type: 'error' });
      } else {
        addToast({
          title: variables.nextStatus ? 'PROVIDER AKTIF' : 'PROVIDER NONAKTIF',
          message: variables.nextStatus
            ? `${variables.name} diaktifkan. Sistem siap bertransaksi produk.`
            : `${variables.name} dinonaktifkan. Produk terkait berhenti dijual sementara.`,
          type: 'success',
        });
      }
    },
    onError: (err: any) => {
      addToast({ title: 'ERROR', message: err.message || 'Gagal mengubah status provider', type: 'error' });
    },
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
        <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--nb-text)]">
          MANAJEMEN PROVIDER
        </h1>
        <p className="text-sm font-bold text-[var(--nb-text-muted)] mt-1">
          Kelola kredensial API, saldo deposit, dan status operasional masing-masing provider.
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
      ) : providers.length === 0 ? (
        <div className="bg-[var(--nb-pink)] border-[3px] border-black p-8 text-center shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
          <h3 className="text-xl font-black uppercase">BELUM ADA PROVIDER TERDAFTAR</h3>
          <p className="text-xs font-bold mt-1">Jalankan seed migration atau periksa tabel Provider Anda.</p>
        </div>
      ) : (
        /* PROVIDERS LIST */
        <div className="space-y-8">
          {providers.map((provider) => {
            const isDigiflazz = provider.code?.toLowerCase() === 'digiflazz';
            const isWartopcoin = provider.code?.toLowerCase() === 'wartopcoin';

            return (
              <Card key={provider.id} variant="white" className="border-[3px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden">
                {/* Card Top Banner */}
                <div className={`p-6 border-b-[3px] border-black flex flex-col md:flex-row md:items-center justify-between gap-4 ${isWartopcoin ? 'bg-[var(--nb-cyan)]' : 'bg-[var(--nb-purple)]'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {provider.isActive ? (
                        <Badge variant="mint" size="sm" className="border-2 font-black uppercase">WEB: AKTIF</Badge>
                      ) : (
                        <Badge variant="pink" size="sm" className="border-2 font-black uppercase">WEB: NON-AKTIF</Badge>
                      )}
                      {provider.isConnected ? (
                        <Badge variant="mint" size="sm" className="border-2 font-black uppercase">API: TERHUBUNG</Badge>
                      ) : (
                        <Badge variant="pink" size="sm" className="border-2 font-black uppercase">API: TIDAK TERHUBUNG</Badge>
                      )}
                    </div>
                    <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${isWartopcoin ? 'text-black' : 'text-white'}`}>
                      {provider.name || provider.code}
                    </h2>
                    <p className={`text-xs font-bold ${isWartopcoin ? 'text-black/80' : 'text-white/90'}`}>
                      {isWartopcoin ? 'Provider H2H Topup Game Wartopcoin' : isDigiflazz ? 'Provider produk Digiflazz' : `Provider ${provider.name}`}
                    </p>
                  </div>

                  {/* Toggle Web Status Button */}
                  <div className="flex items-center">
                    <Button
                      variant={provider.isActive ? 'pink' : 'mint'}
                      size="md"
                      onClick={() => toggleStatusMutation.mutate({ id: provider.id, nextStatus: !provider.isActive, name: provider.name || provider.code })}
                      disabled={toggleStatusMutation.isPending}
                      isLoading={toggleStatusMutation.isPending}
                      className="font-black uppercase shadow-[4px_4px_0px_0px_#000] border-[3px] border-black"
                    >
                      <span>{provider.isActive ? 'DISABLE WEB STATUS' : 'ENABLE WEB STATUS'}</span>
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
                        Rp {(provider.balance || 0).toLocaleString('id-ID')}
                      </div>
                      <p className="text-[11px] font-bold text-black/80 mt-1">
                        {isWartopcoin ? 'Saldo terverifikasi dari Wartopcoin' : 'Saldo terverifikasi dari provider'}
                      </p>
                    </div>

                    {/* Metric 2: Jumlah Produk */}
                    <div className="bg-[var(--nb-yellow)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                      <span className="text-xs font-black uppercase text-black/80 block mb-1">
                        Jumlah Produk
                      </span>
                      <div className="text-2xl font-black uppercase tracking-tight text-black">
                        {(provider._count?.products || 0).toLocaleString('id-ID')} produk
                      </div>
                      <p className="text-[11px] font-bold text-black/80 mt-1">
                        Tersinkron di katalog lokal
                      </p>
                    </div>

                    {/* Metric 3: Terakhir Cek / Sync */}
                    <div className="bg-white border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
                      <span className="text-xs font-black uppercase text-black/80 block mb-1">
                        {isDigiflazz ? 'Terakhir Sync Catalog' : 'Terakhir Cek Saldo'}
                      </span>
                      <div className="text-xl font-black uppercase tracking-tight text-black">
                        {provider.lastSync ? new Date(provider.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Belum Pernah'}
                      </div>
                      <p className="text-[11px] font-bold text-black/80 mt-1">
                        {isDigiflazz ? 'Sync katalog produk berkala' : 'Sinkronisasi saldo real-time'}
                      </p>
                    </div>
                  </div>

                  {/* ACTION MENU BAR */}
                  <div className="bg-neutral-100 border-[3px] border-black p-6 shadow-[4px_4px_0px_0px_#000]">
                    <h3 className="text-sm font-black uppercase text-[var(--nb-text)] mb-4 tracking-tight">
                      AKSI KELOLA PROVIDER {provider.name?.toUpperCase() || provider.code?.toUpperCase()}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Aksi 1: Kelola Credential */}
                      <Button
                        variant="purple"
                        size="md"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setCredentialModalOpen(true);
                        }}
                        fullWidth
                        className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
                      >
                        <KeyRound className="w-3.5 h-3.5 mr-1" />
                        <span>KELOLA CREDENTIAL</span>
                      </Button>

                      {/* Aksi 2: Refresh Saldo */}
                      <Button
                        variant="mint"
                        size="md"
                        onClick={() => refreshBalanceMutation.mutate(provider.code)}
                        disabled={refreshBalanceMutation.isPending}
                        isLoading={refreshBalanceMutation.isPending}
                        fullWidth
                        className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        <span>REFRESH SALDO</span>
                      </Button>

                      {/* Aksi Khusus Digiflazz: Sync Produk */}
                      {isDigiflazz && (
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
                      )}

                      {/* Aksi Khusus Wartopcoin: Sync Produk DB */}
                      {isWartopcoin && (
                        <Button
                          variant="cyan"
                          size="md"
                          onClick={() => syncWartopcoinMutation.mutate()}
                          disabled={syncWartopcoinMutation.isPending}
                          isLoading={syncWartopcoinMutation.isPending}
                          fullWidth
                          className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
                        >
                          <span>{syncWartopcoinMutation.isPending ? 'SYNCING...' : 'SYNC PRODUK DB'}</span>
                        </Button>
                      )}

                      {/* Aksi Khusus Digiflazz: Top Up Saldo */}
                      {isDigiflazz && (
                        <Button
                          variant="white"
                          size="md"
                          onClick={() => setDepositModalOpen(true)}
                          fullWidth
                          className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000] bg-white hover:bg-neutral-50"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5 mr-1" />
                          <span>TOP UP SALDO</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal 1: Kelola Credential */}
      <ProviderModal
        isOpen={credentialModalOpen}
        onClose={() => setCredentialModalOpen(false)}
        provider={selectedProvider}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all })}
      />

      {/* Modal 2: Deposit Ticket Creator (Digiflazz) */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all })}
      />
    </div>
  );
};
