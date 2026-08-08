import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { ClipboardList, RefreshCw, User, MapPin, Search, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { getAdminActivityLogs } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';

export interface ActivityLog {
  id: number;
  userId?: number;
  action: string;
  target?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  user?: { username: string };
}

export const LogsActivityPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.admin.logs.activity({ page, limit, search: debouncedSearch }),
    queryFn: () => getAdminActivityLogs({ page, limit, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const logs: ActivityLog[] = (data as any)?.data || [];
  const meta = (data as any)?._meta || { totalCount: 0, totalPages: 1 };
  const totalCount = meta.totalCount || 0;
  const totalPages = meta.totalPages || 1;

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* HEADER PAGE */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              AUDIT TRAIL
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL RECORD: {totalCount}
            </Badge>
            {isFetching && !isLoading && (
              <Badge variant="pink" size="sm" className="border-2 font-mono animate-pulse">
                REFRESHING...
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-black" />
            <span>ACTIVITY LOG</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Catatan audit trail aktivitas pengguna, admin, login, dan aksi sistem.
          </p>
        </div>

        <Button
          variant="white"
          size="md"
          onClick={() => refetch()}
          disabled={isFetching}
          className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
        >
          <RefreshCw className={`w-4 h-4 stroke-[3] ${isFetching ? 'animate-spin' : ''}`} />
          <span>REFRESH LOGS</span>
        </Button>
      </div>

      {/* FILTER BAR: SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Cari Username, Action, IP, atau Detail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white text-xs font-bold"
          />
          <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[3]" />
        </div>
      </div>

      {/* TABLE DATA */}
      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b-[3px] border-black text-left text-xs font-black uppercase">
                <th className="p-3 w-16">ID</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Pengguna</th>
                <th className="p-3">Aksi (Action)</th>
                <th className="p-3">Target & Detail</th>
                <th className="p-3">IP Address</th>
                <th className="p-3 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-black text-sm font-bold">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-bold text-xs text-neutral-500">
                    Memuat Activity Log...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-black text-xs uppercase text-neutral-500">
                    Belum ada aktivitas sistem tercatat.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-yellow-50 transition-colors">
                    <td className="p-3 font-mono text-xs">#{log.id}</td>
                    <td className="p-3 text-xs font-mono text-neutral-600">
                      {new Date(log.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-black font-black text-xs">
                        <User className="w-3.5 h-3.5 stroke-[3]" />
                        {log.user?.username || `User #${log.userId || 'Guest'}`}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="cyan" size="sm" className="font-black text-xs">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs">
                      {log.target && <div className="font-black text-black">Target: {log.target}</div>}
                      {log.details && <div className="text-neutral-600 truncate max-w-xs">{log.details}</div>}
                    </td>
                    <td className="p-3 text-xs font-mono">
                      <div className="flex items-center gap-1 text-neutral-600">
                        <MapPin className="w-3.5 h-3.5" />
                        {log.ipAddress || '-'}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant="white"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="font-black text-[10px] px-2 py-1"
                        title="Lihat Detail Log"
                        aria-label="Lihat Detail Log"
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>DETAIL</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 bg-neutral-50 border-t-[3px] border-black flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-black">
              Halaman {page} dari {totalPages} ({totalCount} Data)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="white"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                className="font-black text-xs uppercase"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> SEBELUMNYA
              </Button>
              <Button
                variant="white"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isFetching}
                className="font-black text-xs uppercase"
              >
                SELANJUTNYA <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* DETAIL MODAL DIALOG */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="text-base font-black uppercase flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-black" /> Detail Activity Log #{selectedLog.id}
              </h3>
              <button onClick={() => setSelectedLog(null)} className="font-black text-lg hover:text-red-600" title="Tutup Modal" aria-label="Tutup Modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div>
                <span className="text-neutral-500 block uppercase">Waktu Eksekusi:</span>
                <span className="font-mono text-black">{new Date(selectedLog.createdAt).toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase">Pengguna:</span>
                <span className="font-mono text-black">{selectedLog.user?.username || `User #${selectedLog.userId || 'Guest'}`}</span>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase">Aksi:</span>
                <Badge variant="cyan" size="sm" className="font-black uppercase">{selectedLog.action}</Badge>
              </div>
              {selectedLog.target && (
                <div>
                  <span className="text-neutral-500 block uppercase">Target:</span>
                  <span className="font-mono text-black">{selectedLog.target}</span>
                </div>
              )}
              <div>
                <span className="text-neutral-500 block uppercase mb-1">Rincian Detail:</span>
                <div className="p-3 bg-neutral-100 border-[2px] border-black font-mono text-xs whitespace-pre-wrap">
                  {selectedLog.details || 'Tidak ada catatan rincian.'}
                </div>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase">IP Address:</span>
                <span className="font-mono text-black">{selectedLog.ipAddress || '-'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t-2 border-dashed border-black/20">
              <Button variant="white" size="sm" onClick={() => setSelectedLog(null)} className="font-black uppercase">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
