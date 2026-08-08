import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { BellRing, RefreshCw, Server, Search, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { getAdminWebhookLogs } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';

export interface WebhookLog {
  id: number;
  provider: string;
  event: string;
  payload: string;
  status: string;
  createdAt: string;
}

export const LogsWebhookPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.admin.logs.webhook({ page, limit, provider: providerFilter, status: statusFilter, search: debouncedSearch }),
    queryFn: () => getAdminWebhookLogs({ page, limit, provider: providerFilter, status: statusFilter, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const logs: WebhookLog[] = (data as any)?.data || [];
  const meta = (data as any)?._meta || { totalCount: 0, totalPages: 1 };
  const totalCount = meta.totalCount || 0;
  const totalPages = meta.totalPages || 1;

  const formatPrettyJson = (raw: string) => {
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return raw;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* HEADER PAGE */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              API CALLBACK LOGS
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
            <BellRing className="w-8 h-8 text-black" />
            <span>WEBHOOK LOGS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Riwayat penerimaan callback & webhook dari Digiflazz dan TokoPay (Sanitized Payload).
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

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Cari Event / Provider / Payload..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white text-xs font-bold"
          />
          <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[3]" />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* FILTER PROVIDER */}
          <select
            value={providerFilter}
            onChange={(e) => { setProviderFilter(e.target.value); setPage(1); }}
            className="p-2 bg-white border-[2px] border-black font-mono font-bold text-xs outline-none shadow-[2px_2px_0px_0px_#000]"
          >
            <option value="ALL">SEMUA PROVIDER</option>
            <option value="DIGIFLAZZ">DIGIFLAZZ</option>
            <option value="TOKOPAY">TOKOPAY</option>
          </select>

          {/* FILTER STATUS */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="p-2 bg-white border-[2px] border-black font-mono font-bold text-xs outline-none shadow-[2px_2px_0px_0px_#000]"
          >
            <option value="ALL">SEMUA STATUS</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="PENDING">PENDING</option>
          </select>
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
                <th className="p-3">Provider</th>
                <th className="p-3">Event Action</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Detail Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-black text-sm font-bold">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center font-bold text-xs text-neutral-500">
                    Memuat Webhook Log...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center font-black text-xs uppercase text-neutral-500">
                    Belum ada webhook tercatat.
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
                      <div className="flex items-center gap-1 text-black font-black text-xs uppercase">
                        <Server className="w-3.5 h-3.5 stroke-[3]" />
                        {log.provider}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="cyan" size="sm" className="font-mono font-black text-xs">
                        {log.event}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={log.status === 'SUCCESS' ? 'mint' : log.status === 'FAILED' ? 'pink' : 'yellow'}
                        size="sm"
                        className="font-black uppercase text-xs"
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant="white"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="font-black text-[10px] px-2 py-1"
                        title="Lihat Detail Payload JSON"
                        aria-label="Lihat Detail Payload JSON"
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>PAYLOAD</span>
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

      {/* DETAIL PAYLOAD MODAL DIALOG */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-6 max-w-2xl w-full space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="text-base font-black uppercase flex items-center gap-2">
                <BellRing className="w-5 h-5 text-black" /> Webhook Payload #{selectedLog.id} ({selectedLog.provider})
              </h3>
              <button onClick={() => setSelectedLog(null)} className="font-black text-lg hover:text-red-600" title="Tutup Modal" aria-label="Tutup Modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-neutral-500 block uppercase">Provider:</span>
                  <span className="font-mono text-black">{selectedLog.provider}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase">Event:</span>
                  <Badge variant="cyan" size="sm" className="font-mono">{selectedLog.event}</Badge>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase">Status:</span>
                  <Badge variant={selectedLog.status === 'SUCCESS' ? 'mint' : 'pink'} size="sm">{selectedLog.status}</Badge>
                </div>
              </div>

              <div>
                <span className="text-neutral-500 block uppercase mb-1">Sanitized JSON Payload:</span>
                <pre className="p-4 bg-neutral-950 text-green-400 border-[3px] border-black font-mono text-xs overflow-auto max-h-80 rounded-none shadow-[2px_2px_0px_0px_#000]">
                  {formatPrettyJson(selectedLog.payload)}
                </pre>
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
