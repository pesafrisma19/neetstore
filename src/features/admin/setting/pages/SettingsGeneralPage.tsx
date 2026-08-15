import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Callout } from '../../../../components/ui/Callout';
import { Save, Globe, Eye, Phone, Search, Wrench, ShieldAlert } from 'lucide-react';
import { getAdminSettings, updateAdminSettings } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';
import { queryClient } from '../../../../services/queryClient';
import { queryKeys } from '../../../../services/queryKeys';

export const SettingsGeneralPage: React.FC = () => {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<any>({
    site_name: '',
    site_tagline: '',
    logo_url: '',
    favicon_url: '',
    wa_number: '',
    support_email: '',
    default_meta_title: '',
    meta_description: '',
    og_image_url: '',
    maintenance_mode: false,
    maintenance_message: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoImgError, setLogoImgError] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getAdminSettings();
      if (data) {
        setSettings((prev: any) => ({ ...prev, ...data }));
      }
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
    if (key === 'logo_url') setLogoImgError(false);
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Sanitasi & Validasi String
    const siteNameTrimmed = (settings.site_name || '').trim();
    if (!siteNameTrimmed) {
      addToast({ title: 'VALIDASI GAGAL', message: 'Nama Website (site_name) tidak boleh kosong.', type: 'error' });
      return;
    }

    const payload = {
      site_name: siteNameTrimmed,
      site_tagline: (settings.site_tagline || '').trim(),
      logo_url: (settings.logo_url || '').trim(),
      favicon_url: (settings.favicon_url || '').trim(),
      wa_number: (settings.wa_number || '').trim(),
      support_email: (settings.support_email || '').trim(),
      default_meta_title: (settings.default_meta_title || '').trim(),
      meta_description: (settings.meta_description || '').trim(),
      og_image_url: (settings.og_image_url || '').trim(),
      maintenance_mode: Boolean(settings.maintenance_mode),
      maintenance_message: (settings.maintenance_message || '').trim(),
    };

    setSaving(true);
    try {
      await updateAdminSettings(payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.public.settings });
      addToast({ title: 'PENGATURAN DISIMPAN', message: 'General & Branding Settings berhasil diperbarui.', type: 'success' });
      fetchSettings(); // Refresh local state
    } catch (err: any) {
      addToast({ title: 'GAGAL MENYIMPAN', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* HEADER BANNER */}
      <div className="bg-[var(--nb-yellow)] border-[3px] border-[var(--nb-border)] p-6 shadow-[var(--nb-shadow)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm" className="font-black uppercase mb-2">
            CONFIGURATION & BRANDING
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--nb-text)] flex items-center gap-2">
            <span>⚙️</span>
            <span>GENERAL SETTINGS</span>
          </h1>
          <p className="text-sm font-bold text-[var(--nb-text-muted)] mt-1">
            Pusat identitas website, informasi kontak CS, meta SEO, serta status maintenance.
          </p>
        </div>

        <Button
          variant="mint"
          size="lg"
          onClick={handleSave}
          disabled={saving || loading}
          className="font-black uppercase shrink-0"
        >
          <Save className="w-5 h-5 stroke-[3]" />
          <span>{saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}</span>
        </Button>
      </div>

      {/* ROW 1: GROUP 1 (IDENTITAS) + LIVE PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GROUP 1 — IDENTITAS WEBSITE */}
        <Card variant="white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-black uppercase">
              <Globe className="w-5 h-5 stroke-[2.5]" />
              Group 1 — Identitas Website
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                Nama Website (site_name) <span className="text-[var(--nb-pink)]">*</span>
              </label>
              <input
                type="text"
                value={settings.site_name || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
                placeholder="Contoh: NETSTORE"
                className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-bold text-[var(--nb-text)] text-sm focus:bg-[var(--nb-yellow)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                Tagline Website (site_tagline)
              </label>
              <input
                type="text"
                value={settings.site_tagline || ''}
                onChange={(e) => handleChange('site_tagline', e.target.value)}
                placeholder="Contoh: Platform Top Up Game Instant 24 Jam"
                className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-bold text-[var(--nb-text)] text-sm focus:bg-[var(--nb-yellow)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                URL Logo Website (logo_url)
              </label>
              <input
                type="text"
                value={settings.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                URL Favicon Icon (favicon_url)
              </label>
              <input
                type="text"
                value={settings.favicon_url || ''}
                onChange={(e) => handleChange('favicon_url', e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* KARTU LIVE PREVIEW BRANDING */}
        <Card variant="white">
          <CardHeader headerBg="var(--nb-mint)">
            <CardTitle className="flex items-center gap-2 text-base font-black uppercase text-[var(--nb-text)]">
              <Eye className="w-5 h-5 stroke-[2.5]" />
              Live Preview Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <Callout tone="mint" title="DRAFT PREVIEW INTERAKTIF">
              Tampilan real-time identitas website yang dilihat oleh pengunjung.
            </Callout>

            {/* Simulasi Header Component */}
            <div className="p-4 border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] space-y-3">
              <div className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] tracking-wider border-b border-[var(--nb-border)] pb-1">
                PREVIEW NAVBAR BRANDING
              </div>
              <div className="flex items-center gap-3">
                {settings.logo_url && !logoImgError ? (
                  <img
                    src={settings.logo_url}
                    alt="Logo Preview"
                    onError={() => setLogoImgError(true)}
                    className="w-10 h-10 object-contain border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface)] p-1 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 border-[2px] border-[var(--nb-border)] bg-[var(--nb-yellow)] flex items-center justify-center font-black text-sm text-[var(--nb-text)] shrink-0">
                    {(settings.site_name || 'N/S').slice(0, 3).toUpperCase()}
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="font-black text-lg tracking-tighter text-[var(--nb-text)] uppercase leading-none">
                    {settings.site_name || 'NETSTORE'}
                  </span>
                  <span className="text-[10px] font-black uppercase text-[var(--nb-pink)] tracking-wider leading-none mt-1">
                    {settings.site_tagline || 'PLATFORM TOP UP GAME INSTANT'}
                  </span>
                </div>
              </div>
            </div>

            {/* Preview Favicon */}
            <div className="p-3 border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface)] flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--nb-text-muted)] font-sans uppercase">Browser Tab Favicon:</span>
                {settings.favicon_url ? (
                  <img
                    src={settings.favicon_url}
                    alt="Favicon"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    className="w-5 h-5 object-contain border border-[var(--nb-border)]"
                  />
                ) : (
                  <Badge variant="white" size="sm">/favicon.svg</Badge>
                )}
              </div>
              <span className="text-[10px] text-[var(--nb-text-muted)] font-sans font-bold uppercase">Live State</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: GROUP 2 (KONTAK) + GROUP 3 (SEO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GROUP 2 — KONTAK */}
        <Card variant="white">
          <CardHeader headerBg="var(--nb-cyan)">
            <CardTitle className="flex items-center gap-2 text-base font-black uppercase text-[var(--nb-text)]">
              <Phone className="w-5 h-5 stroke-[2.5]" />
              Group 2 — Informasi Kontak CS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                Nomor WhatsApp CS (wa_number)
              </label>
              <input
                type="text"
                value={settings.wa_number || ''}
                onChange={(e) => handleChange('wa_number', e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono font-bold text-sm focus:bg-[var(--nb-yellow)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                Email Support CS (support_email)
              </label>
              <input
                type="email"
                value={settings.support_email || ''}
                onChange={(e) => handleChange('support_email', e.target.value)}
                placeholder="Contoh: cs@netstore.id"
                className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-sm focus:bg-[var(--nb-yellow)] outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* GROUP 3 — SEO */}
        <Card variant="white">
          <CardHeader headerBg="var(--nb-purple)">
            <CardTitle className="flex items-center gap-2 text-base font-black uppercase text-[var(--nb-text)]">
              <Search className="w-5 h-5 stroke-[2.5]" />
              Group 3 — SEO & OpenGraph Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                Default Meta Title (default_meta_title)
              </label>
              <input
                type="text"
                value={settings.default_meta_title || ''}
                onChange={(e) => handleChange('default_meta_title', e.target.value)}
                placeholder="Contoh: NETSTORE - Top Up Game Instant 24 Jam"
                className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-bold text-sm focus:bg-[var(--nb-yellow)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                Meta Description (meta_description)
              </label>
              <textarea
                rows={2}
                value={settings.meta_description || ''}
                onChange={(e) => handleChange('meta_description', e.target.value)}
                placeholder="Deskripsi singkat website untuk Google Search..."
                className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                OG Image Share Preview URL (og_image_url)
              </label>
              <input
                type="text"
                value={settings.og_image_url || ''}
                onChange={(e) => handleChange('og_image_url', e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: GROUP 4 (MAINTENANCE) FULL WIDTH */}
      <Card variant="white">
        <CardHeader headerBg="var(--nb-pink)">
          <CardTitle className="flex items-center gap-2 text-base font-black uppercase text-[var(--nb-text)]">
            <Wrench className="w-5 h-5 stroke-[2.5]" />
            Group 4 — Maintenance Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-black text-sm uppercase text-[var(--nb-text)]">
                <ShieldAlert className="w-4 h-4 text-[var(--nb-pink)]" />
                <span>Status Switch Maintenance (maintenance_mode)</span>
              </div>
              <p className="text-xs font-bold text-[var(--nb-text-muted)]">
                Aktifkan jika ingin menutup sementara akses transaksi publik untuk pemeliharaan sistem.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={Boolean(settings.maintenance_mode)}
                onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
              />
              <div className="w-14 h-7 bg-[var(--nb-surface)] peer-focus:outline-none border-[2px] border-[var(--nb-border)] peer-checked:bg-[var(--nb-pink)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--nb-surface)] after:border-[var(--nb-border)] after:border-[2px] after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
              Pesan Maintenance Pengunjung (maintenance_message)
            </label>
            <textarea
              rows={3}
              value={settings.maintenance_message || ''}
              onChange={(e) => handleChange('maintenance_message', e.target.value)}
              placeholder="Contoh: Kami sedang melakukan pemeliharaan sistem berkala..."
              className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
