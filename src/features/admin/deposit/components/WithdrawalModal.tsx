import React, { useState } from 'react';
import { Dialog } from '../../../../components/ui/Dialog';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { useToast } from '../../../../components/ui/ToastContext';
import { requestTokoPayWithdrawal } from '../../../../utils/api';
import { Wallet, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  merchantBalance?: number;
}

interface WithdrawalResult {
  status: number;
  rc: number;
  message: string;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  merchantBalance = 0,
}) => {
  const { addToast } = useToast();
  const [nominal, setNominal] = useState<number>(50000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<WithdrawalResult | null>(null);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nominal < 10000) {
      addToast({
        title: 'NOMINAL TIDAK VALID',
        message: 'Minimal penarikan saldo TokoPay adalah Rp 10.000.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestTokoPayWithdrawal(nominal);
      if (res.error) {
        addToast({
          title: 'PENARIKAN GAGAL ❌',
          message: res.error,
          type: 'error',
        });
      } else {
        setResult({
          status: res.status,
          rc: res.rc,
          message:
            res.message ||
            'Penarikan berhasil diteruskan ke operator. Silahkan hubungi customer service.',
        });
        addToast({
          title: 'PENARIKAN DIAJUKAN! 🚀',
          message: 'Permintaan penarikan saldo berhasil dikirim ke TokoPay.',
          type: 'success',
        });
        onSuccess();
      }
    } catch (err: any) {
      addToast({
        title: 'PENARIKAN GAGAL',
        message: err.message || 'Gagal terhubung ke API penarikan TokoPay.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setResult(null);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={resetModal}
      title="TARIK SALDO (WITHDRAW) TOKOPAY"
      className="max-w-lg"
    >
      <div className="text-left font-sans space-y-4">
        {/* HASIL SUKSES TARIK SALDO */}
        {result ? (
          <div className="space-y-4">
            <div className="bg-[var(--nb-mint)] border-[4px] border-black p-5 shadow-[6px_6px_0px_0px_#000]">
              <div className="flex items-center gap-3 mb-3 border-b-[3px] border-black pb-2">
                <CheckCircle2 className="w-8 h-8 stroke-[3] text-black" />
                <div>
                  <h3 className="text-lg font-black uppercase text-black leading-none">
                    PENARIKAN BERHASIL DITERUSKAN!
                  </h3>
                  <span className="text-xs font-bold text-black/80">
                    STATUS: {result.status} | RC: {result.rc}
                  </span>
                </div>
              </div>

              <div className="bg-white border-[3px] border-black p-4 space-y-2">
                <span className="text-xs font-black uppercase text-neutral-500 block">
                  PESAN RESMI TOKOPAY:
                </span>
                <p className="text-sm font-black text-black leading-snug">
                  &ldquo;{result.message}&rdquo;
                </p>
              </div>

              <div className="mt-4 p-3 bg-[var(--nb-yellow)] border-[2px] border-black">
                <p className="text-xs font-bold text-black leading-tight">
                  *Sesuai dokumentasi resmi TokoPay, penarikan telah diteruskan ke operator untuk ditransfer ke rekening bank terdaftar Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="yellow"
                size="md"
                onClick={() => setResult(null)}
                className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
              >
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span>TARIK LAGI</span>
              </Button>
              <Button
                variant="white"
                size="md"
                onClick={resetModal}
                className="font-black uppercase"
              >
                TUTUP
              </Button>
            </div>
          </div>
        ) : (
          /* FORM REQUEST TARIK SALDO */
          <form onSubmit={handleWithdraw} className="space-y-4">
            {/* Banner Spesifikasi Dokumen */}
            <div className="bg-[var(--nb-yellow)] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 stroke-[3] text-black shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black uppercase text-xs text-black mb-1">
                    Spesifikasi API Tarik Saldo TokoPay
                  </h4>
                  <p className="text-[11px] font-bold text-black/90 leading-snug">
                    API Endpoint: <code>POST /v1/tarik-saldo</code> | Signature: <code>md5(merchant:secret:nominal)</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Saldo Tersedia */}
            <div className="bg-[var(--nb-purple)] text-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block opacity-90">
                  SALDO TOKOPAY TERKINI:
                </span>
                <span className="text-2xl font-black">
                  Rp {merchantBalance.toLocaleString('id-ID')}
                </span>
              </div>
              <Wallet className="w-8 h-8 stroke-[3]" />
            </div>

            {/* Input Nominal */}
            <div>
              <Input
                label="Nominal Penarikan (Rp)"
                type="number"
                min={10000}
                step={1000}
                value={nominal}
                onChange={(e) => setNominal(Number(e.target.value))}
                placeholder="Minimal Rp 10.000"
                required
              />
              <p className="text-[10px] font-bold text-neutral-500 mt-1">
                *Minimal penarikan Rp 10.000. Dana akan dicairkan ke rekening bank yang terdaftar di dasbor TokoPay Anda.
              </p>
            </div>

            {/* Tombol Cepat Nominal */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[50000, 100000, 250000, 500000, 1000000].map((val) => (
                <Button
                  key={val}
                  type="button"
                  variant="white"
                  size="sm"
                  onClick={() => setNominal(val)}
                  className="font-bold text-xs"
                >
                  Rp {val.toLocaleString('id-ID')}
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t-[3px] border-black">
              <Button
                type="button"
                variant="white"
                size="md"
                onClick={resetModal}
                disabled={isSubmitting}
              >
                BATAL
              </Button>
              <Button
                type="submit"
                variant="yellow"
                size="md"
                disabled={isSubmitting || nominal < 10000}
                className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
              >
                <Wallet className="w-4 h-4 stroke-[3]" />
                <span>{isSubmitting ? 'MENGIRIM PENARIKAN...' : 'TARIK SALDO SEKARANG 🚀'}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
};
