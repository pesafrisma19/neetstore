import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { format, differenceInSeconds } from 'date-fns';
import { id } from 'date-fns/locale';
import { Copy, ArrowLeft, Clock, CheckCircle, XCircle, ChevronRight, AlertTriangle, ShieldCheck, Zap, Sparkles } from 'lucide-react';

import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Table, TableBody, TableRow, TableCell } from '../../../../components/ui/Table';
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

  // 5-Step Horizontal Timeline Progress
  const steps = [
    { label: 'Dibuat', completed: true },
    { label: 'Menunggu Bayar', completed: isPaid || isFailed, active: isUnpaid && !isExpired && !isFailed, failed: isExpired && isUnpaid },
    { label: 'Pembayaran Lunas', completed: isPaid, active: false, failed: isFailed && payStatus === 'REFUND' },
    { label: 'Proses Provider', completed: ordStatus === 'PROCESS' || ordStatus === 'SUCCESS', active: isPaid && ordStatus === 'PENDING' },
    { label: ordStatus === 'SUCCESS' ? 'Topup Sukses' : isFailed ? 'Gagal' : 'Selesai', completed: ordStatus === 'SUCCESS', active: ordStatus === 'PROCESS', failed: isFailed }
  ];

  const brandName = transaction.product?.brand?.name || transaction.product?.category?.name || 'Topup Game';

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        
        {/* Top Bar Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="outline" size="sm" className="border-2 border-black shadow-[2px_2px_0px_0px_#000] font-bold text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
              Kembali ke Beranda
            </Button>
          </Link>
          <div className="flex gap-2">
            <Badge variant="yellow" size="sm" className="hidden sm:inline-flex border border-black/20 font-bold text-xs">
              <Sparkles className="w-3 h-3 mr-1 text-black" />
              Bantuan CS 24/7
            </Badge>
          </div>
        </div>

        {/* Main 2-Column Grid: On Mobile, Payment Action Box is FIRST for above-the-fold conversion! */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* ===================== KOLOM KIRI (70% Desktop) ===================== */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* [CARD 1] COMPACT HEADER STATUS (Compact ~90px, No Duplicate Badges) */}
            <Card 
              variant={isPaid ? 'mint' : isFailed ? 'purple' : isExpired ? 'cream' : 'yellow'} 
              className="p-4 border-4 border-black shadow-[5px_5px_0px_0px_#000] rounded-2xl relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {isPaid ? (
                    <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                      <CheckCircle className="w-5 h-5 text-emerald-600 stroke-[3]" />
                    </div>
                  ) : ordStatus === 'PROCESS' ? (
                    <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                      <Clock className="w-5 h-5 text-amber-600 stroke-[3] animate-spin" />
                    </div>
                  ) : isFailed ? (
                    <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                      <XCircle className="w-5 h-5 text-red-600 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                      <Clock className="w-5 h-5 text-black stroke-[3]" />
                    </div>
                  )}

                  <div>
                    <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-black m-0 leading-tight">
                      {ordStatus === 'SUCCESS' ? 'Pembayaran & Topup Sukses!' : ordStatus === 'PROCESS' ? 'Pesanan Sedang Diproses Provider' : isFailed ? 'Transaksi Gagal' : isExpired ? 'Pembayaran Kedaluwarsa' : 'Menunggu Pembayaran'}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-medium text-black/80 font-mono">Invoice: {transaction.providerRef || `TRX-${transaction.id}`}</span>
                      <button 
                        type="button"
                        onClick={() => handleCopy(transaction.providerRef || String(transaction.id), 'invoice')}
                        className="inline-flex items-center text-xs font-bold text-black hover:underline ml-1 cursor-pointer"
                        title="Salin Kode Invoice"
                      >
                        <Copy className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                        {copied === 'invoice' ? <span className="text-emerald-800 font-bold">Tersalin!</span> : <span>Salin</span>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Single Non-Redundant Status Badge Pair */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-black/15">
                  <Badge variant={isPaid ? 'mint' : isUnpaid ? 'yellow' : 'orange'} className="border border-black/20 font-bold text-xs">
                    {isPaid ? '🟢 Lunas' : isExpired ? '⚪ Kedaluwarsa' : isFailed ? '🔴 Gagal' : '🟡 Belum Dibayar'}
                  </Badge>
                  <Badge variant={ordStatus === 'SUCCESS' ? 'mint' : ordStatus === 'PROCESS' ? 'cyan' : ordStatus === 'FAILED' ? 'orange' : 'white'} className="border border-black/20 font-bold text-xs">
                    {ordStatus === 'SUCCESS' ? '🎉 Topup Sukses' : ordStatus === 'PROCESS' ? '⚡ Diproses' : isFailed ? '❌ Gagal' : '⏳ Menunggu Bayar'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* [CARD 2] DETAIL PESANAN & AKUN GAME (Clean Title Case Grid Layout) */}
            <Card variant="white" className="p-0 overflow-hidden border-4 border-black shadow-[5px_5px_0px_0px_#000] rounded-2xl">
              <div className="bg-[var(--nb-surface-alt)] px-4 py-3 border-b-2 border-black flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider m-0">
                  Detail Pesanan & Akun Game
                </h2>
                <Badge variant="white" className="border border-black/20 font-bold text-[11px]">
                  {brandName}
                </Badge>
              </div>

              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[var(--nb-text-muted)] mb-0.5">Game / Brand</span>
                  <span className="font-bold text-[var(--nb-text)]">{brandName}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[var(--nb-text-muted)] mb-0.5">Produk Nominal</span>
                  <span className="font-bold text-[var(--nb-text)]">{transaction.product?.name || '-'}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[var(--nb-text-muted)] mb-0.5">User ID / Target Account</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-mono text-[var(--nb-text)]">{transaction.targetAccount}</span>
                    {transaction.targetZone && (
                      <span className="text-xs font-bold bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-300">
                        Server: {transaction.targetZone}
                      </span>
                    )}
                    <button 
                      type="button" 
                      onClick={() => handleCopy(transaction.targetAccount, 'targetAccount')}
                      className="text-gray-600 hover:text-black ml-1 cursor-pointer"
                      title="Salin User ID"
                    >
                      <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    {copied === 'targetAccount' && <span className="text-[10px] font-bold text-emerald-600">Tersalin!</span>}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[var(--nb-text-muted)] mb-0.5">Nickname Akun</span>
                  {transaction.nickname ? (
                    <span className="font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-300 inline-block w-fit text-xs">
                      {transaction.nickname}
                    </span>
                  ) : (
                    <span className="font-normal text-gray-500">-</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[var(--nb-text-muted)] mb-0.5">Metode Pembayaran</span>
                  <span className="font-bold text-[var(--nb-text)]">{transaction.paymentMethod || '-'}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[var(--nb-text-muted)] mb-0.5">No. Whatsapp Kontak</span>
                  <span className="font-bold font-mono text-[var(--nb-text)]">{transaction.whatsapp || '-'}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[var(--nb-text-muted)] mb-0.5">Tanggal Dibuat</span>
                  <span className="font-medium text-[var(--nb-text)]">{formatFullDate(transaction.createdAt)}</span>
                </div>
              </div>
            </Card>

            {/* [CARD 3] HORIZONTAL TIMELINE PROGRESS & ESTIMASI PROSES */}
            <Card variant="white" className="p-4 sm:p-5 border-4 border-black shadow-[5px_5px_0px_0px_#000] rounded-2xl">
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider m-0 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 stroke-[2.5]" />
                  Alur Proses Pesanan
                </h2>
                <Badge variant="cyan" className="border border-black/20 font-bold text-[10px]">
                  <Zap className="w-3 h-3 mr-1 fill-black" />
                  Estimasi: &lt; 1 Menit
                </Badge>
              </div>

              {/* Horizontal Progress Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative">
                {steps.map((st, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center p-2 rounded-xl bg-[var(--nb-surface-alt)] border border-black/10">
                    <div className="mb-1">
                      {st.completed ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                          <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : st.failed ? (
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white">
                          <XCircle className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : st.active ? (
                        <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center animate-pulse text-black">
                          <Clock className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] leading-tight font-bold ${st.completed ? 'text-black font-black' : st.failed ? 'text-red-600' : st.active ? 'text-amber-800 font-black' : 'text-gray-400'}`}>
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* [ADMIN ONLY] PROVIDER DEBUG VIEW */}
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

          </div>

          {/* ===================== KOLOM KANAN (30% Desktop Sticky - On Mobile: Above-The-Fold Intent!) ===================== */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-20 order-first lg:order-none">
            
            {/* [CARD 4A] RINGKASAN HARGA (Clean, Fixed-Height Layout) */}
            <Card variant="white" className="p-0 overflow-hidden border-4 border-black shadow-[5px_5px_0px_0px_#000] rounded-2xl">
               <div className="bg-[var(--nb-surface-alt)] px-4 py-3 border-b-2 border-black">
                 <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider m-0 text-center">Ringkasan Harga</h2>
               </div>
               <div className="p-4 sm:p-5">
                  <Table>
                    <TableBody>
                      <TableRow className="border-b-0">
                        <TableCell className="font-medium text-sm px-0 py-1.5">Harga Item</TableCell>
                        <TableCell className="text-right font-bold text-sm px-0 py-1.5">
                          {formatRupiah(transaction.basePrice || 0)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-b-0">
                        <TableCell className="font-medium text-sm px-0 py-1.5 text-emerald-700">Voucher Promo</TableCell>
                        <TableCell className="text-right font-bold text-sm px-0 py-1.5 text-emerald-700">
                          {transaction.discountAmount > 0 ? `-${formatRupiah(transaction.discountAmount)}` : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-b-0">
                        <TableCell className="font-medium text-sm px-0 py-1.5">Biaya Admin</TableCell>
                        <TableCell className="text-right font-bold text-sm px-0 py-1.5">
                          {formatRupiah(transaction.feeAmount || 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                 
                 <Separator className="my-3 border-dashed border-black/30" />
                 
                 {/* TOTAL BAYAR PROMINENT BOX */}
                 <div className="bg-[var(--nb-yellow)] p-3 border-2 border-black rounded-xl text-center shadow-[3px_3px_0px_0px_#000]">
                   <span className="font-black text-[10px] uppercase block text-black/70 mb-0.5">Total Pembayaran</span>
                   <span className="font-black text-2xl text-black tracking-tight block">
                     {formatRupiah(transaction.amount)}
                   </span>
                 </div>
                 
                 {/* Copy Button for Exact Transfer Amount (Properly Labeled!) */}
                 {isUnpaid && !isExpired && (
                   <div className="mt-3 p-2.5 bg-[var(--nb-surface-alt)] border border-black/20 rounded-xl">
                      <span className="text-[10px] font-bold block text-gray-600 mb-1 text-left">Nominal Transfer Tepat:</span>
                      <div className="flex items-center justify-between gap-2">
                         <span className="text-sm font-black font-mono text-black">{formatRupiah(transaction.amount)}</span>
                         <Button variant="yellow" size="sm" className="font-black border border-black text-xs py-1 px-2.5" onClick={() => handleCopy(transaction.amount.toString(), 'amount')}>
                            {copied === 'amount' ? 'Tersalin!' : 'Salin Nominal'}
                         </Button>
                      </div>
                   </div>
                 )}
               </div>
            </Card>

            {/* [CARD 4B] INSTRUKSI PEMBAYARAN / QRIS (Above-the-Fold Priority on Mobile!) */}
            {isUnpaid && !isExpired && !isFailed && (
              <Card variant="yellow" className="p-4 sm:p-5 text-center border-4 border-black shadow-[5px_5px_0px_0px_#000] rounded-2xl">
                <h3 className="text-xs font-black uppercase tracking-widest mb-3">Selesaikan Pembayaran</h3>
                
                {timeLeft !== null && (
                  <div className="mb-4 bg-white p-2 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                    <span className="text-[10px] font-bold block text-gray-600">Sisa Waktu Pembayaran</span>
                    <div className="text-2xl font-black tabular-nums tracking-tighter text-red-600">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                )}

                {/* QRIS Renderer */}
                {transaction.paymentMethod === 'QRIS' && transaction.paymentUrl && !transaction.paymentUrl.startsWith('http') && (
                  <div className="flex flex-col items-center gap-2.5 mb-3">
                    <div className="bg-white p-2.5 border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">
                      <QRCodeSVG value={transaction.paymentUrl} size={170} level="H" includeMargin={false} />
                    </div>
                    <Badge variant="white" className="w-full justify-center border border-black/20 font-bold text-xs">Scan via BCA / Gopay / OVO / Dana</Badge>
                  </div>
                )}

                {/* HTTP Redirect Renderer */}
                {transaction.paymentUrl && transaction.paymentUrl.startsWith('http') && (
                  <div className="mb-3">
                    <a href={transaction.paymentUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="yellow" size="lg" className="w-full font-black border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                        Bayar Sekarang Di Sini
                        <ChevronRight className="w-4 h-4 stroke-[3] ml-1" />
                      </Button>
                    </a>
                  </div>
                )}

                {/* Fallback QRIS */}
                {!transaction.paymentUrl && transaction.paymentMethod === 'QRIS' && (
                  <div className="flex flex-col items-center gap-2.5 mb-3">
                    <div className="bg-white p-2.5 border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">
                      <QRCodeSVG value={transaction.providerRef} size={170} level="M" />
                    </div>
                    <p className="text-xs font-medium text-gray-700">Harap scan QRIS di atas untuk membayar.</p>
                  </div>
                )}

                <Separator className="my-2.5 border-black/20" />
                
                <p className="text-[10px] font-medium text-black/80 leading-snug">
                  Pastikan nominal transfer sesuai hingga 3 digit terakhir agar dikonfirmasi otomatis.
                </p>
              </Card>
            )}

            {/* Expired State Warning */}
            {isExpired && (
              <Card variant="purple" className="p-4 text-center text-white border-4 border-black shadow-[5px_5px_0px_0px_#000] rounded-2xl">
                <AlertTriangle className="w-8 h-8 stroke-[2] text-red-400 mx-auto mb-1.5" />
                <h3 className="text-sm font-black uppercase mb-1">Waktu Habis</h3>
                <p className="text-xs font-medium text-gray-300 mb-4">Metode pembayaran ini sudah kadaluwarsa.</p>
                <Link to="/">
                  <Button variant="yellow" size="sm" className="w-full font-black border-2 border-black">Buat Pesanan Baru</Button>
                </Link>
              </Card>
            )}

          </div>
        </div>

        {/* [CARD 5 - FULL WIDTH 100% AT BOTTOM] CELEBRATORY TOKEN / SERIAL NUMBER (SN) BANNER CARD */}
        {ordStatus === 'SUCCESS' && transaction.sn && (
          <div className="mt-6">
            <Card className="p-0 overflow-hidden border-4 border-black shadow-[6px_6px_0px_0px_var(--nb-mint)] rounded-2xl bg-[#16161a] text-white">
              <div className="bg-[var(--nb-mint)] px-4 py-3 border-b-4 border-black flex flex-wrap items-center justify-between gap-2 text-black">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 fill-black stroke-[2]" />
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wide m-0">
                    🎉 TOPUP BERHASIL! KODE VOUCHER / SERIAL NUMBER (SN)
                  </h2>
                </div>
                <Badge variant="yellow" className="font-bold border border-black/20 text-xs">
                  KODE AKTIF
                </Badge>
              </div>
              
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-400">Nomor Token PLN / Kode Voucher Steam / Serial Number:</span>
                  <div className="bg-[#0b0b0e] p-3.5 sm:p-4 border-2 border-gray-700 rounded-xl font-mono text-xl sm:text-2xl font-black tracking-widest text-white break-all shadow-inner">
                    {transaction.sn}
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="yellow"
                  size="md"
                  onClick={() => handleCopy(transaction.sn, 'sn')}
                  className="shrink-0 font-black text-sm uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] py-3 px-6 self-center sm:self-auto"
                >
                  <Copy className="w-4 h-4 stroke-[2.5] mr-2" />
                  {copied === 'sn' ? 'KODE TERSALIN!' : 'SALIN KODE VOUCHER'}
                </Button>
              </div>
            </Card>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
};
