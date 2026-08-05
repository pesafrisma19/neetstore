import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Save, Server, Key, ShieldCheck } from 'lucide-react';
import { getAdminSettings, updateAdminSettings, testNeetflixConnection } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export const SettingsApiPage: React.FC = () => {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingNeetflix, setTestingNeetflix] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getAdminSettings();
      setSettings(data || {});
    } catch (err: any) {
      addToast({ title: 'GAGAL MEMUAT PENGATURAN API', message: err.message, type: 'error' });
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
        digiflazz_username: settings.digiflazz_username,
        digiflazz_api_key: settings.digiflazz_api_key,
        tokopay_merchant_id: settings.tokopay_merchant_id,
        tokopay_secret_key: settings.tokopay_secret_key,
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_user: settings.smtp_user,
        neetflix_api_key: settings.neetflix_api_key,
      });
      addToast({ title: 'KREDENSIAL API DISIMPAN', message: 'API & Integration Settings berhasil diperbarui.', type: 'success' });
    } catch (err: any) {
      addToast({ title: 'GAGAL MENYIMPAN', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestNeetflix = async () => {
    setTestingNeetflix(true);
    try {
      const res = await testNeetflixConnection();
      if (res?.success) {
        addToast({ 
          title: '✅ KONEKSI AKTIF (System Operational)', 
          message: `Koneksi Neetflix API berhasil. Game Didukung: ${res.data?.supportedGamesCount || 0}`, 
          type: 'success' 
        });
      } else {
        addToast({ title: 'KONEKSI GAGAL', message: 'Respons API tidak valid.', type: 'error' });
      }
    } catch (err: any) {
      addToast({ title: 'KONEKSI GAGAL', message: err.message || 'API Key salah atau server sedang gangguan.', type: 'error' });
    } finally {
      setTestingNeetflix(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-left font-sans pb-12">
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm" className="border-2 font-black uppercase mb-2">
            INTEGRATION
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>🔌</span>
            <span>API & CREDENTIALS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Pusat konfigurasi API Key, Secret Key, untuk Digiflazz, TokoPay, dan SMTP Email.
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
          <span>{saving ? 'MENYIMPAN...' : 'SIMPAN KREDENSIAL'}</span>
        </Button>
      </div>

      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-6 space-y-6">
        <div className="space-y-6">
          
          {/* DIGIFLAZZ */}
          <div className="p-4 bg-blue-50 border-[3px] border-black space-y-4">
            <div className="flex items-center gap-2 border-b-[2px] border-black pb-2">
              <Server className="w-5 h-5 text-blue-700 stroke-[2.5]" />
              <h3 className="text-base font-black uppercase text-blue-800">Digiflazz API (PPOB & Game)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1 text-blue-900">Username Digiflazz</label>
                <input
                  type="text"
                  value={settings.digiflazz_username || ''}
                  onChange={(e) => handleChange('digiflazz_username', e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono font-bold focus:bg-yellow-50 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1 text-blue-900">API Key</label>
                <input
                  type="password"
                  value={settings.digiflazz_api_key || ''}
                  onChange={(e) => handleChange('digiflazz_api_key', e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono font-bold focus:bg-yellow-50 outline-none"
                />
              </div>
            </div>
          </div>

          {/* NEETFLIX VALIDATION API */}
          <div className="p-4 bg-purple-50 border-[3px] border-black space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-700 stroke-[2.5]" />
                <h3 className="text-base font-black uppercase text-purple-800">NEETflix API (Account Validation & 2X Diamond)</h3>
              </div>
              <Button 
                variant="dark" 
                size="sm" 
                onClick={handleTestNeetflix} 
                disabled={testingNeetflix}
                className="shadow-[2px_2px_0px_0px_#000]"
              >
                {testingNeetflix ? 'MENGUJI...' : '🧪 TEST KONEKSI API KEY'}
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1 text-purple-900">API Key Validator (nv_live_...)</label>
                <input
                  type="password"
                  value={settings.neetflix_api_key || ''}
                  onChange={(e) => handleChange('neetflix_api_key', e.target.value)}
                  placeholder="nv_live_xxxxxxxxxxx"
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono font-bold focus:bg-yellow-50 outline-none"
                />
              </div>
            </div>
          </div>

          {/* TOKOPAY */}
          <div className="p-4 bg-green-50 border-[3px] border-black space-y-4">
            <div className="flex items-center gap-2 border-b-[2px] border-black pb-2">
              <ShieldCheck className="w-5 h-5 text-green-700 stroke-[2.5]" />
              <h3 className="text-base font-black uppercase text-green-800">TokoPay API (Payment Gateway)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1 text-green-900">Merchant ID</label>
                <input
                  type="text"
                  value={settings.tokopay_merchant_id || ''}
                  onChange={(e) => handleChange('tokopay_merchant_id', e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono font-bold focus:bg-yellow-50 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1 text-green-900">Secret Key</label>
                <input
                  type="password"
                  value={settings.tokopay_secret_key || ''}
                  onChange={(e) => handleChange('tokopay_secret_key', e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono font-bold focus:bg-yellow-50 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SMTP */}
          <div className="p-4 bg-neutral-100 border-[3px] border-black space-y-4">
            <div className="flex items-center gap-2 border-b-[2px] border-black pb-2">
              <Key className="w-5 h-5 text-neutral-700 stroke-[2.5]" />
              <h3 className="text-base font-black uppercase text-neutral-800">SMTP Email Server</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtp_host || ''}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono font-bold focus:bg-yellow-50 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1">Port</label>
                <input
                  type="text"
                  value={settings.smtp_port || ''}
                  onChange={(e) => handleChange('smtp_port', e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono font-bold focus:bg-yellow-50 outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-black uppercase mb-1">SMTP Username / Email</label>
                <input
                  type="text"
                  value={settings.smtp_user || ''}
                  onChange={(e) => handleChange('smtp_user', e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono font-bold focus:bg-yellow-50 outline-none"
                />
              </div>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
};
