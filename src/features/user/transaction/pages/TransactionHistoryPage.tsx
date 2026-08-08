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
import { Search, FileText, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { apiFetch, type UserTransactionItem } from '../../../../utils/api';
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

  // Fetch real user transactions if user is logged in
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

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)] font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        {/* Title Section */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-8 h-8 stroke-[3] text-[var(--nb-text)]" />
            <Display size="md" highlight="yellow">
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
          className="bg-[var(--nb-surface-alt)] p-6 sm:p-8 mb-10 rounded-2xl"
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

        {/* Real User Transactions List if Logged In */}
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600 stroke-[3]" />
                RIWAYAT TRANSAKSI AKUN ANDA ({transactions.length})
              </h3>
              <Link to="/dashboard" className="text-xs font-black text-black underline">
                Buka User Dashboard
              </Link>
            </div>

            <Card variant="white" shadow="md" borderWidth="3" className="rounded-2xl overflow-hidden">
              <Table>
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
                        <TableCell className="font-mono text-xs text-neutral-600">
                          {formatDate(tx.createdAt)}
                        </TableCell>
                        <TableCell className="font-mono font-black text-xs text-black">
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
