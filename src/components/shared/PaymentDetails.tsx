import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, AlertCircle, CreditCard, Building2, HelpCircle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';

export interface PaymentDetailsProps {
  methodName: string;
  gatewayCode?: string | null;
  paymentType?: string | null;
  totalAmount: number;
  uniqueCode?: number | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  qrString?: string | null;
  qrImageUrl?: string | null;
  checkoutUrl?: string | null;
  paymentUrl?: string | null;
  instructions?: string | null;
  timeLeft?: number | null;
  className?: string;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  methodName,
  gatewayCode,
  paymentType,
  totalAmount,
  uniqueCode,
  bankName,
  accountNumber,
  accountHolder,
  qrString,
  qrImageUrl,
  checkoutUrl,
  paymentUrl,
  instructions,
  timeLeft,
  className = '',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Strict Manual Guard (gatewayCode canonical check)
  const isManual = gatewayCode?.toLowerCase() === 'manual';
  const hasQrData = Boolean(qrString || qrImageUrl);
  const isQrisCategory = paymentType?.toUpperCase() === 'QRIS' || hasQrData;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const rawUrl = (checkoutUrl || paymentUrl || '').trim();
  const isExternalHttp = Boolean(rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')));

  // Format default instructions if empty for QRIS
  const defaultQrisGuide = `1. Screenshot / Simpan kode QR yang tampil
2. Buka aplikasi e-wallet atau mobile banking (DANA, GoPay, OVO, ShopeePay, BCA Mobile, Livin Mandiri, dll)
3. Pilih menu "Bayar" atau "Scan QRIS"
4. Scan langsung kode QR atau pilih dari galeri gambar
5. Pastikan detail penerima dan nominal pembayaran sudah sesuai
6. Masukkan PIN dan selesaikan pembayaran
7. Transaksi selesai dan status otomatis terverifikasi`;

  const displayInstructions = instructions && instructions.trim().length > 0 ? instructions : (isQrisCategory ? defaultQrisGuide : null);

  return (
    <div className={`space-y-3 font-sans text-left ${className}`}>
      {/* HEADER METODE PEMBAYARAN (1 Tombol Panduan Resmi) */}
      <div className="bg-neutral-900 text-white p-3.5 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between">
        <div>
          <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-0.5">METODE PEMBAYARAN</span>
          <div className="font-black text-sm uppercase text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[var(--nb-yellow)]" />
            <span>{methodName}</span>
          </div>
        </div>
        {displayInstructions && (
          <Button
            type="button"
            variant="yellow"
            size="sm"
            onClick={() => setIsGuideOpen(true)}
            className="py-1 px-2.5 text-[10px] font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
          >
            <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Panduan</span>
          </Button>
        )}
      </div>

      {/* NOTIFIKASI KODE UNIK (JIKA ADA) */}
      {Boolean(uniqueCode && uniqueCode > 0) && (
        <div className="p-3 bg-purple-50 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-purple-700 shrink-0 stroke-[2.5] mt-0.5" />
          <div className="text-xs font-bold text-purple-950 space-y-0.5">
            <div className="font-black uppercase text-purple-900">PERHATIAN KODE UNIK!</div>
            <p>
              Nominal harus ditransfer tepat sampai 3 digit terakhir (<b>Rp {totalAmount.toLocaleString('id-ID')}</b>) agar sistem dapat memverifikasi otomatis.
            </p>
          </div>
        </div>
      )}

      {/* 1. AREA BAYAR QRIS DENGAN COUNTDOWN LANGSUNG DI BAWAH QR */}
      {hasQrData && (
        <div className="p-4 bg-yellow-50 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] text-center space-y-3">
          <div className="bg-white p-3 border-[3px] border-black inline-block shadow-[4px_4px_0px_0px_#000]">
            {qrString ? (
              <QRCodeSVG value={qrString} size={190} level="M" includeMargin={true} />
            ) : (
              <img src={qrImageUrl!} alt="QRIS Payment" className="w-44 h-44 object-contain" />
            )}
          </div>

          {/* COUNTDOWN SISA WAKTU TEPAT DI BAWAH QRIS */}
          {timeLeft !== undefined && timeLeft !== null && (
            <div className="w-full bg-red-50 border-2 border-black rounded-xl p-2.5 shadow-[2px_2px_0px_0px_#000] flex items-center justify-between text-left">
              <div className="flex items-center gap-1.5 text-black">
                <Clock className="w-4 h-4 text-red-600 stroke-[2.5] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider">Sisa Waktu Pembayaran</span>
              </div>
              <span className="text-base sm:text-lg font-black tabular-nums tracking-tight text-red-600 font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 2. AREA BAYAR REKENING MANUAL / VA DENGAN COUNTDOWN */}
      {isManual && !isQrisCategory && (bankName || accountNumber || accountHolder) && (
        <div className="p-4 bg-yellow-50 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
          <div className="font-black uppercase text-xs text-black flex items-center gap-2 border-b-2 border-black pb-2">
            <Building2 className="w-4 h-4 text-yellow-700 stroke-[2.5]" />
            <span>TRANSFER KE REKENING BERIKUT</span>
          </div>

          <div className="bg-white p-3 border-2 border-black space-y-2 text-xs font-mono">
            {bankName && (
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-bold uppercase font-sans">Bank / Provider:</span>
                <span className="font-black text-black text-sm">{bankName}</span>
              </div>
            )}

            {accountNumber && (
              <div className="flex justify-between items-center border-t border-neutral-200 pt-2">
                <span className="text-neutral-500 font-bold uppercase font-sans">No. Rekening / VA:</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-blue-900">{accountNumber}</span>
                  <Button
                    type="button"
                    variant="yellow"
                    size="sm"
                    onClick={() => copyToClipboard(accountNumber, 'accountNumber')}
                    className="py-1 px-2 text-[10px] font-black"
                  >
                    {copiedField === 'accountNumber' ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'accountNumber' ? 'COPIED' : 'SALIN'}</span>
                  </Button>
                </div>
              </div>
            )}

            {accountHolder && (
              <div className="flex justify-between items-center border-t border-neutral-200 pt-2">
                <span className="text-neutral-500 font-bold uppercase font-sans">Atas Nama (a.n):</span>
                <span className="font-black text-black">{accountHolder}</span>
              </div>
            )}
          </div>

          {/* COUNTDOWN SISA WAKTU TEPAT DI BAWAH REKENING */}
          {timeLeft !== undefined && timeLeft !== null && (
            <div className="w-full bg-red-50 border-2 border-black rounded-xl p-2.5 shadow-[2px_2px_0px_0px_#000] flex items-center justify-between text-left">
              <div className="flex items-center gap-1.5 text-black">
                <Clock className="w-4 h-4 text-red-600 stroke-[2.5] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider">Sisa Waktu Pembayaran</span>
              </div>
              <span className="text-base sm:text-lg font-black tabular-nums tracking-tight text-red-600 font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. AREA BAYAR REDIRECT GATEWAY DENGAN COUNTDOWN */}
      {!hasQrData && (!isManual || isQrisCategory) && isExternalHttp && (
        <div className="p-4 bg-cyan-50 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] text-center space-y-3">
          <span className="text-xs font-black uppercase text-black block">HALAMAN PEMBAYARAN GATEWAY ONLINE</span>
          <a
            href={rawUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-[var(--nb-yellow)] hover:bg-yellow-400 text-black border-[3px] border-black font-black px-6 py-3 text-sm shadow-[4px_4px_0px_0px_#000] transition-transform active:translate-y-0.5"
          >
            BUKA HALAMAN PEMBAYARAN <ExternalLink className="w-4 h-4 stroke-[3]" />
          </a>

          {/* COUNTDOWN SISA WAKTU */}
          {timeLeft !== undefined && timeLeft !== null && (
            <div className="w-full bg-red-50 border-2 border-black rounded-xl p-2.5 shadow-[2px_2px_0px_0px_#000] flex items-center justify-between text-left">
              <div className="flex items-center gap-1.5 text-black">
                <Clock className="w-4 h-4 text-red-600 stroke-[2.5] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider">Sisa Waktu Pembayaran</span>
              </div>
              <span className="text-base sm:text-lg font-black tabular-nums tracking-tight text-red-600 font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 4. MODAL POP-UP PANDUAN PEMBAYARAN */}
      <Dialog
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title={`PANDUAN BAYAR: ${methodName}`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-100 border-2 border-black p-3 rounded-lg text-xs font-bold text-black flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5 stroke-[2.5]" />
            <p>Ikuti langkah-langkah di bawah ini untuk menyelesaikan pembayaran pesanan Anda.</p>
          </div>

          <div className="bg-white border-2 border-black p-4 rounded-lg shadow-[3px_3px_0px_0px_#000]">
            <div className="text-xs font-bold whitespace-pre-line text-neutral-800 leading-relaxed font-sans space-y-1">
              {displayInstructions}
            </div>
          </div>

          <Button
            type="button"
            variant="yellow"
            size="md"
            onClick={() => setIsGuideOpen(false)}
            className="w-full font-black uppercase text-xs"
          >
            Mengerti & Tutup
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
