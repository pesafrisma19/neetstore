import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../../services/queryClient';
import { queryKeys } from '../../../../services/queryKeys';
import { adjustAdminUserBalance } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { DollarSign, ArrowUpRight, ArrowDownRight, AlertCircle, X } from 'lucide-react';
import type { UserData } from '../../types';

interface AdjustBalanceModalProps {
  user: UserData;
  onClose: () => void;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({ user, onClose }) => {
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [amount, setAmount] = useState<string>('50000');
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const mutation = useMutation({
    mutationFn: async () => {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Nominal penyesuaian harus lebih besar dari 0');
      }
      if (!reason.trim() || reason.trim().length < 3) {
        throw new Error('Alasan penyesuaian wajib diisi (minimal 3 karakter)');
      }
      return await adjustAdminUserBalance(user.id, {
        type,
        amount: parsedAmount,
        reason: reason.trim(),
      });
    },
    onSuccess: () => {
      // Invalidate queries sejenis
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.detail(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.mutations.all });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Gagal melakukan penyesuaian saldo');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg">
        <Card variant="white" shadow="xl" borderWidth="4" className="rounded-3xl overflow-hidden text-left">
          <CardHeader headerBg="#FFDC00" className="border-b-[4px] border-black flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-black font-black text-base">
              <DollarSign className="w-5 h-5 stroke-[3]" />
              <span>PENYESUAIAN SALDO MANUAL</span>
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[3] text-black" />
            </button>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Header Profil Ringkas User */}
            <div className="p-3 bg-neutral-900 text-white rounded-2xl border-[3px] border-black flex items-center justify-between shadow-[3px_3px_0px_0px_#000]">
              <div>
                <div className="text-[10px] font-black uppercase text-neutral-400">TARGET USER</div>
                <div className="font-black text-sm uppercase text-[var(--nb-yellow)]">
                  {user.username} <span className="text-white text-xs font-mono">({user.phone || user.email || `#${user.id}`})</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-neutral-400">SALDO SAAT INI</div>
                <div className="font-black text-sm font-mono text-[var(--nb-yellow)]">
                  Rp {(user.balance || 0).toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-100 border-[3px] border-black text-rose-950 rounded-xl font-bold text-xs flex items-start gap-2 shadow-[3px_3px_0px_0px_#000]">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 stroke-[3] mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* TIPE MUTASI: IN (TAMBAH) VS OUT (POTONG) */}
              <div>
                <label className="text-xs font-black uppercase text-black block mb-2">TIPE PENYESUAIAN</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('IN')}
                    className={`p-3 border-[3px] border-black rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      type === 'IN'
                        ? 'bg-emerald-400 text-black shadow-[3px_3px_0px_0px_#000] translate-y-[-2px]'
                        : 'bg-white text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                    <span>+ TAMBAH (KREDIT)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('OUT')}
                    className={`p-3 border-[3px] border-black rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      type === 'OUT'
                        ? 'bg-rose-400 text-black shadow-[3px_3px_0px_0px_#000] translate-y-[-2px]'
                        : 'bg-white text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                    <span>- POTONG (DEBIT)</span>
                  </button>
                </div>
              </div>

              {/* INPUT NOMINAL */}
              <div>
                <label className="text-xs font-black uppercase text-black block mb-1">NOMINAL (RP)</label>
                <Input
                  type="number"
                  placeholder="Masukkan nominal saldo"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min={1}
                />
              </div>

              {/* INPUT ALASAN / REASON */}
              <div>
                <label className="text-xs font-black uppercase text-black block mb-1">
                  ALASAN / CATATAN AUDIT <span className="text-rose-600">*</span>
                </label>
                <textarea
                  placeholder="Contoh: Topup manual transfer BCA, Refund kendala server, Dll."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  className="w-full p-3 bg-white border-[3px] border-black rounded-xl text-xs font-bold font-sans text-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              {/* TOMBOL AKSI */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="white" size="md" onClick={onClose} disabled={mutation.isPending}>
                  BATAL
                </Button>
                <Button type="submit" variant="yellow" size="md" disabled={mutation.isPending}>
                  {mutation.isPending ? 'MEMPROSES...' : 'SIMPAN MUTASI SALDO'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
