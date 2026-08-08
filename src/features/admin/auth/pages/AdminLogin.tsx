import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Sticker } from '../../../../components/ui/Sticker';
import { login } from '../../../../utils/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { ShieldAlert, Lock, User, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginUser, isLoading: authLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secretPin, setSecretPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto redirect jika user sudah login sebagai Admin
  useEffect(() => {
    if (!authLoading && user && user.role === 'ADMIN') {
      navigate('/secret-admin-dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan Password wajib diisi!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(username, password);
      if (res && res.token) {
        const role = res.user?.role || res.role;
        if (role === 'ADMIN') {
          // Sync token & user profile ke AuthContext secara synchronously sebelum navigate!
          localStorage.setItem('adminToken', res.token);
          localStorage.setItem('adminUser', JSON.stringify({ name: res.user?.username || username, role: 'ADMIN' }));
          
          const profile = await loginUser(res.token, true);
          if (profile && profile.role === 'ADMIN') {
            navigate('/secret-admin-dashboard');
          } else {
            setErrorMsg('Akses Ditolak: Profil bukan Admin.');
          }
        } else {
          setErrorMsg('Kredensial Admin Salah atau Tidak Memiliki Akses!');
        }
      } else {
        setErrorMsg('Gagal terhubung ke server.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Kredensial Admin Salah!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brutalist-grid flex items-center justify-center p-4 text-left">
      <div className="w-full max-w-md">
        
        {/* Top Header Spiky Sticker */}
        <div className="flex justify-center mb-4">
          <Sticker variant="pink" size="md" angle="-rotate-3">
            <div className="flex items-center gap-1.5 font-black">
              <ShieldAlert className="w-4 h-4 stroke-[3]" />
              <span>CONFIDENTIAL PORTAL</span>
            </div>
          </Sticker>
        </div>

        {/* Secret Admin Login Card */}
        <Card variant="white" shadow="xl" borderWidth="4" className="rounded-3xl overflow-hidden">
          <CardHeader headerBg="#FFDC00" className="border-b-[4px]">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[var(--nb-text)]">
                <Lock className="w-6 h-6 stroke-[3]" />
                <span>NETSTORE ADMIN</span>
              </CardTitle>
              <Badge variant="purple" size="sm">SECRET GATE</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
            
            <div className="p-3 bg-[var(--nb-surface-alt)] border-[2.5px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-[var(--nb-pink)] text-white border-[2px] border-[var(--nb-border)] rounded-xl shrink-0 mt-0.5">
                <KeyRound className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <h4 className="font-black text-xs uppercase text-[var(--nb-text)] m-0">AKSES TERBATAS ADMIN</h4>
                <p className="text-[10px] font-bold text-[var(--nb-text-muted)] m-0 mt-0.5">
                  Hanya staf berwenang yang dapat mengakses panel kontrol sistem.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[var(--nb-pink)] text-white border-[2.5px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] rounded-xl font-black text-xs uppercase">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
              
              <div>
                <label className="text-xs font-black uppercase text-[var(--nb-text)] mb-1 block">
                  USERNAME ADMIN
                </label>
                <div className="relative">
                  <Input
                    placeholder="Masukkan Username Admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <User className="w-4 h-4 text-[var(--nb-text)] absolute left-3 top-1/2 -translate-y-1/2 stroke-[3]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-[var(--nb-text)] mb-1 block">
                  PASSWORD SECURITY
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                  />
                  <Lock className="w-4 h-4 text-[var(--nb-text)] absolute left-3 top-1/2 -translate-y-1/2 stroke-[3]" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)] hover:text-[var(--nb-text)] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 stroke-[3]" /> : <Eye className="w-4 h-4 stroke-[3]" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-[var(--nb-text)] mb-1 block">
                  PIN KUNCI ABNORMAL (OPSIONAL)
                </label>
                <Input
                  type="password"
                  placeholder="Kode Kunci 6-Digit"
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  maxLength={6}
                />
              </div>

              <Button
                type="submit"
                variant="yellow"
                size="lg"
                fullWidth
                disabled={isLoading}
                className="mt-2"
              >
                {isLoading ? (
                  <span>MEMVERIFIKASI AKESES...</span>
                ) : (
                  <>
                    <span>MASUK PANEL ADMIN</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </>
                )}
              </Button>
            </form>

            <div className="border-t-[2px] border-[var(--nb-border)]/20 pt-4 text-center">
              <span className="text-[10px] font-bold text-[var(--nb-text-muted)] uppercase">
                Demo Admin: username: <span className="font-black text-[var(--nb-text)]">admin</span> | password: <span className="font-black text-[var(--nb-text)]">admin123</span>
              </span>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

