import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Save, ShieldAlert, Lock } from 'lucide-react';
import { getAdminSettings, updateAdminSettings } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export const SettingsSecurityPage: React.FC = () => {
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
      addToast({ title: 'GAGAL MEMUAT KEAMANAN', message: err.message, type: 'error' });
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
        password_policy: settings.password_policy,
        max_login_attempts: settings.max_login_attempts,
        tfa_enabled: settings.tfa_enabled,
        allowed_ips: settings.allowed_ips,
      });
      addToast({ title: 'KEAMANAN DISIMPAN', message: 'Security Policy berhasil diperbarui.', type: 'success' });
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
            PROTECTION
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>🛡️</span>
            <span>SECURITY POLICY</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Kebijakan keamanan: Password Policy, Limit Salah Login, 2FA, dan IP Whitelist.
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
          <span>{saving ? 'MENYIMPAN...' : 'SIMPAN KEAMANAN'}</span>
        </Button>
      </div>

      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-6 space-y-6">
        <div className="space-y-5">

          <div className="border-b-[3px] border-black pb-2 mb-4">
            <h3 className="text-lg font-black uppercase flex items-center gap-2">
              <Lock className="w-5 h-5 text-neutral-800" /> 
              Authentikasi
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black uppercase mb-1">Password Policy</label>
              <select
                value={settings.password_policy || 'MIN_8_CHARS'}
                onChange={(e) => handleChange('password_policy', e.target.value)}
                className="w-full p-3 bg-neutral-100 border-[3px] border-black font-bold focus:bg-yellow-50 outline-none"
              >
                <option value="MIN_6_CHARS">Minimal 6 Karakter Bebas</option>
                <option value="MIN_8_CHARS">Minimal 8 Karakter Bebas</option>
                <option value="MIN_8_CHARS_ALPHANUMERIC">Minimal 8 Karakter (Huruf & Angka)</option>
                <option value="STRICT_COMPLEX">Ketat (Huruf, Angka, Simbol Khusus)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-black uppercase mb-1">Max Login Attempts</label>
              <input
                type="number"
                value={settings.max_login_attempts || 5}
                onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value))}
                className="w-full p-3 bg-neutral-100 border-[3px] border-black font-mono font-bold focus:bg-yellow-50 outline-none"
                min={3}
                max={20}
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 font-black uppercase bg-pink-50 p-4 border-[3px] border-black cursor-pointer hover:bg-pink-100 text-pink-900">
              <input 
                type="checkbox" 
                checked={settings.tfa_enabled || false}
                onChange={(e) => handleChange('tfa_enabled', e.target.checked)}
                className="w-6 h-6 accent-pink-600" 
              />
              Wajibkan 2FA (Two-Factor Auth) untuk Admin
            </label>
          </div>

          <div className="pt-4 border-t-[3px] border-black/20 mt-4">
            <div className="flex items-center gap-2 border-b-[2px] border-black pb-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-600 stroke-[2.5]" />
              <h3 className="text-base font-black uppercase text-red-700">IP Whitelisting Admin</h3>
            </div>
            <label className="block text-xs font-bold mb-2 text-neutral-600">
              Biarkan "0.0.0.0/0" untuk mengizinkan login admin dari IP manapun. Pisahkan dengan koma jika lebih dari satu.
            </label>
            <input
              type="text"
              value={settings.allowed_ips || '0.0.0.0/0'}
              onChange={(e) => handleChange('allowed_ips', e.target.value)}
              className="w-full p-3 bg-red-50 border-[3px] border-black font-mono font-bold text-red-900 focus:bg-yellow-50 outline-none"
            />
          </div>

        </div>
      </Card>
    </div>
  );
};
