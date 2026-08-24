import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../../utils/api';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Plus, Edit, Trash2, CreditCard, RefreshCw, AlertTriangle } from 'lucide-react';
import type { PaymentMethodData } from '../../types';
import { useToast } from '../../../../components/ui/ToastContext';



export const PaymentMethodsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchAll = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const methodsData = await apiFetch<PaymentMethodData[]>('/admin/payment-methods').catch(() => null);
      setPaymentMethods(Array.isArray(methodsData) ? methodsData : []);
    } catch (e) {
      console.error('Failed fetching payment methods:', e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleToggleActive = async (pm: PaymentMethodData) => {
    try {
      await apiFetch(`/admin/payment-methods/${pm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !pm.isActive }),
      });
      addToast({
        title: pm.isActive ? 'METODE NONAKTIF 🔴' : 'METODE AKTIF 🟢',
        message: `${pm.name} berhasil diubah statusnya.`,
        type: 'success',
      });
      fetchAll();
    } catch (err: any) {
      addToast({ title: 'GAGAL MENGUBAH STATUS', message: err?.message || 'Gagal mengubah status aktif', type: 'error' });
    }
  };

  const handleDeletePayment = async (id: number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus metode pembayaran "${name}"?`)) return;
    try {
      await apiFetch(`/admin/payment-methods/${id}`, { method: 'DELETE' });
      addToast({ title: 'METODE DIHAPUS 🗑️', message: `Metode ${name} berhasil dihapus.`, type: 'success' });
      fetchAll();
    } catch (error: any) {
      addToast({ title: 'GAGAL MENGHAPUS', message: error?.message || 'Gagal menghapus metode bayar', type: 'error' });
    }
  };

  // Helper untuk format scope usage text
  const getScopeBadge = (pm: PaymentMethodData) => {
    if (pm.forTransaction && pm.forDeposit) {
      return <Badge variant="yellow" size="sm" className="font-bold text-[10px]">KEDUANYA (TRANSAKSI & DEPOSIT)</Badge>;
    }
    if (pm.forTransaction) {
      return <Badge variant="cyan" size="sm" className="font-bold text-[10px]">TRANSAKSI SAJA</Badge>;
    }
    if (pm.forDeposit) {
      return <Badge variant="purple" size="sm" className="font-bold text-[10px]">DEPOSIT SAJA</Badge>;
    }
    return <Badge variant="white" size="sm" className="font-bold text-[10px]">TIDAK AKTIF</Badge>;
  };

  // Helper untuk format fee singkat
  const getFeeText = (pm: PaymentMethodData) => {
    const minThresholdText = pm.feeMinimumAmount ? ` (Min. Rp ${pm.feeMinimumAmount.toLocaleString('id-ID')})` : '';
    if (pm.feePercent > 0 && pm.feeFlat > 0) {
      return `${pm.feePercent}% + Rp ${pm.feeFlat.toLocaleString('id-ID')}${minThresholdText}`;
    }
    if (pm.feePercent > 0) {
      return `${pm.feePercent}%${minThresholdText}`;
    }
    if (pm.feeFlat > 0) {
      return `Rp ${pm.feeFlat.toLocaleString('id-ID')}${minThresholdText}`;
    }
    return 'Gratis (Rp 0)';
  };

  // Helper untuk format gateway name
  const getGatewayBadge = (pm: PaymentMethodData) => {
    const gatewayCode = pm.gateway?.code?.toLowerCase();
    if (gatewayCode === 'neetpay') {
      return <Badge variant="purple" size="sm" className="font-black">NEETPAY GATEWAY</Badge>;
    }
    if (gatewayCode === 'tokopay') {
      return <Badge variant="cyan" size="sm" className="font-black">TOKOPAY GATEWAY</Badge>;
    }
    if (gatewayCode === 'manual') {
      return <Badge variant="yellow" size="sm" className="font-black">MANUAL GATEWAY</Badge>;
    }
    return <Badge variant="white" size="sm" className="font-bold text-neutral-600">INTERNAL / SALDO</Badge>;
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL HALAMAN */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              PAYMENT CONFIGURATION
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL METODE: {paymentMethods.length}
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <CreditCard className="w-8 h-8 stroke-[2.5]" />
            <span>METODE PEMBAYARAN</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Kelola channel pembayaran online gateway (TokoPay), transfer manual bank, dan saldo akun.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="pink"
            size="md"
            onClick={() => navigate('/admin/payment-methods/new')}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000] border-[3px] border-black"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>TAMBAH METODE BAYAR</span>
          </Button>
        </div>
      </div>

      {/* 2. RESPONSIVE CARD GRID */}
      {isLoading ? (
        <Card variant="white" className="p-12 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <RefreshCw className="w-10 h-10 stroke-[2] mx-auto mb-3 animate-spin text-neutral-400" />
          <h3 className="text-lg font-black uppercase">MEMUAT METODE PEMBAYARAN...</h3>
        </Card>
      ) : isError ? (
        <Card variant="white" className="p-8 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <AlertTriangle className="w-12 h-12 stroke-[2] mx-auto mb-3 text-red-500" />
          <h3 className="text-lg font-black uppercase text-red-600">GAGAL MEMUAT DATA</h3>
          <p className="text-xs font-bold text-neutral-600 mt-1">Terjadi kesalahan koneksi jaringan.</p>
          <Button variant="yellow" size="sm" onClick={fetchAll} className="mt-4 font-black uppercase">
            COBA LAGI
          </Button>
        </Card>
      ) : paymentMethods.length === 0 ? (
        <Card variant="white" className="p-12 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <CreditCard className="w-12 h-12 stroke-[2] mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-black uppercase">BELUM ADA METODE PEMBAYARAN</h3>
          <p className="text-xs font-bold text-neutral-600 mt-1 mb-4">
            Klik tombol di bawah untuk menambahkan metode pembayaran baru.
          </p>
          <Button
            variant="pink"
            size="md"
            onClick={() => navigate('/admin/payment-methods/new')}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <Plus className="w-4 h-4 mr-2 stroke-[3]" /> TAMBAH METODE BAYAR
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((pm) => (
            <Card
              key={pm.id}
              variant="white"
              shadow="xl"
              borderWidth="4"
              className="flex flex-col justify-between hover:translate-y-[-2px] transition-transform"
            >
              <div>
                {/* Header Card */}
                <div className="p-4 bg-neutral-900 text-white border-b-[3px] border-black flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                      {pm.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <Badge variant="purple" size="sm" className="font-bold text-[10px]">
                        {pm.type}
                      </Badge>
                      {getGatewayBadge(pm)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(pm)}
                    title="Klik untuk ubah status aktif/nonaktif"
                    className="cursor-pointer shrink-0 mt-0.5"
                  >
                    <Badge variant={pm.isActive ? 'mint' : 'pink'} size="sm" className="font-black text-[10px]">
                      {pm.isActive ? 'AKTIF 🟢' : 'NONAKTIF 🔴'}
                    </Badge>
                  </button>
                </div>

                {/* Body Card */}
                <div className="p-5 space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                    <span className="font-bold text-neutral-500 uppercase">DIGUNAKAN UNTUK:</span>
                    <div>{getScopeBadge(pm)}</div>
                  </div>

                  <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                    <span className="font-bold text-neutral-500 uppercase">BIAYA ADMIN:</span>
                    <span className="font-black font-mono text-blue-700 text-sm">
                      {getFeeText(pm)}
                    </span>
                  </div>

                  {/* Manual details snapshot if manual */}
                  {pm.gateway?.code?.toLowerCase() === 'manual' && (
                    <div className="p-2.5 bg-yellow-50 border-2 border-black font-mono text-[11px] space-y-1">
                      {pm.bankName && <div>Bank: <b>{pm.bankName}</b></div>}
                      {pm.accountNumber && <div>No. Rek: <b>{pm.accountNumber}</b></div>}
                      {pm.accountHolder && <div>a.n: <b>{pm.accountHolder}</b></div>}
                      {pm.qrString && <div className="text-[10px] text-green-700">QRIS Payload Configured</div>}
                    </div>
                  )}

                  {/* Unique Code indicator */}
                  <div className="flex justify-between items-center text-[11px] text-neutral-600 font-bold">
                    <span>Kode Unik (01-99):</span>
                    <Badge variant={pm.useUniqueCode ? 'cyan' : 'white'} size="sm" className="text-[10px]">
                      {pm.useUniqueCode ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-neutral-50 border-t-[3px] border-black flex items-center justify-end gap-2">
                <Button
                  variant="yellow"
                  size="sm"
                  onClick={() => navigate(`/admin/payment-methods/${pm.id}/edit`)}
                  className="font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]"
                >
                  <Edit className="w-3.5 h-3.5 mr-1 stroke-[3]" /> EDIT
                </Button>
                <Button
                  variant="pink"
                  size="sm"
                  onClick={() => handleDeletePayment(pm.id, pm.name)}
                  className="font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
