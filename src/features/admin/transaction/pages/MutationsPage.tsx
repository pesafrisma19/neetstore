import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../../services/queryKeys';
import { getAdminMutations } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Search, History, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MutationData } from '../../types';

export const MutationsPage: React.FC = () => {
  // Pagination & Filter States
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // TanStack Query Server State
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.mutations.list({ page, limit, search, type: typeFilter, dateFrom, dateTo }),
    queryFn: () => getAdminMutations({ page, limit, search, type: typeFilter, dateFrom, dateTo }),
  });

  const mutations: MutationData[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleResetFilter = () => {
    setSearch('');
    setTypeFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <Card variant="white" shadow="xl" borderWidth="4" className="rounded-3xl overflow-hidden">
        <CardHeader headerBg="#00F0FF" className="border-b-[4px] border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base text-[var(--nb-text)] font-black uppercase">
            <History className="w-5 h-5 stroke-[3]" />
            <span>AUDIT RIWAYAT MUTASI SALDO USER</span>
          </CardTitle>
          <Badge variant="cyan" size="sm" className="font-black">
            TOTAL: {total} RECORD MUTASI
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* FILTER BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* SEARCH INPUT */}
            <div className="relative">
              <Input
                placeholder="Cari User / Keterangan..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 bg-white"
              />
              <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[3]" />
            </div>

            {/* FILTER TIPE */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="w-full p-2.5 bg-white border-[3px] border-black rounded-xl font-extrabold text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              >
                <option value="ALL">SEMUA TIPE (IN & OUT)</option>
                <option value="IN">+ MASUK (KREDIT)</option>
                <option value="OUT">- KELUAR (DEBIT)</option>
              </select>
            </div>

            {/* DATE FROM */}
            <div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                placeholder="Dari Tanggal"
                className="bg-white text-xs font-bold"
              />
            </div>

            {/* DATE TO */}
            <div>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                placeholder="Sampai Tanggal"
                className="bg-white text-xs font-bold"
              />
            </div>

            {/* RESET FILTER BUTTON */}
            <div>
              <Button
                variant="white"
                size="md"
                onClick={handleResetFilter}
                className="w-full font-black text-xs h-[42px] border-[3px]"
              >
                RESET FILTER
              </Button>
            </div>
          </div>

          {/* TABLE MUTASI */}
          <div className="border-[3px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TANGGAL</TableHead>
                  <TableHead>USER</TableHead>
                  <TableHead>TIPE</TableHead>
                  <TableHead>SALDO AWAL</TableHead>
                  <TableHead>NOMINAL</TableHead>
                  <TableHead>SALDO AKHIR</TableHead>
                  <TableHead>KETERANGAN / DESKRIPSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 font-black text-xs uppercase">
                      Memuat riwayat mutasi saldo...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 font-black text-xs text-rose-600 uppercase">
                      ⚠️ {(error as any)?.message || 'Gagal mengambil data mutasi'}
                    </TableCell>
                  </TableRow>
                ) : mutations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 font-black text-xs text-neutral-500 uppercase">
                      Tidak ada record mutasi saldo ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  mutations.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-bold text-xs text-neutral-600 font-mono">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString('id-ID') : '-'}
                      </TableCell>
                      <TableCell className="font-black text-xs text-black uppercase">
                        {m.user?.username || `User #${m.userId}`}
                        {m.user?.email && <span className="block text-[10px] text-neutral-500 lowercase font-mono">{m.user.email}</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.type === 'IN' ? 'mint' : 'pink'} size="sm">
                          {m.type === 'IN' ? '+ MASUK' : '- KELUAR'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-neutral-600">
                        Rp {(m.startingBalance || 0).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className={`font-black font-mono text-xs ${m.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.type === 'IN' ? '+' : '-'} Rp {(m.amount || 0).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-black text-black">
                        Rp {(m.endingBalance || 0).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-neutral-800 max-w-xs truncate">
                        {m.description}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-neutral-600 font-mono">
                Halaman {page} dari {totalPages} ({total} Total Mutasi)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="white"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="font-black"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                  <span>SEBELUMNYA</span>
                </Button>
                <Button
                  variant="white"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="font-black"
                >
                  <span>SELANJUTNYA</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
