import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Save, Bell, MessageSquare, Mail } from 'lucide-react';
import { getAdminSettings, updateAdminSettings } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export const SettingsNotificationsPage: React.FC = () => {
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
      addToast({ title: 'GAGAL MEMUAT TEMPLATE NOTIFIKASI', message: err.message, type: 'error' });
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
        notif_email_enabled: settings.notif_email_enabled,
        notif_wa_enabled: settings.notif_wa_enabled,
        template_order_success: settings.template_order_success,
        template_order_failed: settings.template_order_failed,
      });
      addToast({ title: 'TEMPLATE DISIMPAN', message: 'Notifikasi & Template berhasil diperbarui.', type: 'success' });
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
            MESSAGING & ALERTS
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>🔔</span>
            <span>NOTIFICATIONS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Atur template pesan notifikasi untuk Order Sukses dan Order Gagal (Email & WA).
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
          <span>{saving ? 'MENYIMPAN...' : 'SIMPAN TEMPLATE'}</span>
        </Button>
      </div>

      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-6 space-y-6">
        <div className="space-y-6">
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 font-black uppercase bg-neutral-100 p-3 border-[3px] border-black cursor-pointer hover:bg-yellow-50">
              <input 
                type="checkbox" 
                checked={settings.notif_email_enabled || false}
                onChange={(e) => handleChange('notif_email_enabled', e.target.checked)}
                className="w-5 h-5 accent-black" 
              />
              <Mail className="w-5 h-5" />
              Aktifkan Email Notif
            </label>
            <label className="flex items-center gap-2 font-black uppercase bg-green-50 p-3 border-[3px] border-black cursor-pointer hover:bg-green-100 text-green-900">
              <input 
                type="checkbox" 
                checked={settings.notif_wa_enabled || false}
                onChange={(e) => handleChange('notif_wa_enabled', e.target.checked)}
                className="w-5 h-5 accent-green-700" 
              />
              <MessageSquare className="w-5 h-5" />
              Aktifkan WA Notif
            </label>
          </div>

          <div className="p-4 bg-blue-50 border-[3px] border-black space-y-3">
            <div className="flex items-center gap-2 border-b-[2px] border-black pb-2">
              <Bell className="w-5 h-5 text-blue-700 stroke-[2.5]" />
              <h3 className="text-base font-black uppercase text-blue-800">Template Order Sukses</h3>
            </div>
            <p className="text-xs font-bold text-neutral-600">Variabel: {'{{trx_id}}, {{product_name}}, {{sn}}'}</p>
            <textarea
              rows={4}
              value={settings.template_order_success || 'Pesanan {{product_name}} Anda dengan ID {{trx_id}} BERHASIL diproses. SN/Voucher: {{sn}}. Terima kasih!'}
              onChange={(e) => handleChange('template_order_success', e.target.value)}
              className="w-full p-3 bg-white border-[2px] border-black font-mono text-sm focus:bg-yellow-50 outline-none"
            />
          </div>

          <div className="p-4 bg-red-50 border-[3px] border-black space-y-3">
            <div className="flex items-center gap-2 border-b-[2px] border-black pb-2">
              <Bell className="w-5 h-5 text-red-700 stroke-[2.5]" />
              <h3 className="text-base font-black uppercase text-red-800">Template Order Gagal / Refund</h3>
            </div>
            <p className="text-xs font-bold text-neutral-600">Variabel: {'{{trx_id}}, {{product_name}}'}</p>
            <textarea
              rows={4}
              value={settings.template_order_failed || 'Mohon maaf, pesanan {{product_name}} Anda (ID: {{trx_id}}) GAGAL diproses oleh server pusat. Saldo Anda telah dikembalikan (Refund).'}
              onChange={(e) => handleChange('template_order_failed', e.target.value)}
              className="w-full p-3 bg-white border-[2px] border-black font-mono text-sm focus:bg-yellow-50 outline-none"
            />
          </div>

        </div>
      </Card>
    </div>
  );
};
