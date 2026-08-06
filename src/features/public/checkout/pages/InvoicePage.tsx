import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { format, differenceInSeconds } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Copy, ArrowLeft, Clock, CheckCircle, XCircle, ChevronRight, 
  AlertTriangle, Sparkles, Check, Calendar, MapPin, 
  ExternalLink, Receipt, Tag, ShieldAlert
} from 'lucide-react';

import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { checkoutApi } from '../services/checkout.api';
import type { PublicInvoiceResponse } from '../types/invoice.types';

export const InvoicePage: React.FC = () => {
  const { orderId } = useParams();
  const invoiceNumber = orderId || '';

  const [copied, setCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // --- Auto Polling React Query ---
  const { data: transaction, isLoading, isError, error, refetch } = useQuery<PublicInvoiceResponse>({
    queryKey: ['invoice', invoiceNumber],
    queryFn: async () => {
      const data = await checkoutApi.getTransaction(invoiceNumber);
      if (!data) throw new Error('Transaksi tidak ditemukan');
      return data;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 10000;

      const isTerminal =
        data.orderStatus === 'SUCCESS' ||
        data.orderStatus === 'FAILED' ||
        data.paymentStatus === 'EXPIRED' ||
        data.paymentStatus === 'FAILED' ||
        data.paymentStatus === 'REFUND';

      return isTerminal ? false : 10000;
    }
  });

  // --- Countdown Logic ---
  useEffect(() => {
    if (!transaction || transaction.paymentStatus !== 'UNPAID') {
      setTimeLeft(null);
      return;
    }

    const expiredDate = transaction.expiredAt
      ? new Date(transaction.expiredAt)
      : new Date(new Date(transaction.createdAt).getTime() + 24 * 60 * 60 * 1000);

    const calculateTimeLeft = () => {
      const secondsLeft = differenceInSeconds(expiredDate, new Date());
      if (secondsLeft <= 0) {
        setTimeLeft(0);
        refetch();
      } else {
        setTimeLeft(secondsLeft);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [transaction, refetch]);

  const handleCopy = (text: string, copyId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(copyId);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatFullDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMMM yyyy, HH:mm 'WIB'", { locale: id });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)] items-center justify-center">
        <span className="font-black text-xl uppercase animate-pulse">Memuat Invoice...</span>
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Card variant="purple" shadow="xl" className="max-w-md w-full p-6 text-center border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl">
            <h1 className="text-2xl font-black text-white mb-3 uppercase">Tidak Ditemukan</h1>
            <p className="text-sm font-bold text-gray-200 mb-6">
              Invoice {invoiceNumber} tidak valid atau belum terdaftar.
              {(error as any)?.message ? ` (${(error as any).message})` : ''}
            </p>
            <Link to="/">
              <Button variant="yellow" size="md" className="w-full font-black border-2 border-black">Kembali ke Beranda</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const payStatus = transaction.paymentStatus;
  const ordStatus = transaction.orderStatus;

  const isPaid = payStatus === 'PAID';
  const isExpired = payStatus === 'EXPIRED' || (payStatus === 'UNPAID' && timeLeft === 0);
  const isRefund = payStatus === 'REFUND';
  const isUnpaid = payStatus === 'UNPAID' && !isExpired;
  const isFailed = ordStatus === 'FAILED' || payStatus === 'FAILED' || isRefund;

  // Presisi Deteksi QRIS & Payment Link
  const isQris = transaction.paymentType === 'QRIS' || 
                 (transaction.paymentCode && transaction.paymentCode.toLowerCase().includes('qris')) ||
                 (transaction.paymentMethod && transaction.paymentMethod.toUpperCase().includes('QRIS'));

  const isHttpUrl = transaction.paymentUrl && (transaction.paymentUrl.startsWith('http://') || transaction.paymentUrl.startsWith('https://'));

  // 5-Step Progress Steps
  const steps = [
    { label: 'Dibuat', completed: true },
    { label: 'Bayar', completed: isPaid, active: isUnpaid, failed: isExpired || (isFailed && !isPaid) },
    { label: 'Lunas', completed: isPaid, active: false, failed: isRefund },
    { label: 'Diproses', completed: ordStatus === 'PROCESS' || ordStatus === 'SUCCESS', active: isPaid && ordStatus === 'PENDING' },
    { label: ordStatus === 'SUCCESS' ? 'Selesai' : isFailed ? 'Gagal' : 'Selesai', completed: ordStatus === 'SUCCESS', active: ordStatus === 'PROCESS', failed: isFailed }
  ];

  const expiredDateFormatted = transaction.expiredAt
    ? formatFullDate(transaction.expiredAt)
    : formatFullDate(new Date(new Date(transaction.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString());

  const dateShort = format(new Date(transaction.createdAt), "MMM dd, yyyy").toUpperCase();
  const timeShort = format(new Date(transaction.createdAt), "hh:mm a").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-5">

        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="outline" size="sm" className="border-2 border-black shadow-[2px_2px_0px_0px_#000] font-bold text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Badge variant="yellow" size="sm" className="border border-black/20 font-bold text-xs">
            <Sparkles className="w-3 h-3 mr-1 text-black" />
            Bantuan CS 24/7
          </Badge>
        </div>

        {/* ========================================================================= */}
        {/* BLOK 1: SLEEK BORDERLESS TIMELINE INDICATOR                               */}
        {/* ========================================================================= */}
        <div className="w-full px-2 py-2">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-gray-300 dark:bg-gray-700 -z-0" />
            {steps.map((st, idx) => (
              <div key={idx} className="flex flex-col items-center z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${st.completed
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                      : st.failed
                        ? 'bg-red-500 text-white'
                        : st.active
                          ? 'bg-[var(--nb-yellow)] text-black ring-4 ring-yellow-200 dark:ring-yellow-900 animate-pulse'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {st.completed ? <Check className="w-4 h-4 stroke-[3]" /> : st.failed ? <XCircle className="w-4 h-4 stroke-[3]" /> : idx + 1}
                </div>
                <span className={`text-[11px] font-bold mt-1.5 ${st.completed ? 'text-black font-black' : st.failed ? 'text-red-600' : st.active ? 'text-black font-black underline' : 'text-gray-400'
                  }`}>
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BLOK 2: AREA STATUS DINAMIS                                               */}
        {/* ========================================================================= */}
        <Card
          variant={ordStatus === 'SUCCESS' ? 'mint' : ordStatus === 'PROCESS' ? 'cyan' : isRefund ? 'purple' : isFailed ? 'purple' : isExpired ? 'cream' : 'yellow'}
          className="p-0 border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl relative overflow-hidden"
        >
          {isUnpaid && (
            <div className="flex flex-col">
              {/* Header row */}
              <div className="flex items-center gap-3.5 p-4 sm:p-5 pb-3 sm:pb-4">
                <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <Clock className="w-5 h-5 text-black stroke-[3] animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-lg font-black uppercase tracking-tight text-black m-0 leading-tight truncate">
                    Menunggu Pembayaran
                  </h1>
                  <p className="text-xs font-semibold text-black/80 mt-0.5 m-0">
                    Bayar sebelum: <span className="font-bold">{expiredDateFormatted}</span>
                  </p>
                </div>
              </div>

              {/* Action panel — QRIS / Payment Link / Countdown / Copy Nominal */}
              <div className="border-t-4 border-black bg-white p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* QRIS Renderer */}
                  {isQris && transaction.paymentUrl && !isHttpUrl && (
                    <div className="flex flex-col items-center gap-2 bg-white p-3 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] shrink-0">
                      <QRCodeSVG value={transaction.paymentUrl} size={140} level="M" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-black">Scan QRIS</span>
                    </div>
                  )}

                  {/* HTTP Payment Link CTA */}
                  {isHttpUrl && (
                    <a
                      href={transaction.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#FDE047] hover:bg-yellow-300 text-black border-2 border-black rounded-xl px-5 py-3 font-black text-sm uppercase shadow-[3px_3px_0px_0px_#000] transition-transform active:translate-y-0.5 shrink-0"
                    >
                      <ExternalLink className="w-4 h-4 stroke-[3]" />
                      <span>Buka Pembayaran</span>
                    </a>
                  )}

                  {/* Countdown Box */}
                  {timeLeft !== null && (
                    <div className="bg-white px-5 py-2.5 border-2 border-black rounded-xl text-center flex flex-col items-center justify-center gap-0.5 shadow-[3px_3px_0px_0px_#000] shrink-0">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500">Sisa Waktu Pembayaran</span>
                      <span className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-red-600 whitespace-nowrap">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  )}

                  {/* Salin Nominal CTA */}
                  <Button
                    variant="white"
                    size="sm"
                    onClick={() => handleCopy(transaction.amount.toString(), 'topAmount')}
                    className="font-black border-2 border-black text-xs px-4 py-2.5 shadow-[3px_3px_0px_0px_#000] shrink-0 h-auto"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
                    {copied === 'topAmount' ? 'Tersalin!' : 'Salin Nominal'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(ordStatus === 'PROCESS' || (isPaid && ordStatus === 'PENDING')) && (
            <div className="flex items-center gap-4 p-4 sm:p-5">
              <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                <Clock className="w-6 h-6 text-amber-600 stroke-[3] animate-spin" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                  PEMBAYARAN DITERIMA
                </h1>
                <p className="text-xs font-bold text-black/80 mt-0.5 m-0">
                  Provider sedang memproses pesanan Anda. Biasanya selesai dalam &lt; 1 menit.
                </p>
              </div>
            </div>
          )}

          {ordStatus === 'SUCCESS' && (
            <div className="flex items-center gap-4 p-4 sm:p-5">
              <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                <CheckCircle className="w-7 h-7 text-emerald-600 stroke-[3] animate-bounce" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                  TOPUP BERHASIL! 🎉
                </h1>
                <p className="text-xs font-bold text-black/80 mt-0.5 m-0">
                  Produk / Item sudah berhasil dikirim ke akun Anda. Terima kasih atas kepercayaan Anda!
                </p>
              </div>
            </div>
          )}

          {isRefund && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left p-4 sm:p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <ShieldAlert className="w-6 h-6 text-purple-600 stroke-[3]" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                    SALDO DIKEMBALIKAN (REFUND)
                  </h1>
                  <p className="text-xs font-semibold text-black/80 mt-0.5 m-0">
                    Transaksi ini tidak dapat diproses oleh supplier. Saldo akun telah dikembalikan secara otomatis.
                  </p>
                </div>
              </div>
              <Link to="/" className="shrink-0">
                <Button variant="yellow" size="sm" className="font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  Buat Pesanan Baru
                </Button>
              </Link>
            </div>
          )}

          {(isFailed && !isRefund) || isExpired ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left p-4 sm:p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <AlertTriangle className="w-6 h-6 text-red-600 stroke-[3]" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                    {isExpired ? 'PEMBAYARAN KEDALUWARSA' : 'TRANSAKSI GAGAL'}
                  </h1>
                  <p className="text-xs font-semibold text-black/80 mt-0.5 m-0">
                    {isExpired ? 'Batas waktu pembayaran telah habis. Silakan buat pesanan baru.' : 'Transaksi ini dibatalkan atau gagal diproses.'}
                  </p>
                </div>
              </div>
              <Link to="/" className="shrink-0">
                <Button variant="yellow" size="sm" className="font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  Buat Pesanan Baru
                </Button>
              </Link>
            </div>
          ) : null}
        </Card>

        {/* ========================================================================= */}
        {/* BLOK 3: POP-ART TICKET STUB + PRICE BREAKDOWN                             */}
        {/* ========================================================================= */}
        <div className="w-full relative">
          <div className="bg-[#FAF5E9] text-black border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-[24px] sm:rounded-[28px] overflow-hidden relative">
            <div className="grid grid-cols-1 md:grid-cols-12 relative">

              {/* LEFT SECTION (col 1-7): Item & Account Details */}
              <div className="md:col-start-1 md:col-span-7 p-5 sm:p-7 flex flex-col justify-between gap-5 relative min-h-[300px]">
                
                {/* Top Row Badges */}
                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#FFB7D5] border-2 border-black rounded-xl px-2.5 py-0.5 flex items-center gap-1.5 font-black text-[11px] uppercase shadow-[2px_2px_0px_0px_#000]">
                      <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : isUnpaid ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                      <span>{isPaid ? 'PAID' : isUnpaid ? 'UNPAID' : payStatus}</span>
                    </div>
                    <Sparkles className="w-5 h-5 text-[#0284C7] fill-[#38BDF8] stroke-black stroke-[2]" />
                  </div>

                  <div className="flex items-center gap-1.5 bg-white border-2 border-black px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_0px_#000]">
                    <Receipt className="w-3.5 h-3.5 text-black" />
                    <span className="font-mono font-black text-xs text-black">{transaction.invoiceId}</span>
                    <button
                      onClick={() => handleCopy(transaction.invoiceId, 'invoiceId')}
                      className="ml-1 text-gray-600 hover:text-black focus:outline-none"
                      title="Salin No. Invoice"
                    >
                      {copied === 'invoiceId' ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Game & Product Headline */}
                <div className="my-1 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-[#FFB7D5] border-2 border-black flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_#000]">
                      ⚡
                    </div>
                    <span className="font-black text-sm sm:text-base uppercase tracking-wider text-black">
                      {transaction.game.name}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black leading-tight m-0 break-words">
                    {transaction.product.cleanName || transaction.product.name}
                  </h1>

                  <div className="w-20 sm:w-28 h-2 bg-[#FFB7D5] border-2 border-black rounded-full mt-2 shadow-[2px_2px_0px_0px_#000]" />
                </div>

                {/* Target Account Breakdown Box */}
                <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_#000] relative z-10 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                    <span className="font-bold text-gray-500 uppercase text-[10px]">User ID / Account:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-black text-black">{transaction.targetAccount}</span>
                      <button onClick={() => handleCopy(transaction.targetAccount, 'accId')} className="text-gray-500 hover:text-black">
                        {copied === 'accId' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  
                  {transaction.targetZone && (
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                      <span className="font-bold text-gray-500 uppercase text-[10px]">Zone / Server ID:</span>
                      <span className="font-mono font-bold text-black">{transaction.targetZone}</span>
                    </div>
                  )}

                  {transaction.nickname && (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-500 uppercase text-[10px]">Nickname Game:</span>
                      <span className="font-extrabold text-emerald-700">{transaction.nickname}</span>
                    </div>
                  )}
                </div>

                {/* Serial Number Section (If Success & SN Available) */}
                {ordStatus === 'SUCCESS' && transaction.sn && (
                  <div className="bg-[#A7F3D0] border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_#000] relative z-10 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-[10px] uppercase text-emerald-900 block leading-none">Serial Number (SN):</span>
                      <span className="font-mono font-black text-xs text-black tracking-wide mt-1 block">{transaction.sn}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(transaction.sn!, 'sn')}
                      className="bg-white border-2 border-black rounded-lg px-2.5 py-1 text-xs font-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1"
                    >
                      {copied === 'sn' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied === 'sn' ? 'Tersalin' : 'Salin SN'}</span>
                    </button>
                  </div>
                )}

              </div>

              {/* NOTCH CUTOUTS + DASHED DIVIDER */}
              <div className="hidden md:block absolute top-0 bottom-0 left-[58.333%] -translate-x-1/2 z-20 pointer-events-none">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-white dark:bg-[#121214] border-4 border-black z-30" />
                <div className="absolute top-0 bottom-0 left-0 border-r-3 border-dashed border-black" />
                <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-white dark:bg-[#121214] border-4 border-black z-30" />
              </div>

              <div className="md:hidden col-span-1 border-b-3 border-dashed border-black" />

              {/* RIGHT SECTION (STUB) (col 8-12): Price Breakdown & Date */}
              <div className="md:col-start-8 md:col-span-5 p-5 sm:p-7 flex flex-col justify-between gap-4 bg-[#FAF5E9] relative z-10">

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3 border-b border-black/15 pb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#BBF7D0] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                      <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-black text-xs uppercase block leading-tight text-black">{dateShort} • {timeShort}</span>
                      <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">TANGGAL & WAKTU</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b border-black/15 pb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#FEF08A] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                      <MapPin className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-black text-xs uppercase block leading-tight text-black">{transaction.paymentMethod}</span>
                      <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">METODE BAYAR</span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Table */}
                <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_#000] space-y-1.5 text-xs">
                  <span className="font-black text-[10px] uppercase text-gray-500 block border-b border-gray-200 pb-1">Rincian Pembayaran</span>
                  
                  <div className="flex justify-between font-medium text-gray-700">
                    <span>Harga Produk:</span>
                    <span className="font-mono font-bold">{formatRupiah(transaction.basePrice)}</span>
                  </div>

                  {transaction.discountAmount > 0 && (
                    <div className="flex justify-between font-medium text-emerald-700">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Diskon {transaction.voucherCode ? `(${transaction.voucherCode})` : ''}:
                      </span>
                      <span className="font-mono font-bold">- {formatRupiah(transaction.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-medium text-gray-700">
                    <span>Biaya Admin:</span>
                    <span className="font-mono font-bold">{formatRupiah(transaction.feeAmount)}</span>
                  </div>

                  <div className="border-t-2 border-black pt-1.5 flex justify-between items-center">
                    <span className="font-black uppercase text-xs text-black">Total Bayar:</span>
                    <span className="font-mono font-black text-sm text-black">{formatRupiah(transaction.amount)}</span>
                  </div>
                </div>

                {/* Bottom Copy CTA */}
                <button
                  type="button"
                  onClick={() => handleCopy(transaction.amount.toString(), 'ticketCta')}
                  className="w-full bg-[#FFB7D5] hover:bg-pink-300 text-black border-2 border-black rounded-2xl py-2.5 px-3 font-black uppercase text-xs flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <span>{copied === 'ticketCta' ? 'NOMINAL TERSALIN!' : 'SALIN NOMINAL TEPAT'}</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>

              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};
