import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Save, Clock, RefreshCw, Play, Pause, CheckCircle2 } from 'lucide-react';
import { getAdminSettings, updateAdminSettings, getAdminCronStatus, getAdminProviders } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export const SettingsSystemPage: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // DB Settings State
  const [pricelistEnabled, setPricelistEnabled] = useState(true);
  const [pricelistInterval, setPricelistInterval] = useState(5);

  const [wtcPricelistEnabled, setWtcPricelistEnabled] = useState(true);
  const [wtcPricelistInterval, setWtcPricelistInterval] = useState(5);

  const [ordersEnabled, setOrdersEnabled] = useState(true);
  const [ordersInterval, setOrdersInterval] = useState(1);

  const [depositsEnabled, setDepositsEnabled] = useState(true);
  const [depositsInterval, setDepositsInterval] = useState(2);

  const [gplayEnabled, setGplayEnabled] = useState(true);
  const [gplayHour, setGplayHour] = useState(0);

  // Real Runtime Status State
  const [cronStatusMap, setCronStatusMap] = useState<Record<string, any>>({});
  const [digiflazzLastSync, setDigiflazzLastSync] = useState<string | null>(null);
  const [wartopcoinLastSync, setWartopcoinLastSync] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [data, statusMap, providers] = await Promise.all([
        getAdminSettings(),
        getAdminCronStatus().catch(() => ({})),
        getAdminProviders().catch(() => []),
      ]);

      if (data) {
        setPricelistEnabled(Boolean(data.cron_pricelist_enabled ?? true));
        setPricelistInterval(Math.max(5, Number(data.cron_pricelist_interval_minutes) || 5));

        setWtcPricelistEnabled(Boolean(data.cron_wartopcoin_pricelist_enabled ?? true));
        setWtcPricelistInterval(Math.max(1, Number(data.cron_wartopcoin_pricelist_interval_minutes) || 5));

        setOrdersEnabled(Boolean(data.cron_orders_enabled ?? true));
        setOrdersInterval(Math.max(1, Number(data.cron_orders_interval_minutes) || 1));

        setDepositsEnabled(Boolean(data.cron_deposits_enabled ?? true));
        setDepositsInterval(Math.max(1, Number(data.cron_deposits_interval_minutes) || 2));

        setGplayEnabled(Boolean(data.cron_gplay_enabled ?? true));
        setGplayHour(Math.min(23, Math.max(0, Number(data.cron_gplay_hour) ?? 0)));
      }

      setCronStatusMap(statusMap || {});

      const digi = (providers || []).find((p: any) => p.code === 'digiflazz');
      if (digi && digi.lastSync) {
        setDigiflazzLastSync(digi.lastSync);
      }

      const wtc = (providers || []).find((p: any) => p.code === 'wartopcoin');
      if (wtc && wtc.lastSync) {
        setWartopcoinLastSync(wtc.lastSync);
      }
    } catch (err: any) {
      addToast({ title: 'GAGAL MEMUAT SETTING', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (pricelistInterval < 5) {
      addToast({ title: 'VALIDASI GAGAL', message: 'Interval Sync Pricelist Digiflazz minimal 5 menit.', type: 'error' });
      return;
    }
    if (wtcPricelistInterval < 1) {
      addToast({ title: 'VALIDASI GAGAL', message: 'Interval Sync Pricelist Wartopcoin minimal 1 menit.', type: 'error' });
      return;
    }
    if (ordersInterval < 1) {
      addToast({ title: 'VALIDASI GAGAL', message: 'Interval Sync Orders minimal 1 menit.', type: 'error' });
      return;
    }
    if (depositsInterval < 1) {
      addToast({ title: 'VALIDASI GAGAL', message: 'Interval Sync Deposits minimal 1 menit.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await updateAdminSettings({
        cron_pricelist_enabled: pricelistEnabled,
        cron_pricelist_interval_minutes: Number(pricelistInterval),

        cron_wartopcoin_pricelist_enabled: wtcPricelistEnabled,
        cron_wartopcoin_pricelist_interval_minutes: Number(wtcPricelistInterval),

        cron_orders_enabled: ordersEnabled,
        cron_orders_interval_minutes: Number(ordersInterval),

        cron_deposits_enabled: depositsEnabled,
        cron_deposits_interval_minutes: Number(depositsInterval),

        cron_gplay_enabled: gplayEnabled,
        cron_gplay_hour: Number(gplayHour),
      });

      addToast({ title: 'CRON JOBS DISIMPAN', message: 'Pengaturan Cron Manager berhasil diperbarui secara runtime tanpa restart server.', type: 'success' });
      fetchData();
    } catch (err: any) {
      addToast({ title: 'GAGAL MENYIMPAN', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const renderStatusBadge = (jobKey: string, isEnabled: boolean) => {
    const liveState = cronStatusMap[jobKey];
    if (!isEnabled || !liveState?.enabled) {
      return (
        <Badge variant="pink" size="sm" className="font-mono font-black gap-1">
          <Pause className="w-3 h-3" /> DISABLED
        </Badge>
      );
    }
    if (liveState?.isExecuting) {
      return (
        <Badge variant="yellow" size="sm" className="font-mono font-black gap-1 animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin" /> EXECUTING...
        </Badge>
      );
    }
    return (
      <Badge variant="cyan" size="sm" className="font-mono font-black gap-1">
        <Play className="w-3 h-3 fill-black" /> RUNNING
      </Badge>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl text-left font-sans pb-12">
      {/* HEADER PAGE */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm" className="border-2 font-black uppercase mb-2">
            RUNTIME SCHEDULER MANAGER
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <Clock className="w-8 h-8 text-black" />
            <span>SISTEM CRON JOBS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Pengelolaan tugas latar belakang otomatis. Perubahan interval & toggle langsung aktif tanpa perlu restart VPS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            onClick={fetchData}
            disabled={loading}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <RefreshCw className={`w-4 h-4 stroke-[3] ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </Button>
          <Button
            variant="mint"
            size="md"
            onClick={handleSave}
            disabled={saving || loading}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <Save className="w-4 h-4 stroke-[3]" />
            <span>{saving ? 'MENYIMPAN...' : 'SIMPAN CONFIG'}</span>
          </Button>
        </div>
      </div>

      {/* 5 CRON JOB CARDS */}
      <div className="space-y-4">
        {/* CARD 1: SYNC PRICELIST DIGIFLAZZ */}
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <h3 className="text-base font-black uppercase">1. Sync Pricelist Digiflazz</h3>
                {renderStatusBadge('pricelist', pricelistEnabled)}
              </div>
              <p className="text-xs font-bold text-neutral-600">
                Memperbarui katalog produk & harga supplier Digiflazz secara otomatis. (Min. 5 menit sesuai limitasi resmi supplier).
              </p>
              {digiflazzLastSync && (
                <p className="text-[11px] font-mono font-bold text-cyan-800 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Terakhir Sync LIVE: {new Date(digiflazzLastSync).toLocaleString('id-ID')}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 bg-yellow-50 p-3 border-[2px] border-black">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Interval Sync</label>
                <select
                  value={pricelistInterval}
                  onChange={(e) => setPricelistInterval(Number(e.target.value))}
                  disabled={!pricelistEnabled}
                  className="p-2 bg-white border-[2px] border-black font-mono font-bold text-xs outline-none shadow-[2px_2px_0px_0px_#000]"
                >
                  <option value={5}>Setiap 5 Menit (Default)</option>
                  <option value={10}>Setiap 10 Menit</option>
                  <option value={15}>Setiap 15 Menit</option>
                  <option value={30}>Setiap 30 Menit</option>
                  <option value={60}>Setiap 60 Menit</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Status Switch</label>
                <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase">
                  <input
                    type="checkbox"
                    checked={pricelistEnabled}
                    onChange={(e) => setPricelistEnabled(e.target.checked)}
                    className="w-5 h-5 accent-black"
                  />
                  <span>{pricelistEnabled ? 'ON' : 'OFF'}</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* CARD 2: SYNC PRICELIST WARTOPCOIN */}
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪙</span>
                <h3 className="text-base font-black uppercase">2. Sync Pricelist Wartopcoin</h3>
                {renderStatusBadge('wartopcoin_pricelist', wtcPricelistEnabled)}
              </div>
              <p className="text-xs font-bold text-neutral-600">
                Memperbarui harga dan status produk Wartopcoin yang sudah ada di database secara otomatis.
              </p>
              {wartopcoinLastSync && (
                <p className="text-[11px] font-mono font-bold text-cyan-800 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Terakhir Sync LIVE: {new Date(wartopcoinLastSync).toLocaleString('id-ID')}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 bg-yellow-50 p-3 border-[2px] border-black">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Interval Sync</label>
                <select
                  value={wtcPricelistInterval}
                  onChange={(e) => setWtcPricelistInterval(Number(e.target.value))}
                  disabled={!wtcPricelistEnabled}
                  className="p-2 bg-white border-[2px] border-black font-mono font-bold text-xs outline-none shadow-[2px_2px_0px_0px_#000]"
                >
                  <option value={5}>Setiap 5 Menit (Default)</option>
                  <option value={10}>Setiap 10 Menit</option>
                  <option value={15}>Setiap 15 Menit</option>
                  <option value={30}>Setiap 30 Menit</option>
                  <option value={60}>Setiap 60 Menit</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Status Switch</label>
                <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase">
                  <input
                    type="checkbox"
                    checked={wtcPricelistEnabled}
                    onChange={(e) => setWtcPricelistEnabled(e.target.checked)}
                    className="w-5 h-5 accent-black"
                  />
                  <span>{wtcPricelistEnabled ? 'ON' : 'OFF'}</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* CARD 3: CEK STATUS PESANAN */}
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h3 className="text-base font-black uppercase">3. Cek Status Pesanan</h3>
                {renderStatusBadge('orders', ordersEnabled)}
              </div>
              <p className="text-xs font-bold text-neutral-600">
                Memeriksa status pesanan yang masih diproses ke provider produk dan menangani penyelesaian atau refund secara otomatis.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-yellow-50 p-3 border-[2px] border-black">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Interval Sync</label>
                <select
                  value={ordersInterval}
                  onChange={(e) => setOrdersInterval(Number(e.target.value))}
                  disabled={!ordersEnabled}
                  className="p-2 bg-white border-[2px] border-black font-mono font-bold text-xs outline-none shadow-[2px_2px_0px_0px_#000]"
                >
                  <option value={1}>Setiap 1 Menit (Default)</option>
                  <option value={2}>Setiap 2 Menit</option>
                  <option value={5}>Setiap 5 Menit</option>
                  <option value={10}>Setiap 10 Menit</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Status Switch</label>
                <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase">
                  <input
                    type="checkbox"
                    checked={ordersEnabled}
                    onChange={(e) => setOrdersEnabled(e.target.checked)}
                    className="w-5 h-5 accent-black"
                  />
                  <span>{ordersEnabled ? 'ON' : 'OFF'}</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* CARD 4: CEK STATUS PEMBAYARAN */}
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <h3 className="text-base font-black uppercase">4. Cek Status Pembayaran</h3>
                {renderStatusBadge('deposits', depositsEnabled)}
              </div>
              <p className="text-xs font-bold text-neutral-600">
                Memeriksa pembayaran yang masih menunggu dari seluruh payment gateway serta menangani pembayaran kedaluwarsa secara otomatis.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-yellow-50 p-3 border-[2px] border-black">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Interval Sync</label>
                <select
                  value={depositsInterval}
                  onChange={(e) => setDepositsInterval(Number(e.target.value))}
                  disabled={!depositsEnabled}
                  className="p-2 bg-white border-[2px] border-black font-mono font-bold text-xs outline-none shadow-[2px_2px_0px_0px_#000]"
                >
                  <option value={1}>Setiap 1 Menit</option>
                  <option value={2}>Setiap 2 Menit (Safety Default Aplikasi)</option>
                  <option value={5}>Setiap 5 Menit</option>
                  <option value={10}>Setiap 10 Menit</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Status Switch</label>
                <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase">
                  <input
                    type="checkbox"
                    checked={depositsEnabled}
                    onChange={(e) => setDepositsEnabled(e.target.checked)}
                    className="w-5 h-5 accent-black"
                  />
                  <span>{depositsEnabled ? 'ON' : 'OFF'}</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* CARD 5: GOOGLE PLAY METADATA SCRAPER */}
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎮</span>
                <h3 className="text-base font-black uppercase">5. Google Play Metadata Scraper</h3>
                {renderStatusBadge('gplay_scraper', gplayEnabled)}
              </div>
              <p className="text-xs font-bold text-neutral-600">
                Otomatis memperbarui icon thumbnail, banner header, screenshots, dan event promo seluruh Brand dari Google Play Store.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-yellow-50 p-3 border-[2px] border-black">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Jadwal Eksekusi (WIB)</label>
                <select
                  value={gplayHour}
                  onChange={(e) => setGplayHour(Number(e.target.value))}
                  disabled={!gplayEnabled}
                  className="p-2 bg-white border-[2px] border-black font-mono font-bold text-xs outline-none shadow-[2px_2px_0px_0px_#000]"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      Jam {h < 10 ? `0${h}` : h}:00 WIB
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Status Switch</label>
                <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase">
                  <input
                    type="checkbox"
                    checked={gplayEnabled}
                    onChange={(e) => setGplayEnabled(e.target.checked)}
                    className="w-5 h-5 accent-black"
                  />
                  <span>{gplayEnabled ? 'ON' : 'OFF'}</span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
