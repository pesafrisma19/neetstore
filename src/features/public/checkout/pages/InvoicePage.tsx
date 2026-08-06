import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { format, differenceInSeconds } from 'date-fns';
import { id } from 'date-fns/locale';
import { Copy, ArrowLeft, Clock, CheckCircle, XCircle, ChevronRight, AlertTriangle, ShieldCheck, Zap, Sparkles, Check } from 'lucide-react';

import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Separator } from '../../../../components/ui/Separator';
import { useAuth } from '../../../../contexts/AuthContext';
import { checkoutApi } from '../services/checkout.api';

export const InvoicePage: React.FC = () => {
  const { orderId } = useParams();
  const invoiceNumber = orderId || '';
  const { user } = useAuth();
  
  const [copied, setCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // --- Auto Polling React Query ---
  const { data: transaction, isLoading, isError, error } = useQuery({
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
        data.orderStatus === 'CANCELED' ||
        data.paymentStatus === 'EXPIRED' ||
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
    
    const expiredDate = transaction.expiredAt ? new Date(transaction.expiredAt) : new Date(new Date(transaction.createdAt).getTime() + 24 * 60 * 60 * 1000);
    
    const calculateTimeLeft = () => {
      const secondsLeft = differenceInSeconds(expiredDate, new Date());
      setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [transaction]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatFullDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd MMMM yyyy, HH:mm", { locale: id });
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
        <span className="font-black text-xl uppercase animate-pulse">Mencari Data Transaksi...</span>
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
              Invoice ID {invoiceNumber} tidak valid atau belum terdaftar.
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
  const isUnpaid = payStatus === 'UNPAID';
  const isExpired = payStatus === 'EXPIRED';
  const isFailed = ordStatus === 'FAILED' || payStatus === 'FAILED' || payStatus === 'REFUND';

  // 5-Step Progress Steps
  const steps = [
    { label: 'Dibuat', completed: true },
    { label: 'Bayar', completed: isPaid || isFailed, active: isUnpaid && !isExpired && !isFailed, failed: isExpired && isUnpaid },
    { label: 'Lunas', completed: isPaid, active: false, failed: isFailed && payStatus === 'REFUND' },
    { label: 'Diproses', completed: ordStatus === 'PROCESS' || ordStatus === 'SUCCESS', active: isPaid && ordStatus === 'PENDING' },
    { label: ordStatus === 'SUCCESS' ? 'Selesai' : isFailed ? 'Gagal' : 'Selesai', completed: ordStatus === 'SUCCESS', active: ordStatus === 'PROCESS', failed: isFailed }
  ];

  const gameName = transaction.product?.brand?.name || transaction.product?.category?.name || 'Topup Game';
  const expiredDateFormatted = transaction.expiredAt 
    ? formatFullDate(transaction.expiredAt) 
    : formatFullDate(new Date(new Date(transaction.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString());

  // Dynamic Theme Color based on Transaction Status
  const ticketHeaderBg = ordStatus === 'SUCCESS'
    ? 'bg-[var(--nb-mint)] text-black'
    : ordStatus === 'PROCESS' || (isPaid && ordStatus === 'PENDING')
    ? 'bg-[var(--nb-cyan)] text-black'
    : isFailed || isExpired
    ? 'bg-red-500 text-white'
    : 'bg-[var(--nb-yellow)] text-black';

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
        {/* BLOK 1: SLEEK BORDERLESS TIMELINE INDICATOR (Tanpa Card / Border / Shadow) */}
        {/* ========================================================================= */}
        <div className="w-full px-2 py-3">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            
            {/* Horizontal Connecting Line */}
            <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-gray-300 dark:bg-gray-700 -z-0" />
            
            {steps.map((st, idx) => (
              <div key={idx} className="flex flex-col items-center z-10">
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    st.completed 
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950' 
                      : st.failed 
                      ? 'bg-red-500 text-white' 
                      : st.active 
                      ? 'bg-[var(--nb-yellow)] text-black ring-4 ring-yellow-200 dark:ring-yellow-900 animate-pulse' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {st.completed ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : st.failed ? (
                    <XCircle className="w-4 h-4 stroke-[3]" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-[11px] font-bold mt-1.5 ${
                  st.completed ? 'text-black font-black' : st.failed ? 'text-red-600' : st.active ? 'text-black font-black underline' : 'text-gray-400'
                }`}>
                  {st.label}
                </span>
              </div>
            ))}

          </div>
        </div>

        {/* ========================================================================= */}
        {/* BLOK 2: AREA STATUS DINAMIS (INFORMATIF + PURE CSS ANIMATIONS)            */}
        {/* ========================================================================= */}
        <Card 
          variant={ordStatus === 'SUCCESS' ? 'mint' : ordStatus === 'PROCESS' ? 'cyan' : isFailed ? 'purple' : isExpired ? 'cream' : 'yellow'} 
          className="p-5 border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl relative overflow-hidden"
        >
          {/* STATE A: UNPAID (Belum Dibayar) */}
          {isUnpaid && !isExpired && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <Clock className="w-6 h-6 text-black stroke-[3] animate-pulse" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                    MENUNGGU PEMBAYARAN
                  </h1>
                  <p className="text-xs font-semibold text-black/80 mt-1 m-0">
                    Bayar sebelum: <span className="font-bold">{expiredDateFormatted}</span>
                  </p>
                </div>
              </div>

              {timeLeft !== null && (
                <div className="bg-white px-4 py-2 border-2 border-black rounded-xl text-center shrink-0 shadow-[3px_3px_0px_0px_#000]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block text-gray-500">Sisa Waktu Pembayaran</span>
                  <span className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-red-600">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STATE B: PROCESS / PAID (Pembayaran Diterima, Diproses Provider) */}
          {(ordStatus === 'PROCESS' || (isPaid && ordStatus === 'PENDING')) && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                <Clock className="w-6 h-6 text-amber-600 stroke-[3] animate-spin" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                  PEMBAYARAN DITERIMA
                </h1>
                <p className="text-xs font-bold text-black/80 mt-1 m-0">
                  Provider sedang memproses pesanan Anda. Biasanya selesai dalam &lt; 1 menit.
                </p>
              </div>
            </div>
          )}

          {/* STATE C: SUCCESS (Topup Berhasil) */}
          {ordStatus === 'SUCCESS' && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                <CheckCircle className="w-7 h-7 text-emerald-600 stroke-[3] animate-bounce" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                  TOPUP BERHASIL! 🎉
                </h1>
                <p className="text-xs font-bold text-black/80 mt-1 m-0">
                  Produk / Diamond sudah masuk ke akun Anda. Silakan cek aplikasi game Anda.
                </p>
              </div>
            </div>
          )}

          {/* STATE D: FAILED / EXPIRED */}
          {(isFailed || isExpired) && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <AlertTriangle className="w-6 h-6 text-red-600 stroke-[3]" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                    {isExpired ? 'PEMBAYARAN KEDALUWARSA' : 'TRANSAKSI GAGAL'}
                  </h1>
                  <p className="text-xs font-semibold text-black/80 mt-1 m-0">
                    {isExpired ? 'Waktu pembayaran telah habis. Silakan buat pesanan baru.' : 'Transaksi ini tidak dapat diproses oleh provider.'}
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
        </Card>

        {/* ========================================================================= */}
        {/* BLOK 3: SATU TIKET UTUH (UNIFIED TICKET STUB WITH DYNAMIC THEME COLOR)   */}
        {/* ========================================================================= */}
        <Card variant="white" className="p-0 overflow-hidden border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl relative">
          
          {/* TICKET HEADER (Warna Mengikuti Status Transaksi) */}
          <div className={`px-5 py-3.5 border-b-4 border-black flex items-center justify-between ${ticketHeaderBg}`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider m-0">
                TIKET BUKTI TRANSAKSI
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="white" className="border border-black/20 font-bold text-xs">
                {gameName}
              </Badge>
              <Badge variant={isPaid ? 'mint' : isUnpaid ? 'yellow' : 'orange'} className="border border-black/20 font-bold text-xs">
                {isPaid ? '🟢 Lunas' : isExpired ? '⚪ Kedaluwarsa' : isFailed ? '🔴 Gagal' : '🟡 Belum Dibayar'}
              </Badge>
            </div>
          </div>

          {/* TICKET BODY GRID: ISI TIKET (KIRI) vs STUB TIKET DINAMIS (KANAN) */}
          <div className="grid grid-cols-1 md:grid-cols-12 relative">
            
            {/* AREA KIRI TIKET: DETAIL PESANAN & BREAKDOWN HARGA (7/12 Cols) */}
            <div className="md:col-span-7 p-5 flex flex-col justify-between gap-5">
              
              {/* Detail Pesanan & Akun Grid */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3 border-b pb-1">
                  Detail Pesanan & Akun
                </h3>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-500 mb-0.5">Game</span>
                    <span className="font-bold text-[var(--nb-text)]">{gameName}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-500 mb-0.5">Produk Nominal</span>
                    <span className="font-bold text-[var(--nb-text)]">{transaction.product?.name || '-'}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-500 mb-0.5">User ID / Target</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-[var(--nb-text)]">{transaction.targetAccount}</span>
                      {transaction.targetZone && (
                        <span className="text-xs font-bold bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-300">
                          Server: {transaction.targetZone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-500 mb-0.5">Nickname Akun</span>
                    <span className="font-bold text-[var(--nb-text)]">{transaction.nickname || '-'}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-500 mb-0.5">Metode Pembayaran</span>
                    <span className="font-bold text-[var(--nb-text)]">{transaction.paymentMethod || '-'}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-500 mb-0.5">No. WA Kontak</span>
                    <span className="font-bold font-mono text-[var(--nb-text)]">{transaction.whatsapp || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Rincian Harga Breakdown (Di Kiri Tiket) */}
              <div className="bg-[var(--nb-surface-alt)] p-3.5 rounded-xl border border-black/15">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
                  Rincian Biaya
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">Harga Item</span>
                    <span className="font-bold">{formatRupiah(transaction.basePrice || 0)}</span>
                  </div>
                  
                  {/* Voucher Promo Row: RENDERED ONLY IF DISCOUNT > 0 */}
                  {transaction.discountAmount > 0 && (
                    <div className="flex justify-between font-medium text-emerald-700">
                      <span>Voucher Promo</span>
                      <span className="font-bold">-{formatRupiah(transaction.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">Biaya Admin</span>
                    <span className="font-bold">{formatRupiah(transaction.feeAmount || 0)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* CUTOUT NOTCH & DASHED TEAR LINE */}
            <div className="hidden md:block relative">
              {/* Upper Notch Cutout */}
              <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-[#fdfbf7] dark:bg-[#121214] border-2 border-black z-20" />
              {/* Dashed Line */}
              <div className="absolute top-0 bottom-0 left-0 w-0 border-r-2 border-dashed border-black/30 z-10" />
              {/* Lower Notch Cutout */}
              <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#fdfbf7] dark:bg-[#121214] border-2 border-black z-20" />
            </div>

            {/* AREA KANAN TIKET: STUB TIKET DINAMIS (5/12 Cols) */}
            <div className="md:col-span-5 p-5 bg-[var(--nb-surface-alt)]/50 border-t-2 md:border-t-0 md:border-l-0 border-dashed border-black/30 flex flex-col justify-between gap-4">
              
              {/* Stub Top: Tanggal Dibuat */}
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Tanggal Dibuat</span>
                <span className="text-xs font-bold text-black dark:text-white block">{formatFullDate(transaction.createdAt)}</span>
              </div>

              {/* Prominent TOTAL BAYAR Box */}
              <div className="bg-[var(--nb-yellow)] p-3.5 border-2 border-black rounded-xl text-center shadow-[3px_3px_0px_0px_#000]">
                <span className="text-[10px] font-black uppercase text-black/70 block mb-0.5">Total Pembayaran</span>
                <span className="text-2xl font-black text-black tracking-tight block">
                  {formatRupiah(transaction.amount)}
                </span>
              </div>

              {/* DYNAMIC STUB CONTENT (Berubah Otomatis Sesuai Status Transaksi!) */}
              <div className="flex-1 flex flex-col justify-center">
                
                {/* DYNAMIC STUB 1: UNPAID (QRIS / Payment Link + Salin Nominal) */}
                {isUnpaid && !isExpired && (
                  <div className="flex flex-col items-center text-center gap-2">
                    
                    {transaction.paymentMethod === 'QRIS' && transaction.paymentUrl && !transaction.paymentUrl.startsWith('http') && (
                      <div className="bg-white p-2 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] inline-block">
                        <QRCodeSVG value={transaction.paymentUrl} size={140} level="H" />
                      </div>
                    )}

                    {transaction.paymentUrl && transaction.paymentUrl.startsWith('http') && (
                      <a href={transaction.paymentUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="yellow" size="sm" className="w-full font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                          Bayar Sekarang <ChevronRight className="w-4 h-4 ml-1 stroke-[3]" />
                        </Button>
                      </a>
                    )}

                    <Button 
                      variant="white" 
                      size="sm" 
                      onClick={() => handleCopy(transaction.amount.toString(), 'stubAmount')}
                      className="w-full font-black border border-black text-xs py-1 mt-1"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                      {copied === 'stubAmount' ? 'Nominal Tersalin!' : 'Salin Nominal Tepat'}
                    </Button>
                  </div>
                )}

                {/* DYNAMIC STUB 2: PROCESS (Loading Spinner) */}
                {(ordStatus === 'PROCESS' || (isPaid && ordStatus === 'PENDING')) && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 rounded-xl text-center flex flex-col items-center gap-2">
                    <Clock className="w-8 h-8 text-amber-600 stroke-[2.5] animate-spin" />
                    <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-300">
                      ⚡ Diproses Provider
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      Mohon tunggu sebentar...
                    </span>
                  </div>
                )}

                {/* DYNAMIC STUB 3: SUCCESS (Kode Voucher / Serial Number Prominent Box!) */}
                {ordStatus === 'SUCCESS' && (
                  <div className="p-3.5 bg-[#16161a] border-2 border-black rounded-xl text-white text-center flex flex-col gap-2 shadow-[3px_3px_0px_0px_var(--nb-mint)]">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                      🎉 KODE VOUCHER / SERIAL NUMBER
                    </span>
                    <div className="bg-[#0b0b0e] p-2 border border-gray-700 rounded-lg font-mono text-sm font-black tracking-widest text-white break-all">
                      {transaction.sn || 'BERHASIL TERKIRIM'}
                    </div>
                    {transaction.sn && (
                      <Button 
                        variant="yellow" 
                        size="sm" 
                        onClick={() => handleCopy(transaction.sn, 'stubSn')}
                        className="w-full font-black border border-black text-xs py-1"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                        {copied === 'stubSn' ? 'Kode Tersalin!' : 'Salin Kode Voucher'}
                      </Button>
                    )}
                  </div>
                )}

                {/* DYNAMIC STUB 4: FAILED / EXPIRED */}
                {(isFailed || isExpired) && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border-2 border-red-500 rounded-xl text-center text-red-700 dark:text-red-300 text-xs font-bold">
                    {isExpired ? 'Metode pembayaran kedaluwarsa.' : 'Transaksi gagal diproses.'}
                  </div>
                )}

              </div>

              {/* Stub Footer: Invoice ID & Functional Visual Barcode */}
              <div className="border-t border-black/15 pt-2 flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-500 uppercase">Invoice ID</span>
                  <span className="font-mono text-xs font-bold text-black dark:text-white truncate max-w-[130px]">
                    {transaction.providerRef || `TRX-${transaction.id}`}
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleCopy(transaction.providerRef || String(transaction.id), 'stubInvoice')}
                  className="p-1 text-gray-600 hover:text-black shrink-0 cursor-pointer"
                  title="Salin Invoice ID"
                >
                  <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                {copied === 'stubInvoice' && <span className="text-[10px] font-bold text-emerald-600">Tersalin!</span>}
              </div>

            </div>
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* BLOK 4: ADMIN DEBUG PANEL (KHUSUS ROLE ADMIN)                             */}
        {/* ========================================================================= */}
        {user?.role === 'ADMIN' && (
          <Card variant="purple" className="p-0 overflow-hidden border-4 border-black rounded-2xl shadow-[5px_5px_0px_0px_#000]">
            <div className="bg-yellow-400 p-2.5 border-b-2 border-black flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-black stroke-[3]" />
               <h2 className="text-xs font-black uppercase text-black m-0">ADMIN DEBUG VIEW</h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-white text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-300 block">Digiflazz SKU</span>
                <span className="font-mono">{transaction.product?.digiflazzSku || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-300 block">Provider Ref</span>
                <span className="font-mono">{transaction.providerRef || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-300 block">Serial Number (SN)</span>
                <span className="font-mono text-emerald-400">{transaction.sn || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-300 block">Provider Message</span>
                <span className="font-mono text-red-300">{transaction.providerMessage || '-'}</span>
              </div>
            </div>
          </Card>
        )}

      </main>
      <Footer />
    </div>
  );
};
