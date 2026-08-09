import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Callout } from '../../../../components/ui/Callout';
import { 
  Wallet, 
  CreditCard, 
  Copy, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw, 
  ArrowRight
} from 'lucide-react';
import { 
  getDepositPaymentMethods, 
  getPublicSettings, 
  createUserDeposit, 
  getUserDepositHistory,
  getUserDepositDetail
} from '../../../../utils/api';
import { PaymentDetails } from '../../../../components/shared/PaymentDetails';
import { type PaymentMethodData } from '../../../admin/types';
import { useAuth } from '../../../../contexts/AuthContext';
import { queryKeys } from '../../../../services/queryKeys';
import { queryClient } from '../../../../services/queryClient';

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

  // Input States
  const [amountInput, setAmountInput] = useState<string>('50000');
  const [selectedMethodCode, setSelectedMethodCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeInvoice, setActiveInvoice] = useState<UserDepositInvoice | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

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

  // 3. Query User Deposit History
  const { 
    data: historyData, 
    isLoading: isLoadingHistory, 
    refetch: refetchHistory 
  } = useQuery({
    queryKey: queryKeys.user.deposits.history(user?.id || 0),
    queryFn: () => getUserDepositHistory({ page: 1, limit: 10 }),
    enabled: Boolean(user?.id),
  });

  const historyItems: UserDepositInvoice[] = historyData?.data || [];

  // 4. Polling Status Active Invoice jika PENDING
  const activeRef = activeInvoice?.paymentRef;
  const isPending = activeInvoice?.status === 'PENDING';

  useQuery({
    queryKey: ['depositStatusPoll', activeRef],
    queryFn: async () => {
      if (!activeRef) return null;
      const res = await getUserDepositHistory({ page: 1, limit: 5 });
      const items: UserDepositInvoice[] = res?.data || [];
      const updated = items.find(d => d.paymentRef === activeRef);

      if (updated) {
        setActiveInvoice((prev) => prev ? { ...prev, ...updated } : updated);
        if (updated.status === 'SUCCESS') {
          queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
          refetchHistory();
        }
      }
      return updated;
    },
    enabled: Boolean(activeRef && isPending),
    refetchInterval: isPending ? 3000 : false, // Poll every 3 seconds while PENDING
  });

  // Calculation Estimates
  const requestedAmount = Number(amountInput) || 0;
  const selectedMethod = paymentMethods.find((m: PaymentMethodData) => m.code === selectedMethodCode);

  const estimatedFee = selectedMethod 
    ? Math.round((selectedMethod.feeFlat || 0) + (requestedAmount * (selectedMethod.feePercent || 0)) / 100)
    : 0;
  const estimatedTotal = requestedAmount + estimatedFee;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2000);
  };

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
        setActiveInvoice({
          ...createdDeposit,
          instructions: res.data.instructions,
          tokopayData: res.data.tokopayData,
        });
        resetIntentKey();
        setTimeout(() => {
          const el = document.getElementById('active-deposit-invoice-card');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        refetchHistory();
      }
    } catch (err: any) {
      alert(err?.message || 'Gagal membuat deposit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewInvoiceDetail = async (item: UserDepositInvoice) => {
    try {
      const res = await getUserDepositDetail(item.paymentRef);
      if (res.success && res.data) {
        setActiveInvoice(res.data);
      } else {
        setActiveInvoice(item);
      }
    } catch {
      setActiveInvoice(item);
    }
    setTimeout(() => {
      const el = document.getElementById('active-deposit-invoice-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* INVOICE TIKET DEPOSIT AKTIF / TERAKHIR */}
      {activeInvoice && (
        <Card id="active-deposit-invoice-card" variant="white" shadow="xl" className="border-[4px] border-black overflow-hidden">
          <CardHeader 
            headerBg={
              activeInvoice.status === 'SUCCESS' ? '#6EE7B7' : 
              activeInvoice.status === 'FAILED' ? '#FCA5A5' : '#FFDC00'
            }
            className="flex items-center justify-between"
          >
            <CardTitle className="text-base text-black flex items-center gap-2">
              <CreditCard className="w-5 h-5 stroke-[3]" />
              <span>INVOICE DEPOSIT #{activeInvoice.paymentRef}</span>
            </CardTitle>
            <Badge 
              variant={activeInvoice.status === 'SUCCESS' ? 'mint' : activeInvoice.status === 'FAILED' ? 'pink' : 'yellow'} 
              size="sm"
              className="font-black uppercase"
            >
              {activeInvoice.status === 'SUCCESS' && <CheckCircle className="w-3.5 h-3.5 inline mr-1" />}
              {activeInvoice.status === 'PENDING' && <Clock className="w-3.5 h-3.5 inline mr-1 animate-spin" />}
              {activeInvoice.status === 'FAILED' && <XCircle className="w-3.5 h-3.5 inline mr-1" />}
              {activeInvoice.status}
            </Badge>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Alert Status Banner */}
            {activeInvoice.status === 'SUCCESS' && (
              <Callout tone="mint" title="🎉 DEPOSIT SALDO BERHASIL!">
                Saldo sebesar <b>Rp {activeInvoice.amount.toLocaleString('id-ID')}</b> telah ditambahkan ke akun Anda!
              </Callout>
            )}

            {activeInvoice.status === 'FAILED' && (
              <Callout tone="pink" title="❌ DEPOSIT GAGAL / KADALUARSA">
                Alasan: <b>{activeInvoice.failureReason || 'Waktu pembayaran berakhir atau ditolak Admin.'}</b>
              </Callout>
            )}

            {activeInvoice.status === 'PENDING' && (
              <Callout tone="yellow" title="⏳ MENUNGGU PEMBAYARAN">
                Silakan lakukan pembayaran sesuai petunjuk di bawah sebelum waktu habis. Status akan diperbarui secara otomatis.
              </Callout>
            )}

            {/* Total Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 p-4 border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
              <div>
                <div className="text-xs font-bold text-neutral-500 uppercase">Nominal Saldo Diterima</div>
                <div className="text-xl font-black text-green-700">Rp {activeInvoice.amount.toLocaleString('id-ID')}</div>
              </div>

              <div>
                <div className="text-xs font-bold text-neutral-500 uppercase">Total Harus Dibayar</div>
                <div className="text-xl font-black text-blue-700 flex items-center gap-2">
                  <span>Rp {activeInvoice.totalAmount.toLocaleString('id-ID')}</span>
                  <Button 
                    variant="white" 
                    size="sm" 
                    onClick={() => handleCopy(String(activeInvoice.totalAmount), 'TOTAL')}
                    className="text-[10px] p-1 h-auto"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {copySuccess === 'TOTAL' ? 'COPIED!' : 'SALIN'}
                  </Button>
                </div>
              </div>

              {activeInvoice.fee > 0 && (
                <div className="text-xs font-bold text-neutral-600">
                  Biaya Admin: Rp {activeInvoice.fee.toLocaleString('id-ID')}
                </div>
              )}

              {activeInvoice.uniqueCode > 0 && (
                <div className="text-xs font-mono font-black text-purple-700">
                  Kode Unik: +{activeInvoice.uniqueCode.toString().padStart(2, '0')} (Membantu Verifikasi Serupa)
                </div>
              )}
            </div>

            {activeInvoice.status === 'PENDING' && (
              <div className="pt-2 border-t-[2px] border-dashed border-neutral-300">
                <PaymentDetails
                  methodName={activeInvoice.paymentMethod}
                  gatewayCode={activeInvoice.paymentMethodRel?.gateway?.code}
                  paymentType={activeInvoice.paymentMethodRel?.type}
                  totalAmount={activeInvoice.totalAmount}
                  uniqueCode={activeInvoice.uniqueCode}
                  bankName={activeInvoice.paymentMethodRel?.bankName}
                  accountNumber={activeInvoice.paymentMethodRel?.accountNumber}
                  accountHolder={activeInvoice.paymentMethodRel?.accountHolder}
                  qrString={activeInvoice.qrString || activeInvoice.paymentMethodRel?.qrString}
                  checkoutUrl={activeInvoice.checkoutUrl}
                  paymentUrl={activeInvoice.paymentUrl}
                  instructions={activeInvoice.paymentInstructions || activeInvoice.instructions}
                />
              </div>
            )}

            <div className="flex justify-between items-center text-xs font-bold text-neutral-500 pt-2">
              <div>Metode: <b>{activeInvoice.paymentMethod}</b></div>
              <Button 
                variant="white" 
                size="sm" 
                onClick={() => {
                  setActiveInvoice(null);
                  resetIntentKey();
                }}
                className="font-black uppercase text-xs"
              >
                TUTUP INVOICE
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
        </CardContent>
      </Card>

    </div>
  );
};
