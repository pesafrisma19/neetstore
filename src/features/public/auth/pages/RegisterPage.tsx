import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { authApi } from '../services/auth.api';
import { ArrowRight, UserPlus } from 'lucide-react';
import { Display } from '../../../../components/ui/Display';

export const RegisterPage: React.FC = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authApi.register({ username, password, phone: regPhone || undefined });
      loginUser(data.token, data.user?.role === 'ADMIN');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registrasi gagal.');
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
            <Display size="sm" highlight="yellow" className="mt-2">DAFTAR AKUN BARU</Display>
            <p className="font-bold text-sm">Bergabung dengan NETSTORE hari ini!</p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm rounded shadow-[3px_3px_0px_0px_#ef4444]">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <Input
                label="Username (Min 3 Karakter)"
                placeholder="Pilih username unik"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                className="bg-[var(--nb-surface)]"
              />
              <Input
                label="Password (Min 6 Karakter)"
                type="password"
                placeholder="Buat password aman"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-[var(--nb-surface)]"
              />
              <Input
                label="No WhatsApp (Opsional)"
                type="tel"
                placeholder="081234567890"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="bg-[var(--nb-surface)]"
              />
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
                <Link to="/login" className="text-[var(--nb-primary)] hover:underline decoration-2 underline-offset-2 font-black">
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

