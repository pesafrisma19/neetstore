import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Button, CountryPhoneInput } from '../../../../components/ui';
import { authApi } from '../services/auth.api';
import { ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Display } from '../../../../components/ui/Display';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [countryCode, setCountryCode] = useState('+62');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password.');
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.register({
        countryCode,
        phone,
        password,
        confirmPassword,
      });

      const targetPhone = data.phone || `${countryCode}${phone}`;
      navigate(`/verify-otp?phone=${encodeURIComponent(targetPhone)}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="bg-[var(--nb-pink)] p-6 border-b-[3px] border-[var(--nb-border)] flex flex-col items-center gap-2 text-center">
            <UserPlus className="w-10 h-10 stroke-[3]" />
            <Display size="sm" highlight="yellow" className="mt-2">
              DAFTAR AKUN BARU
            </Display>
            <p className="font-bold text-sm">Daftar instan via WhatsApp di NETSTORE</p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm rounded shadow-[3px_3px_0px_0px_#ef4444]">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              {/* Reusable Country Phone Input */}
              <CountryPhoneInput
                countryCode={countryCode}
                phone={phone}
                onCountryCodeChange={setCountryCode}
                onPhoneChange={setPhone}
              />

              {/* Password Input */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="font-black text-xs uppercase tracking-wider text-[var(--nb-text)]">
                  Password (Min 6 Karakter) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Buat password aman"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Confirm Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-xs uppercase tracking-wider text-[var(--nb-text)]">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ulangi password"
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
                    <span>DAFTAR SEKARANG</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t-[3px] border-[var(--nb-border)] border-dashed text-center">
              <p className="font-bold text-sm text-[var(--nb-text-muted)]">
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  className="text-[var(--nb-primary)] hover:underline decoration-2 underline-offset-2 font-black"
                >
                  MASUK DI SINI
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
