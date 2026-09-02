import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Display } from '../../../../components/ui/Display';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { Search, FileText, ShieldCheck, ArrowRight, UserCheck, Radio } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { apiFetch, getPublicRecentTransactions, type UserTransactionItem, type PublicRecentTransactionItem } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';

export const TransactionHistoryPage: React.FC = () => {
  const [invoiceId, setInvoiceId] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId.trim()) return;
    navigate(`/invoice/${invoiceId.trim()}`);
  };

  // 1. Fetch 10 Transaksi Real Terbaru Publik (Live Stream)
  const { data: publicRecentData = [], isLoading: isPublicLoading } = useQuery<PublicRecentTransactionItem[]>({
    queryKey: ['publicRecentTransactions'],
    queryFn: getPublicRecentTransactions,
    staleTime: 20 * 1000,
    refetchInterval: 30 * 1000,
  });

  // 2. Fetch real user transactions if user is logged in
  const { data: transactionsData, isLoading } = useQuery<{ data?: UserTransactionItem[] } | UserTransactionItem[]>({
    queryKey: queryKeys.user.transactions.byUser(user?.id ?? 0),
    queryFn: () => apiFetch<any>('/user/transactions'),
    enabled: Boolean(user?.id),
    staleTime: 30 * 1000,
  });

  const transactions: UserTransactionItem[] = Array.isArray(transactionsData)
    ? transactionsData
    : transactionsData?.data || [];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays <= 7) return `${diffDays} hari lalu`;
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)] font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 text-left">
        {/* Title Section */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3] text-[var(--nb-text)]" />
            <Display size="md" highlight="yellow" className="text-xl sm:text-3xl">
              CEK INVOICE &amp; STATUS PESANAN
            </Display>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--nb-text-muted)] max-w-lg">
            Masukkan nomor invoice pesanan Anda untuk mengecek status transaksi real-time secara instan tanpa perlu login.
          </p>
        </div>

        {/* Invoice Check Input Box */}
        <Card
          variant="cream"
          shadow="lg"
          borderWidth="3"
          className="bg-[var(--nb-surface-alt)] p-5 sm:p-8 mb-10 rounded-2xl"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Masukkan Nomor Invoice (Contoh: TRX-100234 atau ID Invoice)"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="bg-[var(--nb-surface)] pl-10 text-xs sm:text-sm py-3 font-bold"
              />
              <Search className="w-5 h-5 text-[var(--nb-text)] stroke-[3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <Button
              type="submit"
              variant="yellow"
              size="lg"
              className="font-black whitespace-nowrap shadow-[3px_3px_0px_0px_#000]"
            >
              <span>CEK SEKARANG</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Button>
          </form>

          <div className="flex items-center gap-2 mt-4 text-[11px] font-bold text-[var(--nb-text-muted)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Semua data pesanan dijamin aman dan dienkripsi 100% oleh sistem NETSTORE.</span>
          </div>
        </Card>

        {/* 🌟 10 TRANSAKSI TERAKHIR (PUBLIK & LIVE) */}
        <div className="mb-10 space-y-3.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[var(--nb-mint)] border-[2px] border-black shadow-[1.5px_1.5px_0px_0px_#000] flex items-center justify-center shrink-0">
                <Radio className="w-3.5 h-3.5 stroke-[3] text-black animate-pulse" />
              </div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-black m-0">
                10 TRANSAKSI TERAKHIR
              </h3>
            </div>
            <div className="flex items-center gap-1.5 bg-black text-[var(--nb-yellow)] border-[1.5px] border-black shadow-[1.5px_1.5px_0px_0px_#000] px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>LIVE STREAM</span>
            </div>
          </div>

          <Card variant="white" shadow="md" borderWidth="3" className="rounded-2xl overflow-hidden">
            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Table className="min-w-[600px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">WAKTU</TableHead>
                    <TableHead className="w-[200px]">PRODUK</TableHead>
                    <TableHead>ITEM</TableHead>
                    <TableHead className="w-[130px]">TOTAL</TableHead>
                    <TableHead className="text-right w-[110px]">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPublicLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 font-bold text-xs">
                        Memuat data transaksi terbaru...
                      </TableCell>
                    </TableRow>
                  ) : publicRecentData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 font-bold text-xs text-neutral-500">
                        Belum ada transaksi tercatat pada sistem.
                      </TableCell>
                    </TableRow>
                  ) : (
                    publicRecentData.map((tx, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs text-neutral-600 font-bold whitespace-nowrap">
                          {formatRelativeTime(tx.createdAt)}
                        </TableCell>
                        <TableCell className="font-black text-xs uppercase text-black">
                          <div className="flex items-center gap-2">
                            {tx.gameThumbnail ? (
                              <img
                                src={tx.gameThumbnail}
                                alt={tx.gameName}
                                referrerPolicy="no-referrer"
                                className="w-6 h-6 rounded-md border-[1.5px] border-black object-contain bg-[var(--nb-surface-alt)] shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span className="truncate max-w-[150px]">{tx.gameName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-xs uppercase text-neutral-800 truncate max-w-[180px]">
                          {tx.productName}
                        </TableCell>
                        <TableCell className="font-mono font-black text-xs text-black whitespace-nowrap">
                          {formatRupiah(tx.amount)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Badge
                            variant={
                              tx.orderStatus === 'SUCCESS'
                                ? 'mint'
                                : tx.orderStatus === 'PROCESS'
                                  ? 'yellow'
                                  : tx.orderStatus === 'PENDING'
                                    ? 'purple'
                                    : 'pink'
                            }
                            size="sm"
                            className="font-black border-[1.5px] border-black shadow-[1px_1px_0px_0px_#000]"
                          >
                            {tx.orderStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Real User Transactions List if Logged In */}
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600 stroke-[3]" />
                RIWAYAT TRANSAKSI AKUN ANDA ({transactions.length})
              </h3>
              <Link to="/dashboard" className="text-xs font-black text-black underline">
                Buka User Dashboard
              </Link>
            </div>

            <Card variant="white" shadow="md" borderWidth="3" className="rounded-2xl overflow-hidden">
              <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <Table className="min-w-[600px] w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>INVOICE ID</TableHead>
                      <TableHead>PRODUK</TableHead>
                      <TableHead>TANGGAL</TableHead>
                      <TableHead>TOTAL</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">AKSI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 font-bold text-xs">
                          Memuat data riwayat pesanan...
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 font-bold text-xs text-neutral-500">
                          Belum ada riwayat transaksi pada akun Anda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-mono font-black text-xs text-black">
                            {tx.providerRef || `TRX-${tx.id}`}
                          </TableCell>
                          <TableCell className="font-bold text-xs uppercase">
                            {tx.product?.name || `Produk #${tx.productId}`}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-neutral-600 whitespace-nowrap">
                            {formatDate(tx.createdAt)}
                          </TableCell>
                          <TableCell className="font-mono font-black text-xs text-black whitespace-nowrap">
                            {formatRupiah(tx.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={tx.orderStatus === 'SUCCESS' ? 'mint' : tx.orderStatus === 'PROCESS' ? 'yellow' : 'pink'} size="sm">
                              {tx.orderStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/invoice/${tx.providerRef || tx.id}`}>
                              <Button variant="yellow" size="sm" className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]">
                                CEK
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        ) : (
          <Card variant="white" shadow="md" borderWidth="3" className="p-6 text-center space-y-3 rounded-2xl">
            <div className="text-xs font-black uppercase text-neutral-600">INGIN MENGAKSES SEMUA PESANAN ANDA DENGAN MUDAH?</div>
            <p className="text-xs text-neutral-500 font-bold max-w-md mx-auto">
              Silakan login ke akun NETSTORE Anda untuk melihat seluruh histori pesanan, saldo akun, dan status transaksi Anda secara otomatis.
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="yellow" size="md" className="font-black text-xs shadow-[2px_2px_0px_0px_#000]">
                  MASUK KE AKUN USER
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

