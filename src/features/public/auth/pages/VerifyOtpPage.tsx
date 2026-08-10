import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Button } from '../../../../components/ui/Button';
import { authApi } from '../services/auth.api';
import { ShieldCheck, ArrowRight, RefreshCw, PhoneCall } from 'lucide-react';
import { Display } from '../../../../components/ui/Display';

function sanitizePhoneDisplay(phoneStr: string): string {
  if (!phoneStr) return '';
  const trimmed = phoneStr.trim();
  if (trimmed.length <= 6) return trimmed;
  const prefix = trimmed.substring(0, 5);
  const suffix = trimmed.substring(trimmed.length - 3);
  return `${prefix}****${suffix}`;
}

export const VerifyOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const phoneParam = searchParams.get('phone') || '';
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown effect
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

    // Auto-advance to next box
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Masukkan 6 digit kode OTP secara lengkap.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await authApi.verifyOtp({
        phone: phoneParam,
        otp: otpCode,
        purpose: 'PHONE_VERIFICATION',
      });

      if (data.token) {
        setSuccessMsg('Verifikasi berhasil! Mengalihkan ke aplikasi...');
        await loginUser(data.token, data.role === 'ADMIN');
        setTimeout(() => {
          navigate(data.role === 'ADMIN' ? '/admin' : '/');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kode OTP salah atau kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await authApi.resendOtp(phoneParam, 'PHONE_VERIFICATION');
      setSuccessMsg(res.message || 'Kode OTP baru berhasil dikirim via WhatsApp.');
      setCooldown(res.cooldownSeconds || 60);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengirim ulang OTP. Silakan coba lagi.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="bg-[var(--nb-green)] p-6 border-b-[3px] border-[var(--nb-border)] flex flex-col items-center gap-2 text-center">
            <ShieldCheck className="w-10 h-10 stroke-[3]" />
            <Display size="sm" highlight="yellow" className="mt-2">
              VERIFIKASI WHATSAPP
            </Display>
            <p className="font-bold text-sm">Masukkan 6 digit kode OTP yang dikirim ke:</p>
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

            <form onSubmit={handleVerify} className="flex flex-col gap-6">
              {/* 6-Digit OTP Boxes */}
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
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
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center font-black text-xl bg-[var(--nb-surface)] border-[3px] border-[var(--nb-border)] rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-[var(--nb-yellow)] transition-all"
                  />
                ))}
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
                {!loading && (
                  <>
                    <span>VERIFIKASI OTP</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </>
                )}
              </Button>
            </form>

            {/* Resend Cooldown Section */}
            <div className="mt-6 pt-6 border-t-[3px] border-[var(--nb-border)] border-dashed text-center flex flex-col gap-3">
              {cooldown > 0 ? (
                <p className="font-bold text-sm text-[var(--nb-text-muted)]">
                  Belum menerima kode? Kirim ulang dalam{' '}
                  <span className="font-black text-[var(--nb-primary)]">
                    00:{cooldown < 10 ? `0${cooldown}` : cooldown}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-black text-sm text-[var(--nb-primary)] hover:underline flex items-center justify-center gap-1.5 mx-auto disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                  <span>KIRIM ULANG OTP</span>
                </button>
              )}

              <Link
                to="/register"
                className="font-bold text-xs text-gray-500 hover:text-black flex items-center justify-center gap-1 mt-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
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
