import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Button } from '../../../../components/ui/Button';
import { authApi } from '../services/auth.api';
import { KeyRound, ArrowRight, Eye, EyeOff, RefreshCw, ArrowLeft } from 'lucide-react';
import { Display } from '../../../../components/ui/Display';

function sanitizePhoneDisplay(phoneStr: string): string {
  if (!phoneStr) return '';
  const trimmed = phoneStr.trim();
  if (trimmed.length <= 6) return trimmed;
  const prefix = trimmed.substring(0, 5);
  const suffix = trimmed.substring(trimmed.length - 3);
  return `${prefix}****${suffix}`;
}

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const phoneParam = searchParams.get('phone') || '';
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = cleanVal;
    setOtpDigits(newOtp);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Masukkan 6 digit kode OTP secara lengkap.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword({
        phone: phoneParam,
        otp: otpCode,
        newPassword,
        confirmPassword,
      });

      setSuccessMsg(res.message || 'Password berhasil di-reset!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mereset password. Pastikan OTP valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await authApi.resendOtp(phoneParam, 'PASSWORD_RESET');
      setSuccessMsg(res.message || 'Kode OTP baru berhasil dikirim via WhatsApp.');
      setCooldown(res.cooldownSeconds || 60);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengirim ulang OTP reset password.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="bg-[var(--nb-pink)] p-6 border-b-[3px] border-[var(--nb-border)] flex flex-col items-center gap-2 text-center">
            <KeyRound className="w-10 h-10 stroke-[3]" />
            <Display size="sm" highlight="yellow" className="mt-2">
              RESET PASSWORD
            </Display>
            <p className="font-bold text-sm">Masukkan OTP & buat password baru untuk nomor:</p>
            <span className="font-black text-base px-3 py-1 bg-white border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {sanitizePhoneDisplay(phoneParam) || 'Nomor WhatsApp'}
            </span>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm rounded shadow-[3px_3px_0px_0px_#ef4444]">
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-100 border-2 border-green-500 text-green-800 font-bold text-sm rounded shadow-[3px_3px_0px_0px_#22c55e]">
                ✅ {successMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
              {/* 6-Digit OTP Boxes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-xs uppercase tracking-wider text-[var(--nb-text)] text-center">
                  Masukkan Kode OTP WhatsApp (6 Digit) <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-10 h-12 sm:w-11 sm:h-13 text-center font-black text-xl bg-[var(--nb-surface)] border-[2.5px] border-[var(--nb-border)] rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
                    />
                  ))}
                </div>
              </div>

              {/* New Password Input */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="font-black text-xs uppercase tracking-wider text-[var(--nb-text)]">
                  Password Baru (Min 6 Karakter) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Buat password baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 pr-10 bg-[var(--nb-surface)] border-[2.5px] border-[var(--nb-border)] font-bold text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-xs uppercase tracking-wider text-[var(--nb-text)]">
                  Konfirmasi Password Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 bg-[var(--nb-surface)] border-[2.5px] border-[var(--nb-border)] font-bold text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
                {!loading && (
                  <>
                    <span>SIMPAN PASSWORD BARU</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t-[3px] border-[var(--nb-border)] border-dashed text-center flex flex-col gap-3">
              {cooldown > 0 ? (
                <p className="font-bold text-sm text-[var(--nb-text-muted)]">
                  Belum menerima kode OTP? Kirim ulang dalam{' '}
                  <span className="font-black text-[var(--nb-primary)]">
                    00:{cooldown < 10 ? `0${cooldown}` : cooldown}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="font-black text-sm text-[var(--nb-primary)] hover:underline flex items-center justify-center gap-1.5 mx-auto disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                  <span>KIRIM ULANG OTP RESET PASSWORD</span>
                </button>
              )}

              <Link
                to="/forgot-password"
                className="font-bold text-xs text-gray-500 hover:text-black flex items-center justify-center gap-1 mt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ganti Nomor WhatsApp</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
