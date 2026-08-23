import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { ShieldCheck, Lock, Smartphone, AlertCircle, ArrowLeft, X, CheckCircle } from 'lucide-react';
import { authApi } from '../services/auth.api';

interface AccountLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkData: {
    linkToken: string;
    email?: string;
    methods?: {
      password: boolean;
      whatsappOtp: boolean;
    };
    maskedPhone?: string | null;
    message?: string;
  } | null;
  onSuccess: (token: string) => void;
}

export const AccountLinkingModal: React.FC<AccountLinkingModalProps> = ({
  isOpen,
  onClose,
  linkData,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'password' | 'otp' | null>(null);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Set default method saat modal dibuka
  useEffect(() => {
    if (linkData) {
      if (linkData.methods?.password) {
        setSelectedMethod('password');
      } else if (linkData.methods?.whatsappOtp) {
        setSelectedMethod('otp');
      }
      setPassword('');
      setOtp('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setOtpSent(false);
      setCooldown(0);
    }
  }, [linkData]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (!isOpen || !linkData) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Masukkan password akun NEETSTORE Anda.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await authApi.linkGoogleWithPassword(linkData.linkToken, password);
      if (res.token) {
        setSuccessMsg('Akun Google berhasil ditautkan! Mengalihkan...');
        setTimeout(() => {
          onSuccess(res.token!);
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Gagal menautkan akun dengan password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await authApi.sendLinkOtp(linkData.linkToken);
      setOtpSent(true);
      setCooldown(res.cooldownSeconds || 60);
      setSuccessMsg(res.message || 'Kode OTP berhasil dikirim via WhatsApp.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Gagal mengirim kode OTP ke nomor WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMsg('Masukkan 6 digit kode OTP yang dikirim via WhatsApp.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await authApi.verifyLinkOtp(linkData.linkToken, otp);
      if (res.token) {
        setSuccessMsg('Verifikasi WhatsApp berhasil! Akun Google telah ditautkan.');
        setTimeout(() => {
          onSuccess(res.token!);
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Kode OTP tidak valid atau kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  const hasPassword = Boolean(linkData.methods?.password);
  const hasOtp = Boolean(linkData.methods?.whatsappOtp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <Card className="w-full max-w-md border-[4px] border-black shadow-[8px_8px_0px_0px_#000] rounded-2xl bg-white overflow-hidden my-auto">
        <CardHeader className="bg-[var(--nb-yellow)] border-b-[3px] border-black p-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 stroke-[2.5] text-black" />
            <CardTitle className="text-sm md:text-base font-black uppercase text-black tracking-wider">
              VERIFIKASI TAUTAN AKUN
            </CardTitle>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded-lg transition-colors border-2 border-black bg-white"
          >
            <X className="w-4 h-4 text-black stroke-[3]" />
          </button>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="bg-amber-50 border-2 border-amber-400 p-3.5 rounded-xl space-y-1">
            <p className="text-xs font-black text-amber-950">
              Email Google Terdaftar: <span className="font-mono text-black underline">{linkData.email}</span>
            </p>
            <p className="text-[11px] font-bold text-amber-900 leading-relaxed">
              Untuk keamanan akun, silakan verifikasi kepemilikan akun NEETSTORE lama Anda sebelum menghubungkan Google Sign-In.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border-2 border-rose-500 rounded-xl text-rose-800 text-xs font-extrabold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 stroke-[2.5] mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-emerald-800 text-xs font-extrabold flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 stroke-[2.5] mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Pemilihan Metode Verifikasi */}
          {hasPassword && hasOtp && (
            <div className="grid grid-cols-2 gap-2 border-2 border-black p-1 rounded-xl bg-neutral-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('password');
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
                  selectedMethod === 'password'
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]'
                    : 'text-black hover:bg-neutral-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('otp');
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
                  selectedMethod === 'otp'
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]'
                    : 'text-black hover:bg-neutral-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                WhatsApp OTP
              </button>
            </div>
          )}

          {/* Form Verifikasi Password */}
          {selectedMethod === 'password' && hasPassword && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black">
                  Password Akun NEETSTORE Lama
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password akun Anda"
                  className="font-bold border-[2.5px] border-black shadow-[2px_2px_0px_0px_#000]"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                variant="yellow"
                size="md"
                disabled={loading || !password}
                className="w-full font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] border-2 border-black"
              >
                {loading ? 'MEMVERIFIKASI...' : 'TAUTKAN DENGAN PASSWORD'}
              </Button>
            </form>
          )}

          {/* Form Verifikasi OTP WhatsApp */}
          {selectedMethod === 'otp' && hasOtp && (
            <div className="space-y-3 pt-1">
              <div className="p-3 bg-neutral-50 border-2 border-neutral-300 rounded-xl space-y-1">
                <span className="text-[10px] font-black uppercase text-neutral-500 block">
                  Nomor WhatsApp Terdaftar
                </span>
                <span className="text-sm font-black font-mono text-black block">
                  {linkData.maskedPhone || 'Tersimpan di Akun'}
                </span>
              </div>

              {!otpSent ? (
                <Button
                  type="button"
                  variant="mint"
                  size="md"
                  onClick={handleSendOtp}
                  disabled={loading || cooldown > 0}
                  className="w-full font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] border-2 border-black"
                >
                  {loading
                    ? 'MENGIRIM OTP...'
                    : cooldown > 0
                    ? `TUNGGU ${cooldown} DETIK`
                    : 'KIRIM KODE OTP KE WHATSAPP'}
                </Button>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black uppercase text-black">
                        Kode OTP 6 Digit
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={cooldown > 0 || loading}
                        className="text-[11px] font-black text-blue-700 hover:underline disabled:opacity-50"
                      >
                        {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : 'Kirim Ulang OTP'}
                      </button>
                    </div>
                    <Input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Contoh: 123456"
                      className="font-mono text-center tracking-widest text-lg font-black border-[2.5px] border-black shadow-[2px_2px_0px_0px_#000]"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="yellow"
                    size="md"
                    disabled={loading || otp.length !== 6}
                    className="w-full font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] border-2 border-black"
                  >
                    {loading ? 'MEMVERIFIKASI OTP...' : 'VERIFIKASI & TAUTKAN GOOGLE'}
                  </Button>
                </form>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-neutral-200 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-neutral-600 hover:text-black flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Batalkan dan kembali
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
