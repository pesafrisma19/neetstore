import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../../services/queryKeys';
import { getAdminUsers, deleteAdminUser } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Dialog } from '../../../../components/ui/Dialog';
import { useToast } from '../../../../components/ui/ToastContext';
import { Search, Eye, Edit3, DollarSign, ChevronLeft, ChevronRight, UserCheck, SlidersHorizontal, Trash2 } from 'lucide-react';
import { UserDetailModal } from '../components/UserDetailModal';
import { EditUserModal } from '../components/EditUserModal';
import { AdjustBalanceModal } from '../components/AdjustBalanceModal';
import { UserSettingsModal } from '../components/UserSettingsModal';
import type { UserData } from '../../types';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Filter & Pagination States
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal States
  const [selectedUserDetailId, setSelectedUserDetailId] = useState<number | null>(null);
  const [selectedUserEdit, setSelectedUserEdit] = useState<UserData | null>(null);
  const [selectedUserAdjust, setSelectedUserAdjust] = useState<UserData | null>(null);
  const [userSettingsModalOpen, setUserSettingsModalOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  // TanStack Mutation for Delete User
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      addToast({
        type: 'success',
        title: 'USER DIHAPUS',
        message: 'Data pengguna berhasil dihapus.',
      });
      setUserToDelete(null);
    },
    onError: (err: any) => {
      addToast({
        type: 'error',
        title: 'GAGAL MENGHAPUS USER',
        message: err.message || 'Gagal menghapus pengguna.',
      });
    },
  });

  // TanStack Query untuk Server State
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.users.list({ page, limit, search, role: roleFilter, level: levelFilter, status: statusFilter }),
    queryFn: () => getAdminUsers({ page, limit, search, role: roleFilter, level: levelFilter, status: statusFilter }),
  });

  const users: UserData[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <Card variant="white" shadow="xl" borderWidth="4" className="rounded-3xl overflow-hidden">
        <CardHeader headerBg="#00F0FF" className="border-b-[4px] border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base text-[var(--nb-text)] font-black uppercase">
            <UserCheck className="w-5 h-5 stroke-[3]" />
            <span>MANAJEMEN USER & BALANCE (MEMBER, RESELLER, VIP)</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="yellow" size="sm" className="font-black">
              TOTAL: {total} PENGGUNA
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUserSettingsModalOpen(true)}
              className="font-black uppercase shadow-[2px_2px_0px_0px_#000]"
              title="Pengaturan Level User"
              aria-label="Pengaturan Level User"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Pengaturan</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* FILTER BAR: SEARCH & DROPDOWN SELECTORS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* SEARCH INPUT */}
            <div className="relative">
              <Input
                placeholder="Cari Username / Phone / Email..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 bg-white"
              />
              <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[3]" />
            </div>

            {/* FILTER ROLE */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="w-full p-2.5 bg-white border-[3px] border-black rounded-xl font-extrabold text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              >
                <option value="ALL">SEMUA ROLE (USER & ADMIN)</option>
                <option value="USER">ROLE: USER</option>
                <option value="ADMIN">ROLE: ADMIN</option>
              </select>
            </div>

            {/* FILTER LEVEL */}
            <div>
              <select
                value={levelFilter}
                onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                className="w-full p-2.5 bg-white border-[3px] border-black rounded-xl font-extrabold text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              >
                <option value="ALL">SEMUA LEVEL HARGA</option>
                <option value="MEMBER">LEVEL: MEMBER</option>
                <option value="RESELLER">LEVEL: RESELLER</option>
                <option value="VIP">LEVEL: VIP</option>
              </select>
            </div>

            {/* FILTER STATUS */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full p-2.5 bg-white border-[3px] border-black rounded-xl font-extrabold text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              >
                <option value="ALL">SEMUA STATUS AKUN</option>
                <option value="ACTIVE">STATUS: AKTIF</option>
                <option value="INACTIVE">STATUS: NONAKTIF</option>
              </select>
            </div>
          </div>

          {/* TABLE COMPONENT */}
          <div className="border-[3px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>USERNAME</TableHead>
                  <TableHead>KONTAK</TableHead>
                  <TableHead>ROLE & LEVEL</TableHead>
                  <TableHead>SALDO & POIN</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">AKSI AUDIT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 font-black text-xs uppercase">
                      Memuat data pengguna...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 font-black text-xs text-rose-600 uppercase">
                      ⚠️ {(error as any)?.message || 'Gagal mengambil data user'}
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 font-black text-xs text-neutral-500 uppercase">
                      Tidak ada user ditemukan sesuai filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-black text-xs text-black">
                        {u.username}
                        {u.fullname && <span className="block text-[11px] font-sans font-bold text-neutral-800">{u.fullname}</span>}
                        <span className="block text-[10px] font-mono text-neutral-500">ID #{u.id}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-neutral-700">
                        {u.email && <div className="truncate max-w-[140px]">{u.email}</div>}
                        {u.phone && <div className="text-[11px] text-neutral-500">{u.phone}</div>}
                        {!u.email && !u.phone && <span className="text-neutral-400">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant={u.role === 'ADMIN' ? 'yellow' : 'cyan'} size="sm">
                            {u.role}
                          </Badge>
                          <Badge variant={u.level === 'VIP' ? 'pink' : u.level === 'RESELLER' ? 'purple' : 'mint'} size="sm">
                            {u.level}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-black text-xs text-black">
                        <div>Rp {(u.balance || 0).toLocaleString('id-ID')}</div>
                        <div className="text-[10px] font-bold text-neutral-500 font-sans">({(u.points || 0).toLocaleString('id-ID')} Poin)</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant={u.isActive ? 'mint' : 'pink'} size="sm">
                            {u.isActive ? 'Status Akun: Aktif' : 'Status Akun: Nonaktif'}
                          </Badge>
                          {u.verified && (
                            <Badge variant="mint" size="sm">
                              VERIFIED
                            </Badge>
                          )}
                          <Badge variant={u.apiStatus === 'APPROVED' ? 'mint' : u.apiStatus === 'PENDING' ? 'yellow' : 'pink'} size="sm">
                            API: {u.apiStatus}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          variant="white"
                          size="sm"
                          onClick={() => setSelectedUserDetailId(u.id)}
                          className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                          <span>DETAIL</span>
                        </Button>
                        <Button
                          variant="cyan"
                          size="sm"
                          onClick={() => setSelectedUserEdit(u)}
                          className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                          <span>EDIT USER</span>
                        </Button>
                        <Button
                          variant="yellow"
                          size="sm"
                          onClick={() => setSelectedUserAdjust(u)}
                          className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]"
                        >
                          <DollarSign className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                          <span>ADJUST SALDO</span>
                        </Button>
                        <Button
                          variant="pink"
                          size="sm"
                          onClick={() => setUserToDelete(u)}
                          className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]"
                          title="Hapus User"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                          <span>HAPUS</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-neutral-600 font-mono">
                Halaman {page} dari {totalPages} ({total} Total User)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="white"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="font-black"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                  <span>SEBELUMNYA</span>
                </Button>
                <Button
                  variant="white"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="font-black"
                >
                  <span>SELANJUTNYA</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL USER DETAIL */}
      {selectedUserDetailId && (
        <UserDetailModal
          userId={selectedUserDetailId}
          onClose={() => setSelectedUserDetailId(null)}
        />
      )}

      {/* MODAL EDIT USER */}
      {selectedUserEdit && (
        <EditUserModal
          user={selectedUserEdit}
          onClose={() => setSelectedUserEdit(null)}
        />
      )}

      {/* MODAL ADJUST SALDO */}
      {selectedUserAdjust && (
        <AdjustBalanceModal
          user={selectedUserAdjust}
          onClose={() => setSelectedUserAdjust(null)}
        />
      )}

      {/* MODAL PENGATURAN LEVEL USER */}
      <UserSettingsModal
        isOpen={userSettingsModalOpen}
        onClose={() => setUserSettingsModalOpen(false)}
      />

      {/* MODAL KONFIRMASI HAPUS USER */}
      <Dialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="KONFIRMASI HAPUS USER"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs font-bold text-neutral-800">
            Apakah Anda yakin ingin menghapus user{' '}
            <span className="font-mono font-black uppercase underline bg-yellow-200 px-1">{userToDelete?.username}</span> (ID: #{userToDelete?.id})?
          </p>
          <div className="p-3 bg-red-50 border-[2.5px] border-red-600 text-[11px] font-bold text-red-900">
            ⚠️ Perhatian: Tindakan ini akan menghapus akun user secara permanen dari database.
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-[3px] border-black">
            <Button variant="white" size="md" onClick={() => setUserToDelete(null)} disabled={deleteMutation.isPending}>
              BATAL
            </Button>
            <Button
              variant="pink"
              size="md"
              onClick={() => userToDelete?.id && deleteMutation.mutate(userToDelete.id)}
              isLoading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
              className="font-black text-xs uppercase"
            >
              <Trash2 className="w-4 h-4 mr-1 stroke-[3]" />
              {deleteMutation.isPending ? 'MENGHAPUS...' : 'YA, HAPUS USER'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
