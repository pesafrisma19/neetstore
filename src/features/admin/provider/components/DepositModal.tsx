import React, { useState } from 'react';
import { Dialog } from '../../../../components/ui/Dialog';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { useToast } from '../../../../components/ui/ToastContext';
import { requestDigiflazzDeposit } from '../../../../utils/api';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DepositTicket {
  rc: string;
  bank: string;
  payment_method: string;
  account_no: string;
  notes: string;
  amount: number;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [amount, setAmount] = useState<number>(100000);
  const [bank, setBank] = useState<string>('BCA');
  const [ownerName, setOwnerName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [ticket, setTicket] = useState<DepositTicket | null>(null);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 10000) {
      addToast({ title: 'NOMINAL KURANG', message: 'Minimal deposit adalah Rp 10.000', type: 'error' });
      return;
    }
    if (!ownerName.trim()) {
      addToast({ title: 'NAMA WAJIB DIISI', message: 'Masukkan nama pemilik rekening pengirim', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestDigiflazzDeposit({
        amount: Number(amount),
        bank,
        owner_name: ownerName.trim(),
      });

      if ((res as any)?.error) {
        addToast({
          title: 'GAGAL BUAT TIKET',
          message: (res as any).error || 'Periksa kembali kredensial dan jaringan Anda.',
          type: 'error',
        });
      } else if ((res as any)?.data) {
        setTicket((res as any).data);
        addToast({
          title: 'TIKET DEPOSIT DIBUAT',
          message: `Berhasil mendapatkan tiket transfer bank ${bank}.`,
          type: 'success',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'GAGAL BUAT TIKET',
        message: err.message || 'Terjadi kesalahan saat memanggil API deposit Digiflazz.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      title: 'DISALIN',
      message: `${label} berhasil disalin ke clipboard!`,
      type: 'success',
    });
  };

  const handleResetAndClose = () => {
    setTicket(null);
    onSuccess();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="REQUEST TIKET DEPOSIT DIGIFLAZZ"
      className="max-w-lg"
    >
      <div className="text-left font-sans space-y-5">
        {!ticket ? (
          /* STEP 1: Form Input Request Tiket Deposit */
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="bg-[var(--nb-mint)] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
              <h4 className="font-black uppercase text-sm mb-1 text-black">
                Top-up Saldo Otomatis API Digiflazz
              </h4>
              <p className="text-xs font-bold text-black/90 leading-relaxed">
                Sistem akan membuat tiket transfer resmi ke server Digiflazz. Pastikan Anda mentransfer tepat hingga angka unik.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[var(--nb-text)] mb-1">
                Pilih Bank Tujuan Transfer
              </label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full bg-white border-[3px] border-black px-3 py-2 text-sm font-black uppercase shadow-[3px_3px_0px_0px_#000] focus:outline-none"
              >
                <option value="BCA">BANK BCA</option>
                <option value="MANDIRI">BANK MANDIRI</option>
                <option value="BRI">BANK BRI</option>
                <option value="BNI">BANK BNI</option>
              </select>
            </div>

            <div>
              <Input
                label="Nominal Deposit (Rp)"
                type="number"
                min={10000}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Contoh: 500000"
                required
              />
              <p className="text-[10px] font-bold text-neutral-500 mt-1">
                *Minimal Rp 10.000. Server akan menambahkan angka unik (contoh: Rp 500.001).
              </p>
            </div>

            <div>
              <Input
                label="Nama Pemilik Rekening Pengirim"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t-[3px] border-black">
              <Button type="button" variant="white" size="md" onClick={onClose} disabled={isSubmitting}>
                BATAL
              </Button>
              <Button type="submit" variant="purple" size="md" disabled={isSubmitting}>
                <span>{isSubmitting ? 'MEMBUAT TIKET...' : 'BUAT TIKET DEPOSIT'}</span>
              </Button>
            </div>
          </form>
        ) : (
          /* STEP 2: Tiket Deposit Hasil API Digiflazz */
          <div className="space-y-4">
            <div className="bg-[var(--nb-yellow)] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
              <h4 className="font-black uppercase text-sm text-black">
                TIKET DEPOSIT DIGIFLAZZ RESMI (RC: {ticket.rc})
              </h4>
              <p className="text-xs font-bold text-black/90 mt-1">
                Transfer persis nominal di bawah agar otomatis masuk ke saldo Digiflazz Anda.
              </p>
            </div>

            <div className="bg-white border-[3px] border-black p-5 space-y-4 shadow-[6px_6px_0px_0px_#000]">
              {/* Bank Tujuan */}
              <div className="flex items-center justify-between border-b-2 border-dashed border-neutral-300 pb-3">
                <span className="text-xs font-black uppercase text-neutral-500">Bank Tujuan</span>
                <span className="text-base font-black uppercase text-black">
                  {ticket.bank} ({ticket.payment_method})
                </span>
              </div>

              {/* Nomor Rekening / VA */}
              <div className="flex items-center justify-between border-b-2 border-dashed border-neutral-300 pb-3">
                <div>
                  <span className="text-xs font-black uppercase text-neutral-500 block">Nomor Rekening / VA</span>
                  <span className="text-xl font-black text-[var(--nb-purple)] tracking-tight">
                    {ticket.account_no}
                  </span>
                </div>
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => handleCopy(ticket.account_no, 'Nomor Rekening')}
                  className="font-black uppercase text-xs"
                >
                  <span>SALIN</span>
                </Button>
              </div>

              {/* Nominal Wajib Transfer (Angka Unik) */}
              <div className="flex items-center justify-between border-b-2 border-dashed border-neutral-300 pb-3">
                <div>
                  <span className="text-xs font-black uppercase text-neutral-500 block">Nominal Wajib Transfer</span>
                  <span className="text-2xl font-black text-[var(--nb-pink)]">
                    Rp {ticket.amount.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500 block">
                    *(Wajib transfer persis termasuk angka unik di belakang)
                  </span>
                </div>
                <Button
                  variant="mint"
                  size="sm"
                  onClick={() => handleCopy(String(ticket.amount), 'Nominal Transfer')}
                  className="font-black uppercase text-xs"
                >
                  <span>SALIN</span>
                </Button>
              </div>

              {/* Berita Transfer */}
              {ticket.notes && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-neutral-500 block">Berita / Catatan Transfer</span>
                    <span className="text-lg font-black text-black">
                      {ticket.notes}
                    </span>
                  </div>
                  <Button
                    variant="yellow"
                    size="sm"
                    onClick={() => handleCopy(ticket.notes, 'Berita Transfer')}
                    className="font-black uppercase text-xs"
                  >
                    <span>SALIN</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="white"
                size="sm"
                onClick={() => setTicket(null)}
                className="font-black uppercase text-xs"
              >
                <span>BUAT TIKET LAIN</span>
              </Button>

              <Button
                type="button"
                variant="purple"
                size="md"
                onClick={handleResetAndClose}
                className="font-black uppercase text-xs"
              >
                <span>SELESAI & REFRESH</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
