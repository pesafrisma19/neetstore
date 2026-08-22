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
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Lock,
  RefreshCw,
  AlertCircle
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
import { queryClient } from '../../../../services/queryClient';
import { queryKeys } from '../../../../services/queryKeys';

type ConnectionState = 'IDLE' | 'TESTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED';

export const SettingsApiPage: React.FC = () => {
  const { addToast } = useToast();
  
  // Settings State from GET /api/admin/settings
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Secret Input States (Hydrated with actual stored values)
  const [neetflixApiKeyInput, setNeetflixApiKeyInput] = useState('');
  const [smtpPasswordInput, setSmtpPasswordInput] = useState('');
  const [fonnteTokenInput, setFonnteTokenInput] = useState('');

  // Show/Hide password toggles for revealing exact stored credentials
  const [showNeetflixKey, setShowNeetflixKey] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showFonnteToken, setShowFonnteToken] = useState(false);

  // Per-card Saving Loading States
  const [savingNeetflix, setSavingNeetflix] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [savingFonnte, setSavingFonnte] = useState(false);

  // Real Session Connection Test States (IDLE on page load, updated ONLY by real test action)
  const [neetflixConnState, setNeetflixConnState] = useState<ConnectionState>('IDLE');
  const [neetflixConnMsg, setNeetflixConnMsg] = useState('');

  const [smtpConnState, setSmtpConnState] = useState<ConnectionState>('IDLE');
  const [smtpConnMsg, setSmtpConnMsg] = useState('');

  const [fonnteConnState, setFonnteConnState] = useState<ConnectionState>('IDLE');
  const [fonnteConnMsg, setFonnteConnMsg] = useState('');

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
        setNeetflixApiKeyInput(data.neetflix_api_key || '');
        setSmtpPasswordInput(data.smtp_password || '');
        setFonnteTokenInput(data.fonnte_token || '');
      }
    } catch (err: any) {
      addToast({ title: 'Gagal Memuat Pengaturan API', message: err.message, type: 'error' });
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

  // =======================================================
  // SCOPED SAVE 1: NEETFLIX ONLY
  // =======================================================
  const handleSaveNeetflix = async () => {
    setSavingNeetflix(true);
    const payload: Record<string, any> = {
      neetflix_api_url: (settings.neetflix_api_url || 'https://api.neetflix.monster').trim(),
      neetflix_api_key: neetflixApiKeyInput.trim()
    };

    try {
      await updateAdminSettings(payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.public.settings });
      addToast({ title: 'Neetflix Disimpan', message: 'Pengaturan Neetflix Validator berhasil diperbarui.', type: 'success' });
      await fetchSettings();
    } catch (err: any) {
      addToast({ title: 'Gagal Menyimpan', message: err.message, type: 'error' });
    } finally {
      setSavingNeetflix(false);
    }
  };

  // =======================================================
  // SCOPED SAVE 2: SMTP ONLY
  // =======================================================
  const handleSaveSmtp = async () => {
    setSavingSmtp(true);
    const payload: Record<string, any> = {
      smtp_host: (settings.smtp_host || '').trim(),
      smtp_port: Number(settings.smtp_port) || 587,
      smtp_user: (settings.smtp_user || '').trim(),
      smtp_from_name: (settings.smtp_from_name || '').trim(),
      smtp_from_email: (settings.smtp_from_email || '').trim(),
      smtp_secure: Boolean(settings.smtp_secure),
      smtp_password: smtpPasswordInput.trim()
    };

    try {
      await updateAdminSettings(payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.public.settings });
      addToast({ title: 'SMTP Disimpan', message: 'Pengaturan SMTP Email Server berhasil diperbarui.', type: 'success' });
      await fetchSettings();
    } catch (err: any) {
      addToast({ title: 'Gagal Menyimpan', message: err.message, type: 'error' });
    } finally {
      setSavingSmtp(false);
    }
  };

  // =======================================================
  // SCOPED SAVE 3: FONNTE ONLY
  // =======================================================
  const handleSaveFonnte = async () => {
    setSavingFonnte(true);
    const payload: Record<string, any> = {
      fonnte_api_url: (settings.fonnte_api_url || 'https://api.fonnte.com').trim(),
      fonnte_token: fonnteTokenInput.trim()
    };

    try {
      await updateAdminSettings(payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.public.settings });
      addToast({ title: 'Fonnte Disimpan', message: 'Pengaturan Fonnte WhatsApp Gateway berhasil diperbarui.', type: 'success' });
      await fetchSettings();
    } catch (err: any) {
      addToast({ title: 'Gagal Menyimpan', message: err.message, type: 'error' });
    } finally {
      setSavingFonnte(false);
    }
  };

  // =======================================================
  // REAL CONNECTION TEST 1: NEETFLIX
  // =======================================================
  const handleTestNeetflix = async () => {
    setNeetflixConnState('TESTING');
    setNeetflixConnMsg('');
    try {
      const res = await testNeetflixConnection();
      if (res?.success) {
        setNeetflixConnState('CONNECTED');
        setNeetflixConnMsg(`Terhubung (${res.data?.supportedGamesCount || 0} game OK)`);
        addToast({ 
          title: 'Koneksi Neetflix Aktif', 
          message: `Status server OK. Game terdukung: ${res.data?.supportedGamesCount || 0}`, 
          type: 'success' 
        });
      } else {
        setNeetflixConnState('FAILED');
        setNeetflixConnMsg('Respons API tidak valid');
        addToast({ title: 'Koneksi Neetflix Gagal', message: 'Respons API tidak valid.', type: 'error' });
      }
    } catch (err: any) {
      const errMsg = err.message || 'API Key salah atau server offline';
      setNeetflixConnState('FAILED');
      setNeetflixConnMsg(`Gagal terhubung: ${errMsg}`);
      addToast({ title: 'Koneksi Neetflix Gagal', message: errMsg, type: 'error' });
    }
  };

  // =======================================================
  // REAL CONNECTION TEST 2: SMTP
  // =======================================================
  const handleTestSmtpConnection = async () => {
    setSmtpConnState('TESTING');
    setSmtpConnMsg('');
    try {
      const res = await testSmtpConnection();
      if (res?.success) {
        setSmtpConnState('CONNECTED');
        setSmtpConnMsg(res.message || 'Terhubung');
        addToast({ title: 'Koneksi SMTP Berhasil', message: res.message || 'Koneksi ke server SMTP terverifikasi.', type: 'success' });
      } else {
        setSmtpConnState('FAILED');
        setSmtpConnMsg('Gagal terhubung ke SMTP Server');
        addToast({ title: 'Koneksi SMTP Gagal', message: 'Tidak dapat terhubung ke server SMTP.', type: 'error' });
      }
    } catch (err: any) {
      const msg = err.message?.includes('535') 
        ? 'Autentikasi SMTP gagal' 
        : (err.message || 'Koneksi SMTP gagal');
      setSmtpConnState('FAILED');
      setSmtpConnMsg(`Gagal terhubung: ${msg}`);
      addToast({ title: 'Koneksi SMTP Gagal', message: msg, type: 'error' });
    }
  };

  // Send Test Email Action
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

  // =======================================================
  // REAL CONNECTION TEST 3: FONNTE
  // =======================================================
  const handleTestFonnteConnection = async () => {
    setFonnteConnState('TESTING');
    setFonnteConnMsg('');
    try {
      const res = await testFonnteConnection();
      if (res?.tokenValid && res?.deviceConnected) {
        setFonnteConnState('CONNECTED');
        setFonnteConnMsg(res.message || 'Token Fonnte valid dan perangkat WhatsApp terhubung.');
        addToast({ title: 'Koneksi Fonnte Berhasil', message: res.message || 'Token Fonnte valid dan perangkat WhatsApp terhubung.', type: 'success' });
      } else if (res?.tokenValid && !res?.deviceConnected) {
        setFonnteConnState('DISCONNECTED');
        setFonnteConnMsg(res.message || 'Token Fonnte valid, tetapi perangkat WhatsApp sedang tidak terhubung.');
        addToast({ title: 'Device WhatsApp Disconnect', message: res.message || 'Token Fonnte valid, tetapi perangkat WhatsApp sedang tidak terhubung.', type: 'warning' });
      } else {
        setFonnteConnState('FAILED');
        setFonnteConnMsg(res?.message || 'Token Fonnte tidak valid atau server offline.');
        addToast({ title: 'Koneksi Fonnte Gagal', message: res?.message || 'Token Fonnte tidak valid.', type: 'error' });
      }
    } catch (err: any) {
      const msg = err.message || 'Gagal terhubung ke Fonnte';
      setFonnteConnState('FAILED');
      setFonnteConnMsg(`Gagal terhubung: ${msg}`);
      addToast({ title: 'Koneksi Fonnte Gagal', message: msg, type: 'error' });
    }
  };

  // Send Test WhatsApp Action
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
      {/* HEADER BANNER (NO GLOBAL SAVE BUTTON) */}
      <div className="bg-[var(--nb-yellow)] border-[3px] border-[var(--nb-border)] p-6 shadow-[var(--nb-shadow)]">
        <Badge variant="cyan" size="sm" className="font-black uppercase mb-2">
          INTEGRATION SERVICES
        </Badge>
        <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--nb-text)] flex items-center gap-2">
          <span>API INTEGRATION</span>
        </h1>
        <p className="text-sm font-bold text-[var(--nb-text-muted)] mt-1">
          Kelola layanan eksternal untuk validasi akun, email, dan WhatsApp. Setiap integrasi memiliki tombol simpan masing-masing.
        </p>
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
                  Neetflix Validator
                </CardTitle>

                {/* SINGLE CONFIGURATION BADGE ONLY IN HEADER */}
                {settings.neetflix_api_key_configured ? (
                  <Badge variant="mint" size="sm" className="font-black uppercase flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terkonfigurasi</span>
                  </Badge>
                ) : (
                  <Badge variant="pink" size="sm" className="font-black uppercase flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Belum Dikonfigurasi</span>
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
                    placeholder="Masukkan API Key Neetflix"
                    autoComplete="new-password"
                    className="w-full p-2.5 pr-10 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNeetflixKey(!showNeetflixKey)}
                    className="absolute right-2 text-[var(--nb-text-muted)] hover:text-[var(--nb-text)]"
                    title={showNeetflixKey ? 'Sembunyikan API key' : 'Tampilkan API key'}
                  >
                    {showNeetflixKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {settings.neetflix_api_key_configured && (
                  <p className="text-[10px] font-bold text-[var(--nb-text-muted)] mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> Credential aktif tersimpan di database.
                  </p>
                )}
              </div>
            </CardContent>
          </div>

          {/* CARD 1 FOOTER ACTIONS */}
          <div className="p-5 pt-0 border-t-[2px] border-dashed border-[var(--nb-border)] mt-4 pt-4 flex items-center justify-between gap-2">
            <div className="text-[11px] font-bold text-[var(--nb-text-muted)] truncate max-w-[50%]">
              {neetflixConnMsg && (
                <span className={`font-mono text-[10px] ${neetflixConnState === 'CONNECTED' ? 'text-emerald-700 font-black' : neetflixConnState === 'FAILED' ? 'text-rose-700 font-black' : ''}`}>
                  {neetflixConnMsg}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* SINGLE TEST BUTTON */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNeetflix}
                disabled={neetflixConnState === 'TESTING'}
                className="font-black uppercase text-xs"
                title="Test Koneksi Neetflix"
                aria-label="Test Koneksi Neetflix"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${neetflixConnState === 'TESTING' ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Test Koneksi</span>
              </Button>

              {/* SINGLE SAVE BUTTON */}
              <Button
                variant="mint"
                size="sm"
                onClick={handleSaveNeetflix}
                disabled={savingNeetflix || loading}
                className="font-black uppercase text-xs"
                title="Simpan Neetflix"
                aria-label="Simpan Neetflix"
              >
                <Save className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">{savingNeetflix ? 'Menyimpan...' : 'Simpan Neetflix'}</span>
              </Button>
            </div>
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

                {/* SINGLE CONFIGURATION BADGE ONLY IN HEADER */}
                {settings.smtp_password_configured && settings.smtp_host ? (
                  <Badge variant="mint" size="sm" className="font-black uppercase flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terkonfigurasi</span>
                  </Badge>
                ) : (
                  <Badge variant="pink" size="sm" className="font-black uppercase flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Belum Dikonfigurasi</span>
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
                      placeholder="Masukkan Password SMTP"
                      autoComplete="new-password"
                      className="w-full p-2.5 pr-8 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-2 text-[var(--nb-text-muted)] hover:text-[var(--nb-text)]"
                      title={showSmtpPassword ? 'Sembunyikan password' : 'Tampilkan password'}
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
                    placeholder="NETSTORE CS"
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
                    placeholder="cs@netstore.id"
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

          {/* CARD 2 FOOTER ACTIONS */}
          <div className="p-5 pt-0 border-t-[2px] border-dashed border-[var(--nb-border)] mt-4 pt-4 flex items-center justify-between gap-2">
            <div className="text-[11px] font-bold text-[var(--nb-text-muted)] truncate max-w-[40%]">
              {smtpConnMsg && (
                <span className={`font-mono text-[10px] ${smtpConnState === 'CONNECTED' ? 'text-emerald-700 font-black' : smtpConnState === 'FAILED' ? 'text-rose-700 font-black' : ''}`}>
                  {smtpConnMsg}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* SINGLE TEST BUTTON */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSmtpConnection}
                disabled={smtpConnState === 'TESTING'}
                className="font-black uppercase text-xs"
                title="Test Koneksi SMTP"
                aria-label="Test Koneksi SMTP"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${smtpConnState === 'TESTING' ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Test Koneksi</span>
              </Button>

              {/* SINGLE SEND TEST EMAIL BUTTON */}
              <Button
                variant="cyan"
                size="sm"
                onClick={() => setSmtpModalOpen(true)}
                className="font-black uppercase text-xs"
                title="Kirim Email Tes"
                aria-label="Kirim Email Tes"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim Email Tes</span>
              </Button>

              {/* SINGLE SAVE BUTTON */}
              <Button
                variant="mint"
                size="sm"
                onClick={handleSaveSmtp}
                disabled={savingSmtp || loading}
                className="font-black uppercase text-xs"
                title="Simpan SMTP"
                aria-label="Simpan SMTP"
              >
                <Save className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">{savingSmtp ? 'Menyimpan...' : 'Simpan SMTP'}</span>
              </Button>
            </div>
          </div>
        </Card>

      </div>

      {/* CARD 3: FONNTE WHATSAPP GATEWAY */}
      <Card variant="white">
        <CardHeader headerBg="var(--nb-mint)">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-black uppercase text-[var(--nb-text)]">
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
              Fonnte WhatsApp Gateway
            </CardTitle>

            {/* SINGLE CONFIGURATION BADGE ONLY IN HEADER */}
            {settings.fonnte_token_configured ? (
              <Badge variant="yellow" size="sm" className="font-black uppercase flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terkonfigurasi</span>
              </Badge>
            ) : (
              <Badge variant="pink" size="sm" className="font-black uppercase flex items-center gap-1 shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Belum Dikonfigurasi</span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Masukkan Token Fonnte"
                  autoComplete="new-password"
                  className="w-full p-2.5 pr-10 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] font-mono text-xs focus:bg-[var(--nb-yellow)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowFonnteToken(!showFonnteToken)}
                  className="absolute right-2 text-[var(--nb-text-muted)] hover:text-[var(--nb-text)]"
                  title={showFonnteToken ? 'Sembunyikan Token Fonnte' : 'Tampilkan Token Fonnte'}
                >
                  {showFonnteToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {settings.fonnte_token_configured && (
                <p className="text-[10px] font-bold text-[var(--nb-text-muted)] mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" /> Credential aktif tersimpan di database.
                </p>
              )}
            </div>
          </div>
        </CardContent>

        {/* CARD 3 FOOTER ACTIONS */}
        <div className="p-5 pt-0 border-t-[2px] border-dashed border-[var(--nb-border)] mt-2 pt-4 flex items-center justify-between gap-2">
          <div className="text-[11px] font-bold text-[var(--nb-text-muted)] truncate max-w-[40%]">
            {fonnteConnMsg && (
              <span className={`font-mono text-[10px] ${
                fonnteConnState === 'CONNECTED'
                  ? 'text-emerald-700 font-black'
                  : fonnteConnState === 'DISCONNECTED'
                  ? 'text-amber-700 font-black'
                  : fonnteConnState === 'FAILED'
                  ? 'text-rose-700 font-black'
                  : ''
              }`}>
                {fonnteConnMsg}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* SINGLE TEST BUTTON */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestFonnteConnection}
              disabled={fonnteConnState === 'TESTING'}
              className="font-black uppercase text-xs"
              title="Test Koneksi Fonnte"
              aria-label="Test Koneksi Fonnte"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fonnteConnState === 'TESTING' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Test Koneksi</span>
            </Button>

            {/* SINGLE SEND TEST WA BUTTON */}
            <Button
              variant="cyan"
              size="sm"
              onClick={() => setFonnteModalOpen(true)}
              className="font-black uppercase text-xs"
              title="Kirim WA Tes"
              aria-label="Kirim WA Tes"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim WA Tes</span>
            </Button>

            {/* SINGLE SAVE BUTTON */}
            <Button
              variant="mint"
              size="sm"
              onClick={handleSaveFonnte}
              disabled={savingFonnte || loading}
              className="font-black uppercase text-xs"
              title="Simpan Fonnte"
              aria-label="Simpan Fonnte"
            >
              <Save className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">{savingFonnte ? 'Menyimpan...' : 'Simpan Fonnte'}</span>
            </Button>
          </div>
        </div>
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
