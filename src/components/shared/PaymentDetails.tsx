import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, AlertCircle, QrCode, CreditCard, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';

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
  className = '',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isManual = gatewayCode?.toLowerCase() === 'manual' || (!gatewayCode && (bankName || qrString));
  const isQrisCategory = paymentType?.toUpperCase() === 'QRIS' || Boolean(qrString || qrImageUrl);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const rawUrl = checkoutUrl || paymentUrl;
  const isExternalHttp = rawUrl?.startsWith('http');

  return (
    <div className={`space-y-4 font-sans text-left ${className}`}>
      {/* HEADER RINGKASAN PEMBAYARAN */}
      <div className="bg-neutral-900 text-white p-4 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-neutral-400 block mb-0.5">METODE PEMBAYARAN</span>
          <div className="font-black text-sm uppercase text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[var(--nb-yellow)]" />
            <span>{methodName}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase text-neutral-400 block mb-0.5">TOTAL BAYAR</span>
          <div className="font-black font-mono text-base text-[var(--nb-yellow)]">
            Rp {totalAmount.toLocaleString('id-ID')}
          </div>
        </div>
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

      {/* 1. MANUAL QRIS — RENDER QR CODE SVG FROM QR STRING */}
      {isManual && isQrisCategory && (qrString || qrImageUrl) && (
        <div className="p-5 bg-yellow-50 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#FFD700]">
            <QrCode className="w-4 h-4 text-[var(--nb-yellow)]" />
            <span>SCAN QRIS UNTUK MEMBAYAR</span>
          </div>

          <div className="bg-white p-4 border-[3px] border-black inline-block shadow-[4px_4px_0px_0px_#000]">
            {qrString ? (
              <QRCodeSVG value={qrString} size={200} level="M" includeMargin={true} />
            ) : (
              <img src={qrImageUrl!} alt="QRIS Payment" className="w-48 h-48 object-contain" />
            )}
          </div>

          <p className="text-xs font-bold text-neutral-800">
            Scan QRIS menggunakan aplikasi pembayaran Anda (GoPay, OVO, ShopeePay, DANA, BCA Mobile, dll).
          </p>
        </div>
      )}

      {/* 2. MANUAL BANK TRANSFER / E-WALLET / VA — DETAIL REKENING & ATAS NAMA */}
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
                <span className="text-neutral-500 font-bold uppercase font-sans">No. Rekening / HP:</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-blue-900">{accountNumber}</span>
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
        </div>
      )}

      {/* 3. TOKOPAY GATEWAY RESPONSE — EXTERNAL LINK / VA DISPLAY */}
      {!isManual && isExternalHttp && (
        <div className="p-4 bg-cyan-50 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] text-center space-y-3">
          <span className="text-xs font-black uppercase text-black block">HALAMAN PEMBAYARAN GATEWAY ONLINE</span>
          <a
            href={rawUrl || undefined}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-[var(--nb-yellow)] hover:bg-yellow-400 text-black border-[3px] border-black font-black px-6 py-3 text-sm shadow-[4px_4px_0px_0px_#000] transition-transform active:translate-y-0.5"
          >
            BUKA HALAMAN PEMBAYARAN <ExternalLink className="w-4 h-4 stroke-[3]" />
          </a>
        </div>
      )}

      {/* 4. INSTRUKSI TAMBAHAN (CATATAN KHUSUS) */}
      {instructions && (
        <div className="p-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] space-y-2">
          <div className="font-black uppercase text-xs text-black flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-blue-600 stroke-[2.5]" />
            <span>INSTRUKSI TAMBAHAN</span>
          </div>
          <div className="text-xs font-bold whitespace-pre-line text-neutral-800 bg-neutral-50 p-3 border-2 border-black font-mono">
            {instructions}
          </div>
        </div>
      )}
    </div>
  );
};
