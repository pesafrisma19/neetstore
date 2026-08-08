import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Save, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  AlertTriangle,
  Zap,
  Activity,
  Send,
  ExternalLink
} from 'lucide-react';
import { 
  getAdminSettings, 
  updateAdminSettings,
  sendSmtpTestEmail,
  sendFonnteTestMessage
} from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';
import { queryClient } from '../../../../services/queryClient';
import { queryKeys } from '../../../../services/queryKeys';

type EventType = 'order_success' | 'order_failed' | 'deposit_success';
type ChannelType = 'email' | 'whatsapp';

export const SettingsNotificationsPage: React.FC = () => {
  const { addToast } = useToast();

  // Settings State with complete fallbacks
  const [settings, setSettings] = useState<any>({
    notif_email_enabled: false,
    notif_wa_enabled: false,
    site_name: 'NETSTORE',
    support_email: 'cs@netstore.id',
    logo_url: '',

    // Structured Email Templates (Order Success)
    email_order_success_subject: '[{site_name}] Pesanan Berhasil - {trx_id}',
    email_order_success_heading: 'PESANAN BERHASIL DIPROSES',
    email_order_success_body: 'Halo {name},\n\nTerima kasih telah bertransaksi di {site_name}. Pesanan Anda telah berhasil diproses oleh sistem.',
    email_order_success_cta_text: 'Lihat Detail Pesanan',
    email_order_success_cta_url: '/invoice/{trx_id}',
    email_order_success_footer: 'Jika Anda memiliki pertanyaan, silakan hubungi layanan pelanggan kami.',

    // Structured Email Templates (Order Failed)
    email_order_failed_subject: '[{site_name}] Pesanan Gagal - {trx_id}',
    email_order_failed_heading: 'PESANAN GAGAL DIPROSES',
    email_order_failed_body: 'Mohon maaf {name},\n\nPesanan Anda dengan ID {trx_id} gagal diproses oleh server pusat. Saldo Anda telah dikembalikan (Refund).',
    email_order_failed_cta_text: 'Cek Riwayat Transaksi',
    email_order_failed_cta_url: '/riwayat-transaksi',
    email_order_failed_footer: 'Silakan lakukan pemesanan ulang atau hubungi tim bantuan kami.',

    // Structured Email Templates (Deposit Success)
    email_deposit_success_subject: '[{site_name}] Deposit Berhasil - {deposit_id}',
    email_deposit_success_heading: 'DEPOSIT SALDO BERHASIL',
    email_deposit_success_body: 'Halo {name},\n\nDeposit saldo sebesar Rp {amount} via {payment_method} telah berhasil masuk ke saldo akun Anda.',
    email_deposit_success_cta_text: 'Cek Saldo Akun',
    email_deposit_success_cta_url: '/dashboard',
    email_deposit_success_footer: 'Terima kasih telah mempercayai {site_name}.',

    // WhatsApp Templates
    whatsapp_order_success_template: 'Halo {name},\n\nPesanan *{product_name}* (ID: *{trx_id}*) BERHASIL diproses!\nTarget: {target}\nSN/Kode: *{sn}*\nTotal: {price}\n\nTerima kasih telah bertransaksi di {site_name}.',
    whatsapp_order_failed_template: 'Mohon maaf {name},\n\nPesanan *{product_name}* (ID: *{trx_id}*) GAGAL diproses.\nAlasan: {reason}\nSaldo Anda telah dikembalikan (Refund).',
    whatsapp_deposit_success_template: 'Halo {name},\n\nDeposit saldo Rp *{amount}* via {payment_method} (ID: *{deposit_id}*) BERHASIL masuk ke akun Anda.',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Active Event & Channel Tabs
  const [activeEvent, setActiveEvent] = useState<EventType>('order_success');
  const [activeChannel, setActiveChannel] = useState<ChannelType>('email');

  // Textarea Refs for inserting variable chips at cursor
  const emailBodyRef = useRef<HTMLTextAreaElement>(null);
  const waTemplateRef = useRef<HTMLTextAreaElement>(null);

  // Modal Dialog states for Send Test Actions
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);
  const [smtpTargetEmail, setSmtpTargetEmail] = useState('');
  const [sendingSmtpTest, setSendingSmtpTest] = useState(false);

  const [fonnteModalOpen, setFonnteModalOpen] = useState(false);
  const [fonnteTargetPhone, setFonnteTargetPhone] = useState('');
  const [sendingFonnteTest, setSendingFonnteTest] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getAdminSettings();
      if (data) {
        setSettings((prev: any) => ({ ...prev, ...data }));
      }
    } catch (err: any) {
      addToast({ title: 'Gagal Memuat Pengaturan', message: err.message, type: 'error' });
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
      const payload: Record<string, any> = {
        notif_email_enabled: Boolean(settings.notif_email_enabled),
        notif_wa_enabled: Boolean(settings.notif_wa_enabled),

        // Email templates
        email_order_success_subject: settings.email_order_success_subject || '',
        email_order_success_heading: settings.email_order_success_heading || '',
        email_order_success_body: settings.email_order_success_body || '',
        email_order_success_cta_text: settings.email_order_success_cta_text || '',
        email_order_success_cta_url: settings.email_order_success_cta_url || '',
        email_order_success_footer: settings.email_order_success_footer || '',

        email_order_failed_subject: settings.email_order_failed_subject || '',
        email_order_failed_heading: settings.email_order_failed_heading || '',
        email_order_failed_body: settings.email_order_failed_body || '',
        email_order_failed_cta_text: settings.email_order_failed_cta_text || '',
        email_order_failed_cta_url: settings.email_order_failed_cta_url || '',
        email_order_failed_footer: settings.email_order_failed_footer || '',

        email_deposit_success_subject: settings.email_deposit_success_subject || '',
        email_deposit_success_heading: settings.email_deposit_success_heading || '',
        email_deposit_success_body: settings.email_deposit_success_body || '',
        email_deposit_success_cta_text: settings.email_deposit_success_cta_text || '',
        email_deposit_success_cta_url: settings.email_deposit_success_cta_url || '',
        email_deposit_success_footer: settings.email_deposit_success_footer || '',

        // WhatsApp templates
        whatsapp_order_success_template: settings.whatsapp_order_success_template || '',
        whatsapp_order_failed_template: settings.whatsapp_order_failed_template || '',
        whatsapp_deposit_success_template: settings.whatsapp_deposit_success_template || '',
      };

      await updateAdminSettings(payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.public.settings });
      addToast({ title: 'Pengaturan Disimpan', message: 'Template notifikasi berhasil diperbarui ke PostgreSQL.', type: 'success' });
      fetchSettings();
    } catch (err: any) {
      addToast({ title: 'Gagal Menyimpan', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Helper insertion for placeholder chips
  const insertPlaceholder = (key: string, ref: React.RefObject<HTMLTextAreaElement | null>, tag: string) => {
    const textarea = ref.current;
    const currentVal = settings[key] || '';

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newVal = currentVal.substring(0, start) + tag + currentVal.substring(end);
      handleChange(key, newVal);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
    } else {
      handleChange(key, currentVal + ' ' + tag);
    }
  };

  // Get available placeholders per active event
  const getPlaceholdersForActiveEvent = (): string[] => {
    if (activeEvent === 'order_success') {
      return ['{name}', '{trx_id}', '{product_name}', '{target}', '{sn}', '{price}', '{status}', '{site_name}'];
    }
    if (activeEvent === 'order_failed') {
      return ['{name}', '{trx_id}', '{product_name}', '{target}', '{reason}', '{status}', '{site_name}'];
    }
    return ['{name}', '{deposit_id}', '{amount}', '{payment_method}', '{status}', '{site_name}'];
  };

  // Helper to replace placeholders for live preview mock
  const replaceMockPlaceholders = (templateStr: string): string => {
    const siteName = settings.site_name || 'NETSTORE';
    let result = templateStr || '';

    if (activeEvent === 'order_success') {
      result = result
        .replace(/{name}/gi, 'Budi')
        .replace(/{trx_id}/gi, 'TRX-882910')
        .replace(/{product_name}|{product}/gi, 'Mobile Legends 86 Diamonds')
        .replace(/{target}/gi, '12345678 (2026)')
        .replace(/{sn}/gi, 'SN992019283746')
        .replace(/{price}/gi, 'Rp 20.000')
        .replace(/{status}/gi, 'SUCCESS')
        .replace(/{site_name}/gi, siteName);
    } else if (activeEvent === 'order_failed') {
      result = result
        .replace(/{name}/gi, 'Budi')
        .replace(/{trx_id}/gi, 'TRX-882910')
        .replace(/{product_name}|{product}/gi, 'Free Fire 140 Diamonds')
        .replace(/{target}/gi, '87654321')
        .replace(/{reason}/gi, 'ID Player tidak ditemukan')
        .replace(/{status}/gi, 'FAILED')
        .replace(/{site_name}/gi, siteName);
    } else {
      result = result
        .replace(/{name}/gi, 'Budi')
        .replace(/{deposit_id}/gi, 'DEP-77281')
        .replace(/{amount}/gi, '50.000')
        .replace(/{payment_method}/gi, 'QRIS Instant')
        .replace(/{status}/gi, 'SUCCESS')
        .replace(/{site_name}/gi, siteName);
    }

    return result;
  };

  // Actions: Send Test Email
  const handleSendTestEmail = async () => {
    if (!smtpTargetEmail || !smtpTargetEmail.includes('@')) {
      addToast({ title: 'Validasi Gagal', message: 'Alamat email tujuan tes wajib diisi.', type: 'error' });
      return;
    }

    setSendingSmtpTest(true);
    try {
      const res = await sendSmtpTestEmail(smtpTargetEmail);
      if (res?.success) {
        addToast({ title: 'Email Tes Terkirim', message: `Email tes berhasil dikirim ke ${smtpTargetEmail}`, type: 'success' });
        setSmtpModalOpen(false);
        setSmtpTargetEmail('');
      } else {
        addToast({ title: 'Pengiriman Gagal', message: 'Server gagal mengirim email tes.', type: 'error' });
      }
    } catch (err: any) {
      addToast({ title: 'Pengiriman Gagal', message: err.message, type: 'error' });
    } finally {
      setSendingSmtpTest(false);
    }
  };

  // Actions: Send Test WhatsApp
  const handleSendTestWhatsApp = async () => {
    if (!fonnteTargetPhone) {
      addToast({ title: 'Validasi Gagal', message: 'Nomor WhatsApp tujuan tes wajib diisi.', type: 'error' });
      return;
    }

    setSendingFonnteTest(true);
    try {
      const currentWaKey = `whatsapp_${activeEvent}_template`;
      const templateText = settings[currentWaKey] || '';
      const resolvedMessage = replaceMockPlaceholders(templateText);

      const res = await sendFonnteTestMessage(fonnteTargetPhone, resolvedMessage);
      if (res?.success) {
        addToast({ title: 'WhatsApp Tes Terkirim', message: `Pesan WA tes berhasil dikirim ke ${res.target || fonnteTargetPhone}`, type: 'success' });
        setFonnteModalOpen(false);
        setFonnteTargetPhone('');
      } else {
        addToast({ title: 'Pengiriman Gagal', message: 'Server Fonnte gagal mengirim pesan tes.', type: 'error' });
      }
    } catch (err: any) {
      addToast({ title: 'Pengiriman Gagal', message: err.message, type: 'error' });
    } finally {
      setSendingFonnteTest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-16">
      {/* HEADER BANNER */}
      <div className="bg-[var(--nb-yellow)] border-[3px] border-[var(--nb-border)] p-6 shadow-[var(--nb-shadow)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm" className="font-black uppercase mb-2">
            MESSAGING & ALERTS
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--nb-text)] flex items-center gap-2">
            <span>NOTIFIKASI & TEMPLATE</span>
          </h1>
          <p className="text-sm font-bold text-[var(--nb-text-muted)] mt-1">
            Atur aturan pengiriman notifikasi otomatis dan kustomisasi template email & WhatsApp.
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
          <span>{saving ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN'}</span>
        </Button>
      </div>

      {/* ROW 1 DESKTOP: CHANNEL NOTIFIKASI & EVENT STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: CHANNEL NOTIFIKASI */}
        <Card variant="white" className="flex flex-col justify-between">
          <div>
            <CardHeader headerBg="var(--nb-cyan)">
              <CardTitle className="text-base font-black uppercase flex items-center gap-2">
                <Zap className="w-5 h-5 stroke-[2.5]" />
                Saluran Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {/* NOTIFIKASI EMAIL */}
              <div className="p-4 border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="font-black text-sm uppercase text-[var(--nb-text)]">
                      Notifikasi Email
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={Boolean(settings.notif_email_enabled)}
                      onChange={(e) => handleChange('notif_email_enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-[var(--nb-surface)] peer-focus:outline-none border-[2px] border-[var(--nb-border)] peer-checked:bg-[var(--nb-cyan)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--nb-surface)] after:border-[var(--nb-border)] after:border-[2px] after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[var(--nb-border)]">
                  <span className="text-[11px] font-bold text-[var(--nb-text-muted)]">Koneksi SMTP Server:</span>
                  {settings.smtp_password_configured && settings.smtp_host ? (
                    <Badge variant="mint" size="sm" className="font-black uppercase text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Configured
                    </Badge>
                  ) : (
                    <Badge variant="pink" size="sm" className="font-black uppercase text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Belum Dikonfigurasi
                    </Badge>
                  )}
                </div>
              </div>

              {/* NOTIFIKASI WHATSAPP */}
              <div className="p-4 border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-black text-sm uppercase text-[var(--nb-text)]">
                      Notifikasi WhatsApp
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={Boolean(settings.notif_wa_enabled)}
                      onChange={(e) => handleChange('notif_wa_enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-[var(--nb-surface)] peer-focus:outline-none border-[2px] border-[var(--nb-border)] peer-checked:bg-[var(--nb-mint)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--nb-surface)] after:border-[var(--nb-border)] after:border-[2px] after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[var(--nb-border)]">
                  <span className="text-[11px] font-bold text-[var(--nb-text-muted)]">Gateway Fonnte WA:</span>
                  {settings.fonnte_token_configured ? (
                    <Badge variant="mint" size="sm" className="font-black uppercase text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Configured
                    </Badge>
                  ) : (
                    <Badge variant="pink" size="sm" className="font-black uppercase text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Belum Dikonfigurasi
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* CARD 2: EVENT NOTIFIKASI TERDUKUNG */}
        <Card variant="white" className="flex flex-col justify-between">
          <div>
            <CardHeader headerBg="var(--nb-purple)">
              <CardTitle className="text-base font-black uppercase flex items-center gap-2">
                <Activity className="w-5 h-5 stroke-[2.5]" />
                Event Notifikasi Sistem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pesanan Berhasil</span>
                  </div>
                  <Badge variant="mint" size="sm" className="text-[10px] font-black uppercase">Lifecycle Active</Badge>
                </div>

                <div className="flex items-center justify-between p-2.5 border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Pesanan Gagal / Refund</span>
                  </div>
                  <Badge variant="pink" size="sm" className="text-[10px] font-black uppercase">Lifecycle Active</Badge>
                </div>

                <div className="flex items-center justify-between p-2.5 border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Deposit Berhasil</span>
                  </div>
                  <Badge variant="cyan" size="sm" className="text-[10px] font-black uppercase">Lifecycle Active</Badge>
                </div>
              </div>
              <p className="text-[11px] font-bold text-[var(--nb-text-muted)] pt-1">
                Notifikasi dipemicu secara otomatis saat event terjadi di backend. Kegagalan pengiriman tidak akan mengubah status transaksi / deposit.
              </p>
            </CardContent>
          </div>
        </Card>

      </div>

      {/* SEGMENTED EVENT SWITCHER TABS */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 border-b-[3px] border-[var(--nb-border)] pb-2">
          <button
            type="button"
            onClick={() => setActiveEvent('order_success')}
            className={`px-4 py-2 text-xs font-black uppercase border-[2px] border-[var(--nb-border)] transition-all ${
              activeEvent === 'order_success'
                ? 'bg-[var(--nb-mint)] text-[var(--nb-text)] shadow-[var(--nb-shadow-sm)]'
                : 'bg-[var(--nb-surface)] text-[var(--nb-text-muted)] hover:bg-[var(--nb-surface-alt)]'
            }`}
          >
            Pesanan Berhasil
          </button>

          <button
            type="button"
            onClick={() => setActiveEvent('order_failed')}
            className={`px-4 py-2 text-xs font-black uppercase border-[2px] border-[var(--nb-border)] transition-all ${
              activeEvent === 'order_failed'
                ? 'bg-[var(--nb-pink)] text-[var(--nb-text)] shadow-[var(--nb-shadow-sm)]'
                : 'bg-[var(--nb-surface)] text-[var(--nb-text-muted)] hover:bg-[var(--nb-surface-alt)]'
            }`}
          >
            Pesanan Gagal
          </button>

          <button
            type="button"
            onClick={() => setActiveEvent('deposit_success')}
            className={`px-4 py-2 text-xs font-black uppercase border-[2px] border-[var(--nb-border)] transition-all ${
              activeEvent === 'deposit_success'
                ? 'bg-[var(--nb-cyan)] text-[var(--nb-text)] shadow-[var(--nb-shadow-sm)]'
                : 'bg-[var(--nb-surface)] text-[var(--nb-text-muted)] hover:bg-[var(--nb-surface-alt)]'
            }`}
          >
            Deposit Berhasil
          </button>
        </div>

        {/* CHANNEL SUB-TABS: EMAIL VS WHATSAPP */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveChannel('email')}
            className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 border-[2px] border-[var(--nb-border)] ${
              activeChannel === 'email' ? 'bg-[var(--nb-yellow)] text-[var(--nb-text)]' : 'bg-white text-[var(--nb-text-muted)]'
            }`}
          >
            <Mail className="w-4 h-4" /> Email Template
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel('whatsapp')}
            className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 border-[2px] border-[var(--nb-border)] ${
              activeChannel === 'whatsapp' ? 'bg-[var(--nb-yellow)] text-[var(--nb-text)]' : 'bg-white text-[var(--nb-text-muted)]'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp Template
          </button>
        </div>
      </div>

      {/* CHANNEL EDITOR & PREVIEW GRID */}
      {activeChannel === 'email' ? (
        /* EMAIL TAB: EDITOR (LEFT) | STYLED LIVE PREVIEW (RIGHT) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EMAIL EDITOR */}
          <Card variant="white">
            <CardHeader headerBg="var(--nb-yellow)">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Editor Email
                </CardTitle>
                <Button
                  variant="mint"
                  size="sm"
                  onClick={() => setSmtpModalOpen(true)}
                  className="font-black uppercase text-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Email Tes
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Subject Email</label>
                <input
                  type="text"
                  value={settings[`email_${activeEvent}_subject`] || ''}
                  onChange={(e) => handleChange(`email_${activeEvent}_subject`, e.target.value)}
                  className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-sans text-xs focus:bg-[var(--nb-yellow)] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Judul Email (Heading)</label>
                <input
                  type="text"
                  value={settings[`email_${activeEvent}_heading`] || ''}
                  onChange={(e) => handleChange(`email_${activeEvent}_heading`, e.target.value)}
                  className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-sans text-xs focus:bg-[var(--nb-yellow)] outline-none font-bold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black uppercase">Isi Pesan (Body)</label>
                  <span className="text-[10px] font-bold text-[var(--nb-text-muted)]">Placeholder:</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {getPlaceholdersForActiveEvent().map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertPlaceholder(`email_${activeEvent}_body`, emailBodyRef, tag)}
                      className="text-[10px] font-mono font-bold bg-[var(--nb-surface-alt)] hover:bg-[var(--nb-yellow)] border border-[var(--nb-border)] px-1.5 py-0.5"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={emailBodyRef}
                  rows={4}
                  value={settings[`email_${activeEvent}_body`] || ''}
                  onChange={(e) => handleChange(`email_${activeEvent}_body`, e.target.value)}
                  className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-sans text-xs focus:bg-[var(--nb-yellow)] outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">Teks Tombol (CTA)</label>
                  <input
                    type="text"
                    value={settings[`email_${activeEvent}_cta_text`] || ''}
                    onChange={(e) => handleChange(`email_${activeEvent}_cta_text`, e.target.value)}
                    className="w-full p-2 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-sans text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1">URL Tombol (CTA)</label>
                  <input
                    type="text"
                    value={settings[`email_${activeEvent}_cta_url`] || ''}
                    onChange={(e) => handleChange(`email_${activeEvent}_cta_url`, e.target.value)}
                    className="w-full p-2 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Footer Email</label>
                <input
                  type="text"
                  value={settings[`email_${activeEvent}_footer`] || ''}
                  onChange={(e) => handleChange(`email_${activeEvent}_footer`, e.target.value)}
                  className="w-full p-2 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-sans text-xs outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* STYLED LIVE EMAIL PREVIEW */}
          <Card variant="white">
            <CardHeader headerBg="var(--nb-purple)">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Live Email HTML Preview
                </CardTitle>
                <Badge variant="yellow" size="sm" className="font-black uppercase text-[10px]">
                  Sample Preview Only
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="border-[3px] border-black bg-neutral-100 p-4 rounded-none shadow-[var(--nb-shadow)]">
                {/* EMAIL CONTAINER MOCK */}
                <div className="bg-white border-[2px] border-black p-5 space-y-4 text-left">
                  {/* BRANDING HEADER */}
                  <div className="bg-yellow-200 border-b-[2px] border-black p-3 text-center -mx-5 -mt-5 mb-3">
                    {settings.logo_url ? (
                      <img src={settings.logo_url} alt="Logo" className="h-8 mx-auto" />
                    ) : (
                      <h2 className="text-lg font-black uppercase tracking-tight text-black">
                        {settings.site_name || 'NETSTORE'}
                      </h2>
                    )}
                  </div>

                  {/* SUBJECT PREVIEW */}
                  <div className="text-[11px] font-mono text-neutral-500 border-b pb-1">
                    <strong>Subject:</strong> {replaceMockPlaceholders(settings[`email_${activeEvent}_subject`])}
                  </div>

                  {/* HEADING PREVIEW */}
                  <h3 className="text-sm font-black uppercase text-black border-b-[2px] border-black pb-1">
                    {replaceMockPlaceholders(settings[`email_${activeEvent}_heading`])}
                  </h3>

                  {/* BODY PREVIEW */}
                  <div className="text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed font-sans">
                    {replaceMockPlaceholders(settings[`email_${activeEvent}_body`])}
                  </div>

                  {/* MOCK SUMMARY TABLE */}
                  <table className="w-full text-xs font-mono border-[2px] border-black bg-neutral-50">
                    <tbody>
                      {activeEvent === 'order_success' && (
                        <>
                          <tr className="border-b border-neutral-200">
                            <td className="p-2 font-bold text-neutral-500">INVOICE</td>
                            <td className="p-2 font-bold text-right text-black">TRX-882910</td>
                          </tr>
                          <tr className="border-b border-neutral-200">
                            <td className="p-2 font-bold text-neutral-500">PRODUK</td>
                            <td className="p-2 font-bold text-right text-black">Mobile Legends 86 Diamonds</td>
                          </tr>
                          <tr className="border-b border-neutral-200">
                            <td className="p-2 font-bold text-neutral-500">TARGET</td>
                            <td className="p-2 font-bold text-right text-black">12345678 (2026)</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-neutral-500">SN / KODE</td>
                            <td className="p-2 font-bold text-right text-black">SN992019283746</td>
                          </tr>
                        </>
                      )}
                      {activeEvent === 'order_failed' && (
                        <>
                          <tr className="border-b border-neutral-200">
                            <td className="p-2 font-bold text-neutral-500">INVOICE</td>
                            <td className="p-2 font-bold text-right text-black">TRX-882910</td>
                          </tr>
                          <tr className="border-b border-neutral-200">
                            <td className="p-2 font-bold text-neutral-500">PRODUK</td>
                            <td className="p-2 font-bold text-right text-black">Free Fire 140 Diamonds</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-neutral-500">ALASAN GAGAL</td>
                            <td className="p-2 font-bold text-right text-rose-600">ID Player tidak ditemukan</td>
                          </tr>
                        </>
                      )}
                      {activeEvent === 'deposit_success' && (
                        <>
                          <tr className="border-b border-neutral-200">
                            <td className="p-2 font-bold text-neutral-500">DEPOSIT ID</td>
                            <td className="p-2 font-bold text-right text-black">DEP-77281</td>
                          </tr>
                          <tr className="border-b border-neutral-200">
                            <td className="p-2 font-bold text-neutral-500">NOMINAL SALDO</td>
                            <td className="p-2 font-bold text-right text-black">Rp 50.000</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-neutral-500">METODE PEMBAYARAN</td>
                            <td className="p-2 font-bold text-right text-black">QRIS Instant</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>

                  {/* CTA BUTTON PREVIEW */}
                  {settings[`email_${activeEvent}_cta_text`] && (
                    <div className="text-center pt-2">
                      <span className="inline-flex items-center gap-1 bg-black text-white px-4 py-2 text-xs font-black uppercase">
                        {replaceMockPlaceholders(settings[`email_${activeEvent}_cta_text`])}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}

                  {/* FOOTER PREVIEW */}
                  <div className="text-[10px] text-neutral-500 text-center border-t border-neutral-200 pt-3">
                    {replaceMockPlaceholders(settings[`email_${activeEvent}_footer`])}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* WHATSAPP TAB: EDITOR (LEFT) | CHAT BUBBLE PREVIEW (RIGHT) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* WHATSAPP EDITOR */}
          <Card variant="white">
            <CardHeader headerBg="var(--nb-mint)">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-[var(--nb-text)]">
                  <MessageSquare className="w-4 h-4" /> Editor WhatsApp
                </CardTitle>
                <Button
                  variant="mint"
                  size="sm"
                  onClick={() => setFonnteModalOpen(true)}
                  className="font-black uppercase text-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim WA Tes
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black uppercase">Template Pesan WhatsApp</label>
                  <span className="text-[10px] font-bold text-[var(--nb-text-muted)]">Placeholder:</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {getPlaceholdersForActiveEvent().map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertPlaceholder(`whatsapp_${activeEvent}_template`, waTemplateRef, tag)}
                      className="text-[10px] font-mono font-bold bg-[var(--nb-surface-alt)] hover:bg-[var(--nb-yellow)] border border-[var(--nb-border)] px-1.5 py-0.5"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={waTemplateRef}
                  rows={8}
                  value={settings[`whatsapp_${activeEvent}_template`] || ''}
                  onChange={(e) => handleChange(`whatsapp_${activeEvent}_template`, e.target.value)}
                  className="w-full p-3 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* CHAT BUBBLE PREVIEW */}
          <Card variant="white">
            <CardHeader headerBg="var(--nb-purple)">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                  <Eye className="w-4 h-4" /> WhatsApp Chat Preview
                </CardTitle>
                <Badge variant="yellow" size="sm" className="font-black uppercase text-[10px]">
                  Sample Preview Only
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="border-[3px] border-black bg-emerald-950 p-4 shadow-[var(--nb-shadow)]">
                {/* WHATSAPP BUBBLE */}
                <div className="max-w-xs bg-emerald-50 border-[2px] border-black p-3 font-sans text-xs text-neutral-900 space-y-2 whitespace-pre-wrap leading-relaxed">
                  <div className="font-bold text-[11px] text-emerald-800 border-b border-emerald-200 pb-1">
                    {settings.site_name || 'NETSTORE'} Notification
                  </div>
                  <div>
                    {replaceMockPlaceholders(settings[`whatsapp_${activeEvent}_template`])}
                  </div>
                  <div className="text-[9px] text-neutral-400 text-right font-mono">
                    10:42 AM ✓✓
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DIALOG MODAL: SEND SMTP TEST EMAIL */}
      {smtpModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="text-base font-black uppercase flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-600" /> Kirim Email Tes ({activeEvent.toUpperCase()})
              </h3>
              <button 
                onClick={() => setSmtpModalOpen(false)}
                className="font-black text-lg hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-bold text-neutral-600">
              Masukkan email penerima tes. Pesan akan di-render menggunakan template email {activeEvent} yang aktif.
            </p>

            <div>
              <label className="block text-xs font-black uppercase mb-1">Email Tujuan</label>
              <input
                type="email"
                value={smtpTargetEmail}
                onChange={(e) => setSmtpTargetEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full p-2.5 bg-neutral-50 border-[2px] border-black font-mono text-sm outline-none focus:bg-yellow-50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="white" 
                size="sm" 
                onClick={() => setSmtpModalOpen(false)}
                className="font-black uppercase"
              >
                Batal
              </Button>
              <Button 
                variant="mint" 
                size="sm" 
                onClick={handleSendTestEmail} 
                disabled={sendingSmtpTest}
                className="font-black uppercase"
              >
                {sendingSmtpTest ? 'Pengiriman...' : 'Kirim Email Tes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG MODAL: SEND FONNTE TEST WHATSAPP */}
      {fonnteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="text-base font-black uppercase flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" /> Kirim WA Tes ({activeEvent.toUpperCase()})
              </h3>
              <button 
                onClick={() => setFonnteModalOpen(false)}
                className="font-black text-lg hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-bold text-neutral-600">
              Masukkan nomor WhatsApp penerima tes. Pesan akan di-render menggunakan template WA {activeEvent} yang aktif.
            </p>

            <div>
              <label className="block text-xs font-black uppercase mb-1">Nomor WhatsApp Tujuan</label>
              <input
                type="text"
                value={fonnteTargetPhone}
                onChange={(e) => setFonnteTargetPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full p-2.5 bg-neutral-50 border-[2px] border-black font-mono text-sm outline-none focus:bg-yellow-50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="white" 
                size="sm" 
                onClick={() => setFonnteModalOpen(false)}
                className="font-black uppercase"
              >
                Batal
              </Button>
              <Button 
                variant="mint" 
                size="sm" 
                onClick={handleSendTestWhatsApp} 
                disabled={sendingFonnteTest}
                className="font-black uppercase"
              >
                {sendingFonnteTest ? 'Pengiriman...' : 'Kirim WA Tes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
