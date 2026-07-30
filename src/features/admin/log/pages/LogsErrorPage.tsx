import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { getAdminErrorLogs } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export interface ErrorLog {
  id: number;
  level: string; // ERROR, WARN, FATAL
  message: string;
  stack?: string;
  path?: string;
  createdAt: string;
}

export const LogsErrorPage: React.FC = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAdminErrorLogs();
      setLogs(data || []);
    } catch (err: any) {
      addToast({
        title: 'GAGAL MEMUAT ERROR LOG',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'FATAL':
        return 'pink'; // Red-ish
      case 'WARN':
        return 'yellow';
      default:
        return 'pink';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              SYSTEM DIAGNOSTICS
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              {logs.length} ERROR TERAKHIR
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>⚠️</span>
            <span>SYSTEM ERRORS & CRASHES</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Log pengecualian (exceptions), error koneksi database, atau kegagalan third-party API.
          </p>
        </div>

        <Button
          variant="white"
          size="md"
          onClick={fetchLogs}
          className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
        >
          <RefreshCw className={`w-4 h-4 stroke-[3] ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH LOGS</span>
        </Button>
      </div>

      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="p-4 bg-neutral-900 text-white border-b-[3px] border-black flex items-center justify-between">
          <h3 className="text-sm font-black uppercase flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 stroke-[2.5] text-red-500" />
            <span>APPLICATION ERROR TRACES</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b-[2px] border-black text-left text-xs font-black uppercase">
                <th className="p-3 w-16">ID</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Level</th>
                <th className="p-3">Pesan Error (Message)</th>
                <th className="p-3">Path / Endpoint</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-black text-sm font-bold">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-red-50 transition-colors">
                  <td className="p-3 font-mono">#{log.id}</td>
                  <td className="p-3 text-xs font-mono text-neutral-600">
                    {new Date(log.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3">
                    <Badge variant={getBadgeColor(log.level) as any} size="sm" className="font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                      {log.level}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="text-red-700 font-black">{log.message}</div>
                  </td>
                  <td className="p-3 text-xs font-mono text-neutral-600">
                    {log.path || '-'}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      variant="white"
                      size="sm"
                      onClick={() => {
                        addToast({
                          title: 'STACK TRACE',
                          message: log.stack || 'Tidak ada stack trace untuk error ini.',
                          type: 'info'
                        });
                      }}
                      className="font-black text-[10px] px-2 py-1"
                    >
                      <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>CEK TRACE</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
