import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Button, CountryPhoneInput } from '../../../../components/ui';
import { authApi } from '../services/auth.api';
import { KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { Display } from '../../../../components/ui/Display';
import { TurnstileWidget } from '../../../../components/shared/TurnstileWidget';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [countryCode, setCountryCode] = useState('+62');
  const [phone, setPhone] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetTurnstile = () => {
    setTurnstileToken(null);
    setTurnstileResetKey((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fullPhone = `${countryCode}${phone}`;
      const res = await authApi.forgotPassword({ phone: fullPhone, turnstileToken });
      const targetPhone = res.phone || fullPhone;
      navigate(`/reset-password?phone=${encodeURIComponent(targetPhone)}`);
    } catch (err: any) {
      resetTurnstile();
      setError(err.response?.data?.error || 'Gagal mengirim OTP reset password. Periksa nomor WhatsApp Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="bg-[var(--nb-yellow)] p-6 border-b-[3px] border-[var(--nb-border)] flex flex-col items-center gap-2 text-center">
            <KeyRound className="w-10 h-10 stroke-[3]" />
            <Display size="sm" highlight="yellow" className="mt-2">
              LUPA PASSWORD
            </Display>
            <p className="font-bold text-sm">Masukkan nomor WhatsApp terdaftar untuk menerima OTP reset password.</p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm rounded shadow-[3px_3px_0px_0px_#ef4444]">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <CountryPhoneInput
                countryCode={countryCode}
                phone={phone}
                onCountryCodeChange={setCountryCode}
                onPhoneChange={setPhone}
              />

              {/* Cloudflare Turnstile Managed CAPTCHA */}
              <TurnstileWidget
                action="forgot_password"
                resetKey={turnstileResetKey}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
              />

              <Button type="submit" variant="primary" size="lg" className="w-full mt-1" isLoading={loading}>
                {!loading && (
                  <>
                    <span>KIRIM KODE OTP</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t-[3px] border-[var(--nb-border)] border-dashed text-center">
              <Link
                to="/login"
                className="font-bold text-sm text-[var(--nb-primary)] hover:underline flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Halaman Login</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
