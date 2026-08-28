import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Wallet, 
  CreditCard, 
  RefreshCw, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { 
  getDepositPaymentMethods, 
  getPublicSettings, 
  createUserDeposit, 
  getUserDepositHistory
} from '../../../../utils/api';
import { type PaymentMethodData } from '../../../admin/types';
import { useAuth } from '../../../../contexts/AuthContext';

export interface UserDepositInvoice {
  id: number;
  paymentRef: string;
  amount: number;
  fee: number;
  uniqueCode: number;
  totalAmount: number;
  paymentMethod: string;
  paymentUrl: string | null;
  checkoutUrl?: string | null;
  qrString?: string | null;
  qrImageUrl?: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  failureReason: string | null;
  paidAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  paymentInstructions?: string | null;
  instructions?: string;
  tokopayData?: any;
  paymentMethodRel?: {
    id: number;
    name: string;
    code: string;
    type: string;
    bankName?: string | null;
    accountNumber?: string | null;
    accountHolder?: string | null;
    qrString?: string | null;
    gateway?: {
      id: number;
      name: string;
      code: string;
    } | null;
  } | null;
}

export const UserDepositSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Input States
  const [amountInput, setAmountInput] = useState<string>('50000');
  const [selectedMethodCode, setSelectedMethodCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pagination State for Deposit History
  const [depositPage, setDepositPage] = useState<number>(1);
  const depositPageSize = 10;

  // Idempotency Key Lifecycle per User Intent
  const [intentIdempotencyKey, setIntentIdempotencyKey] = useState<string>(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `dep-key-${Date.now()}-${Math.random()}`
  );

  const resetIntentKey = () => {
    setIntentIdempotencyKey(
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `dep-key-${Date.now()}-${Math.random()}`
    );
  };

  // 1. Query Setting Global (min & max deposit)
  const { data: publicSettings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: getPublicSettings,
    staleTime: 5 * 60 * 1000,
  });

  const minDeposit = Number(publicSettings?.min_deposit_amount || 10000);
  const maxDeposit = Number(publicSettings?.max_deposit_amount || 5000000);

  // 2. Query Payment Methods Deposit (isActive=true & forDeposit=true)
  const { data: paymentMethodsResponse, isLoading: isLoadingMethods } = useQuery({
    queryKey: ['publicDepositPaymentMethods'],
    queryFn: getDepositPaymentMethods,
    staleTime: 60 * 1000,
  });

  const paymentMethods: PaymentMethodData[] = Array.isArray(paymentMethodsResponse) ? paymentMethodsResponse : [];

  // Select first method by default when loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethodCode) {
      setSelectedMethodCode(paymentMethods[0].code);
    }
  }, [paymentMethods, selectedMethodCode]);

  // 3. Query User Deposit History (Server-side Paginated)
  const { 
    data: historyData, 
    isLoading: isLoadingHistory, 
    refetch: refetchHistory 
  } = useQuery({
    queryKey: ['user', 'deposits', 'history', user?.id || 0, depositPage],
    queryFn: () => getUserDepositHistory({ page: depositPage, limit: depositPageSize }),
    enabled: Boolean(user?.id),
  });

  const historyItems: UserDepositInvoice[] = historyData?.data || [];
  const totalDeposits: number = historyData?._meta?.totalCount || (Array.isArray(historyData) ? historyData.length : historyItems.length);
  const totalDepositPages: number = historyData?._meta?.totalPages || Math.max(1, Math.ceil(totalDeposits / depositPageSize));
  const startDepositItem = totalDeposits === 0 ? 0 : (depositPage - 1) * depositPageSize + 1;
  const endDepositItem = Math.min(depositPage * depositPageSize, totalDeposits);

  // Calculation Estimates
  const requestedAmount = Number(amountInput) || 0;
  const selectedMethod = paymentMethods.find((m: PaymentMethodData) => m.code === selectedMethodCode);
  const isFeeApplicable = selectedMethod
    ? (selectedMethod.feeMinimumAmount === undefined || selectedMethod.feeMinimumAmount === null || requestedAmount >= selectedMethod.feeMinimumAmount)
    : true;
  const estimatedFee = (selectedMethod && isFeeApplicable)
    ? Math.round((selectedMethod.feeFlat || 0) + (requestedAmount * (selectedMethod.feePercent || 0)) / 100)
    : 0;
  const estimatedTotal = requestedAmount + estimatedFee;

  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestedAmount < minDeposit) {
      alert(`Nominal deposit minimal adalah Rp ${minDeposit.toLocaleString('id-ID')}`);
      return;
    }
    if (requestedAmount > maxDeposit) {
      alert(`Nominal deposit maksimal adalah Rp ${maxDeposit.toLocaleString('id-ID')}`);
      return;
    }
    if (!selectedMethodCode) {
      alert('Pilih metode pembayaran terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createUserDeposit({
        amount: requestedAmount,
        paymentMethodCode: selectedMethodCode,
      }, intentIdempotencyKey);

      if (res.success && res.data) {
        const createdDeposit = res.data.deposit || res.data;
        resetIntentKey();
        navigate(`/deposit/${createdDeposit.paymentRef}`);
      }
    } catch (err: any) {
      alert(err?.message || 'Gagal membuat deposit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewInvoiceDetail = (item: UserDepositInvoice) => {
    navigate(`/deposit/${item.paymentRef}`);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* FORM BUAT DEPOSIT BARU */}
      <Card variant="white" shadow="lg" className="border-[4px] border-black">
        <CardHeader headerBg="#FFDC00">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 stroke-[3]" />
            <span>ISI SALDO AKUN NETSTORE</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-xs font-bold text-neutral-600">
            Isi saldo akun kamu untuk checkout top-up game secara instan tanpa perlu transfer bank berulang kali.
          </p>

          <form onSubmit={handleCreateDeposit} className="space-y-6">
            
            {/* STEP 1: NOMINAL SALDO */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase text-black">
                1. PILIH ATAU INPUT NOMINAL SALDO (MIN: Rp {minDeposit.toLocaleString('id-ID')} - MAX: Rp {maxDeposit.toLocaleString('id-ID')})
              </label>

              {/* Quick Nominal Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[10000, 20000, 50000, 100000, 200000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountInput(String(amt))}
                    className={`p-3 border-[3px] border-black font-black text-xs transition-all cursor-pointer shadow-[3px_3px_0px_0px_#000] ${
                      amountInput === String(amt)
                        ? 'bg-[var(--nb-yellow)] text-black ring-2 ring-black'
                        : 'bg-white hover:bg-yellow-50 text-black'
                    }`}
                  >
                    Rp {amt.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>

              {/* Custom Input Nominal */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-black text-sm text-neutral-500">Rp</span>
                <input
                  type="number"
                  required
                  min={minDeposit}
                  max={maxDeposit}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="Masukkan nominal custom..."
                  className="w-full bg-white border-[3px] border-black pl-10 pr-3 py-2 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)] shadow-[3px_3px_0px_0px_#000]"
                />
              </div>
            </div>

            {/* STEP 2: PILIH METODE PEMBAYARAN (isActive=true & forDeposit=true) */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase text-black">
                2. PILIH METODE PEMBAYARAN
              </label>

              {isLoadingMethods ? (
                <div className="p-6 text-center text-xs font-bold text-neutral-500">
                  Memuat metode pembayaran deposit...
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="p-4 bg-red-50 border-[2px] border-red-500 text-xs font-bold text-red-600">
                  Belum ada metode pembayaran deposit yang diaktifkan Admin.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((m: PaymentMethodData) => {
                    const isSelected = selectedMethodCode === m.code;
                    const feeText = m.feeFlat > 0 || m.feePercent > 0
                      ? `Fee: ${m.feeFlat > 0 ? `Rp ${m.feeFlat.toLocaleString('id-ID')}` : ''} ${m.feePercent > 0 ? `${m.feePercent}%` : ''}`
                      : 'Tanpa Biaya Admin';

                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMethodCode(m.code)}
                        className={`p-3.5 border-[3px] border-black cursor-pointer transition-all flex items-center justify-between shadow-[3px_3px_0px_0px_#000] ${
                          isSelected
                            ? 'bg-yellow-100 border-black ring-2 ring-black'
                            : 'bg-white hover:bg-neutral-50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-black text-xs uppercase text-black flex items-center gap-1.5">
                            <span>{m.name}</span>
                            {m.gateway?.code === 'manual' && (
                              <Badge variant="purple" size="sm" className="text-[9px] px-1 py-0 font-bold">
                                TRANSFER
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] font-bold text-neutral-500">
                            {feeText}
                          </div>
                        </div>

                        <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${isSelected ? 'bg-black' : 'bg-white'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PREVIEW TOTAL BAYAR */}
            {selectedMethod && (
              <div className="p-4 bg-neutral-900 text-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span>Nominal Saldo:</span>
                  <span>Rp {requestedAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Estimasi Biaya Admin:</span>
                  <span>+ Rp {estimatedFee.toLocaleString('id-ID')}</span>
                </div>
                {selectedMethod.useUniqueCode && (
                  <div className="text-purple-300 text-[11px]">
                    * Metode ini menggunakan Kode Unik 2-digit (diberikan otomatis saat submit)
                  </div>
                )}
                <div className="border-t border-neutral-700 pt-2 flex justify-between font-black text-sm text-[var(--nb-yellow)] font-sans">
                  <span>ESTIMASI TOTAL BAYAR:</span>
                  <span>Rp {estimatedTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="pink"
              size="lg"
              className="w-full font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000]"
              disabled={isSubmitting || paymentMethods.length === 0 || requestedAmount < minDeposit || requestedAmount > maxDeposit}
            >
              {isSubmitting ? (
                <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>LANJUTKAN DEPOSIT SALDO</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </span>
              )}
            </Button>

          </form>
        </CardContent>
      </Card>

      {/* RIWAYAT DEPOSIT USER */}
      <Card variant="white" shadow="lg" className="border-[4px] border-black">
        <CardHeader headerBg="#6EE7B7" className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
            <CreditCard className="w-4 h-4 stroke-[3]" />
            <span>RIWAYAT TIKET DEPOSIT ANDA</span>
          </CardTitle>
          <Button 
            variant="white" 
            size="sm" 
            onClick={() => refetchHistory()}
            className="text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> REFRESH
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {isLoadingHistory ? (
            <div className="p-8 text-center text-xs font-bold text-neutral-500">
              Memuat riwayat deposit...
            </div>
          ) : historyItems.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-neutral-500">
              Belum ada transaksi deposit.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-bold">
                <thead>
                  <tr className="bg-neutral-100 border-b-[2px] border-black uppercase text-[11px] font-black">
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Metode</th>
                    <th className="p-3">Saldo</th>
                    <th className="p-3">Total Bayar</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Tanggal / Struk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {historyItems.map((h) => (
                    <tr key={h.id} className="hover:bg-yellow-50 transition-colors">
                      <td className="p-3 font-mono font-black">{h.paymentRef}</td>
                      <td className="p-3">{h.paymentMethod}</td>
                      <td className="p-3 text-green-700 font-black">Rp {h.amount.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-blue-700 font-black">Rp {h.totalAmount.toLocaleString('id-ID')}</td>
                      <td className="p-3">
                        <Badge 
                          variant={h.status === 'SUCCESS' ? 'mint' : h.status === 'PENDING' ? 'yellow' : 'pink'}
                          size="sm"
                          className="font-black text-[10px]"
                        >
                          {h.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="white"
                          size="sm"
                          onClick={() => handleViewInvoiceDetail(h)}
                          className="text-[10px] p-1.5 font-black uppercase"
                        >
                          LIHAT INVOICE
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalDeposits > 0 && (
            <div className="bg-neutral-50 border-t-[3px] border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
              <div className="text-neutral-600">
                Menampilkan <span className="text-black font-black">{startDepositItem}–{endDepositItem}</span> dari <span className="text-black font-black">{totalDeposits}</span> deposit {totalDepositPages > 1 ? `(Halaman ${depositPage} dari ${totalDepositPages})` : ''}
              </div>
              {totalDepositPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="white"
                    size="sm"
                    disabled={depositPage <= 1 || isLoadingHistory}
                    onClick={() => setDepositPage((p) => Math.max(1, p - 1))}
                    className="font-black uppercase shadow-[2px_2px_0px_0px_#000]"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[3]" />
                    <span>PREV</span>
                  </Button>
                  <span className="px-2.5 py-1 bg-white border-2 border-black font-mono font-black rounded shadow-[2px_2px_0px_0px_#000]">
                    {depositPage} / {totalDepositPages}
                  </span>
                  <Button
                    variant="white"
                    size="sm"
                    disabled={depositPage >= totalDepositPages || isLoadingHistory}
                    onClick={() => setDepositPage((p) => Math.min(totalDepositPages, p + 1))}
                    className="font-black uppercase shadow-[2px_2px_0px_0px_#000]"
                  >
                    <span>NEXT</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
