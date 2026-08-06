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
import { IconButton } from '../../../../components/ui/IconButton';
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
        <span className="font-black text-2xl uppercase animate-pulse">Mencari Data Transaksi...</span>
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Card variant="purple" shadow="xl" className="max-w-md w-full p-8 text-center border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-2xl">
            <h1 className="text-3xl font-black text-white mb-4 uppercase">Tidak Ditemukan</h1>
            <p className="text-sm font-bold text-gray-200 mb-8">
              Invoice ID {invoiceNumber} tidak valid atau belum terdaftar.
              {(error as any)?.message ? ` (${(error as any).message})` : ''}
            </p>
            <Link to="/">
              <Button variant="yellow" size="lg" className="w-full font-black border-2 border-black">KEMBALI KE BERANDA</Button>
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

  // 5-Step Horizontal Timeline Progress Calculation
  const steps = [
    { label: 'Pesanan Dibuat', completed: true },
    { label: 'Menunggu Bayar', completed: isPaid || isFailed, active: isUnpaid && !isExpired && !isFailed, failed: isExpired && isUnpaid },
    { label: 'Pembayaran Diterima', completed: isPaid, active: false, failed: isFailed && payStatus === 'REFUND' },
    { label: 'Proses Provider', completed: ordStatus === 'PROCESS' || ordStatus === 'SUCCESS', active: isPaid && ordStatus === 'PENDING' },
    { label: ordStatus === 'SUCCESS' ? 'Topup Sukses' : isFailed ? 'Gagal' : 'Selesai', completed: ordStatus === 'SUCCESS', active: ordStatus === 'PROCESS', failed: isFailed }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {/* Top Bar Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/">
            <Button variant="outline" size="sm" className="border-3 border-black shadow-[3px_3px_0px_0px_#000] font-black">
              <ArrowLeft className="w-4 h-4 stroke-[3] mr-2" />
              KEMBALI KE BERANDA
            </Button>
          </Link>
          <div className="flex gap-2">
            <Badge variant="yellow" size="sm" className="hidden sm:inline-flex border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-black" />
              BANTUAN CS 24/7
            </Badge>
          </div>
        </div>

        {/* 2-Column Main Layout: Left 70% (Main Details) : Right 30% Sticky (Price & Payment) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* ===================== KOLOM KIRI (70%) ===================== */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* [CARD 1] COMPACT STATUS HEADER CARD (~120-150px Height) */}
            <Card 
              variant={isPaid ? 'mint' : isFailed ? 'purple' : isExpired ? 'cream' : 'yellow'} 
              className="p-5 sm:p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {isPaid ? (
                    <div className="w-12 h-12 rounded-xl bg-white border-3 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#000]">
                      <CheckCircle className="w-7 h-7 text-emerald-600 stroke-[3]" />
                    </div>
                  ) : ordStatus === 'PROCESS' ? (
                    <div className="w-12 h-12 rounded-xl bg-white border-3 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#000]">
                      <Clock className="w-7 h-7 text-amber-600 stroke-[3] animate-spin" />
                    </div>
                  ) : isFailed ? (
                    <div className="w-12 h-12 rounded-xl bg-white border-3 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#000]">
                      <XCircle className="w-7 h-7 text-red-600 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white border-3 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#000]">
                      <Clock className="w-7 h-7 text-black stroke-[3]" />
                    </div>
                  )}

                  <div>
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black m-0 leading-none">
                      {ordStatus === 'SUCCESS' ? 'PEMBAYARAN & TOPUP SUKSES!' : ordStatus === 'PROCESS' ? 'PESANAN SEDANG DIPROSES...' : isFailed ? 'TRANSAKSI GAGAL' : isExpired ? 'KEDALUWARSA' : 'MENUNGGU PEMBAYARAN'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-bold text-black/80 font-mono">Invoice: {transaction.providerRef || `TRX-${transaction.id}`}</span>
                      <IconButton variant="white" size="sm" className="w-5 h-5 p-0.5 border-2 border-black" onClick={() => handleCopy(transaction.providerRef || String(transaction.id), 'invoice')}>
                        <Copy className="w-3 h-3 stroke-[3]" />
                      </IconButton>
                      {copied === 'invoice' && <span className="text-[10px] font-black text-emerald-800 uppercase">Tersalin!</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-black/20">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={isPaid ? 'mint' : isUnpaid ? 'yellow' : 'orange'} className="border-2 border-black font-black uppercase">
                      Bayar: {payStatus}
                    </Badge>
                    <Badge variant={ordStatus === 'SUCCESS' ? 'mint' : ordStatus === 'PROCESS' ? 'cyan' : ordStatus === 'FAILED' ? 'orange' : 'white'} className="border-2 border-black font-black uppercase">
                      Status: {ordStatus}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-bold text-black/70">
                    Dibuat: {formatFullDate(transaction.createdAt)}
                  </span>
                </div>
              </div>
            </Card>

            {/* [CARD 2] HIGH PRIORITY TOKEN / SERIAL NUMBER (SN) CARD (Hanya jika SUCCESS & SN terisi) */}
            {ordStatus === 'SUCCESS' && transaction.sn && (
              <Card className="p-0 overflow-hidden border-4 border-black shadow-[6px_6px_0px_0px_var(--nb-mint)] rounded-2xl bg-[#16161a] text-white">
                <div className="bg-[var(--nb-mint)] p-3 border-b-4 border-black flex items-center justify-between text-black">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 fill-black stroke-[2]" />
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-wide m-0">SERIAL NUMBER / KODE VOUCHER / TOKEN</h2>
                  </div>
                  <Badge variant="yellow" className="font-black border-2 border-black uppercase text-xs">BERHASIL DITERBITKAN</Badge>
                </div>
                
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <span className="text-[11px] font-extrabold uppercase text-gray-400">Kode Token Voucher / SN Anda:</span>
                    <div className="bg-[#0b0b0e] p-3 sm:p-4 border-3 border-gray-700 rounded-xl font-mono text-xl sm:text-2xl font-black tracking-widest text-white break-all shadow-inner">
                      {transaction.sn}
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="yellow"
                    size="lg"
                    onClick={() => handleCopy(transaction.sn, 'sn')}
                    className="shrink-0 font-black text-sm uppercase border-3 border-black shadow-[4px_4px_0px_0px_#000] py-3 sm:py-4 px-6"
                  >
                    <Copy className="w-4.5 h-4.5 stroke-[3] mr-2" />
                    {copied === 'sn' ? 'KODE TERSALIN!' : 'SALIN KODE'}
                  </Button>
                </div>
              </Card>
            )}

            {/* [CARD 3] DETAIL PESANAN & AKUN GAME (Clean 2-Column Grid Layout) */}
            <Card variant="white" className="p-0 overflow-hidden border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl">
              <div className="bg-[var(--nb-surface-alt)] p-4 border-b-4 border-black flex items-center justify-between">
                <h2 className="text-base font-black uppercase m-0 flex items-center gap-2">
                  Detail Pesanan & Akun Game
                </h2>
                <Badge variant="white" className="border-2 border-black font-extrabold uppercase text-[10px]">
                  {transaction.product?.category?.name || 'Topup Game'}
                </Badge>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] tracking-wider mb-0.5">Game / Brand</span>
                  <span className="text-sm font-black uppercase text-[var(--nb-text)]">{transaction.product?.category?.name || '-'}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] tracking-wider mb-0.5">Produk Nomimal</span>
                  <span className="text-sm font-black uppercase text-[var(--nb-text)]">{transaction.product?.name || '-'}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] tracking-wider mb-0.5">User ID / Target Account</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black font-mono text-[var(--nb-text)]">{transaction.targetAccount}</span>
                    {transaction.targetZone && (
                      <span className="text-xs font-extrabold bg-[var(--nb-surface-alt)] px-2 py-0.5 border-2 border-black rounded">
                        Server: {transaction.targetZone}
                      </span>
                    )}
                    <IconButton variant="white" size="sm" className="w-5 h-5 p-0.5 border-2 border-black" onClick={() => handleCopy(transaction.targetAccount, 'targetAccount')}>
                      <Copy className="w-3 h-3 stroke-[3]" />
                    </IconButton>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] tracking-wider mb-0.5">Nickname Akun</span>
                  <span className="text-sm font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 border-2 border-emerald-600 rounded-lg inline-block w-fit">
                    {transaction.nickname || '-'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] tracking-wider mb-0.5">Metode Pembayaran</span>
                  <span className="text-sm font-black uppercase text-[var(--nb-text)]">{transaction.paymentMethod || '-'}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] tracking-wider mb-0.5">No. Whatsapp Kontak</span>
                  <span className="text-sm font-black font-mono text-[var(--nb-text)]">{transaction.whatsapp || '-'}</span>
                </div>
              </div>
            </Card>

            {/* [CARD 4] HORIZONTAL TIMELINE PROGRESS & ESTIMASI PROSES */}
            <Card variant="white" className="p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <h2 className="text-base font-black uppercase m-0 flex items-center gap-2">
                  <Clock className="w-5 h-5 stroke-[3]" />
                  Alur Proses Pesanan
                </h2>
                <Badge variant="cyan" className="border-2 border-black font-black uppercase text-[10px] w-fit">
                  <Zap className="w-3 h-3 mr-1 fill-black" />
                  Estimasi Selesai: &lt; 1 Menit
                </Badge>
              </div>

              {/* Horizontal Steps Container */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                {steps.map((st, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center relative p-3 border-2 border-black rounded-xl bg-[var(--nb-surface-alt)]">
                    <div className="mb-2">
                      {st.completed ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-white">
                          <CheckCircle className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : st.failed ? (
                        <div className="w-7 h-7 rounded-full bg-red-500 border-2 border-black flex items-center justify-center text-white">
                          <XCircle className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : st.active ? (
                        <div className="w-7 h-7 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center animate-pulse text-black">
                          <Clock className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center text-gray-500 font-black text-xs">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <span className={`text-[11px] leading-tight font-black uppercase ${st.completed ? 'text-black' : st.failed ? 'text-red-600' : st.active ? 'text-amber-700' : 'text-gray-400'}`}>
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* [CARD 6 - ADMIN ONLY] PROVIDER DEBUG VIEW */}
            {user?.role === 'ADMIN' && (
              <Card variant="purple" className="p-0 overflow-hidden border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000]">
                <div className="bg-yellow-400 p-3 border-b-4 border-black flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5 text-black stroke-[3]" />
                   <h2 className="text-sm font-black uppercase text-black m-0">ADMIN ONLY DEBUG VIEW</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-300 block">Digiflazz SKU</span>
                    <span className="text-xs font-mono">{transaction.product?.digiflazzSku || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-300 block">Provider Ref</span>
                    <span className="text-xs font-mono">{transaction.providerRef || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-300 block">Serial Number (SN)</span>
                    <span className="text-xs font-mono text-emerald-400">{transaction.sn || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-300 block">Provider Message</span>
                    <span className="text-xs font-mono text-red-300">{transaction.providerMessage || '-'}</span>
                  </div>
                </div>
              </Card>
            )}

          </div>

          {/* ===================== KOLOM KANAN (30% STICKY) ===================== */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            
            {/* [CARD 5A] RINGKASAN HARGA */}
            <Card variant="white" className="p-0 overflow-hidden border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl">
               <div className="bg-[var(--nb-surface-alt)] p-4 border-b-4 border-black">
                 <h2 className="text-base font-black uppercase m-0 text-center">Ringkasan Harga</h2>
               </div>
               <div className="p-5 sm:p-6">
                  <Table>
                    <TableBody>
                      <TableRow className="border-b-0">
                        <TableCell className="font-bold text-sm px-0 py-2">Harga Item</TableCell>
                        <TableCell className="text-right font-black text-sm px-0 py-2">
                          {formatRupiah(transaction.basePrice || 0)}
                        </TableCell>
                      </TableRow>
                      {transaction.discountAmount > 0 && (
                        <TableRow className="border-b-0">
                          <TableCell className="font-bold text-sm px-0 py-2 text-emerald-600">Potongan Promo</TableCell>
                          <TableCell className="text-right font-black text-sm px-0 py-2 text-emerald-600">
                            -{formatRupiah(transaction.discountAmount)}
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className="border-b-0">
                        <TableCell className="font-bold text-sm px-0 py-2">Biaya Admin</TableCell>
                        <TableCell className="text-right font-black text-sm px-0 py-2">
                          {formatRupiah(transaction.feeAmount || 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                 
                 <Separator className="my-4 border-2 border-dashed border-black" />
                 
                 {/* TOTAL BAYAR PROMINENT BOX (Font 32px font-black) */}
                 <div className="bg-[var(--nb-yellow)] p-4 border-3 border-black rounded-xl text-center shadow-[4px_4px_0px_0px_#000]">
                   <span className="font-black text-xs uppercase block text-black/70 mb-1">TOTAL PEMBAYARAN</span>
                   <span className="font-black text-2xl sm:text-3xl text-black tracking-tight block">
                     {formatRupiah(transaction.amount)}
                   </span>
                 </div>
                 
                 {/* Copy Button for Exact Amount */}
                 {isUnpaid && !isExpired && (
                   <div className="mt-4 flex items-center justify-between p-2.5 bg-[var(--nb-surface-alt)] border-3 border-black rounded-lg">
                      <span className="text-xs font-black px-2">{transaction.amount}</span>
                      <Button variant="cyan" size="sm" className="font-black border-2 border-black" onClick={() => handleCopy(transaction.amount.toString(), 'amount')}>
                         SALIN
                      </Button>
                   </div>
                 )}
               </div>
            </Card>

            {/* [CARD 5B] INSTRUKSI PEMBAYARAN / QRIS (Terpisah di bawah Ringkasan Harga) */}
            {isUnpaid && !isExpired && !isFailed && (
              <Card variant="yellow" className="p-6 text-center border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4">SELESAIKAN PEMBAYARAN</h3>
                
                {timeLeft !== null && (
                  <div className="mb-6 bg-white p-3 border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">
                    <span className="text-[10px] font-black uppercase block mb-0.5 text-gray-600">Sisa Waktu Pembayaran</span>
                    <div className="text-3xl font-black tabular-nums tracking-tighter text-red-600">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                )}

                {/* QRIS Renderer */}
                {transaction.paymentMethod === 'QRIS' && transaction.paymentUrl && !transaction.paymentUrl.startsWith('http') && (
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="bg-white p-3 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_#000]">
                      <QRCodeSVG value={transaction.paymentUrl} size={180} level="H" includeMargin={false} />
                    </div>
                    <Badge variant="white" className="w-full justify-center border-2 border-black font-black">Scan via BCA / Gopay / OVO / Dana</Badge>
                  </div>
                )}

                {/* HTTP Redirect Renderer */}
                {transaction.paymentUrl && transaction.paymentUrl.startsWith('http') && (
                  <div className="mb-6">
                    <a href={transaction.paymentUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="cyan" size="lg" className="w-full font-black border-3 border-black shadow-[4px_4px_0px_0px_#000]">
                        BAYAR SEKARANG DI SINI
                        <ChevronRight className="w-4 h-4 stroke-[3] ml-2" />
                      </Button>
                    </a>
                  </div>
                )}

                {/* Tanpa URL / Fallback */}
                {!transaction.paymentUrl && transaction.paymentMethod === 'QRIS' && (
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="bg-white p-3 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_#000]">
                      <QRCodeSVG value={transaction.providerRef} size={180} level="M" />
                    </div>
                    <p className="text-xs font-bold">Harap scan QRIS di atas untuk menyelesaikan pembayaran.</p>
                  </div>
                )}

                <Separator className="my-4 border-2 border-black" />
                
                <p className="text-xs font-extrabold text-black/80">
                  Pastikan nominal pembayaran sesuai hingga 3 digit terakhir agar dikonfirmasi otomatis.
                </p>
              </Card>
            )}

            {/* Expired State Warning */}
            {isExpired && (
              <Card variant="purple" className="p-6 text-center text-white border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl">
                <AlertTriangle className="w-12 h-12 stroke-[2] text-red-400 mx-auto mb-3" />
                <h3 className="text-lg font-black uppercase mb-2">WAKTU HABIS</h3>
                <p className="text-xs font-bold text-gray-300 mb-6">Metode pembayaran ini sudah kadaluwarsa.</p>
                <Link to="/">
                  <Button variant="yellow" className="w-full font-black border-2 border-black">BUAT PESANAN BARU</Button>
                </Link>
              </Card>
            )}

          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};
