import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { format, differenceInSeconds } from 'date-fns';
import { id } from 'date-fns/locale';
import { Copy, ArrowLeft, Clock, CheckCircle, XCircle, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';

import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Sticker } from '../../../../components/ui/Sticker';
import { Button } from '../../../../components/ui/Button';
import { IconButton } from '../../../../components/ui/IconButton';
import { Table, TableBody, TableRow, TableCell } from '../../../../components/ui/Table';
import { Separator } from '../../../../components/ui/Separator';
import { useAuth } from '../../../../contexts/AuthContext';
import { checkoutApi } from '../services/checkout.api';

// --- Timeline Component ---
const TimelineItem = ({ 
  title, 
  active, 
  completed, 
  failed, 
  isLast 
}: { 
  title: string; 
  active?: boolean; 
  completed?: boolean; 
  failed?: boolean; 
  isLast?: boolean; 
}) => {
  return (
    <div className="flex gap-4 relative">
      {!isLast && (
        <div className={`absolute left-[11px] top-6 bottom-[-8px] w-1 border-l-[3px] border-dashed ${completed ? 'border-[var(--nb-success)]' : failed ? 'border-[var(--nb-error)]' : 'border-[var(--nb-border)]'}`}></div>
      )}
      <div className="relative z-10 flex-shrink-0 mt-0.5">
        {completed ? (
          <div className="w-6 h-6 rounded-none bg-[var(--nb-success)] border-[3px] border-[var(--nb-border)] flex items-center justify-center">
            <CheckCircle className="w-3.5 h-3.5 text-white" />
          </div>
        ) : failed ? (
          <div className="w-6 h-6 rounded-none bg-[var(--nb-error)] border-[3px] border-[var(--nb-border)] flex items-center justify-center">
            <XCircle className="w-3.5 h-3.5 text-white" />
          </div>
        ) : active ? (
          <div className="w-6 h-6 rounded-none bg-[var(--nb-yellow)] border-[3px] border-[var(--nb-border)] flex items-center justify-center animate-pulse">
            <Clock className="w-3.5 h-3.5 text-[var(--nb-text)]" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-none bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[var(--nb-border)]"></div>
          </div>
        )}
      </div>
      <div className={`pb-6 pt-0.5 ${completed || active ? 'font-black opacity-100' : failed ? 'font-black text-red-600' : 'font-bold text-[var(--nb-text-muted)] opacity-70'}`}>
        {title}
      </div>
    </div>
  );
};

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
    // Berhenti polling jika status sudah terminal (selesai/gagal/refund)
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
    
    // Jika ada expiredAt dari TokoPay, gunakan itu. Jika tidak, default 24 jam.
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
          <Card variant="dark" shadow="xl" className="max-w-md w-full p-8 text-center border-red-500">
            <h1 className="text-4xl font-black text-white mb-4 uppercase">Tidak Ditemukan</h1>
            <p className="text-sm font-bold text-gray-300 mb-8">
              Invoice ID {invoiceNumber} tidak valid atau belum terdaftar.
              {(error as any)?.message ? ` (${(error as any).message})` : ''}
            </p>
            <Link to="/">
              <Button variant="yellow" size="lg" className="w-full">KEMBALI KE BERANDA</Button>
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
  
  const expiredDate = transaction.expiredAt ? new Date(transaction.expiredAt) : new Date(new Date(transaction.createdAt).getTime() + 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Top Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 stroke-[3] mr-2" />
              KEMBALI KE BERANDA
            </Button>
          </Link>
          <div className="flex gap-2">
            <Badge variant="yellow" size="sm" className="hidden sm:inline-flex">BANTUAN CS</Badge>
          </div>
        </div>

        {/* Global Alert Banner */}
        <div className={`mb-6 p-4 border-[3px] border-[var(--nb-border)] flex items-center justify-between gap-4 shadow-[4px_4px_0px_0px_var(--nb-shadow)]
          ${isPaid ? 'bg-[var(--nb-mint)]' : isFailed ? 'bg-[var(--nb-error)] text-white' : isExpired ? 'bg-gray-400' : 'bg-[var(--nb-yellow)]'}
        `}>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight m-0">
              {isFailed ? 'PESANAN GAGAL' : isExpired ? 'KEDALUWARSA' : isPaid ? 'PEMBAYARAN BERHASIL!' : 'MENUNGGU PEMBAYARAN'}
            </h1>
            <p className={`text-sm font-bold ${isFailed ? 'text-white' : 'text-[var(--nb-text-muted)]'}`}>
              Invoice: {transaction.providerRef || transaction.id}
            </p>
          </div>
          <div className="hidden sm:block">
            <Sticker variant={ordStatus === 'SUCCESS' ? 'yellow' : isFailed ? 'purple' : ordStatus === 'PROCESS' ? 'mint' : 'white'} size="lg">
              {ordStatus === 'SUCCESS' ? 'SELESAI' : isFailed ? 'GAGAL' : ordStatus === 'PROCESS' ? 'DIPROSES' : 'PENDING'}
            </Sticker>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri (70%) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Header Informasi Dasar */}
            <Card variant="white" className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] block mb-1">Status Pembayaran</span>
                  <Badge variant={isPaid ? 'mint' : isUnpaid ? 'yellow' : 'orange'}>{payStatus}</Badge>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] block mb-1">Status Pesanan</span>
                  <Badge variant={ordStatus === 'SUCCESS' ? 'mint' : ordStatus === 'PROCESS' ? 'cyan' : ordStatus === 'FAILED' ? 'orange' : 'white'}>{ordStatus}</Badge>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] block mb-1">Tanggal Dibuat</span>
                  <span className="text-xs font-black break-words">{formatFullDate(transaction.createdAt)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] block mb-1">Batas Pembayaran</span>
                  <span className="text-xs font-black break-words">{formatFullDate(expiredDate.toISOString())}</span>
                </div>
              </div>
            </Card>

            {/* Timeline */}
            <Card variant="white" className="p-6">
              <h2 className="text-lg font-black uppercase mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 stroke-[3]" />
                Timeline Pesanan
              </h2>
              <div className="pl-2">
                <TimelineItem title="Invoice Dibuat" completed={true} />
                <TimelineItem title="Menunggu Pembayaran" completed={isPaid || isFailed} active={isUnpaid && !isExpired && !isFailed} failed={isExpired && isUnpaid} />
                <TimelineItem title="Pembayaran Berhasil" completed={isPaid} active={false} failed={isFailed && payStatus === 'REFUND'} />
                <TimelineItem title="Pesanan Dikirim ke Provider" completed={ordStatus === 'PROCESS' || ordStatus === 'SUCCESS'} active={isPaid && ordStatus === 'PENDING'} />
                <TimelineItem title={isFailed ? 'Topup Gagal' : 'Topup Berhasil'} completed={ordStatus === 'SUCCESS'} active={ordStatus === 'PROCESS'} failed={isFailed} isLast={true} />
              </div>
            </Card>

            {/* Detail Produk */}
            <Card variant="white" className="p-0 overflow-hidden">
              <div className="bg-[var(--nb-surface-alt)] p-4 border-b-[3px] border-[var(--nb-border)] flex items-center justify-between">
                 <h2 className="text-lg font-black uppercase m-0">Detail Produk</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)]">Produk</span>
                  <span className="text-sm font-extrabold uppercase">{transaction.product?.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)]">Game / Brand</span>
                  <span className="text-sm font-extrabold uppercase">{transaction.product?.category?.name || 'Voucher Game'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)]">Nomor Tujuan</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold">{transaction.targetAccount} {transaction.targetZone ? `(${transaction.targetZone})` : ''}</span>
                    <IconButton variant="white" size="sm" className="w-5 h-5 p-0.5" onClick={() => handleCopy(transaction.targetAccount, 'target')}>
                      <Copy className="w-3 h-3 stroke-[3]" />
                    </IconButton>
                    {copied === 'target' && <span className="text-[9px] font-bold text-green-700">Tersalin!</span>}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)]">Nickname</span>
                  <span className="text-sm font-bold text-[var(--nb-text-muted)] italic">- (Belum tersedia) -</span>
                </div>
              </div>
            </Card>

            {/* Khusus Admin */}
            {user?.role === 'ADMIN' && (
              <Card variant="dark" className="p-0 overflow-hidden border-yellow-500">
                <div className="bg-yellow-500 p-3 flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5 text-black stroke-[3]" />
                   <h2 className="text-sm font-black uppercase text-black m-0">ADMIN ONLY DEBUG VIEW</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Digiflazz SKU</span>
                    <span className="text-xs font-mono">{transaction.product?.digiflazzSku || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Provider Ref</span>
                    <span className="text-xs font-mono">{transaction.providerRef || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Serial Number (SN)</span>
                    <span className="text-xs font-mono text-green-400">{transaction.sn || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Provider Message</span>
                    <span className="text-xs font-mono text-red-400">{transaction.providerMessage || '-'}</span>
                  </div>
                </div>
              </Card>
            )}

          </div>

          {/* Kolom Kanan (30%) */}
          <div className="flex flex-col gap-8">
            
            {/* Box QRIS / Instruksi Pembayaran */}
            {isUnpaid && !isExpired && !isFailed && (
              <Card variant="yellow" className="p-6 text-center shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4">SELESAIKAN PEMBAYARAN</h3>
                
                {timeLeft !== null && (
                  <div className="mb-6">
                    <span className="text-[10px] font-black uppercase block mb-1">Sisa Waktu</span>
                    <div className="text-3xl font-black tabular-nums tracking-tighter text-red-600">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                )}

                {/* QRIS Renderer */}
                {transaction.paymentMethod === 'QRIS' && transaction.paymentUrl && !transaction.paymentUrl.startsWith('http') && (
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="bg-white p-3 border-[3px] border-[var(--nb-border)]">
                      <QRCodeSVG value={transaction.paymentUrl} size={180} level="H" includeMargin={false} />
                    </div>
                    <Badge variant="white" className="w-full justify-center">Scan via BCA / Gopay / OVO / Dana</Badge>
                  </div>
                )}

                {/* HTTP Redirect Renderer */}
                {transaction.paymentUrl && transaction.paymentUrl.startsWith('http') && (
                  <div className="mb-6">
                    <a href={transaction.paymentUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="cyan" size="lg" className="w-full">
                        BAYAR SEKARANG DI SINI
                        <ChevronRight className="w-4 h-4 stroke-[3] ml-2" />
                      </Button>
                    </a>
                  </div>
                )}

                {/* Tanpa URL / Fallback */}
                {!transaction.paymentUrl && transaction.paymentMethod === 'QRIS' && (
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="bg-white p-3 border-[3px] border-[var(--nb-border)]">
                      <QRCodeSVG value={transaction.providerRef} size={180} level="M" />
                    </div>
                    <p className="text-xs font-bold">Harap scan kode di atas.</p>
                  </div>
                )}

                <Separator className="my-4 bg-[var(--nb-border)]" />
                
                <p className="text-xs font-bold text-[var(--nb-text-muted)] mb-4">
                  Pastikan nominal sesuai hingga 3 digit terakhir agar pembayaran otomatis dikonfirmasi.
                </p>
                
              </Card>
            )}

            {/* Expired State */}
            {isExpired && (
              <Card variant="dark" className="p-6 text-center text-white">
                <AlertTriangle className="w-12 h-12 stroke-[2] text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-black uppercase mb-2">WAKTU HABIS</h3>
                <p className="text-sm font-bold text-gray-400 mb-6">Metode pembayaran ini sudah kadaluwarsa.</p>
                <Link to="/">
                  <Button variant="yellow" className="w-full">BUAT PESANAN BARU</Button>
                </Link>
              </Card>
            )}

            {/* Ringkasan Harga */}
            <Card variant="white" className="p-0 overflow-hidden">
               <div className="bg-[var(--nb-surface-alt)] p-4 border-b-[3px] border-[var(--nb-border)]">
                 <h2 className="text-base font-black uppercase m-0 text-center">Ringkasan Harga</h2>
               </div>
               <div className="p-6">
                 <Table>
                   <TableBody>
                     <TableRow className="border-b-0">
                       <TableCell className="font-bold text-sm px-0 py-2">Harga Dasar</TableCell>
                       <TableCell className="text-right font-black text-sm px-0 py-2">
                         {formatRupiah((transaction.basePrice || transaction.amount) - (transaction.feeAmount || 0))}
                       </TableCell>
                     </TableRow>
                     <TableRow className="border-b-0">
                       <TableCell className="font-bold text-sm px-0 py-2">Biaya Admin</TableCell>
                       <TableCell className="text-right font-black text-sm px-0 py-2">
                         {formatRupiah(transaction.feeAmount || 0)}
                       </TableCell>
                     </TableRow>
                     {transaction.discountAmount > 0 && (
                       <TableRow className="border-b-0">
                         <TableCell className="font-bold text-sm px-0 py-2 text-[var(--nb-success)]">Diskon Promo</TableCell>
                         <TableCell className="text-right font-black text-sm px-0 py-2 text-[var(--nb-success)]">
                           -{formatRupiah(transaction.discountAmount)}
                         </TableCell>
                       </TableRow>
                     )}
                   </TableBody>
                 </Table>
                 
                 <Separator className="my-4 border-[2px] border-dashed" />
                 
                 <div className="flex items-center justify-between">
                   <span className="font-black text-sm uppercase">Total Bayar</span>
                   <span className="font-black text-2xl text-red-600 tracking-tighter">
                     {formatRupiah(transaction.amount)}
                   </span>
                 </div>
                 
                 {/* Copy Button for Exact Amount */}
                 {isUnpaid && !isExpired && (
                   <div className="mt-4 flex items-center justify-between p-2 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)]">
                      <span className="text-xs font-black px-2">{transaction.amount}</span>
                      <Button variant="cyan" size="sm" onClick={() => handleCopy(transaction.amount.toString(), 'amount')}>
                         SALIN
                      </Button>
                   </div>
                 )}
               </div>
            </Card>

          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};
