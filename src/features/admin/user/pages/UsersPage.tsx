import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Edit } from 'lucide-react';
import type { UserData } from '../../types';

interface TabUsersProps {
  users: UserData[];
  onEditUser: (user: UserData) => void;
}

export const TabUsers: React.FC<TabUsersProps> = ({ users, onEditUser }) => {
  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="#00F0FF" className="flex items-center justify-between">
        <CardTitle className="text-base text-[var(--nb-text)]">MANAJEMEN LEVEL PENGGUNA & SALDO (MEMBER, RESELLER, VIP)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>USERNAME</TableHead>
              <TableHead>NO WHATSAPP</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead>LEVEL HARGA</TableHead>
              <TableHead>SALDO & POIN</TableHead>
              <TableHead className="text-right">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-black text-[var(--nb-text)]">{u.username}</TableCell>
                <TableCell className="font-bold text-[var(--nb-text-muted)]">{u.phone}</TableCell>
                <TableCell><Badge variant="yellow" size="sm">{u.role}</Badge></TableCell>
                <TableCell>
                  <Badge variant={u.level === 'VIP' ? 'pink' : u.level === 'RESELLER' ? 'purple' : 'mint'} size="sm">
                    {u.level}
                  </Badge>
                </TableCell>
                <TableCell className="font-black text-[var(--nb-text)]">Rp {u.balance.toLocaleString('id-ID')} ({u.points} Poin)</TableCell>
                <TableCell className="text-right">
                  <Button variant="yellow" size="sm" onClick={() => onEditUser(u)}>
                    <Edit className="w-3.5 h-3.5 stroke-[3]" />
                    <span>EDIT LEVEL & SALDO</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiFetch<UserData[]>('/admin/users');
        setUsers(data || []);
      } catch (e) {
        console.error('Failed fetching users:', e);
      }
    };
    fetchUsers();
  }, []);

  return (
    <TabUsers
      users={users}
      onEditUser={() => {}}
    />
  );
};
