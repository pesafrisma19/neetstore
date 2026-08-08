import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../../services/queryKeys';
import { updateAdminUser } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { User, X, AlertCircle, CheckCircle } from 'lucide-react';
import type { UserData } from '../../types';

interface EditUserModalProps {
  user: UserData;
  onClose: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose }) => {
  const queryClient = useQueryClient();

  const [fullname, setFullname] = useState<string>(user.fullname || '');
  const [email, setEmail] = useState<string>(user.email || '');
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [role, setRole] = useState<'USER' | 'ADMIN'>(user.role || 'USER');
  const [level, setLevel] = useState<'MEMBER' | 'RESELLER' | 'VIP'>(user.level || 'MEMBER');
  const [isActive, setIsActive] = useState<boolean>(user.isActive !== false);
  const [verified, setVerified] = useState<boolean>(Boolean(user.verified));

  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: any) => updateAdminUser(user.id, payload),
    onSuccess: () => {
      setMsg({ text: 'Data user berhasil diperbarui!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.detail(user.id) });
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (err: any) => {
      setMsg({ text: err?.message || 'Gagal memperbarui data user', type: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    mutation.mutate({
      fullname: fullname.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      role,
      level,
      isActive,
      verified,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg my-auto font-sans">
        <Card variant="white" shadow="xl" borderWidth="4" className="rounded-3xl overflow-hidden text-left">
          <CardHeader headerBg="#00F0FF" className="border-b-[4px] border-black flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-black font-black text-sm uppercase">
              <User className="w-4 h-4 stroke-[3]" />
              <span>EDIT USER — #{user.id} {user.username}</span>
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3] text-black" />
            </button>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* ALERT NOTIFICATION */}
            {msg && (
              <div
                className={`p-3 border-[3px] border-black rounded-xl text-xs font-black flex items-center gap-2 ${
                  msg.type === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {msg.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 stroke-[3]" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0 stroke-[3]" />
                )}
                <span>{msg.text}</span>
              </div>
            )}

            {/* READ-ONLY INFORMATION BANNER */}
            <div className="p-3 bg-neutral-100 border-[2px] border-black rounded-xl space-y-1 text-xs font-mono">
              <div className="flex justify-between items-center text-neutral-600">
                <span>USERNAME:</span>
                <span className="font-black text-black font-sans">{user.username}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>SALDO SAAT INI:</span>
                <span className="font-black text-emerald-700">Rp {(user.balance || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="text-[10px] font-sans font-bold text-neutral-500 italic text-right">
                *Saldo hanya dapat diubah melalui menu &quot;Adjust Saldo&quot;
              </div>
            </div>

            {/* EDIT FORM */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
              {/* NAMA LENGKAP */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-black">Nama Lengkap</label>
                <Input
                  type="text"
                  placeholder="Masukkan nama lengkap..."
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-black">Email</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* NO. WHATSAPP */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-black">No. WhatsApp / Telepon</label>
                <Input
                  type="text"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* GRID 2 KOLOM UNTUK ROLE & LEVEL */}
              <div className="grid grid-cols-2 gap-3">
                {/* ROLE */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-black">Role System</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 bg-white border-[3px] border-black rounded-xl font-extrabold text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                {/* LEVEL HARGA */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-black">Level Harga</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full p-2.5 bg-white border-[3px] border-black rounded-xl font-extrabold text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="RESELLER">RESELLER</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              {/* GRID 2 KOLOM UNTUK STATUS AKUN & VERIFIED */}
              <div className="grid grid-cols-2 gap-3">
                {/* STATUS AKUN */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-black">Status Akun</label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full p-2.5 bg-white border-[3px] border-black rounded-xl font-extrabold text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                  >
                    <option value="true">Status Akun: Aktif</option>
                    <option value="false">Status Akun: Nonaktif</option>
                  </select>
                </div>

                {/* VERIFIED STATUS */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-black">Status Verifikasi</label>
                  <select
                    value={verified ? 'true' : 'false'}
                    onChange={(e) => setVerified(e.target.value === 'true')}
                    className="w-full p-2.5 bg-white border-[3px] border-black rounded-xl font-extrabold text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                  >
                    <option value="false">Belum Verifikasi</option>
                    <option value="true">Terverifikasi</option>
                  </select>
                </div>
              </div>

              {/* BUTTON ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="white"
                  size="md"
                  onClick={onClose}
                  disabled={mutation.isPending}
                  className="font-black text-xs"
                >
                  BATAL
                </Button>
                <Button
                  type="submit"
                  variant="yellow"
                  size="md"
                  disabled={mutation.isPending}
                  className="font-black text-xs shadow-[3px_3px_0px_0px_#000]"
                >
                  {mutation.isPending ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
