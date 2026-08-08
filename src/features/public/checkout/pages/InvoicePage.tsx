import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInSeconds } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Copy, ArrowLeft, Clock, CheckCircle, XCircle,
  AlertTriangle, Sparkles, Check, Calendar, CreditCard,
  Receipt, Tag, ShieldAlert, Zap, Star
} from 'lucide-react';

import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { checkoutApi } from '../services/checkout.api';
import type { PublicInvoiceResponse } from '../types/invoice.types';
import { PaymentDetails } from '../../../../components/shared/PaymentDetails';

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
      return format(new Date(dateStr), "dd MMMM yyyy", { locale: id });
    } catch {
      return dateStr;
    }
  };

  const formatFullTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "HH:mm 'WIB'", { locale: id });
    } catch {
      return '';
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
  const isProcessing = ordStatus === 'PROCESS' || (isPaid && ordStatus === 'PENDING');
  const isSuccess = ordStatus === 'SUCCESS';

  // 5-Step Progress Steps
  const steps = [
    { label: 'Dibuat', completed: true },
    { label: 'Bayar', completed: isPaid, active: isUnpaid, failed: isExpired || (isFailed && !isPaid) },
    { label: 'Lunas', completed: isPaid, active: false, failed: isRefund },
    { label: 'Diproses', completed: ordStatus === 'PROCESS' || ordStatus === 'SUCCESS', active: isPaid && ordStatus === 'PENDING' },
    { label: isSuccess ? 'Selesai' : isFailed ? 'Gagal' : 'Selesai', completed: isSuccess, active: ordStatus === 'PROCESS', failed: isFailed }
  ];

  const expiredDateFormatted = transaction.expiredAt
    ? formatFullDate(transaction.expiredAt)
    : formatFullDate(new Date(new Date(transaction.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString());

  const expiredTimeFormatted = transaction.expiredAt
    ? formatFullTime(transaction.expiredAt)
    : formatFullTime(new Date(new Date(transaction.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString());

  const dateShort = formatFullDate(transaction.createdAt);
  const timeShort = formatFullTime(transaction.createdAt);

  // Warna aksen banner status utama
  const bannerBg = isSuccess ? 'bg-[#BBF7D2]'
    : isProcessing ? 'bg-[#BAE6FD]'
      : isRefund || (isFailed && !isRefund) ? 'bg-[#E9D5FF]'
        : isExpired ? 'bg-[#FED7AA]'
          : 'bg-[var(--nb-yellow)]';

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
        {/* BLOK 1: TIMELINE                                                           */}
        {/* ========================================================================= */}
        <div className="w-full px-2 py-2">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            <div className="absolute top-3.5 left-6 right-6 h-0.5 border-t-2 border-dashed border-gray-300 -z-0" />
            {steps.map((st, idx) => (
              <div key={idx} className="flex flex-col items-center z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${st.completed
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                    : st.failed
                      ? 'bg-red-500 text-white'
                      : st.active
                        ? 'bg-[var(--nb-yellow)] text-black ring-4 ring-yellow-200 animate-pulse'
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
        {/* BLOK 2: STATUS BANNER (dengan dekorasi bintang & petir)                    */}
        {/* ========================================================================= */}
        <div className="relative">
          {/* dekorasi: petir kiri atas */}
          <div className="hidden sm:block absolute -top-7 -left-9 -rotate-[18deg] pointer-events-none select-none">
            <Zap className="w-10 h-10 text-[var(--nb-yellow)] fill-[var(--nb-yellow)] stroke-black stroke-[1.5]" />
          </div>
          {/* dekorasi: bintang kecil */}
          <div className="hidden sm:block absolute -top-4 left-16 pointer-events-none select-none">
            <Star className="w-3.5 h-3.5 fill-black text-black" />
          </div>
          {/* dekorasi: bintang besar kanan */}
          <div className="hidden sm:block absolute -top-6 -right-8 pointer-events-none select-none">
            <Star className="w-9 h-9 fill-[var(--nb-yellow)] text-black stroke-[1.5]" />
          </div>
          {/* dekorasi: tanda seru saat urgent */}
          {isUnpaid && (
            <div className="hidden sm:flex absolute top-3 right-[9.5rem] gap-0.5 -rotate-6 pointer-events-none select-none">
              <span className="text-lg font-black text-black/70">!</span>
              <span className="text-lg font-black text-black/70 -translate-y-1">!</span>
              <span className="text-lg font-black text-black/70">!</span>
            </div>
          )}

          <div className={`${bannerBg} border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl overflow-hidden relative`}>
            {isUnpaid && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                    <Clock className="w-5 h-5 text-black stroke-[3] animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-black m-0 leading-tight truncate">
                      Menunggu Pembayaran
                    </h1>
                    <p className="text-xs font-semibold text-black/70 mt-0.5 m-0">
                      Selesaikan pembayaran sebelum waktu habis
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-wider text-black/60 block">Bayar Sebelum</span>
                    <span className="text-sm font-black text-black block leading-tight">{expiredDateFormatted}</span>
                  </div>
                  <span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-lg">{expiredTimeFormatted}</span>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center gap-4 p-4 sm:p-5">
                <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <Clock className="w-6 h-6 text-amber-600 stroke-[3] animate-spin" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                    Pembayaran Diterima
                  </h1>
                  <p className="text-xs font-bold text-black/70 mt-0.5 m-0">
                    Provider sedang memproses pesanan Anda. Biasanya selesai dalam &lt; 1 menit.
                  </p>
                </div>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-4 p-4 sm:p-5">
                <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <CheckCircle className="w-7 h-7 text-emerald-600 stroke-[3] animate-bounce" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                    Topup Berhasil! 🎉
                  </h1>
                  <p className="text-xs font-bold text-black/70 mt-0.5 m-0">
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
                      Saldo Dikembalikan (Refund)
                    </h1>
                    <p className="text-xs font-semibold text-black/70 mt-0.5 m-0">
                      Transaksi ini tidak dapat diproses oleh supplier. Saldo akun telah dikembalikan otomatis.
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

            {((isFailed && !isRefund) || isExpired) && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left p-4 sm:p-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                    <AlertTriangle className="w-6 h-6 text-red-600 stroke-[3]" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                      {isExpired ? 'Pembayaran Kedaluwarsa' : 'Transaksi Gagal'}
                    </h1>
                    <p className="text-xs font-semibold text-black/70 mt-0.5 m-0">
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
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BLOK 3: POP-ART TICKET STUB                                                */}
        {/* ========================================================================= */}
        <div className="w-full relative pb-4">

          {/* dekorasi: pola titik pojok kiri atas & kanan atas */}
          <div className="hidden md:block absolute -top-6 -left-10 w-28 h-28 rounded-full opacity-60 pointer-events-none select-none bg-[radial-gradient(circle,#FFB7D5_2px,transparent_2px)] bg-[length:12px_12px]" />
          <div className="hidden md:block absolute -top-6 -right-10 w-28 h-28 rounded-full opacity-60 pointer-events-none select-none bg-[radial-gradient(circle,#FFB7D5_2px,transparent_2px)] bg-[length:12px_12px]" />

          {/* dekorasi: starburst "TOP UP" */}
          <div className="absolute -bottom-4 -left-3 sm:-left-5 z-30 pointer-events-none select-none">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[3px_3px_0px_#000]">
                <polygon
                  points="50,2 61,25 85,15 76,39 100,50 76,61 85,85 61,75 50,100 39,75 15,85 24,61 0,50 24,39 15,15 39,25"
                  fill="#FFB7D5"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="relative text-[11px] sm:text-xs font-black uppercase text-black leading-tight text-center rotate-[-8deg]">
                Top<br />Up
              </span>
            </div>
          </div>

          <div className="bg-[#FAF5E9] text-black border-4 border-black shadow-[8px_8px_0px_0px_var(--nb-shadow)] rounded-[24px] sm:rounded-[28px] overflow-hidden relative">
            <div className="grid grid-cols-1 md:grid-cols-12 relative">

              {/* LEFT SECTION (col 1-7): Item, Akun, Rincian Pembayaran */}
              <div className="md:col-start-1 md:col-span-7 p-5 sm:p-7 flex flex-col gap-4 relative min-h-[300px]">

                <div className="flex items-center gap-2 relative z-10">
                  <div className="bg-[#FFB7D5] border-2 border-black rounded-xl px-2.5 py-0.5 flex items-center gap-1.5 font-black text-[11px] uppercase shadow-[2px_2px_0px_0px_#000]">
                    <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : isUnpaid ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                    <span>{isPaid ? 'PAID' : isUnpaid ? 'UNPAID' : payStatus}</span>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#0284C7] fill-[#38BDF8] stroke-black stroke-[2]" />
                </div>

                {/* Game & Product Headline */}
                <div className="relative z-10">
                  <span className="font-black text-[11px] uppercase tracking-wider text-pink-600">Game</span>
                  <h2 className="text-sm sm:text-base font-black uppercase text-black leading-tight m-0">{transaction.game.name}</h2>

                  <span className="font-black text-[11px] uppercase tracking-wider text-pink-600 block mt-2">Produk</span>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black leading-tight m-0 break-words">
                    {transaction.product.cleanName || transaction.product.name}
                  </h1>
                </div>

                <div className="border-t-2 border-dashed border-black/20" />

                {/* Target Account Row */}
                <div className="flex flex-wrap items-start gap-x-6 gap-y-3 text-xs relative z-10">
                  <div>
                    <span className="font-black text-[10px] uppercase tracking-wider text-pink-600 block">User ID</span>
                    <span className="font-mono font-black text-black">{transaction.targetAccount}</span>
                  </div>
                  {transaction.targetZone && (
                    <div>
                      <span className="font-black text-[10px] uppercase tracking-wider text-pink-600 block">Server / Zone</span>
                      <span className="font-mono font-black text-black">{transaction.targetZone}</span>
                    </div>
                  )}
                  {transaction.nickname && (
                    <div>
                      <span className="font-black text-[10px] uppercase tracking-wider text-pink-600 block">Nickname</span>
                      <span className="font-black text-black">{transaction.nickname}</span>
                    </div>
                  )}
                </div>

                {/* Rincian Pembayaran */}
                <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_#000] relative z-10 space-y-1.5 text-xs mt-auto">
                  <span className="font-black text-[10px] uppercase text-pink-600 block border-b border-gray-200 pb-1">Rincian Pembayaran</span>

                  <div className="flex justify-between font-medium text-gray-700">
                    <span>Harga Item:</span>
                    <span className="font-mono font-bold">{formatRupiah(transaction.basePrice)}</span>
                  </div>

                  {transaction.discountAmount > 0 && (
                    <div className="flex justify-between font-medium text-emerald-700">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Voucher {transaction.voucherCode ? `(${transaction.voucherCode})` : ''}:
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
                    <span className="font-mono font-black text-base text-pink-600">{formatRupiah(transaction.amount)}</span>
                  </div>
                </div>
              </div>

              {/* NOTCH CUTOUTS + DASHED DIVIDER */}
              <div className="hidden md:block absolute top-0 bottom-0 left-[58.333%] -translate-x-1/2 z-20 pointer-events-none">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#e9e4d6] border-4 border-black z-30" />
                <div className="absolute top-0 bottom-0 left-0 border-r-[3px] border-dashed border-black" />
                <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-[#e9e4d6] border-4 border-black z-30" />
              </div>
              <div className="md:hidden col-span-1 border-b-[3px] border-dashed border-black" />

              {/* RIGHT SECTION (STUB): Pembayaran */}
              <div className="md:col-start-8 md:col-span-5 p-5 sm:p-7 flex flex-col items-center justify-center gap-3 bg-[#FAF5E9] relative z-10 text-center">

                {isUnpaid && (
                  <div className="w-full space-y-4">
                    <PaymentDetails
                      methodName={transaction.paymentMethod}
                      gatewayCode={transaction.gatewayCode}
                      paymentType={transaction.paymentType}
                      totalAmount={transaction.amount}
                      uniqueCode={transaction.uniqueCode}
                      bankName={transaction.bankName}
                      accountNumber={transaction.accountNumber}
                      accountHolder={transaction.accountHolder}
                      qrString={transaction.qrString}
                      qrImageUrl={transaction.qrImageUrl}
                      checkoutUrl={transaction.checkoutUrl}
                      paymentUrl={transaction.paymentUrl}
                      instructions={transaction.instructions}
                    />

                    {timeLeft !== null && (
                      <div className="text-center pt-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block">Sisa Waktu Pembayaran</span>
                        <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-red-600 whitespace-nowrap">
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {isProcessing && (
                  <>
                    <Clock className="w-14 h-14 text-amber-500 stroke-[2] animate-spin" />
                    <p className="text-xs font-bold text-black/70">Sedang memproses pesananmu, mohon tunggu sebentar ya.</p>
                  </>
                )}

                {isSuccess && (
                  <>
                    <CheckCircle className="w-14 h-14 text-emerald-500 stroke-[2]" />
                    {transaction.sn ? (
                      <button
                        type="button"
                        onClick={() => handleCopy(transaction.sn!, 'ticketSn')}
                        className="w-full bg-[#FFB7D5] hover:bg-pink-300 text-black border-2 border-black rounded-2xl py-2.5 px-3 font-black uppercase text-xs flex items-center justify-between gap-2 shadow-[3px_3px_0px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                      >
                        <span className="truncate font-mono font-black">
                          {copied === 'ticketSn' ? 'SN / TOKEN TERSALIN!' : `SN: ${transaction.sn}`}
                        </span>
                        <div className="flex items-center gap-1 shrink-0 bg-white border border-black rounded-lg px-2 py-0.5 text-[10px]">
                          {copied === 'ticketSn' ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied === 'ticketSn' ? 'Tersalin' : 'Salin SN'}</span>
                        </div>
                      </button>
                    ) : (
                      <p className="text-xs font-bold text-black/70">Item sudah dikirim ke akunmu. Selamat menikmati!</p>
                    )}
                  </>
                )}

                {isRefund && (
                  <>
                    <ShieldAlert className="w-14 h-14 text-purple-500 stroke-[2]" />
                    <p className="text-xs font-bold text-black/70">Saldo sudah dikembalikan otomatis ke akunmu.</p>
                  </>
                )}

                {((isFailed && !isRefund) || isExpired) && (
                  <>
                    <AlertTriangle className="w-14 h-14 text-red-500 stroke-[2]" />
                    <p className="text-xs font-bold text-black/70">
                      {isExpired ? 'Waktu pembayaran sudah habis.' : 'Transaksi tidak dapat diselesaikan.'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* FOOTER BAR: Invoice info */}
            <div className="border-t-4 border-black bg-black text-white px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[var(--nb-yellow)]" />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/50 block leading-none">Invoice ID</span>
                  <button
                    onClick={() => handleCopy(transaction.invoiceId, 'invoiceId')}
                    className="font-mono font-black text-xs flex items-center gap-1 hover:text-[var(--nb-yellow)]"
                  >
                    {transaction.invoiceId}
                    {copied === 'invoiceId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--nb-yellow)]" />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/50 block leading-none">Dibuat Pada</span>
                  <span className="font-bold text-xs">{dateShort}, {timeShort}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[var(--nb-yellow)]" />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/50 block leading-none">Status Pembayaran</span>
                  <span className="inline-block bg-[var(--nb-yellow)] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-md mt-0.5">
                    {payStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};
