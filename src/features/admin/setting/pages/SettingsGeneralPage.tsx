import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Save, Globe, Smartphone, Image as ImageIcon } from 'lucide-react';
import { getAdminSettings, updateAdminSettings } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export const SettingsGeneralPage: React.FC = () => {
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
      addToast({ title: 'GAGAL MEMUAT PENGATURAN', message: err.message, type: 'error' });
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
        site_name: settings.site_name,
        logo_url: settings.logo_url,
        favicon_url: settings.favicon_url,
        wa_number: settings.wa_number,
        maintenance_mode: settings.maintenance_mode,
        currency: settings.currency,
      });
      addToast({ title: 'PENGATURAN DISIMPAN', message: 'General Settings berhasil diperbarui.', type: 'success' });
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
            CONFIGURATION
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>⚙️</span>
            <span>GENERAL SETTINGS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Pengaturan umum website: Nama Web, Logo, Favicon, Meta SEO, Email CS, WA, dan Maintenance Mode.
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
          <span>{saving ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN'}</span>
        </Button>
      </div>

      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-6 space-y-6">
        <div className="space-y-4">
          <div className="border-b-[3px] border-black pb-2 mb-4">
            <h3 className="text-lg font-black uppercase flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" /> 
              Informasi Website
            </h3>
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-1">Nama Website (Site Name)</label>
            <input
              type="text"
              value={settings.site_name || ''}
              onChange={(e) => handleChange('site_name', e.target.value)}
              className="w-full p-3 bg-neutral-100 border-[3px] border-black font-bold text-black focus:bg-yellow-50 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-1">Mata Uang (Currency)</label>
            <input
              type="text"
              value={settings.currency || 'IDR'}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full p-3 bg-neutral-100 border-[3px] border-black font-bold text-black focus:bg-yellow-50 outline-none transition-colors uppercase"
              maxLength={3}
            />
          </div>

          <div className="pt-4 border-t-[3px] border-black/20">
            <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-pink-600" /> 
              Branding & Aset
            </h3>
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-1">URL Logo Website</label>
            <input
              type="text"
              value={settings.logo_url || ''}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              placeholder="https://..."
              className="w-full p-3 bg-neutral-100 border-[3px] border-black font-mono text-sm focus:bg-yellow-50 outline-none transition-colors"
            />
          </div>

          <div className="pt-4 border-t-[3px] border-black/20">
            <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-green-600" /> 
              Kontak Customer Service
            </h3>
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-1">Nomor WhatsApp CS</label>
            <input
              type="text"
              value={settings.wa_number || ''}
              onChange={(e) => handleChange('wa_number', e.target.value)}
              placeholder="08123..."
              className="w-full p-3 bg-neutral-100 border-[3px] border-black font-mono font-bold text-black focus:bg-yellow-50 outline-none transition-colors"
            />
          </div>

          <div className="pt-4 border-t-[3px] border-black/20 mt-4 flex items-center justify-between bg-red-50 p-4 border-[3px]">
            <div>
              <h3 className="text-base font-black uppercase text-red-600">Maintenance Mode</h3>
              <p className="text-xs font-bold text-neutral-600">Tutup website sementara untuk perbaikan.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.maintenance_mode || false}
                onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
              />
              <div className="w-14 h-7 bg-neutral-300 peer-focus:outline-none border-[2px] border-black peer-checked:bg-red-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border-[2px] after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7"></div>
            </label>
          </div>

        </div>
      </Card>
    </div>
  );
};
