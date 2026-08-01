import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, checkAdminTransactionStatus } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { useToast } from '../../../../components/ui/ToastContext';
import { Search, Edit, RefreshCw } from 'lucide-react';
import type { TransactionData } from '../../types';

interface TabTransactionsProps {
  transactions: TransactionData[];
  onOpenTxModal: (tx: TransactionData) => void;
  onCheckStatus: (id: number) => void;
  checkingIds: Set<number>;
}

export const TabTransactions: React.FC<TabTransactionsProps> = ({
  transactions,
  onOpenTxModal,
  onCheckStatus,
  checkingIds,
}) => {
  const [txFilter, setTxFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="#00F0FF" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-base text-[var(--nb-text)]">SEMUA RIWAYAT TRANSAKSI</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={txFilter === 'ALL' ? 'yellow' : 'white'} size="sm" onClick={() => setTxFilter('ALL')}>SEMUA</Button>
          <Button variant={txFilter === 'SUCCESS' ? 'mint' : 'white'} size="sm" onClick={() => setTxFilter('SUCCESS')}>SUCCESS</Button>
          <Button variant={txFilter === 'PENDING' ? 'yellow' : 'white'} size="sm" onClick={() => setTxFilter('PENDING')}>PENDING / PROCESS</Button>
          <Button variant={txFilter === 'FAILED' ? 'pink' : 'white'} size="sm" onClick={() => setTxFilter('FAILED')}>FAILED</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative max-w-sm">
          <input
            type="text"
            placeholder="Cari ID Transaksi, Username, Produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-[3px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] text-sm font-bold focus:outline-none"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)]" />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>INV / REF</TableHead>
              <TableHead>USER</TableHead>
              <TableHead>PRODUK</TableHead>
              <TableHead>TUJUAN (ID GAME)</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PEMBAYARAN</TableHead>
              <TableHead>STATUS ORDER</TableHead>
              <TableHead className="text-right">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions
              .filter((tx: any) => {
                if (txFilter === 'SUCCESS') return tx.orderStatus === 'SUCCESS';
                if (txFilter === 'PENDING') return tx.orderStatus === 'PENDING' || tx.orderStatus === 'PROCESS';
                if (txFilter === 'FAILED') return tx.orderStatus === 'FAILED';
                return true;
              })
              .filter((tx: any) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                const inv = (tx.providerRef || tx.id || '').toString().toLowerCase();
                const usr = (tx.user?.username || 'guest').toLowerCase();
                const prod = (tx.product?.name || '').toLowerCase();
                return inv.includes(q) || usr.includes(q) || prod.includes(q);
              })
              .map((tx: any) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-black text-[var(--nb-text)]">{tx.providerRef || tx.id}</TableCell>
                  <TableCell className="font-bold text-[var(--nb-text)] uppercase">{tx.user?.username || 'GUEST'}</TableCell>
                  <TableCell className="font-bold text-[var(--nb-text)]">{tx.product?.name || `Produk #${tx.productId}`}</TableCell>
                  <TableCell className="font-bold text-[var(--nb-text-muted)]">{tx.targetAccount} {tx.targetZone ? `(${tx.targetZone})` : ''}</TableCell>
                  <TableCell className="font-black text-[var(--nb-text)]">Rp {(tx.amount || 0).toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <Badge variant={tx.paymentStatus === 'PAID' ? 'mint' : 'yellow'} size="sm">
                      {tx.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.orderStatus === 'SUCCESS' ? 'mint' : tx.orderStatus === 'PROCESS' ? 'purple' : 'pink'} size="sm">
                      {tx.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {tx.orderStatus === 'PROCESS' && (
                        <Button
                          variant="yellow"
                          size="sm"
                          onClick={() => onCheckStatus(tx.id)}
                          disabled={checkingIds.has(tx.id)}
                          title="Cek Status ke Digiflazz"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 stroke-[3] ${checkingIds.has(tx.id) ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                      <Button variant="yellow" size="sm" onClick={() => onOpenTxModal(tx)}>
                        <Edit className="w-3.5 h-3.5 stroke-[3]" />
                        <span>STATUS</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const TransactionsPage: React.FC = () => {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [checkingIds, setCheckingIds] = useState<Set<number>>(new Set());

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await apiFetch<TransactionData[]>('/admin/transactions')
        .catch(() => apiFetch<TransactionData[]>('/transactions'))
        .catch(() => null);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed fetching transactions:', e);
      setTransactions([]);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleCheckStatus = async (id: number) => {
    setCheckingIds((prev) => new Set(prev).add(id));
    try {
      const result = await checkAdminTransactionStatus(id);
      const newStatus = result?.orderStatus || result?.data?.orderStatus;
      addToast({
        title: newStatus === 'SUCCESS' ? '✅ TRANSAKSI SUKSES' : newStatus === 'FAILED' ? '❌ TRANSAKSI GAGAL' : '🔄 MASIH PENDING',
        message: newStatus === 'PROCESS' || !newStatus
          ? `Transaksi #${id} masih diproses oleh Digiflazz.`
          : `Transaksi #${id} sekarang berstatus ${newStatus}.`,
        type: newStatus === 'SUCCESS' ? 'success' : newStatus === 'FAILED' ? 'error' : 'info',
      });
      fetchTransactions();
    } catch (err: any) {
      addToast({
        title: 'GAGAL CEK STATUS',
        message: err.message || 'Gagal menghubungi Digiflazz untuk cek status.',
        type: 'error',
      });
    } finally {
      setCheckingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  return (
    <TabTransactions
      transactions={transactions}
      onOpenTxModal={() => {}}
      onCheckStatus={handleCheckStatus}
      checkingIds={checkingIds}
    />
  );
};
