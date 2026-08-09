import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../../services/queryKeys';
import {
  getAdminUserDetail,
  approveAdminApiKey,
  rejectAdminApiKey,
  getAdminUserWhitelists,
  addAdminUserWhitelist,
  deleteAdminUserWhitelist,
} from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import {
  User,
  History,
  ShoppingBag,
  X,
  Phone,
  Mail,
  DollarSign,
  Key,
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { AdjustBalanceModal } from './AdjustBalanceModal';

interface UserDetailModalProps {
  userId: number;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, onClose }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'MUTATIONS' | 'TRANSACTIONS' | 'DEPOSITS'>('MUTATIONS');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiMsg, setApiMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.users.detail(userId),
    queryFn: () => getAdminUserDetail(userId),
  });

  const approveMutation = useMutation({
    mutationFn: () => approveAdminApiKey(userId),
    onSuccess: (res) => {
      setApiMsg({ text: res?.message || 'API Key berhasil disetujui & digenerate!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.detail(userId) });
    },
    onError: (err: any) => {
      setApiMsg({ text: err?.message || 'Gagal menyetujui API Key', type: 'error' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectAdminApiKey(userId),
    onSuccess: (res) => {
      setApiMsg({ text: res?.message || 'Pengajuan API Key telah ditolak.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.detail(userId) });
    },
    onError: (err: any) => {
      setApiMsg({ text: err?.message || 'Gagal menolak API Key', type: 'error' });
    },
  });

  // Admin IP Whitelist States & Query
  const [adminNewIp, setAdminNewIp] = useState('');
  const [adminIpMsg, setAdminIpMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { data: adminWhitelistsData = [] } = useQuery<any[]>({
    queryKey: queryKeys.admin.users.whitelists(userId),
    queryFn: async (): Promise<any[]> => {
      const res = await getAdminUserWhitelists(userId);
      return Array.isArray(res) ? res : [];
    },
    enabled: Boolean(userId),
    staleTime: 10 * 1000,
  });

  const addAdminIpMutation = useMutation({
    mutationFn: (ip: string) => addAdminUserWhitelist(userId, ip),
    onSuccess: () => {
      setAdminIpMsg({ text: 'IP Whitelist berhasil ditambahkan oleh Admin!', type: 'success' });
      setAdminNewIp('');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.whitelists(userId) });
    },
    onError: (err: any) => {
      setAdminIpMsg({ text: err.message || 'Gagal menambahkan IP Whitelist', type: 'error' });
    },
  });

  const deleteAdminIpMutation = useMutation({
    mutationFn: (whitelistId: number) => deleteAdminUserWhitelist(userId, whitelistId),
    onSuccess: () => {
      setAdminIpMsg({ text: 'IP Whitelist berhasil dihapus oleh Admin!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.whitelists(userId) });
    },
    onError: (err: any) => {
      setAdminIpMsg({ text: err.message || 'Gagal menghapus IP Whitelist', type: 'error' });
    },
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white border-[4px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_#000] font-black text-sm uppercase">
          Memuat Detail User #{userId}...
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white border-[4px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_#000] text-center space-y-4 max-w-sm">
          <div className="text-rose-600 font-black text-sm uppercase">
            ⚠️ {(error as any)?.message || 'Gagal memuat detail user'}
          </div>
          <Button variant="white" size="sm" onClick={onClose}>TUTUP</Button>
        </div>
      </div>
    );
  }

  const { user, mutations = [], transactions = [], deposits = [], stats } = data as any;

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
        <div className="w-full max-w-5xl max-h-[90vh] my-auto overflow-y-auto">
          <Card variant="white" shadow="xl" borderWidth="4" className="rounded-3xl overflow-hidden text-left font-sans">
            <CardHeader headerBg="#00F0FF" className="border-b-[4px] border-black flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-black font-black text-base">
                <User className="w-5 h-5 stroke-[3]" />
                <span>DETAIL USER #{user.id} — {user.username.toUpperCase()}</span>
              </CardTitle>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[3] text-black" />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* PROFILE SUMMARY HEADER */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CARD 1: IDENTITAS */}
                <div className="p-4 bg-yellow-50 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between border-b-2 border-black/20 pb-2">
                    <span className="text-[10px] font-black uppercase text-neutral-500">IDENTITAS PENGGUNA</span>
                    <Badge variant={user.role === 'ADMIN' ? 'yellow' : 'cyan'} size="sm">{user.role}</Badge>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="font-black text-sm font-sans text-black">{user.username}</div>
                    {user.fullname && <div className="font-extrabold text-xs text-neutral-800 font-sans">{user.fullname}</div>}
                    <div className="flex items-center gap-1.5 text-neutral-700">
                      <Mail className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                      <span className="truncate">{user.email || 'Tanpa Email'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-700">
                      <Phone className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                      <span>{user.phone || 'Tanpa No. HP'}</span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: FINANSIAL & AKSI */}
                <div className="p-4 bg-neutral-900 text-white border-[3px] border-black shadow-[3px_3px_0px_0px_#000] rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-neutral-400 block mb-1">TOTAL SALDO AKUN</span>
                    <div className="text-xl font-black font-mono text-[var(--nb-yellow)]">
                      Rp {(user.balance || 0).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] font-bold text-neutral-300 mt-1 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span>Poin Loyalti: <b>{(user.points || 0).toLocaleString('id-ID')} Pts</b></span>
                    </div>
                  </div>

                  <Button
                    variant="yellow"
                    size="sm"
                    onClick={() => setShowAdjustModal(true)}
                    className="w-full font-black text-xs py-2 h-auto shadow-[2px_2px_0px_0px_#000]"
                  >
                    <DollarSign className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                    <span>ADJUST SALDO MANUAL</span>
                  </Button>
                </div>

                {/* CARD 3: STATUS AKUN & METADATA */}
                <div className="p-4 bg-cyan-50 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between border-b-2 border-black/20 pb-2">
                    <span className="text-[10px] font-black uppercase text-neutral-500">LEVEL & STATUS</span>
                    <Badge variant={user.isActive ? 'mint' : 'pink'} size="sm">
                      {user.isActive ? 'Status Akun: Aktif' : 'Status Akun: Nonaktif'}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 font-extrabold uppercase">Level Harga:</span>
                      <Badge variant={user.level === 'VIP' ? 'pink' : user.level === 'RESELLER' ? 'purple' : 'mint'} size="sm">
                        {user.level}
                      </Badge>
                    </div>
                    {user.verified && (
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 font-extrabold uppercase">Verifikasi:</span>
                        <Badge variant="mint" size="sm" className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 stroke-[3]" /> AKUN TERVERIFIKASI
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-neutral-500 font-extrabold uppercase">Kode Reff:</span>
                      <span className="font-mono font-bold">{user.referralCode || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-neutral-500 font-extrabold uppercase">Terdaftar:</span>
                      <span className="font-mono font-bold">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEVELOPER API SECTION */}
              <div className="p-4 bg-neutral-100 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-black stroke-[3]" />
                    <span className="text-xs font-black uppercase text-black">AKSES DEVELOPER API KEY</span>
                  </div>
                  <Badge variant={user.apiStatus === 'APPROVED' ? 'mint' : user.apiStatus === 'PENDING' ? 'yellow' : 'pink'} size="sm">
                    API STATUS: {user.apiStatus}
                  </Badge>
                </div>

                {apiMsg && (
                  <div
                    className={`p-2.5 border-[2px] border-black rounded-xl text-xs font-black flex items-center gap-2 ${
                      apiMsg.type === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {apiMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 stroke-[3]" /> : <CheckCircle className="w-4 h-4 shrink-0 stroke-[3]" />}
                    <span>{apiMsg.text}</span>
                  </div>
                )}

                {user.apiStatus === 'APPROVED' && user.apiKey ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={user.apiKey}
                        readOnly
                        className="bg-white font-mono text-xs font-black border-[2px]"
                      />
                      <Button
                        variant="white"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="font-black text-xs shrink-0"
                      >
                        {showApiKey ? 'SEMBUNYIKAN' : 'TAMPILKAN'}
                      </Button>
                      <Button
                        variant="yellow"
                        size="sm"
                        onClick={() => handleCopyKey(user.apiKey!)}
                        className="font-black text-xs shrink-0"
                      >
                        {copiedKey ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
                      </Button>
                    </div>
                  </div>
                ) : user.apiStatus === 'PENDING' ? (
                  <div className="p-3 bg-yellow-50 border-[2px] border-black rounded-xl space-y-3">
                    <p className="text-xs font-bold text-yellow-900 m-0">
                      ⚠️ User ini mengajukan akses Developer API Key. Silakan tinjau dan pilih tindakan admin di bawah ini:
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="mint"
                        size="sm"
                        onClick={() => approveMutation.mutate()}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="font-black text-xs py-1.5 shadow-[2px_2px_0px_0px_#000]"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                        <span>{approveMutation.isPending ? 'MEMPROSES...' : 'SETUJUI & GENERATE KEY'}</span>
                      </Button>
                      <Button
                        variant="pink"
                        size="sm"
                        onClick={() => rejectMutation.mutate()}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="font-black text-xs py-1.5 shadow-[2px_2px_0px_0px_#000]"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                        <span>{rejectMutation.isPending ? 'MEMPROSES...' : 'TOLAK PENGAJUAN'}</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-600 m-0">
                      User ini saat ini belum memiliki API Key aktif.
                    </p>
                    <Button
                      variant="white"
                      size="sm"
                      onClick={() => approveMutation.mutate()}
                      disabled={approveMutation.isPending}
                      className="font-black text-xs py-1 shadow-[2px_2px_0px_0px_#000]"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                      <span>{approveMutation.isPending ? 'GENERATING...' : 'SETUJUI API KEY'}</span>
                    </Button>
                  </div>
                )}

                {/* ADMIN IP WHITELIST MANAGEMENT BOX */}
                <div className="mt-4 p-4 bg-white border-[2.5px] border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] space-y-3">
                  <div className="flex items-center justify-between border-b-[2px] border-black pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-black stroke-[3]" />
                      <h4 className="text-xs font-black uppercase text-black">IP WHITELIST USER (ADMIN OVERRIDE)</h4>
                    </div>
                    <Badge variant={adminWhitelistsData.length >= 3 ? 'pink' : 'mint'} size="sm" className="font-black">
                      {adminWhitelistsData.length} / 3 TERPAKAI
                    </Badge>
                  </div>

                  {adminIpMsg && (
                    <div
                      className={`p-2.5 border-[2px] border-black rounded-xl text-xs font-black flex items-center gap-2 ${
                        adminIpMsg.type === 'success' ? 'bg-emerald-100 text-emerald-950' : 'bg-rose-100 text-rose-950'
                      }`}
                    >
                      <span>{adminIpMsg.text}</span>
                    </div>
                  )}

                  {/* Form Tambah IP Admin */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (adminNewIp.trim()) {
                        setAdminIpMsg(null);
                        addAdminIpMutation.mutate(adminNewIp.trim());
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      type="text"
                      placeholder="Input IP IPv4 (Contoh: 15.235.214.156)"
                      value={adminNewIp}
                      onChange={(e) => setAdminNewIp(e.target.value)}
                      disabled={adminWhitelistsData.length >= 3 || addAdminIpMutation.isPending}
                      className="bg-neutral-50 font-mono text-xs font-black text-black border-[2px]"
                    />
                    <Button
                      type="submit"
                      variant="yellow"
                      size="sm"
                      disabled={adminWhitelistsData.length >= 3 || addAdminIpMutation.isPending || !adminNewIp.trim()}
                      className="font-black text-xs shrink-0 py-1.5 shadow-[2px_2px_0px_0px_#000]"
                    >
                      {addAdminIpMutation.isPending ? 'ADDING...' : '+ TAMBAH IP'}
                    </Button>
                  </form>

                  {/* List / Empty State */}
                  {adminWhitelistsData.length === 0 ? (
                    <div className="p-3 bg-neutral-100 border-[1.5px] border-dashed border-black rounded-xl text-center">
                      <p className="text-xs font-bold text-neutral-600 m-0">
                        Belum ada IP Whitelist terdaftar untuk user ini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {adminWhitelistsData.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 bg-neutral-50 border-[1.5px] border-black rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                            <span className="font-mono font-black text-black">{item.ipAddress}</span>
                          </div>
                          <Button
                            variant="pink"
                            size="sm"
                            onClick={() => {
                              setAdminIpMsg(null);
                              deleteAdminIpMutation.mutate(item.id);
                            }}
                            disabled={deleteAdminIpMutation.isPending}
                            className="text-[10px] font-black py-0.5 px-2 shadow-[1.5px_1.5px_0px_0px_#000]"
                          >
                            <Trash2 className="w-3 h-3 mr-1 stroke-[2.5]" />
                            HAPUS
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* TABS SELECTOR: MUTASI SALDO VS TRANSAKSI VS DEPOSIT */}
              <div className="border-b-2 border-black flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('MUTATIONS')}
                  className={`px-4 py-2 text-xs font-black uppercase border-t-2 border-x-2 border-black rounded-t-xl transition-all cursor-pointer ${
                    activeTab === 'MUTATIONS' ? 'bg-[#FFDC00] text-black -mb-[2px] shadow-[2px_0px_0px_0px_#000]' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <History className="w-3.5 h-3.5 inline mr-1.5 stroke-[2.5]" />
                  <span>MUTASI SALDO ({stats?.totalMutations ?? mutations.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('TRANSACTIONS')}
                  className={`px-4 py-2 text-xs font-black uppercase border-t-2 border-x-2 border-black rounded-t-xl transition-all cursor-pointer ${
                    activeTab === 'TRANSACTIONS' ? 'bg-[#FFDC00] text-black -mb-[2px] shadow-[2px_0px_0px_0px_#000]' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 inline mr-1.5 stroke-[2.5]" />
                  <span>TRANSAKSI ({stats?.totalTransactions ?? transactions.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('DEPOSITS')}
                  className={`px-4 py-2 text-xs font-black uppercase border-t-2 border-x-2 border-black rounded-t-xl transition-all cursor-pointer ${
                    activeTab === 'DEPOSITS' ? 'bg-[#FFDC00] text-black -mb-[2px] shadow-[2px_0px_0px_0px_#000]' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 inline mr-1.5 stroke-[2.5]" />
                  <span>DEPOSIT ({stats?.totalDeposits ?? deposits.length})</span>
                </button>
              </div>

              {/* TAB CONTENT 1: MUTASI SALDO */}
              {activeTab === 'MUTATIONS' && (
                <div className="border-2 border-black rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>TANGGAL</TableHead>
                        <TableHead>TIPE</TableHead>
                        <TableHead>SALDO AWAL</TableHead>
                        <TableHead>NOMINAL</TableHead>
                        <TableHead>SALDO AKHIR</TableHead>
                        <TableHead>DESKRIPSI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mutations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-xs font-bold text-neutral-500">
                            Belum ada riwayat mutasi saldo untuk user ini.
                          </TableCell>
                        </TableRow>
                      ) : (
                        mutations.map((m: any) => (
                          <TableRow key={m.id}>
                            <TableCell className="font-bold text-xs text-neutral-600">
                              {m.createdAt ? new Date(m.createdAt).toLocaleString('id-ID') : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={m.type === 'IN' ? 'mint' : 'pink'} size="sm">
                                {m.type === 'IN' ? '+ MASUK' : '- KELUAR'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-neutral-700">
                              Rp {(m.startingBalance || 0).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className={`font-black font-mono text-xs ${m.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {m.type === 'IN' ? '+' : '-'} Rp {(m.amount || 0).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-black text-black">
                              Rp {(m.endingBalance || 0).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-neutral-800">
                              {m.description}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* TAB CONTENT 2: TRANSAKSI */}
              {activeTab === 'TRANSACTIONS' && (
                <div className="border-2 border-black rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>TANGGAL</TableHead>
                        <TableHead>ORDER ID</TableHead>
                        <TableHead>PRODUK</TableHead>
                        <TableHead>NOMINAL</TableHead>
                        <TableHead>STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-xs font-bold text-neutral-500">
                            Belum ada riwayat transaksi untuk user ini.
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((t: any) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-bold text-xs text-neutral-600">
                              {t.createdAt ? new Date(t.createdAt).toLocaleString('id-ID') : '-'}
                            </TableCell>
                            <TableCell className="font-mono font-black text-xs text-black">
                              {t.providerRef || `TRX-${t.id}`}
                            </TableCell>
                            <TableCell className="font-bold text-xs text-neutral-800">
                              {t.product?.name || 'Produk'}
                            </TableCell>
                            <TableCell className="font-mono font-black text-xs text-black">
                              Rp {(t.amount || 0).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <Badge variant={t.orderStatus === 'SUCCESS' ? 'mint' : t.orderStatus === 'PROCESS' ? 'yellow' : 'pink'} size="sm">
                                {t.orderStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* TAB CONTENT 3: DEPOSIT */}
              {activeTab === 'DEPOSITS' && (
                <div className="border-2 border-black rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>TANGGAL</TableHead>
                        <TableHead>REFERENSI</TableHead>
                        <TableHead>METODE</TableHead>
                        <TableHead>NOMINAL</TableHead>
                        <TableHead>STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deposits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-xs font-bold text-neutral-500">
                            Belum ada riwayat deposit untuk user ini.
                          </TableCell>
                        </TableRow>
                      ) : (
                        deposits.map((d: any) => (
                          <TableRow key={d.id}>
                            <TableCell className="font-bold text-xs text-neutral-600">
                              {d.createdAt ? new Date(d.createdAt).toLocaleString('id-ID') : '-'}
                            </TableCell>
                            <TableCell className="font-mono font-black text-xs text-black">
                              {d.reference || `DEP-${d.id}`}
                            </TableCell>
                            <TableCell className="font-bold text-xs uppercase text-neutral-800">
                              {d.paymentMethodName || d.paymentMethodCode || '-'}
                            </TableCell>
                            <TableCell className="font-mono font-black text-xs text-black">
                              Rp {(d.amount || 0).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <Badge variant={d.status === 'SUCCESS' || d.status === 'PAID' ? 'mint' : d.status === 'PENDING' ? 'yellow' : 'pink'} size="sm">
                                {d.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ADJUST BALANCE MODAL CHILD */}
      {showAdjustModal && (
        <AdjustBalanceModal
          user={user}
          onClose={() => setShowAdjustModal(false)}
        />
      )}
    </>
  );
};
