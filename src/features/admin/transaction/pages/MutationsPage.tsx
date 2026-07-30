import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Search } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';

export interface MutationData {
  id: number;
  userId: number;
  user?: { username: string };
  type: 'IN' | 'OUT';
  amount: number;
  startingBalance: number;
  endingBalance: number;
  description: string;
  createdAt: string;
}

interface TabMutationsProps {
  mutations: MutationData[];
}

export const TabMutations: React.FC<TabMutationsProps> = ({ mutations }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="#00F0FF" className="flex items-center justify-between">
        <CardTitle className="text-base text-[var(--nb-text)]">RIWAYAT MUTASI SALDO & POIN USER</CardTitle>
        <Badge variant="cyan" size="sm">{mutations.length} MUTASI</Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative max-w-sm">
          <Input 
            placeholder="Cari User / Deskripsi..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-4 h-4 text-[var(--nb-text)] absolute right-3 top-1/2 -translate-y-1/2 stroke-[3]" />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TANGGAL</TableHead>
              <TableHead>USER</TableHead>
              <TableHead>TIPE</TableHead>
              <TableHead>SALDO AWAL</TableHead>
              <TableHead>NOMINAL</TableHead>
              <TableHead>SALDO AKHIR</TableHead>
              <TableHead>DESKRIPSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mutations
              .filter(m => {
                const searchStr = searchQuery.toLowerCase();
                return (m.user?.username || '').toLowerCase().includes(searchStr) || 
                       (m.description || '').toLowerCase().includes(searchStr);
              })
              .map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-bold text-gray-700 text-xs">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString('id-ID') : '-'}
                  </TableCell>
                  <TableCell className="font-black text-[var(--nb-text)] uppercase">{m.user?.username || `User #${m.userId}`}</TableCell>
                  <TableCell>
                    <Badge variant={m.type === 'IN' ? 'mint' : 'pink'} size="sm">
                      {m.type === 'IN' ? '+ MASUK' : '- KELUAR'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-gray-600">
                    Rp {(m.startingBalance || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className={`font-black ${m.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {m.type === 'IN' ? '+' : '-'} Rp {(m.amount || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="font-bold text-gray-800">
                    Rp {(m.endingBalance || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="font-bold text-gray-800 text-xs">{m.description}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const MutationsPage: React.FC = () => {
  const [mutations, setMutations] = useState<MutationData[]>([]);

  useEffect(() => {
    const fetchMutations = async () => {
      try {
        const data = await apiFetch<MutationData[]>('/admin/mutations');
        setMutations(data || []);
      } catch (e) {
        console.error('Failed fetching mutations:', e);
      }
    };
    fetchMutations();
  }, []);

  return (
    <TabMutations mutations={mutations} />
  );
};
