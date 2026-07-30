import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Save, HardDrive, Terminal, Zap, Clock } from 'lucide-react';
import { getAdminSettings, updateAdminSettings } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export const SettingsSystemPage: React.FC = () => {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getAdminSettings();
      setSettings(data || {});
    } catch (err: any) {
      addToast({ title: 'GAGAL MEMUAT SISTEM', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAdminSettings({
        cache_enabled: settings.cache_enabled,
        cron_enabled: settings.cron_enabled,
        session_timeout: settings.session_timeout,
        debug_mode: settings.debug_mode,
      });
      addToast({ title: 'SISTEM DISIMPAN', message: 'System Settings berhasil diperbarui.', type: 'success' });
    } catch (err: any) {
      addToast({ title: 'GAGAL MENYIMPAN', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-left font-sans pb-12">
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm" className="border-2 font-black uppercase mb-2">
            ADVANCED
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>⚙️</span>
            <span>SYSTEM CONFIGURATION</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Konfigurasi level server: Redis Cache, Cron Jobs, Session Timeout, dan Debug Mode.
          </p>
        </div>

        <Button
          variant="mint"
          size="lg"
          onClick={handleSave}
          disabled={saving || loading}
          className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
        >
          <Save className="w-5 h-5 stroke-[3]" />
          <span>{saving ? 'MENYIMPAN...' : 'SIMPAN SISTEM'}</span>
        </Button>
      </div>

      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-6 space-y-6">
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b-[3px] border-black pb-6">
            <div className="p-4 bg-yellow-50 border-[3px] border-black">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-600 stroke-[2.5]" />
                <h3 className="text-sm font-black uppercase text-yellow-800">Redis Cache</h3>
              </div>
              <p className="text-xs font-bold text-neutral-600 mb-4">Meningkatkan kecepatan loading halaman produk dengan menyimpannya di memori sementara (RAM).</p>
              <label className="flex items-center gap-2 font-black uppercase cursor-pointer text-sm">
                <input 
                  type="checkbox" 
                  checked={settings.cache_enabled || false}
                  onChange={(e) => handleChange('cache_enabled', e.target.checked)}
                  className="w-5 h-5 accent-yellow-600" 
                />
                AKTIFKAN CACHE ENGINE
              </label>
            </div>

            <div className="p-4 bg-cyan-50 border-[3px] border-black">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-cyan-700 stroke-[2.5]" />
                <h3 className="text-sm font-black uppercase text-cyan-900">Background Cron Jobs</h3>
              </div>
              <p className="text-xs font-bold text-neutral-600 mb-4">Otomatis sinkronisasi status transaksi & harga produk dari Digiflazz setiap beberapa menit secara gaib di latar belakang.</p>
              <label className="flex items-center gap-2 font-black uppercase cursor-pointer text-sm">
                <input 
                  type="checkbox" 
                  checked={settings.cron_enabled || false}
                  onChange={(e) => handleChange('cron_enabled', e.target.checked)}
                  className="w-5 h-5 accent-cyan-700" 
                />
                AKTIFKAN CRON SYNC
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-black uppercase mb-1">
                <HardDrive className="w-4 h-4" /> Session Timeout (Detik)
              </label>
              <p className="text-xs font-bold text-neutral-500 mb-2">Batas waktu tidak ada aktivitas (Idle) sebelum user / admin otomatis logout.</p>
              <input
                type="number"
                value={settings.session_timeout || 3600}
                onChange={(e) => handleChange('session_timeout', parseInt(e.target.value))}
                className="w-full p-3 bg-neutral-100 border-[3px] border-black font-mono font-bold focus:bg-yellow-50 outline-none"
                min={60}
                max={86400}
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 font-black uppercase bg-red-50 p-4 border-[3px] border-black cursor-pointer hover:bg-red-100 text-red-900">
                <input 
                  type="checkbox" 
                  checked={settings.debug_mode || false}
                  onChange={(e) => handleChange('debug_mode', e.target.checked)}
                  className="w-6 h-6 accent-red-600" 
                />
                <Terminal className="w-6 h-6" />
                Aktifkan Debug Mode (Dev Only)
              </label>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
};
