import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Wallet, 
  RefreshCw, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { getAdminMutations } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';

export interface MutationItem {
  id: number;
  userId?: number;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
  user?: {
    username: string;
    email: string;
  };
}

export const DepositsPage: React.FC = () => {

  // Local UI State
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page on filter tab change
  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setPage(1);
  };

  // TanStack Query: Load Deposits / Mutations
  const {
    data: depositsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.deposits.list({
      page,
      limit,
      search: debouncedSearch,
      type: filterType,
    }),
    queryFn: () =>
      getAdminMutations({
        page,
        limit,
        search: debouncedSearch,
        type: filterType,
      }),
    placeholderData: keepPreviousData,
  });

  const deposits: MutationItem[] = (depositsResponse as unknown as MutationItem[]) || [];
  const _meta = (depositsResponse as any)?._meta || { totalCount: 0, totalPages: 1 };
  const totalPages = _meta.totalPages || 1;
  const totalCount = _meta.totalCount || 0;

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL & STATS */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              TRANSACTIONS / FINANCE
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL FOUND: {totalCount}
            </Badge>
            {isFetching && !isLoading && (
              <Badge variant="pink" size="sm" className="border-2 font-mono animate-pulse">
                REFRESHING...
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>💰</span>
            <span>USER DEPOSITS & MUTATIONS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Riwayat pengisian saldo (top-up) pengguna dan catatan mutasi keluar-masuk dana.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            onClick={() => refetch()}
            disabled={isFetching}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <RefreshCw className={`w-4 h-4 stroke-[3] ${isFetching ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </Button>
        </div>
      </div>

      {/* 2. TAB FILTER & CARI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: '📋 SEMUA MUTASI' },
            { id: 'CREDIT', label: '🟢 SALDO MASUK (CREDIT)' },
            { id: 'DEBIT', label: '🔴 SALDO KELUAR (DEBIT)' },
          ].map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant={filterType === tab.id ? 'yellow' : 'white'}
              size="sm"
              onClick={() => handleFilterChange(tab.id)}
              className="font-black uppercase text-xs"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Username / Email / Keterangan..."
            className="w-full bg-white border-[2px] border-black px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
          />
          <Search className="w-4 h-4 stroke-[2.5] text-neutral-400 absolute right-2.5 top-2" />
        </div>
      </div>

      {/* 3. TABEL RIWAYAT DEPOSIT */}
      {isLoading ? (
        <Card variant="white" className="p-12 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <RefreshCw className="w-10 h-10 stroke-[2] mx-auto mb-3 animate-spin text-neutral-400" />
          <h3 className="text-lg font-black uppercase">MEMUAT RIWAYAT MUTASI...</h3>
          <p className="text-xs font-bold text-neutral-500 mt-1">Mengambil data mutasi saldo pengguna dari server.</p>
        </Card>
      ) : isError ? (
        <Card variant="white" className="p-8 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <AlertTriangle className="w-12 h-12 stroke-[2] mx-auto mb-3 text-red-500" />
          <h3 className="text-lg font-black uppercase text-red-600">GAGAL MEMUAT MUTASI</h3>
          <p className="text-xs font-bold text-neutral-600 mt-1">
            {(error as any)?.message || 'Terjadi kesalahan saat terhubung ke server backend.'}
          </p>
          <div className="mt-4">
            <Button variant="yellow" size="sm" onClick={() => refetch()} className="font-black uppercase">
              <RefreshCw className="w-4 h-4 mr-2" /> COBA LAGI
            </Button>
          </div>
        </Card>
      ) : deposits.length === 0 ? (
        <Card variant="white" className="p-8 text-center border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
          <Wallet className="w-12 h-12 stroke-[2] mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-black uppercase">
            {debouncedSearch ? 'TIDAK DITEMUKAN HASIL PENCARIAN' : 'BELUM ADA RIWAYAT DEPOSIT / MUTASI'}
          </h3>
          <p className="text-xs font-bold text-neutral-500 mt-1">
            {debouncedSearch
              ? `Tidak ada catatan mutasi yang cocok dengan pencarian "${debouncedSearch}".`
              : `Belum ada transaksi pengisian saldo atau perubahan mutasi yang tercatat.`}
          </p>
        </Card>
      ) : (
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white border-b-[3px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3">ID Mutasi</th>
                  <th className="p-3">Pengguna / User</th>
                  <th className="p-3">Tipe & Keterangan</th>
                  <th className="p-3">Nominal (Rp)</th>
                  <th className="p-3">Saldo Sebelum / Sesudah</th>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-yellow-50 transition-colors">
                    <td className="p-3 font-mono">#DEP-{d.id}</td>
                    <td className="p-3">
                      <div className="font-black text-black">
                        {d.user?.username || `User #${d.userId || '-'}`}
                      </div>
                      <div className="text-xs font-mono text-neutral-500">
                        {d.user?.email || 'System / Merchant'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={d.type === 'CREDIT' ? 'mint' : 'pink'}
                          size="sm"
                          className="font-black uppercase text-[10px]"
                        >
                          {d.type === 'CREDIT' ? (
                            <ArrowDownRight className="w-3 h-3 inline mr-1" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 inline mr-1" />
                          )}
                          {d.type}
                        </Badge>
                        <span className="text-xs font-bold text-neutral-700">
                          {d.description || 'Deposit / Transaksi'}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`p-3 font-black ${
                        d.type === 'CREDIT' ? 'text-green-700' : 'text-red-600'
                      }`}
                    >
                      {d.type === 'CREDIT' ? '+' : '-'} Rp {(d.amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 font-mono text-xs text-neutral-600">
                      <div>Awal: Rp {(d.balanceBefore || 0).toLocaleString('id-ID')}</div>
                      <div>Akhir: Rp {(d.balanceAfter || 0).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="p-3 font-mono text-xs text-neutral-500">
                      -
                    </td>
                    <td className="p-3 text-right text-xs font-mono text-neutral-500">
                      {new Date(d.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. PAGINATION FOOTER */}
          <div className="bg-neutral-100 border-t-[3px] border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
            <div className="text-neutral-600">
              Menampilkan {deposits.length} dari {totalCount} mutasi (Halaman {page} dari {totalPages})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="white"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || isFetching}
                className="font-black uppercase"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> SEBELUMNYA
              </Button>
              <span className="px-2 py-1 bg-white border-[2px] border-black font-mono font-black">
                {page} / {totalPages}
              </span>
              <Button
                variant="white"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || isFetching}
                className="font-black uppercase"
              >
                SELANJUTNYA <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

