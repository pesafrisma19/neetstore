import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Stat } from '../../../../components/ui/Stat';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { Switch } from '../../../../components/ui/Switch';
import { Textarea } from '../../../../components/ui/Textarea';
import { Avatar } from '../../../../components/ui/Avatar';
import { Wallet, History, Shield, Zap, RefreshCw, CheckCircle, Clock, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { apiFetch, type UserTransactionItem, isTransactionPaymentStatus, isTransactionOrderStatus } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { UserDepositSection } from '../components/UserDepositSection';

export const UserDashboardPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [activeTab, setActiveTab] = useState('history');

  const handleOpenDepositTab = () => {
    setActiveTab('topup');
    const tabEl = document.getElementById('user-dashboard-tabs');
    if (tabEl) {
      tabEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Protected Route Logic: HANYA redirect jika auth bootstrap selesai (!isLoading) DAN user null
  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const userId = user?.id;

  // 1. Fetch User Transactions via TanStack Query (User-Scoped Cache Key)
  // Enabled HANYA jika auth bootstrap selesai (!isLoading) DAN user.id terautentikasi
  const {
    data: transactions = [],
    isLoading: isFetchingTx,
    isError: isTxError,
    refetch: refetchTx,
  } = useQuery<UserTransactionItem[]>({
    queryKey: queryKeys.user.transactions.byUser(userId ?? 0),
    queryFn: async () => {
      const data = await apiFetch<UserTransactionItem[]>('/user/transactions');
      if (!Array.isArray(data)) {
        throw new Error('Invalid /user/transactions response: expected array');
      }
      for (const tx of data) {
        const isValidDate = typeof tx.createdAt === 'string' && !isNaN(new Date(tx.createdAt).getTime());
        const isValidProduct = tx.product === null || (
          typeof tx.product === 'object' &&
          typeof tx.product.name === 'string' &&
          typeof tx.product.sku === 'string'
        );

        if (
          typeof tx.id !== 'number' || !Number.isFinite(tx.id) ||
          typeof tx.userId !== 'number' || !Number.isFinite(tx.userId) ||
          typeof tx.productId !== 'number' || !Number.isFinite(tx.productId) ||
          typeof tx.amount !== 'number' || !Number.isFinite(tx.amount) ||
          typeof tx.paymentMethod !== 'string' ||
          !isTransactionPaymentStatus(tx.paymentStatus) ||
          !isTransactionOrderStatus(tx.orderStatus) ||
          !isValidDate ||
          !isValidProduct
        ) {
          throw new Error('Invalid /user/transactions item: malformed data type, missing fields, or unrecognized status value');
        }
      }
      return data;
    },
    enabled: !isLoading && Boolean(userId),
    staleTime: 30 * 1000,
    retry: (failureCount, error: unknown) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          return false; // Disable retry on auth error (401/403)
        }
      }
      return failureCount < 1;
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brutalist-grid">
        <span className="font-black text-2xl uppercase tracking-wider text-[var(--nb-text)]">MEMUAT PROFIL USER...</span>
      </div>
    );
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };
  
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        
        {/* User Profile Header Box */}
        <Card variant="yellow" shadow="xl" className="p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar fallback={user.username.substring(0,2).toUpperCase()} variant="pink" size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black uppercase text-[var(--nb-text)] m-0">{user.username}</h1>
                  <Badge variant="mint" size="sm">MEMBER {user.level}</Badge>
                </div>
                <p className="text-xs font-bold text-black/80 mt-1">{user.phone || 'Belum ada No HP'} • ID Member: #{user.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="pink" size="md" onClick={handleOpenDepositTab}>
                <PlusCircle className="w-4 h-4 stroke-[3]" />
                DEPOSIT SALDO
              </Button>
              <Link to="/">
                <Button variant="white" size="md">
                  <Zap className="w-4 h-4 fill-black stroke-[2]" />
                  TOP UP BARU
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Metric Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Stat
            label="SALDO NETSTORE"
            value={formatRupiah(user.balance)}
            subtext="Tersedia untuk pembayaran instan"
            badge="TOP UP"
            badgeTone="yellow"
            icon={<Wallet className="w-5 h-5 text-[var(--nb-text)] stroke-[3]" />}
            variant="white"
          />

          <Stat
            label="TOTAL TRANSAKSI"
            value={`${transactions.length} Pesanan`}
            subtext={`${transactions.filter(t => t.orderStatus === 'SUCCESS').length} Berhasil • ${transactions.filter(t => t.orderStatus === 'PENDING').length} Dalam Proses`}
            badge="AKTIF"
            badgeTone="mint"
            icon={<History className="w-5 h-5 text-[var(--nb-text)] stroke-[3]" />}
            variant="white"
          />

          <Stat
            label="POIN REWARD"
            value="1.250 Pts"
            subtext="Bisa ditukar voucher cashback"
            badge="VIP 2"
            badgeTone="purple"
            icon={<Shield className="w-5 h-5 text-[var(--nb-text)] stroke-[3]" />}
            variant="white"
          />
        </div>

        {/* Dashboard Tabs & Content */}
        <div id="user-dashboard-tabs">
          <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="history">RIWAYAT TRANSAKSI</TabsTrigger>
              <TabsTrigger value="topup">ISI SALDO AKUN</TabsTrigger>
              <TabsTrigger value="settings">PENGATURAN AKUN</TabsTrigger>
            </TabsList>

          {/* History Tab using Table Component Primitives */}
          <TabsContent value="history">
            <Card variant="white" shadow="lg" className="mt-4">
              <CardHeader headerBg="#6EE7B7">
                <CardTitle className="flex items-center justify-between w-full">
                  <span>TRANSAKSI TERAKHIR</span>
                  <RefreshCw className="w-4 h-4 stroke-[3] cursor-pointer hover:rotate-180 transition-transform" onClick={() => refetchTx()} />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>INVOICE ID</TableHead>
                      <TableHead>PRODUK</TableHead>
                      <TableHead>TANGGAL</TableHead>
                      <TableHead>TOTAL</TableHead>
                      <TableHead>PEMBAYARAN</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">AKSI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isFetchingTx ? (
                       <TableRow>
                          <TableCell colSpan={7} className="text-center font-bold py-8">Memuat data transaksi dari server...</TableCell>
                       </TableRow>
                    ) : isTxError ? (
                       <TableRow>
                          <TableCell colSpan={7} className="text-center font-bold py-8 text-red-500">
                            Gagal memuat transaksi. <button type="button" onClick={() => refetchTx()} className="underline font-black cursor-pointer">Klik untuk coba lagi</button>
                          </TableCell>
                       </TableRow>
                    ) : transactions.length === 0 ? (
                       <TableRow>
                          <TableCell colSpan={7} className="text-center font-bold py-8">Belum ada transaksi</TableCell>
                       </TableRow>
                    ) : transactions.map((tx: UserTransactionItem) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-black">{tx.providerRef || tx.id}</TableCell>
                        <TableCell className="uppercase">{tx.product?.name || `Produk #${tx.productId}`}</TableCell>
                        <TableCell className="text-[var(--nb-text-muted)]">{formatDate(tx.createdAt)}</TableCell>
                        <TableCell className="font-black">{formatRupiah(tx.amount)}</TableCell>
                        <TableCell className="uppercase font-bold">{tx.paymentMethod}</TableCell>
                        <TableCell>
                          {tx.orderStatus === 'SUCCESS' ? (
                            <Badge variant="mint" size="sm">
                              <CheckCircle className="w-3 h-3 stroke-[3]" /> BERHASIL
                            </Badge>
                          ) : (
                            <Badge variant="yellow" size="sm">
                              <Clock className="w-3 h-3 stroke-[3]" /> {tx.orderStatus}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/invoice/${tx.providerRef || tx.id}`}>
                            <Button variant="yellow" size="sm">STRUK</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Up Balance Tab */}
          <TabsContent value="topup">
            <div className="mt-4">
              <UserDepositSection />
            </div>
          </TabsContent>

          {/* Settings Tab using Switch Primitive */}
          <TabsContent value="settings">
            <Card variant="white" shadow="lg" className="mt-4">
              <CardHeader headerBg="#C4B5FD">
                <CardTitle>PENGATURAN PROFIL & KEAMANAN</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 max-w-lg">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase">Username</label>
                  <input
                    type="text"
                    defaultValue={user.username}
                    readOnly
                    className="p-2.5 border-[3px] border-[var(--nb-border)] bg-gray-100 text-xs font-bold cursor-not-allowed text-[var(--nb-text-muted)]"
                  />
                  <span className="text-[10px] font-bold text-red-500">Username tidak dapat diubah</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase">No HP / WhatsApp</label>
                  <input
                    type="text"
                    defaultValue={user.phone || ''}
                    className="p-2.5 border-[3px] border-[var(--nb-border)] bg-[var(--nb-surface)] text-xs font-bold"
                  />
                </div>

                <Textarea label="Catatan Profil / Bio" defaultValue="Gamer sejati MLBB & Valorant" />

                <div className="border-t-[2px] border-[var(--nb-border)] pt-4 flex flex-col gap-4">
                  <h4 className="text-xs font-black uppercase text-[var(--nb-text)]">NOTIFIKASI TRANSAKSI</h4>
                  <Switch
                    checked={notifyWhatsapp}
                    onChange={setNotifyWhatsapp}
                    label="KIRIM BUKTI TRANSAKSI VIA WHATSAPP"
                    tone="yellow"
                  />
                  <Switch
                    checked={notifyEmail}
                    onChange={setNotifyEmail}
                    label="KIRIM LAPORAN PROMO KE EMAIL"
                    tone="pink"
                  />
                </div>

                <Button variant="yellow" size="md">SIMPAN PERUBAHAN</Button>
              </CardContent>
            </Card>
          </TabsContent>

          </Tabs>
        </div>

      </main>

      <Footer />
    </div>
  );
};
