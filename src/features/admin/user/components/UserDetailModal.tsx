import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../../services/queryKeys';
import { getAdminUserDetail } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { User, History, ShoppingBag, X, Phone, Mail, DollarSign } from 'lucide-react';
import { AdjustBalanceModal } from './AdjustBalanceModal';

interface UserDetailModalProps {
  userId: number;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'MUTATIONS' | 'TRANSACTIONS'>('MUTATIONS');
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.users.detail(userId),
    queryFn: () => getAdminUserDetail(userId),
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

  const { user, mutations, transactions } = data;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
        <div className="w-full max-w-4xl max-h-[90vh] my-auto overflow-y-auto">
          <Card variant="white" shadow="xl" borderWidth="4" className="rounded-3xl overflow-hidden text-left">
            <CardHeader headerBg="#00F0FF" className="border-b-[4px] border-black flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-black font-black text-base">
                <User className="w-5 h-5 stroke-[3]" />
                <span>DETAIL AKUN USER — #{user.id} {user.username.toUpperCase()}</span>
              </CardTitle>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[3] text-black" />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CARD 1: INFORMASI PROFIL */}
                <div className="p-4 bg-yellow-50 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between border-b-2 border-black/20 pb-2">
                    <span className="text-[10px] font-black uppercase text-neutral-500">PROFIL USER</span>
                    <Badge variant={user.role === 'ADMIN' ? 'yellow' : 'cyan'} size="sm">{user.role}</Badge>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="font-black text-sm font-sans text-black">{user.username}</div>
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

                {/* CARD 2: SALDO & AKSI */}
                <div className="p-4 bg-neutral-900 text-white border-[3px] border-black shadow-[3px_3px_0px_0px_#000] rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-neutral-400 block mb-1">TOTAL SALDO AKUN</span>
                    <div className="text-xl font-black font-mono text-[var(--nb-yellow)]">
                      Rp {(user.balance || 0).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] font-bold text-neutral-300 mt-0.5">
                      Poin Loyalti: <b>{user.points || 0} Poin</b>
                    </div>
                  </div>

                  <Button
                    variant="yellow"
                    size="sm"
                    onClick={() => setShowAdjustModal(true)}
                    className="w-full font-black text-xs py-2 h-auto shadow-[2px_2px_0px_0px_#000]"
                  >
                    <DollarSign className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                    <span>ADJUST SALDO</span>
                  </Button>
                </div>

                {/* CARD 3: STATUS & METADATA */}
                <div className="p-4 bg-cyan-50 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between border-b-2 border-black/20 pb-2">
                    <span className="text-[10px] font-black uppercase text-neutral-500">LEVEL HARGA & STATUS</span>
                    <Badge variant={user.isActive ? 'mint' : 'pink'} size="sm">
                      {user.isActive ? 'AKTIF' : 'NONAKTIF'}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 font-extrabold uppercase">Level:</span>
                      <Badge variant={user.level === 'VIP' ? 'pink' : user.level === 'RESELLER' ? 'purple' : 'mint'} size="sm">
                        {user.level}
                      </Badge>
                    </div>
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

              {/* TABS SELECTOR: MUTASI SALDO VS RIWAYAT TRANSAKSI */}
              <div className="border-b-2 border-black flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('MUTATIONS')}
                  className={`px-4 py-2 text-xs font-black uppercase border-t-2 border-x-2 border-black rounded-t-xl transition-all cursor-pointer ${
                    activeTab === 'MUTATIONS' ? 'bg-[#FFDC00] text-black -mb-[2px] shadow-[2px_0px_0px_0px_#000]' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <History className="w-3.5 h-3.5 inline mr-1.5 stroke-[2.5]" />
                  <span>RIWAYAT MUTASI SALDO ({mutations.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('TRANSACTIONS')}
                  className={`px-4 py-2 text-xs font-black uppercase border-t-2 border-x-2 border-black rounded-t-xl transition-all cursor-pointer ${
                    activeTab === 'TRANSACTIONS' ? 'bg-[#FFDC00] text-black -mb-[2px] shadow-[2px_0px_0px_0px_#000]' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 inline mr-1.5 stroke-[2.5]" />
                  <span>TRANSAKSI TERAKHIR ({transactions.length})</span>
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

              {/* TAB CONTENT 2: TRANSAKSI TERAKHIR */}
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
