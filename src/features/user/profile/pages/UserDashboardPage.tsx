import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Stat } from '../../../../components/ui/Stat';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { Avatar } from '../../../../components/ui/Avatar';
import { Callout } from '../../../../components/ui/Callout';
import {
  Wallet,
  History,
  ShieldCheck,
  Zap,
  RefreshCw,
  PlusCircle,
  Copy,
  Check,
  CheckCircle,
  User,
  Key,
  Award,
  AlertCircle,
  Share2,
  Edit3,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, type UserProfile } from '../../../../contexts/AuthContext';
import {
  apiFetch,
  updateUserProfile,
  getUserMutations,
  requestUserApiKey,
  getUserLevelUpgradeInfo,
  upgradeUserLevel,
  type UserTransactionItem,
} from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { queryClient } from '../../../../services/queryClient';
import { UserDepositSection } from '../components/UserDepositSection';

export const UserDashboardPage: React.FC = () => {
  const { user: authUser, isLoading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedReff, setCopiedReff] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form states untuk update profil
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Redirect jika belum login
  React.useEffect(() => {
    if (!authLoading && !authUser) {
      navigate('/login');
    }
  }, [authUser, authLoading, navigate]);

  // Set default form values saat user loaded
  React.useEffect(() => {
    if (authUser) {
      setFullname(authUser.fullname || '');
      setEmail(authUser.email || '');
      setPhone(authUser.phone || '');
    }
  }, [authUser]);

  const userId = authUser?.id;

  // 1. Fetch Real-time Profile via TanStack Query
  const { data: profileData } = useQuery<UserProfile | null>({
    queryKey: queryKeys.user.profile,
    queryFn: async () => {
      const res = await apiFetch<UserProfile>('/user/me');
      return res || null;
    },
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });

  const user: UserProfile = profileData || authUser || {
    id: 0,
    username: '',
    balance: 0,
    role: 'USER',
    level: 'MEMBER',
    apiStatus: 'NONE',
  };

  // 2. Fetch Transactions via TanStack Query
  const {
    data: transactionsData,
    isLoading: isFetchingTx,
    refetch: refetchTx,
  } = useQuery<any>({
    queryKey: queryKeys.user.transactions.byUser(userId ?? 0),
    queryFn: () => apiFetch<any>('/user/transactions'),
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });

  const transactions: UserTransactionItem[] = Array.isArray(transactionsData)
    ? transactionsData
    : transactionsData?.data || [];

  const totalTransactions = typeof transactionsData?.total === 'number'
    ? transactionsData.total
    : transactions.length;

  // 3. Fetch Balance Mutations via TanStack Query
  const {
    data: mutationsData,
    isLoading: isFetchingMutations,
    refetch: refetchMutations,
  } = useQuery<any>({
    queryKey: queryKeys.user.mutations.byUser(userId ?? 0),
    queryFn: () => getUserMutations(),
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });

  const mutations: any[] = Array.isArray(mutationsData)
    ? mutationsData
    : mutationsData?.data || [];

  // Mutation Update Profile
  const updateProfileMutation = useMutation({
    mutationFn: () => updateUserProfile({ fullname, email, phone }),
    onSuccess: async (res: any) => {
      setProfileMsg({ text: res?.message || 'Profil berhasil diperbarui!', type: 'success' });
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
    onError: (err: any) => {
      setProfileMsg({ text: err.message || 'Gagal memperbarui profil', type: 'error' });
    },
  });

  // Query info Level Upgrade
  const {
    data: levelUpgradeInfo,
    isLoading: isFetchingLevelInfo,
  } = useQuery({
    queryKey: queryKeys.user.levelUpgradeInfo,
    queryFn: () => getUserLevelUpgradeInfo(),
    enabled: Boolean(userId),
    staleTime: 10 * 1000,
  });

  // Mutation Upgrade Level Mandiri via Saldo
  const levelUpgradeMutation = useMutation({
    mutationFn: (expectedLevel?: string) => upgradeUserLevel(expectedLevel),
    onSuccess: async (res: any) => {
      setProfileMsg({ text: res?.message || 'Selamat! Akun Anda berhasil di-upgrade!', type: 'success' });
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.mutations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.levelUpgradeInfo });
    },
    onError: (err: any) => {
      setProfileMsg({ text: err.message || 'Gagal melakukan upgrade level', type: 'error' });
    },
  });

  // Mutation Request API Key
  const requestApiKeyMutation = useMutation({
    mutationFn: () => requestUserApiKey(),
    onSuccess: async (res: any) => {
      setProfileMsg({ text: res?.message || 'Pengajuan API Key berhasil dikirim!', type: 'success' });
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
    onError: (err: any) => {
      setProfileMsg({ text: err.message || 'Gagal mengajukan API Key', type: 'error' });
    },
  });

  if (authLoading || !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brutalist-grid">
        <span className="font-black text-xl uppercase tracking-wider text-[var(--nb-text)]">
          MEMUAT DASHBOARD PENGGUNA...
        </span>
      </div>
    );
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };

  const handleCopy = (text: string, type: 'key' | 'reff') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedReff(true);
      setTimeout(() => setCopiedReff(false), 2000);
    }
  };

  const handleOpenDepositTab = () => {
    setActiveTab('deposit');
    const tabEl = document.getElementById('user-dashboard-tabs');
    if (tabEl) {
      tabEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)] font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        {/* User Profile Header Box */}
        <Card variant="yellow" shadow="xl" className="p-6 md:p-8 mb-8 border-[4px] rounded-3xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar
                fallback={user.username.substring(0, 2).toUpperCase()}
                variant="pink"
                size="lg"
                className="border-[3px] border-black shadow-[3px_3px_0px_0px_#000]"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black uppercase text-black m-0">{user.username}</h1>
                  <Badge variant={user.level === 'VIP' ? 'pink' : user.level === 'RESELLER' ? 'purple' : 'mint'} size="sm">
                    {user.level} MEMBER
                  </Badge>
                  {user.verified && (
                    <Badge variant="mint" size="sm" className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 stroke-[3]" /> VERIFIED
                    </Badge>
                  )}
                  {user.role === 'ADMIN' && (
                    <Badge variant="yellow" size="sm">ADMIN</Badge>
                  )}
                </div>
                <p className="text-xs font-bold text-black/80 font-mono">
                  {user.fullname ? `${user.fullname} • ` : ''}
                  {user.email || user.phone || 'Belum Melengkapi Kontak'} • Member ID: #{user.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="pink" size="md" onClick={handleOpenDepositTab} className="font-black text-xs shadow-[3px_3px_0px_0px_#000]">
                <PlusCircle className="w-4 h-4 stroke-[3]" />
                DEPOSIT SALDO
              </Button>
              <Link to="/">
                <Button variant="white" size="md" className="font-black text-xs shadow-[3px_3px_0px_0px_#000]">
                  <Zap className="w-4 h-4 fill-black stroke-[2]" />
                  TOP UP BARU
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* 4 Metric Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Stat
            label="SALDO NETSTORE"
            value={formatRupiah(user.balance || 0)}
            subtext="Tersedia untuk transaksi instan"
            badge="SALDO"
            badgeTone="yellow"
            icon={<Wallet className="w-5 h-5 text-black stroke-[3]" />}
            variant="white"
          />

          <Stat
            label="POIN REWARD"
            value={`${(user.points || 0).toLocaleString('id-ID')} Pts`}
            subtext="Dapat dikumpulkan dari transaksi"
            badge="POIN"
            badgeTone="mint"
            icon={<Award className="w-5 h-5 text-black stroke-[3]" />}
            variant="white"
          />

          <Stat
            label="TOTAL PESANAN"
            value={`${totalTransactions} Transaction`}
            subtext={`${transactions.filter((t) => t.orderStatus === 'SUCCESS').length} Berhasil • ${transactions.filter((t) => t.orderStatus === 'PENDING').length} Pending`}
            badge="HISTORI"
            badgeTone="purple"
            icon={<History className="w-5 h-5 text-black stroke-[3]" />}
            variant="white"
          />

          <Stat
            label="KODE REFERRAL"
            value={user.referralCode || '-'}
            subtext="Bagikan kode referral ke teman"
            badge="KODE"
            badgeTone="pink"
            icon={<Share2 className="w-5 h-5 text-black stroke-[3]" />}
            variant="white"
          />
        </div>

        {/* Dashboard Tabs & Content */}
        <div id="user-dashboard-tabs">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-auto gap-2 p-2 bg-neutral-900 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
              <TabsTrigger value="overview" className="font-black text-xs uppercase cursor-pointer">RINGKASAN</TabsTrigger>
              <TabsTrigger value="transactions" className="font-black text-xs uppercase cursor-pointer">TRANSAKSI ({totalTransactions})</TabsTrigger>
              <TabsTrigger value="mutations" className="font-black text-xs uppercase cursor-pointer">MUTASI SALDO ({mutations.length})</TabsTrigger>
              <TabsTrigger value="deposit" className="font-black text-xs uppercase cursor-pointer">ISI SALDO & HISTORI</TabsTrigger>
              <TabsTrigger value="api" className="font-black text-xs uppercase cursor-pointer">DEVELOPER API</TabsTrigger>
              <TabsTrigger value="settings" className="font-black text-xs uppercase cursor-pointer">PENGATURAN PROFIL</TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview">
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* RINGKASAN PROFIL */}
                  <Card variant="white" shadow="lg" borderWidth="3" className="rounded-2xl p-5 space-y-4">
                    <CardHeader headerBg="#00F0FF" className="border-b-[3px] border-black flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-black">
                        <User className="w-4 h-4 stroke-[3]" />
                        INFORMASI AKUN PENGGUNA
                      </CardTitle>
                      <Button variant="white" size="sm" onClick={() => setActiveTab('settings')} className="text-[10px] font-black py-1 px-2">
                        <Edit3 className="w-3 h-3 mr-1" /> EDIT PROFIL
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-neutral-200">
                        <span className="font-bold text-neutral-500 uppercase">Username:</span>
                        <span className="font-black font-mono text-black">{user.username}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-neutral-200">
                        <span className="font-bold text-neutral-500 uppercase">Nama Lengkap:</span>
                        <span className="font-black text-black">{user.fullname || 'Belum diisi'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-neutral-200">
                        <span className="font-bold text-neutral-500 uppercase">Email:</span>
                        <span className="font-bold font-mono text-black">{user.email || 'Belum diisi'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-neutral-200">
                        <span className="font-bold text-neutral-500 uppercase">No. WhatsApp:</span>
                        <span className="font-bold font-mono text-black">{user.phone || 'Belum diisi'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-neutral-200">
                        <span className="font-bold text-neutral-500 uppercase">Kode Referral:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-black font-mono text-black">{user.referralCode || '-'}</span>
                          {user.referralCode && (
                            <button
                              onClick={() => handleCopy(user.referralCode!, 'reff')}
                              className="p-1 hover:bg-neutral-200 rounded transition-colors"
                              title="Salin Kode Referral"
                            >
                              {copiedReff ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 text-black stroke-[2.5]" />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="font-bold text-neutral-500 uppercase">Tanggal Terdaftar:</span>
                        <span className="font-mono text-black">{formatDate(user.createdAt || '')}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CARD UPGRADE LEVEL MEMBERSHIP */}
                  <Card variant="white" shadow="lg" borderWidth="3" className="rounded-2xl space-y-4">
                    <CardHeader headerBg="var(--nb-mint)" className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-[var(--nb-text)]">
                        <Award className="w-4 h-4 stroke-[3]" />
                        KEANGGOTAAN & UPGRADE LEVEL AKUN
                      </CardTitle>
                      <Badge variant={user.level === 'VIP' ? 'pink' : user.level === 'RESELLER' ? 'purple' : 'mint'} size="sm">
                        LEVEL: {user.level}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {isFetchingLevelInfo ? (
                        <div className="text-center py-4 text-xs font-bold text-[var(--nb-text-muted)]">
                          Memuat data level membership...
                        </div>
                      ) : !levelUpgradeInfo ? null : user.level === 'VIP' ? (
                        <Callout tone="mint" title="LEVEL TERTINGGI (VIP MEMBER)" icon={<ShieldCheck className="w-5 h-5 stroke-[3] shrink-0" />}>
                          Selamat! Anda sudah berada di tingkat keanggotaan tertinggi. Anda menikmati harga paling murah untuk seluruh produk.
                        </Callout>
                      ) : (
                        <div className="space-y-3 text-xs text-left">
                          <div className="p-3 border-[3px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] font-mono space-y-1.5">
                            <div className="flex justify-between">
                              <span className="font-bold text-[var(--nb-text-muted)] font-sans uppercase">Level Saat Ini:</span>
                              <span className="font-black font-sans text-[var(--nb-text)]">{levelUpgradeInfo.currentLevel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold text-[var(--nb-text-muted)] font-sans uppercase">Level Berikutnya:</span>
                              <span className="font-black font-sans text-[var(--nb-text)]">{levelUpgradeInfo.nextLevel}</span>
                            </div>
                            <div className="flex justify-between border-t-[2px] border-[var(--nb-border)] pt-1.5">
                              <span className="font-bold text-[var(--nb-text-muted)] font-sans uppercase">Biaya Upgrade:</span>
                              <span className="font-black text-[var(--nb-text)]">{formatRupiah(levelUpgradeInfo.upgradePrice)}</span>
                            </div>
                          </div>

                          {!levelUpgradeInfo.enabled ? (
                            <Callout tone="pink" title="PEMBERITAHUAN">
                              Fitur upgrade level mandiri saat ini sedang dinonaktifkan oleh Admin.
                            </Callout>
                          ) : levelUpgradeInfo.canUpgrade ? (
                            <Button
                              variant="mint"
                              size="md"
                              onClick={() => levelUpgradeMutation.mutate(levelUpgradeInfo.currentLevel)}
                              disabled={levelUpgradeMutation.isPending}
                              className="w-full font-black text-xs py-2.5"
                            >
                              <Award className="w-4 h-4 mr-1 stroke-[3]" />
                              <span>
                                {levelUpgradeMutation.isPending
                                  ? 'MEMPROSES UPGRADE...'
                                  : `NAIK KE ${levelUpgradeInfo.nextLevel} (${formatRupiah(levelUpgradeInfo.upgradePrice)})`}
                              </span>
                            </Button>
                          ) : (
                            <Callout tone="warning" title="SALDO TIDAK MENCUKUPI">
                              <div className="space-y-2">
                                <p className="m-0 font-bold">
                                  Saldo Anda ({formatRupiah(user.balance || 0)}) tidak mencukupi untuk upgrade ke {levelUpgradeInfo.nextLevel}. Kurang <b>{formatRupiah(levelUpgradeInfo.shortfall)}</b> (Biaya: {formatRupiah(levelUpgradeInfo.upgradePrice)}).
                                </p>
                                <Button
                                  variant="yellow"
                                  size="sm"
                                  onClick={handleOpenDepositTab}
                                  className="w-full font-black text-xs py-2"
                                >
                                  <PlusCircle className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                                  <span>ISI SALDO SEKARANG</span>
                                </Button>
                              </div>
                            </Callout>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* QUICK ACTIONS & API STATUS */}
                  <Card variant="white" shadow="lg" borderWidth="3" className="rounded-2xl p-5 space-y-4">
                    <CardHeader headerBg="#FFDC00" className="border-b-[3px] border-black">
                      <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-black">
                        <Key className="w-4 h-4 stroke-[3]" />
                        AKSES API DEVELOPER & STATUS AKUN
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="p-3 bg-neutral-100 border-[2.5px] border-black rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase text-neutral-600">Status Akses API:</span>
                          <Badge variant={user.apiStatus === 'APPROVED' ? 'mint' : user.apiStatus === 'PENDING' ? 'yellow' : 'pink'} size="sm">
                            {user.apiStatus === 'APPROVED' ? 'AKTIF (APPROVED)' : user.apiStatus === 'PENDING' ? 'PENDING REVIEW' : 'BELUM DIAJUKAN'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-neutral-600 font-bold leading-relaxed">
                          Gunakan API Key untuk melakukan integrasi transaksi otomatis dari bot WhatsApp atau website pihak ke-3.
                        </p>
                        <Button variant="cyan" size="sm" onClick={() => setActiveTab('api')} className="w-full text-xs font-black py-2 mt-1">
                          KELOLA DEVELOPER API
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button variant="pink" size="sm" onClick={handleOpenDepositTab} className="font-black text-xs py-2.5">
                          <PlusCircle className="w-3.5 h-3.5 mr-1" /> ISI SALDO AKUN
                        </Button>
                        <Link to="/daftar-harga">
                          <Button variant="white" size="sm" className="w-full font-black text-xs py-2.5">
                            DAFTAR HARGA
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 5 TRANSAKSI TERAKHIR PREVIEW */}
                <Card variant="white" shadow="lg" borderWidth="3" className="rounded-2xl overflow-hidden">
                  <CardHeader headerBg="#6EE7B7" className="border-b-[3px] border-black flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-black">
                      <History className="w-4 h-4 stroke-[3]" />
                      5 TRANSAKSI TERAKHIR
                    </CardTitle>
                    <Button variant="white" size="sm" onClick={() => setActiveTab('transactions')} className="text-[10px] font-black py-1 px-2">
                      LIHAT SEMUA ({transactions.length})
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ORDER ID</TableHead>
                          <TableHead>PRODUK</TableHead>
                          <TableHead>TANGGAL</TableHead>
                          <TableHead>TOTAL</TableHead>
                          <TableHead>STATUS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.slice(0, 5).map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-mono font-black text-xs text-black">{tx.providerRef || `TRX-${tx.id}`}</TableCell>
                            <TableCell className="font-bold text-xs uppercase">{tx.product?.name || `Produk #${tx.productId}`}</TableCell>
                            <TableCell className="font-mono text-xs text-neutral-600">{formatDate(tx.createdAt)}</TableCell>
                            <TableCell className="font-mono font-black text-xs text-black">{formatRupiah(tx.amount)}</TableCell>
                            <TableCell>
                              <Badge variant={tx.orderStatus === 'SUCCESS' ? 'mint' : tx.orderStatus === 'PROCESS' ? 'yellow' : 'pink'} size="sm">
                                {tx.orderStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {transactions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-xs font-bold text-neutral-500">
                              Belum ada transaksi.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: RIWAYAT TRANSAKSI */}
            <TabsContent value="transactions">
              <Card variant="white" shadow="lg" borderWidth="3" className="mt-4 rounded-2xl overflow-hidden">
                <CardHeader headerBg="#6EE7B7" className="border-b-[3px] border-black flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-black">
                    <History className="w-4 h-4 stroke-[3]" />
                    RIWAYAT PEMBELIAN & TOP UP PESANAN
                  </CardTitle>
                  <RefreshCw
                    className="w-4 h-4 stroke-[3] cursor-pointer hover:rotate-180 transition-transform text-black"
                    onClick={() => refetchTx()}
                  />
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
                        <TableHead>STATUS PESANAN</TableHead>
                        <TableHead className="text-right">STRUK</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isFetchingTx ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 font-black text-xs uppercase">
                            Memuat data transaksi dari server...
                          </TableCell>
                        </TableRow>
                      ) : transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 font-black text-xs text-neutral-500 uppercase">
                            Belum ada riwayat transaksi.
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((tx: UserTransactionItem) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-mono font-black text-xs text-black">
                              {tx.providerRef || `TRX-${tx.id}`}
                            </TableCell>
                            <TableCell className="font-bold text-xs uppercase">
                              {tx.product?.name || `Produk #${tx.productId}`}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-neutral-600">{formatDate(tx.createdAt)}</TableCell>
                            <TableCell className="font-mono font-black text-xs text-black">{formatRupiah(tx.amount)}</TableCell>
                            <TableCell className="font-mono text-xs uppercase font-bold text-neutral-700">{tx.paymentMethod}</TableCell>
                            <TableCell>
                              <Badge variant={tx.orderStatus === 'SUCCESS' ? 'mint' : tx.orderStatus === 'PROCESS' ? 'yellow' : 'pink'} size="sm">
                                {tx.orderStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link to={`/invoice/${tx.providerRef || tx.id}`}>
                                <Button variant="yellow" size="sm" className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]">
                                  STRUK
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: MUTASI SALDO */}
            <TabsContent value="mutations">
              <Card variant="white" shadow="lg" borderWidth="3" className="mt-4 rounded-2xl overflow-hidden">
                <CardHeader headerBg="#00F0FF" className="border-b-[3px] border-black flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-black">
                    <Wallet className="w-4 h-4 stroke-[3]" />
                    RIWAYAT MUTASI SALDO AKUN
                  </CardTitle>
                  <RefreshCw
                    className="w-4 h-4 stroke-[3] cursor-pointer hover:rotate-180 transition-transform text-black"
                    onClick={() => refetchMutations()}
                  />
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>TANGGAL</TableHead>
                        <TableHead>TIPE</TableHead>
                        <TableHead>SALDO AWAL</TableHead>
                        <TableHead>NOMINAL</TableHead>
                        <TableHead>SALDO AKHIR</TableHead>
                        <TableHead>KETERANGAN</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isFetchingMutations ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 font-black text-xs uppercase">
                            Memuat riwayat mutasi saldo...
                          </TableCell>
                        </TableRow>
                      ) : mutations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 font-black text-xs text-neutral-500 uppercase">
                            Belum ada riwayat mutasi saldo.
                          </TableCell>
                        </TableRow>
                      ) : (
                        mutations.map((m: any) => (
                          <TableRow key={m.id}>
                            <TableCell className="font-mono text-xs font-bold text-neutral-600">{formatDate(m.createdAt)}</TableCell>
                            <TableCell>
                              <Badge variant={m.type === 'IN' ? 'mint' : 'pink'} size="sm">
                                {m.type === 'IN' ? '+ MASUK' : '- KELUAR'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-neutral-700">
                              {formatRupiah(m.startingBalance || 0)}
                            </TableCell>
                            <TableCell className={`font-mono font-black text-xs ${m.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {m.type === 'IN' ? '+' : '-'} {formatRupiah(m.amount || 0)}
                            </TableCell>
                            <TableCell className="font-mono font-black text-xs text-black">
                              {formatRupiah(m.endingBalance || 0)}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-neutral-800">{m.description}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: DEPOSIT SALDO */}
            <TabsContent value="deposit">
              <div className="mt-4">
                <UserDepositSection />
              </div>
            </TabsContent>

            {/* TAB 5: DEVELOPER API */}
            <TabsContent value="api">
              <Card variant="white" shadow="lg" borderWidth="3" className="mt-4 rounded-2xl p-6">
                <CardHeader headerBg="#C4B5FD" className="border-b-[3px] border-black">
                  <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-black">
                    <Key className="w-4 h-4 stroke-[3]" />
                    INTEGRASI API DEVELOPER (BOT WHATSAPP / WEBSITE RESELLER)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 max-w-2xl">
                  {/* Status Banner */}
                  <div className="p-4 bg-neutral-900 text-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-black uppercase text-neutral-400">STATUS AKSES API</div>
                      <div className="text-base font-black uppercase text-[var(--nb-yellow)] mt-0.5">
                        {user.apiStatus === 'APPROVED' ? 'AKTIF & DISETUJUI' : user.apiStatus === 'PENDING' ? 'DALAM REVIEW ADMIN' : 'BELUM DIAJUKAN'}
                      </div>
                    </div>

                    {user.apiStatus === 'NONE' || user.apiStatus === 'REJECTED' ? (
                      <Button
                        variant="yellow"
                        size="md"
                        onClick={() => requestApiKeyMutation.mutate()}
                        disabled={requestApiKeyMutation.isPending}
                        className="font-black text-xs shadow-[2px_2px_0px_0px_#000]"
                      >
                        {requestApiKeyMutation.isPending ? 'MEMPROSES...' : 'AJUKAN API KEY SEKARANG'}
                      </Button>
                    ) : user.apiStatus === 'PENDING' ? (
                      <Badge variant="yellow" size="md" className="font-black">
                        REVIEW PENDING
                      </Badge>
                    ) : (
                      <Badge variant="mint" size="md" className="font-black">
                        APPROVED
                      </Badge>
                    )}
                  </div>

                  {/* API Key Box jika APPROVED */}
                  {user.apiStatus === 'APPROVED' && user.apiKey && (
                    <div className="p-4 bg-emerald-50 border-[3px] border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] space-y-3">
                      <label className="text-xs font-black uppercase text-emerald-950 block">API KEY ANDA (RAHASIA)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type={showApiKey ? 'text' : 'password'}
                          value={user.apiKey}
                          readOnly
                          className="bg-white font-mono text-xs font-black text-black border-[2.5px]"
                        />
                        <Button
                          variant="white"
                          size="md"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="font-black text-xs shrink-0"
                        >
                          {showApiKey ? 'SEMBUNYIKAN' : 'TAMPILKAN'}
                        </Button>
                        <Button
                          variant="yellow"
                          size="md"
                          onClick={() => handleCopy(user.apiKey!, 'key')}
                          className="font-black text-xs shrink-0"
                        >
                          {copiedKey ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
                        </Button>
                      </div>
                      <p className="text-[11px] font-bold text-emerald-900">
                        🔒 Jangan bagikan API Key Anda kepada siapapun. Gunakan header <code className="font-mono bg-emerald-200 px-1 py-0.5 rounded">X-API-KEY</code> pada setiap request API.
                      </p>
                    </div>
                  )}

                  {/* Instruksi Penggunaan */}
                  <div className="space-y-3 text-xs text-neutral-800">
                    <h4 className="font-black uppercase text-black">PETUNJUK PENGGUNAAN API:</h4>
                    <ul className="list-disc pl-5 space-y-1.5 font-bold">
                      <li>Endpoint publik harga & stok produk dapat diakses tanpa login lewat halaman Daftar Harga.</li>
                      <li>Untuk melakukan transaksi via API, saldo akun Anda akan terpotong secara otomatis.</li>
                      <li>Pengajuan API Key akan direview oleh Admin NETSTORE dalam waktu 1x24 jam.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 6: PENGATURAN PROFIL */}
            <TabsContent value="settings">
              <Card variant="white" shadow="lg" borderWidth="3" className="mt-4 rounded-2xl p-6">
                <CardHeader headerBg="#C4B5FD" className="border-b-[3px] border-black">
                  <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-black">
                    <User className="w-4 h-4 stroke-[3]" />
                    PENGATURAN PROFIL & KONTAK
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 max-w-lg">
                  {profileMsg && (
                    <div
                      className={`p-3 border-[3px] border-black rounded-xl text-xs font-black flex items-center gap-2 shadow-[3px_3px_0px_0px_#000] ${
                        profileMsg.type === 'success' ? 'bg-emerald-100 text-emerald-950' : 'bg-rose-100 text-rose-950'
                      }`}
                    >
                      {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <AlertCircle className="w-4 h-4 text-rose-600 stroke-[3]" />}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setProfileMsg(null);
                      updateProfileMutation.mutate();
                    }}
                    className="space-y-4"
                  >
                    {/* Readonly Username */}
                    <div>
                      <label className="text-xs font-black uppercase text-neutral-600 block mb-1">USERNAME (READ-ONLY)</label>
                      <Input
                        type="text"
                        value={user.username}
                        readOnly
                        className="bg-neutral-100 text-neutral-500 font-mono cursor-not-allowed border-[2.5px]"
                      />
                      <span className="text-[10px] font-bold text-neutral-500 mt-1 block">Username tidak dapat diubah setelah pendaftaran</span>
                    </div>

                    {/* Input Fullname */}
                    <div>
                      <label className="text-xs font-black uppercase text-black block mb-1">NAMA LENGKAP</label>
                      <Input
                        type="text"
                        placeholder="Masukkan nama lengkap Anda"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        className="bg-white text-xs font-bold"
                      />
                    </div>

                    {/* Input Email */}
                    <div>
                      <label className="text-xs font-black uppercase text-black block mb-1">EMAIL</label>
                      <Input
                        type="email"
                        placeholder="nama@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white text-xs font-bold"
                      />
                    </div>

                    {/* Input Phone */}
                    <div>
                      <label className="text-xs font-black uppercase text-black block mb-1">NO. WHATSAPP / TELEPON</label>
                      <Input
                        type="text"
                        placeholder="081234567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-white text-xs font-bold"
                      />
                    </div>

                    {/* Readonly Metadata */}
                    <div className="p-3 bg-neutral-50 border-[2.5px] border-black rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">Role:</span>
                        <span className="font-black font-mono text-black">{user.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">Level Harga:</span>
                        <span className="font-black font-mono text-black">{user.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">Terdaftar Pada:</span>
                        <span className="font-mono text-black">{formatDate(user.createdAt || '')}</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="yellow"
                      size="md"
                      disabled={updateProfileMutation.isPending}
                      className="w-full font-black text-xs py-3 shadow-[3px_3px_0px_0px_#000]"
                    >
                      {updateProfileMutation.isPending ? 'MENYIMPAN PERUBAHAN...' : 'SIMPAN PERUBAHAN PROFIL'}
                    </Button>
                  </form>
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
