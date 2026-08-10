import React from 'react';
import { useLocation } from 'react-router-dom';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { Wrench, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Callout } from '../ui/Callout';

export const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, isLoading } = usePublicSettings();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (!isLoading && settings.maintenance_mode && !isAdminRoute) {
    return (
      <div className="min-h-screen bg-[var(--nb-bg)] flex items-center justify-center p-4 text-left font-sans">
        <div className="max-w-xl w-full">
          <Card variant="white">
            <CardHeader headerBg="var(--nb-pink)">
              <div className="flex items-center justify-between">
                <Badge variant="white" size="sm" className="font-black uppercase">
                  SYSTEM MAINTENANCE
                </Badge>
                <span className="text-xl">⚠️</span>
              </div>
              <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase text-[var(--nb-text)] mt-2">
                <Wrench className="w-7 h-7 stroke-[3]" />
                PEMELIHARAAN SISTEM
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <Callout tone="pink" title="MOHON MAAF ATAS KETIDAKNYAMANAN ANDA">
                {settings.maintenance_message || 'Kami sedang melakukan pemeliharaan sistem berkala. Silakan kembali beberapa saat lagi.'}
              </Callout>

              <div className="p-4 border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 font-bold text-[var(--nb-text)] font-sans">
                  <ShieldAlert className="w-4 h-4 text-[var(--nb-pink)]" />
                  <span>Informasi Status Operasional:</span>
                </div>
                <p className="text-[var(--nb-text-muted)]">
                  Layanan transaksi dan pembelian voucher sementara dinonaktifkan oleh Administrator. Data transaksi dan saldo akun Anda tetap aman.
                </p>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs font-bold text-[var(--nb-text-muted)]">
                  {settings.site_name || 'NETSTORE'} — Official Service
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
