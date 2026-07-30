import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { BellRing, RefreshCw, Server, Terminal } from 'lucide-react';
import { getAdminWebhookLogs } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export interface WebhookLog {
  id: number;
  provider: string;
  event: string;
  payload: string;
  status: string;
  createdAt: string;
}

export const LogsWebhookPage: React.FC = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAdminWebhookLogs();
      setLogs(data || []);
    } catch (err: any) {
      addToast({
        title: 'GAGAL MEMUAT WEBHOOK LOG',
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
              API INTEGRATION
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              {logs.length} PAYLOAD TERAKHIR
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>🔔</span>
            <span>WEBHOOK LOGS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Riwayat penerimaan callback & webhook dari Digiflazz, VIP Reseller, dan TokoPay.
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
            <BellRing className="w-4 h-4 stroke-[2.5] text-[var(--nb-yellow)]" />
            <span>INCOMING WEBHOOK PAYLOADS</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b-[2px] border-black text-left text-xs font-black uppercase">
                <th className="p-3 w-16">ID</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Event Action</th>
                <th className="p-3">Status</th>
                <th className="p-3 max-w-[300px]">Payload (JSON)</th>
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
                      <Server className="w-3.5 h-3.5 stroke-[3]" />
                      {log.provider}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="cyan" size="sm" className="font-mono font-black lowercase">
                      {log.event}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge 
                      variant={log.status === 'SUCCESS' ? 'mint' : 'pink'} 
                      size="sm" 
                      className="font-black uppercase"
                    >
                      {log.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-[10px] font-mono text-neutral-600 max-w-[300px] truncate" title={log.payload}>
                    <div className="flex items-center gap-1 bg-white border-[2px] border-black p-1 rounded-sm overflow-hidden">
                      <Terminal className="w-3 h-3 text-black shrink-0" />
                      <span className="truncate">{log.payload}</span>
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
