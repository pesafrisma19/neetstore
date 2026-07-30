import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  ShoppingCart, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Search
} from 'lucide-react';
import { getAdminTransactions, updateAdminTransaction } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export interface OrderItem {
  id: number;
  userId?: number;
  productId: number;
  providerId?: number;
  targetAccount?: string;
  targetZone?: string;
  amount?: number;
  totalPrice?: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  providerRef?: string;
  sn?: string;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
  };
}

export const OrdersPage: React.FC = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL_ACTIVE');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminTransactions();
      setOrders(data || []);
    } catch (err: any) {
      addToast({
        title: 'GAGAL MEMUAT PESANAN',
        message: err.message || 'Gagal mengambil daftar pesanan dari server.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await updateAdminTransaction(id, { orderStatus: newStatus });
      addToast({
        title: 'STATUS PESANAN DIPERBARUI',
        message: `Pesanan #ORD-${id} berhasil diubah menjadi ${newStatus}.`,
        type: 'success',
      });
      fetchOrders();
    } catch (err: any) {
      addToast({
        title: 'GAGAL MEMPERBARUI',
        message: err.message || 'Terjadi kesalahan saat mengubah status pesanan.',
        type: 'error',
      });
    }
  };

  // Filter antrean aktif (PENDING / PROCESS / FAILED / SUCCESS)
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      `#ORD-${o.id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.targetAccount || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (filterStatus === 'ALL_ACTIVE') {
      return o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESS';
    }
    return o.orderStatus === filterStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL & STATS */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              TRANSACTIONS QUEUE
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              ACTIVE QUEUE: {orders.filter((o) => o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESS').length}
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>🛒</span>
            <span>ORDERS (LIVE QUEUE)</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Antrean pesanan aktif yang sedang diproses oleh server atau provider game.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            onClick={fetchOrders}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <RefreshCw className={`w-4 h-4 stroke-[3] ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </Button>
        </div>
      </div>

      {/* 2. TAB FILTER & CARI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL_ACTIVE', label: '⚡ LIVE QUEUE (PENDING/PROCESS)' },
            { id: 'PENDING', label: '🕒 PENDING' },
            { id: 'PROCESS', label: '🔄 PROCESS' },
            { id: 'SUCCESS', label: '✅ SUCCESS' },
            { id: 'FAILED', label: '❌ FAILED' },
          ].map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant={filterStatus === tab.id ? 'yellow' : 'white'}
              size="sm"
              onClick={() => setFilterStatus(tab.id)}
              className="font-black uppercase text-xs"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Order / No Tujuan / Produk..."
            className="w-full bg-white border-[2px] border-black px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
          />
          <Search className="w-4 h-4 stroke-[2.5] text-neutral-400 absolute right-2.5 top-2" />
        </div>
      </div>

      {/* 3. TABEL ORDER */}
      {filteredOrders.length === 0 ? (
        <Card variant="white" className="p-8 text-center border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
          <ShoppingCart className="w-12 h-12 stroke-[2] mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-black uppercase">TIDAK ADA PESANAN DALAM ANTREAN</h3>
          <p className="text-xs font-bold text-neutral-500 mt-1">
            Saat ini tidak ada pesanan dengan filter {filterStatus} yang sedang menunggu diproses.
          </p>
        </Card>
      ) : (
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white border-b-[3px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3">ID Order</th>
                  <th className="p-3">Produk & Tujuan</th>
                  <th className="p-3">Total (Rp)</th>
                  <th className="p-3">Metode Bayar</th>
                  <th className="p-3">Status Bayar</th>
                  <th className="p-3">Status Order</th>
                  <th className="p-3 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-yellow-50 transition-colors">
                    <td className="p-3 font-mono">#ORD-{o.id}</td>
                    <td className="p-3">
                      <div className="font-black text-black">{o.product?.name || `Produk #${o.productId}`}</div>
                      <div className="text-xs font-mono text-neutral-500">
                        Tujuan: {o.targetAccount || '-'} {o.targetZone ? `(${o.targetZone})` : ''}
                      </div>
                    </td>
                    <td className="p-3 font-black">
                      Rp {(o.amount || o.totalPrice || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 uppercase">
                      <Badge variant="cyan" size="sm" className="font-bold">
                        {o.paymentMethod}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={o.paymentStatus === 'PAID' ? 'mint' : 'yellow'}
                        size="sm"
                        className="font-black uppercase"
                      >
                        {o.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          o.orderStatus === 'SUCCESS'
                            ? 'mint'
                            : o.orderStatus === 'FAILED'
                            ? 'pink'
                            : 'yellow'
                        }
                        size="sm"
                        className="font-black uppercase"
                      >
                        {o.orderStatus}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="mint"
                          size="sm"
                          onClick={() => handleUpdateStatus(o.id, 'SUCCESS')}
                          className="font-black uppercase text-[10px] px-2 py-1"
                          title="Tandai Sukses"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        </Button>
                        <Button
                          variant="pink"
                          size="sm"
                          onClick={() => handleUpdateStatus(o.id, 'FAILED')}
                          className="font-black uppercase text-[10px] px-2 py-1"
                          title="Tandai Gagal"
                        >
                          <XCircle className="w-3.5 h-3.5 stroke-[3]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
