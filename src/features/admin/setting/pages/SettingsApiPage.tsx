import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Save, 
  ShieldCheck, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Lock,
  RefreshCw
} from 'lucide-react';
import { 
  getAdminSettings, 
  updateAdminSettings, 
  testNeetflixConnection,
  testSmtpConnection,
  sendSmtpTestEmail,
  testFonnteConnection,
  sendFonnteTestMessage
} from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export const SettingsApiPage: React.FC = () => {
  const { addToast } = useToast();
  
  // Settings state
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form input states for secret keys (populated only when admin types a new key)
  const [neetflixApiKeyInput, setNeetflixApiKeyInput] = useState('');
  const [smtpPasswordInput, setSmtpPasswordInput] = useState('');
  const [fonnteTokenInput, setFonnteTokenInput] = useState('');

  // Show/Hide password toggles
  const [showNeetflixKey, setShowNeetflixKey] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showFonnteToken, setShowFonnteToken] = useState(false);

  // Loading states for actions
  const [testingNeetflix, setTestingNeetflix] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testingFonnte, setTestingFonnte] = useState(false);
  
  const [sendingSmtpTest, setSendingSmtpTest] = useState(false);
  const [sendingFonnteTest, setSendingFonnteTest] = useState(false);

  // Modal dialog states
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);
  const [smtpTargetEmail, setSmtpTargetEmail] = useState('');

  const [fonnteModalOpen, setFonnteModalOpen] = useState(false);
  const [fonnteTargetPhone, setFonnteTargetPhone] = useState('');
  const [fonnteCustomMessage, setFonnteCustomMessage] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getAdminSettings();
      if (data) {
        setSettings(data);
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

    const payload: Record<string, any> = {
      neetflix_api_url: (settings.neetflix_api_url || '').trim(),
      smtp_host: (settings.smtp_host || '').trim(),
      smtp_port: Number(settings.smtp_port) || 587,
      smtp_user: (settings.smtp_user || '').trim(),
      smtp_from_name: (settings.smtp_from_name || '').trim(),
      smtp_from_email: (settings.smtp_from_email || '').trim(),
      smtp_secure: Boolean(settings.smtp_secure),
      fonnte_api_url: (settings.fonnte_api_url || 'https://api.fonnte.com').trim(),
    };

    if (neetflixApiKeyInput.trim()) {
      payload.neetflix_api_key = neetflixApiKeyInput.trim();
    }
    if (smtpPasswordInput.trim()) {
      payload.smtp_password = smtpPasswordInput.trim();
    }
    if (fonnteTokenInput.trim()) {
      payload.fonnte_token = fonnteTokenInput.trim();
    }

    try {
      await updateAdminSettings(payload);
      addToast({ title: 'Pengaturan Disimpan', message: 'Pengaturan API Integration berhasil diperbarui.', type: 'success' });
      
      setNeetflixApiKeyInput('');
      setSmtpPasswordInput('');
      setFonnteTokenInput('');

      fetchSettings();
    } catch (err: any) {
      addToast({ title: 'Gagal Menyimpan', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Actions: Neetflix
  const handleTestNeetflix = async () => {
    setTestingNeetflix(true);
    try {
      const res = await testNeetflixConnection();
      if (res?.success) {
        addToast({ 
          title: 'Koneksi Neetflix Aktif', 
          message: `Status server OK. Game terdukung: ${res.data?.supportedGamesCount || 0}`, 
          type: 'success' 
        });
      } else {
        addToast({ title: 'Koneksi Neetflix Gagal', message: 'Respons API tidak valid.', type: 'error' });
      }
    } catch (err: any) {
      addToast({ title: 'Koneksi Neetflix Gagal', message: err.message || 'API Key salah atau server offline.', type: 'error' });
    } finally {
      setTestingNeetflix(false);
    }
  };

  // Actions: SMTP Test Connection
  const handleTestSmtpConnection = async () => {
    setTestingSmtp(true);
    try {
      const res = await testSmtpConnection();
      if (res?.success) {
        addToast({ title: 'Koneksi SMTP Berhasil', message: res.message || 'Koneksi ke server SMTP terverifikasi.', type: 'success' });
      } else {
        addToast({ title: 'Koneksi SMTP Gagal', message: 'Tidak dapat terhubung ke server SMTP.', type: 'error' });
      }
    } catch (err: any) {
      const msg = err.message?.includes('535') 
        ? 'Autentikasi SMTP gagal. Periksa username dan password.' 
        : (err.message || 'Koneksi SMTP gagal.');
      addToast({ title: 'Koneksi SMTP Gagal', message: msg, type: 'error' });
    } finally {
      setTestingSmtp(false);
    }
  };

  // Actions: Send Test Email
  const handleSendTestEmail = async () => {
    if (!smtpTargetEmail || !smtpTargetEmail.includes('@')) {
      addToast({ title: 'Validasi Gagal', message: 'Alamat email tujuan tes tidak valid.', type: 'error' });
      return;
    }

    setSendingSmtpTest(true);
    try {
      const res = await sendSmtpTestEmail(smtpTargetEmail);
      if (res?.success) {
        addToast({ title: 'Email Tes Terkirim', message: `Email percobaan berhasil dikirim ke ${smtpTargetEmail}`, type: 'success' });
        setSmtpModalOpen(false);
        setSmtpTargetEmail('');
      } else {
        addToast({ title: 'Pengiriman Email Gagal', message: 'Server gagal mengirim email percobaan.', type: 'error' });
      }
    } catch (err: any) {
      addToast({ title: 'Pengiriman Email Gagal', message: err.message, type: 'error' });
    } finally {
      setSendingSmtpTest(false);
    }
  };

  // Actions: Fonnte Test Connection
  const handleTestFonnteConnection = async () => {
    setTestingFonnte(true);
    try {
      const res = await testFonnteConnection();
      if (res?.success) {
        addToast({ title: 'Koneksi Fonnte Berhasil', message: res.message || 'Token Fonnte valid dan device aktif.', type: 'success' });
      } else {
        addToast({ title: 'Koneksi Fonnte Gagal', message: 'Token Fonnte tidak terverifikasi.', type: 'error' });
      }
    } catch (err: any) {
      addToast({ title: 'Koneksi Fonnte Gagal', message: err.message, type: 'error' });
    } finally {
      setTestingFonnte(false);
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
      const res = await sendFonnteTestMessage(fonnteTargetPhone, fonnteCustomMessage);
      if (res?.success) {
        addToast({ title: 'Pesan WA Terkirim', message: `Pesan tes berhasil dikirim ke ${res.target || fonnteTargetPhone}`, type: 'success' });
        setFonnteModalOpen(false);
        setFonnteTargetPhone('');
        setFonnteCustomMessage('');
      } else {
        addToast({ title: 'Pengiriman WA Gagal', message: 'Server Fonnte gagal mengirim pesan tes.', type: 'error' });
      }
    } catch (err: any) {
      addToast({ title: 'Pengiriman WA Gagal', message: err.message, type: 'error' });
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
            INTEGRATION SERVICES
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--nb-text)] flex items-center gap-2">
            <span>API INTEGRATION</span>
          </h1>
          <p className="text-sm font-bold text-[var(--nb-text-muted)] mt-1">
            Kelola layanan eksternal untuk validasi akun, email, dan WhatsApp.
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

      {/* ROW 1 DESKTOP: NEETFLIX VALIDATOR & SMTP EMAIL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: NEETFLIX VALIDATOR */}
        <Card variant="white" className="flex flex-col justify-between">
          <div>
            <CardHeader headerBg="var(--nb-purple)">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-black uppercase">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  Neetflix Validator API
                </CardTitle>
                {settings.neetflix_api_key_configured ? (
                  <Badge variant="mint" size="sm" className="font-black uppercase flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Terkonfigurasi
                  </Badge>
                ) : (
                  <Badge variant="pink" size="sm" className="font-black uppercase flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Belum Dikonfigurasi
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div>
                <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                  API Base URL
                </label>
                <input
                  type="text"
                  value={settings.neetflix_api_url || 'https://api.neetflix.monster'}
                  onChange={(e) => handleChange('neetflix_api_url', e.target.value)}
                  placeholder="https://api.neetflix.monster"
                  className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                  API Key Validator
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNeetflixKey ? 'text' : 'password'}
                    value={neetflixApiKeyInput}
                    onChange={(e) => setNeetflixApiKeyInput(e.target.value)}
                    placeholder={settings.neetflix_api_key_configured ? 'API key sudah dikonfigurasi' : 'Masukkan API key baru'}
                    className="w-full p-2.5 pr-10 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNeetflixKey(!showNeetflixKey)}
                    className="absolute right-2 text-[var(--nb-text-muted)] hover:text-[var(--nb-text)]"
                  >
                    {showNeetflixKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {settings.neetflix_api_key_configured && !neetflixApiKeyInput && (
                  <p className="text-[10px] font-bold text-[var(--nb-text-muted)] mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> API key aktif tersimpan di server.
                  </p>
                )}
              </div>
            </CardContent>
          </div>

          <div className="p-5 pt-0">
            <Button
              variant="dark"
              size="md"
              onClick={handleTestNeetflix}
              disabled={testingNeetflix}
              className="w-full font-black uppercase text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${testingNeetflix ? 'animate-spin' : ''}`} />
              <span>{testingNeetflix ? 'Menguji...' : 'Tes Koneksi'}</span>
            </Button>
          </div>
        </Card>

        {/* CARD 2: SMTP EMAIL */}
        <Card variant="white" className="flex flex-col justify-between">
          <div>
            <CardHeader headerBg="var(--nb-cyan)">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-black uppercase">
                  <Mail className="w-5 h-5 stroke-[2.5]" />
                  SMTP Email Server
                </CardTitle>
                {settings.smtp_password_configured && settings.smtp_host ? (
                  <Badge variant="mint" size="sm" className="font-black uppercase flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Terkonfigurasi
                  </Badge>
                ) : (
                  <Badge variant="pink" size="sm" className="font-black uppercase flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Belum Dikonfigurasi
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                    Host
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_host || ''}
                    onChange={(e) => handleChange('smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                    Port
                  </label>
                  <input
                    type="number"
                    value={settings.smtp_port || 587}
                    onChange={(e) => handleChange('smtp_port', e.target.value)}
                    placeholder="587"
                    className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                    Username
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_user || ''}
                    onChange={(e) => handleChange('smtp_user', e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showSmtpPassword ? 'text' : 'password'}
                      value={smtpPasswordInput}
                      onChange={(e) => setSmtpPasswordInput(e.target.value)}
                      placeholder={settings.smtp_password_configured ? 'Password sudah dikonfigurasi' : 'Password SMTP'}
                      className="w-full p-2.5 pr-8 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-2 text-[var(--nb-text-muted)] hover:text-[var(--nb-text)]"
                    >
                      {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_from_name || ''}
                    onChange={(e) => handleChange('smtp_from_name', e.target.value)}
                    placeholder={settings.site_name || 'NETSTORE CS'}
                    className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-sans text-xs focus:bg-[var(--nb-yellow)] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={settings.smtp_from_email || ''}
                    onChange={(e) => handleChange('smtp_from_email', e.target.value)}
                    placeholder={settings.support_email || 'cs@netstore.id'}
                    className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-black uppercase cursor-pointer text-[var(--nb-text)]">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.smtp_secure)}
                    onChange={(e) => handleChange('smtp_secure', e.target.checked)}
                    className="w-4 h-4 accent-black"
                  />
                  Gunakan SSL/TLS (Port 465)
                </label>
              </div>
            </CardContent>
          </div>

          <div className="p-5 pt-0 grid grid-cols-2 gap-3">
            <Button
              variant="dark"
              size="md"
              onClick={handleTestSmtpConnection}
              disabled={testingSmtp}
              className="font-black uppercase text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${testingSmtp ? 'animate-spin' : ''}`} />
              <span>{testingSmtp ? 'Memeriksa...' : 'Tes Koneksi'}</span>
            </Button>

            <Button
              variant="mint"
              size="md"
              onClick={() => setSmtpModalOpen(true)}
              className="font-black uppercase text-xs"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Email Tes</span>
            </Button>
          </div>
        </Card>

      </div>

      {/* ROW 2: FONNTE WHATSAPP (FULL WIDTH DESKTOP) */}
      <Card variant="white">
        <CardHeader headerBg="var(--nb-mint)">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-black uppercase text-[var(--nb-text)]">
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
              Fonnte WhatsApp Gateway
            </CardTitle>
            {settings.fonnte_token_configured ? (
              <Badge variant="yellow" size="sm" className="font-black uppercase flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Terkonfigurasi
              </Badge>
            ) : (
              <Badge variant="pink" size="sm" className="font-black uppercase flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Belum Dikonfigurasi
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KIRI (2 Kolom di LG): FIELDS */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                  API Base URL
                </label>
                <input
                  type="text"
                  value={settings.fonnte_api_url || 'https://api.fonnte.com'}
                  onChange={(e) => handleChange('fonnte_api_url', e.target.value)}
                  placeholder="https://api.fonnte.com"
                  className="w-full p-2.5 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 text-[var(--nb-text)]">
                  Device Account Token
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showFonnteToken ? 'text' : 'password'}
                    value={fonnteTokenInput}
                    onChange={(e) => setFonnteTokenInput(e.target.value)}
                    placeholder={settings.fonnte_token_configured ? 'Token sudah dikonfigurasi' : 'Masukkan Token Fonnte'}
                    className="w-full p-2.5 pr-10 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFonnteToken(!showFonnteToken)}
                    className="absolute right-2 text-[var(--nb-text-muted)] hover:text-[var(--nb-text)]"
                  >
                    {showFonnteToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {settings.fonnte_token_configured && !fonnteTokenInput && (
                  <p className="text-[10px] font-bold text-[var(--nb-text-muted)] mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> Token aktif tersimpan di server.
                  </p>
                )}
              </div>
            </div>

            {/* KANAN (1 Kolom di LG): STATUS RINGKASAN & ACTIONS */}
            <div className="flex flex-col justify-between p-4 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] tracking-wider block mb-1">
                  STATUS LAYANAN WHATSAPP
                </span>
                <p className="text-xs font-bold text-[var(--nb-text)]">
                  Layanan pengiriman notifikasi otomatis invoice, transaksi, dan verifikasi via Fonnte WhatsApp API Gateway.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  variant="dark"
                  size="md"
                  onClick={handleTestFonnteConnection}
                  disabled={testingFonnte}
                  className="w-full font-black uppercase text-xs justify-center"
                >
                  <RefreshCw className={`w-4 h-4 ${testingFonnte ? 'animate-spin' : ''}`} />
                  <span>{testingFonnte ? 'Memeriksa Device...' : 'Tes Koneksi'}</span>
                </Button>

                <Button
                  variant="mint"
                  size="md"
                  onClick={() => setFonnteModalOpen(true)}
                  className="w-full font-black uppercase text-xs justify-center"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim WA Tes</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG MODAL: SEND SMTP TEST EMAIL */}
      {smtpModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="text-base font-black uppercase flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-600" /> Kirim Email Tes
              </h3>
              <button 
                onClick={() => setSmtpModalOpen(false)}
                className="font-black text-lg hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-bold text-neutral-600">
              Masukkan alamat email penerima. Pesan uji coba akan dikirim menggunakan server SMTP yang dikonfigurasi.
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
                <MessageSquare className="w-5 h-5 text-green-600" /> Kirim WhatsApp Tes
              </h3>
              <button 
                onClick={() => setFonnteModalOpen(false)}
                className="font-black text-lg hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-bold text-neutral-600">
              Masukkan nomor WhatsApp penerima tes. Nomor ini hanya digunakan sementara untuk verifikasi pesan.
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

            <div>
              <label className="block text-xs font-black uppercase mb-1">Pesan Kustom (Opsional)</label>
              <textarea
                rows={3}
                value={fonnteCustomMessage}
                onChange={(e) => setFonnteCustomMessage(e.target.value)}
                placeholder="Pesan tes opsional..."
                className="w-full p-2.5 bg-neutral-50 border-[2px] border-black font-sans text-xs outline-none focus:bg-yellow-50"
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
