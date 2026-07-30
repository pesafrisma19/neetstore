import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { ClipboardList, RefreshCw, User, MapPin } from 'lucide-react';
import { getAdminActivityLogs } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

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
  const { addToast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAdminActivityLogs();
      setLogs(data || []);
    } catch (err: any) {
      addToast({
        title: 'GAGAL MEMUAT ACTIVITY LOG',
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

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              AUDIT TRAIL
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              {logs.length} RECORD TERAKHIR
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>📋</span>
            <span>ACTIVITY LOG</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Catatan aktivitas pengguna dan admin, perubahan harga, pengaturan, dan login.
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
            <ClipboardList className="w-4 h-4 stroke-[2.5] text-[var(--nb-yellow)]" />
            <span>RIWAYAT AKTIVITAS SISTEM</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b-[2px] border-black text-left text-xs font-black uppercase">
                <th className="p-3 w-16">ID</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Pengguna</th>
                <th className="p-3">Aksi (Action)</th>
                <th className="p-3">Target / Detail</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-black text-sm font-bold">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-yellow-50 transition-colors">
                  <td className="p-3 font-mono">#{log.id}</td>
                  <td className="p-3 text-xs font-mono text-neutral-600">
                    {new Date(log.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-black font-black">
                      <User className="w-3.5 h-3.5 stroke-[3]" />
                      {log.user?.username || `User #${log.userId || 'Guest'}`}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="cyan" size="sm" className="font-black">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs">
                    {log.target && <div className="font-black text-black">Target: {log.target}</div>}
                    {log.details && <div className="text-neutral-600">{log.details}</div>}
                  </td>
                  <td className="p-3 text-xs font-mono">
                    <div className="flex items-center gap-1 text-neutral-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {log.ipAddress || '-'}
                    </div>
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
