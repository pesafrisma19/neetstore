import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Button, CountryPhoneInput } from '../../../../components/ui';
import { authApi } from '../services/auth.api';
import { Phone, ArrowRight } from 'lucide-react';
import { Display } from '../../../../components/ui/Display';

export const CompletePhonePage: React.FC = () => {
  const navigate = useNavigate();

  const [countryCode, setCountryCode] = useState('+62');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fullPhone = `${countryCode}${phone}`;
      const res = await authApi.sendOtp(fullPhone, 'PHONE_VERIFICATION');
      navigate(`/verify-otp?phone=${encodeURIComponent(res.phone || fullPhone)}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengirim OTP. Pastikan nomor WhatsApp valid.');
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
            <Phone className="w-10 h-10 stroke-[3]" />
            <Display size="sm" highlight="yellow" className="mt-2">
              LENGKAPI NOMOR WA
            </Display>
            <p className="font-bold text-sm">Masukkan nomor WhatsApp aktif untuk verifikasi akun NETSTORE Anda.</p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm rounded shadow-[3px_3px_0px_0px_#ef4444]">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <CountryPhoneInput
                countryCode={countryCode}
                phone={phone}
                onCountryCodeChange={setCountryCode}
                onPhoneChange={setPhone}
              />

              <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
                {!loading && (
                  <>
                    <span>KIRIM KODE OTP WA</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
