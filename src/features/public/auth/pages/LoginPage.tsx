import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { authApi } from '../services/auth.api';
import { ArrowRight, LogIn } from 'lucide-react';
import { Display } from '../../../../components/ui/Display';

export const LoginPage: React.FC = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authApi.login({ username, password });
      const profile = await loginUser(data.token, data.user?.role === 'ADMIN');
      if (profile?.role === 'ADMIN') {
        navigate('/secret-admin-dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login gagal.');
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
            <LogIn className="w-10 h-10 stroke-[3]" />
            <Display size="sm" highlight="yellow" className="mt-2">MASUK AKUN</Display>
            <p className="font-bold text-sm">Selamat datang kembali di NETSTORE</p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm rounded shadow-[3px_3px_0px_0px_#ef4444]">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <Input
                label="Username"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-[var(--nb-surface)]"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Masukkan password rahasia"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[var(--nb-surface)]"
              />
              <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
                {!loading && (
                  <>
                    <span>MASUK SEKARANG</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t-[3px] border-[var(--nb-border)] border-dashed text-center">
              <p className="font-bold text-sm text-[var(--nb-text-muted)]">
                Belum punya akun?{' '}
                <Link to="/register" className="text-[var(--nb-primary)] hover:underline decoration-2 underline-offset-2 font-black">
                  DAFTAR SEKARANG
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

