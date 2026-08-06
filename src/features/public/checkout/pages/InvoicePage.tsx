import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { format, differenceInSeconds } from 'date-fns';
import { id } from 'date-fns/locale';
import { Copy, ArrowLeft, Clock, CheckCircle, XCircle, ChevronRight, AlertTriangle, ShieldCheck, Sparkles, Check, Calendar, MapPin, Zap, Music, Smile, Star } from 'lucide-react';

import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
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
  const rawProductName = transaction.product?.name || 'TOPUP GAME';
  // Clean product name if it repeats brand name
  const cleanProductName = rawProductName.toLowerCase().startsWith(gameName.toLowerCase())
    ? rawProductName.slice(gameName.length).replace(/^[\s:\-]+/, '')
    : rawProductName;

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
                  {st.completed ? <Check className="w-4 h-4 stroke-[3]" /> : st.failed ? <XCircle className="w-4 h-4 stroke-[3]" /> : idx + 1}
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
          className="p-4 sm:p-5 border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl relative overflow-hidden"
        >
          {isUnpaid && !isExpired && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <Clock className="w-5 h-5 text-black stroke-[3] animate-pulse" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                    MENUNGGU PEMBAYARAN
                  </h1>
                  <p className="text-xs font-semibold text-black/80 mt-0.5 m-0">
                    Bayar sebelum: <span className="font-bold">{expiredDateFormatted}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {transaction.paymentMethod === 'QRIS' && transaction.paymentUrl && !transaction.paymentUrl.startsWith('http') && (
                  <div className="bg-white p-1.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] shrink-0">
                    <QRCodeSVG value={transaction.paymentUrl} size={70} level="M" />
                  </div>
                )}
                
                {timeLeft !== null && (
                  <div className="bg-white px-3 py-1.5 border-2 border-black rounded-xl text-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider block text-gray-500">Sisa Waktu Pembayaran</span>
                    <span className="text-lg sm:text-xl font-black tabular-nums tracking-tight text-red-600">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}

                <Button 
                  variant="white" 
                  size="sm" 
                  onClick={() => handleCopy(transaction.amount.toString(), 'topAmount')}
                  className="font-black border-2 border-black text-xs py-2 px-3 shadow-[2px_2px_0px_0px_#000]"
                >
                  <Copy className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                  {copied === 'topAmount' ? 'Tersalin!' : 'Salin Nominal'}
                </Button>
              </div>
            </div>
          )}

          {(ordStatus === 'PROCESS' || (isPaid && ordStatus === 'PENDING')) && (
            <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                <CheckCircle className="w-7 h-7 text-emerald-600 stroke-[3] animate-bounce" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                  TOPUP BERHASIL! 🎉
                </h1>
                <p className="text-xs font-bold text-black/80 mt-0.5 m-0">
                  Produk / Diamond sudah masuk ke akun Anda. Silakan cek aplikasi game Anda.
                </p>
              </div>
            </div>
          )}

          {(isFailed || isExpired) && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <AlertTriangle className="w-6 h-6 text-red-600 stroke-[3]" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-black m-0 leading-tight">
                    {isExpired ? 'PEMBAYARAN KEDALUWARSA' : 'TRANSAKSI GAGAL'}
                  </h1>
                  <p className="text-xs font-semibold text-black/80 mt-0.5 m-0">
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
        {/* BLOK 3: POP-ART TICKET STUB (RESPONSIVE 2-COLUMN POP-ART TICKET)          */}
        {/* ========================================================================= */}
        <div className="w-full relative">
          
          {/* Main Ticket Shell */}
          <div className="bg-[#FAF5E9] text-black border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-[24px] sm:rounded-[28px] overflow-hidden relative">
            
            {/* Main Ticket Inner Grid (Always 2 Columns on md/lg, responsive stacked with tear lines) */}
            <div className="grid grid-cols-1 md:grid-cols-12 relative">
              
              {/* ================= LEFT SECTION OF TICKET (7/12 Cols) ================= */}
              <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between gap-5 relative min-h-[300px]">
                
                {/* Top Row: Pink Live Badge + Four-point Star Sparkle + Purple Starburst Sticker */}
                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#FFB7D5] border-2 border-black rounded-xl px-2.5 py-0.5 flex items-center gap-1.5 font-black text-[11px] uppercase shadow-[2px_2px_0px_0px_#000]">
                      <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                      <span>{isPaid ? 'PAID' : isUnpaid ? 'LIVE' : 'INVOICE'}</span>
                    </div>
                    <Sparkles className="w-5 h-5 text-[#0284C7] fill-[#38BDF8] stroke-black stroke-[2]" />
                  </div>

                  <div className="relative">
                    <div className="bg-[#C084FC] border-2 border-black px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_0px_#000] transform rotate-3 flex items-center justify-center">
                      <span className="font-black text-[10px] uppercase text-black leading-tight text-center block">
                        SEE YOU THERE!
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logo & Big Bold Headline */}
                <div className="my-1 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-[#FFB7D5] border-2 border-black flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_#000]">
                      ⚡
                    </div>
                    <span className="font-black text-sm sm:text-base uppercase tracking-wider text-black">
                      {gameName}
                    </span>
                  </div>

                  {/* Clean Headline Product Name */}
                  <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-black leading-tight m-0 break-words">
                    {cleanProductName || rawProductName}
                  </h1>

                  <div className="w-20 sm:w-28 h-2 bg-[#FFB7D5] border-2 border-black rounded-full mt-2 shadow-[2px_2px_0px_0px_#000]" />
                </div>

                {/* Music Note Embellishment */}
                <div className="absolute right-6 top-20 hidden sm:block">
                  <Music className="w-7 h-7 text-[#E086D3] fill-[#F472B6] stroke-black stroke-[2] transform -rotate-12" />
                </div>

                {/* Bottom Row of Left Ticket: Yellow Smiley + Mint Green Account Capsule + Blue Bolt */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-10 pt-1">
                  <div className="w-9 h-9 rounded-full bg-[#FDE047] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                    <Smile className="w-5 h-5 text-black stroke-[2.5]" />
                  </div>

                  <div className="flex-1 bg-[#A7F3D0] border-2 border-black rounded-full px-3.5 py-1.5 flex items-center justify-center font-extrabold text-xs sm:text-sm text-black shadow-[2px_2px_0px_0px_#000] text-center min-w-[180px]">
                    <span className="truncate">
                      ID: {transaction.targetAccount} {transaction.targetZone ? `• Zone: ${transaction.targetZone}` : ''} {transaction.nickname ? `• ${transaction.nickname}` : ''}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-[#38BDF8] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                    <Zap className="w-4 h-4 text-black fill-yellow-300 stroke-[2.5]" />
                  </div>
                </div>

                {/* Halftone Dots */}
                <div className="absolute bottom-2 right-14 hidden sm:grid grid-cols-4 gap-1 opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                </div>

              </div>

              {/* ================= MIDDLE DASHED DIVIDER & NOTCH CUTOUTS ================= */}
              <div className="relative">
                {/* Desktop Notch Cutouts (Top & Bottom of Divider) */}
                <div className="hidden md:block absolute -top-4 -left-4 w-8 h-8 rounded-full bg-white dark:bg-[#121214] border-4 border-black z-30" />
                <div className="hidden md:block absolute top-0 bottom-0 left-0 w-0 border-r-3 border-dashed border-black z-20" />
                <div className="hidden md:block absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-white dark:bg-[#121214] border-4 border-black z-30" />
                
                {/* Mobile Tear Line (Horizontal) */}
                <div className="md:hidden w-full border-b-3 border-dashed border-black my-0" />
              </div>

              {/* ================= RIGHT SECTION OF TICKET (STUB) (5/12 Cols) ================= */}
              <div className="md:col-span-5 p-5 sm:p-7 flex flex-col justify-between gap-4 bg-[#FAF5E9] relative z-10">
                
                {/* Row Items with Square Colored Icon Boxes */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 border-b border-black/15 pb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#BBF7D0] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                      <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm uppercase block leading-tight text-black">{dateShort}</span>
                      <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">DATE</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b border-black/15 pb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#E9D5FF] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                      <Clock className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm uppercase block leading-tight text-black">{timeShort}</span>
                      <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">TIME</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pb-1">
                    <div className="w-9 h-9 rounded-xl bg-[#FEF08A] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                      <MapPin className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm uppercase block leading-tight text-black">
                        {transaction.paymentMethod} • {formatRupiah(transaction.amount)}
                      </span>
                      <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">VENUE & PRICE</span>
                    </div>
                  </div>
                </div>

                {/* Middle Barcode Section */}
                <div className="my-1 flex flex-col items-center justify-center text-center">
                  <div className="w-full bg-white p-2 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1 w-full h-8 px-2 overflow-hidden">
                      <div className="w-1 h-full bg-black" />
                      <div className="w-2 h-full bg-black" />
                      <div className="w-0.5 h-full bg-black" />
                      <div className="w-1.5 h-full bg-black" />
                      <div className="w-1 h-full bg-black" />
                      <div className="w-3 h-full bg-black" />
                      <div className="w-0.5 h-full bg-black" />
                      <div className="w-2 h-full bg-black" />
                      <div className="w-1 h-full bg-black" />
                      <div className="w-1.5 h-full bg-black" />
                      <div className="w-0.5 h-full bg-black" />
                      <div className="w-2 h-full bg-black" />
                    </div>
                    
                    <div className="flex items-center justify-center gap-1 mt-1 text-[11px] font-mono font-black text-black">
                      <Star className="w-2.5 h-2.5 fill-black text-black" />
                      <span className="truncate max-w-[170px]">{transaction.providerRef || `TRX-${transaction.id}`}</span>
                      <Star className="w-2.5 h-2.5 fill-black text-black" />
                    </div>
                  </div>
                </div>

                {/* Bottom Pink Pill CTA Button */}
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
