import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  CreditCard, 
  ArrowLeft, 
  Copy, 
  Check, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw, 
  Wallet,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Callout } from '../../../../components/ui/Callout';
import { PaymentDetails } from '../../../../components/shared/PaymentDetails';
import { getUserDepositDetail } from '../../../../utils/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { queryKeys } from '../../../../services/queryKeys';
import { queryClient } from '../../../../services/queryClient';

export const DepositInvoicePage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const { user: authUser, isLoading: authLoading } = useAuth();

  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [copiedTotal, setCopiedTotal] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const depositRef = reference || '';

  // Query Deposit Detail with Reactive Polling
  const { 
    data: depositResponse, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['user', 'deposit', depositRef],
    queryFn: async () => {
      if (!depositRef) throw new Error('Kode referensi deposit tidak valid.');
      const res = await getUserDepositDetail(depositRef);
      if (res.success && res.data) {
        return res.data;
      }
      if (res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Invoice deposit tidak ditemukan.');
    },
    enabled: Boolean(depositRef && authUser),
    staleTime: 2000,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === 'PENDING' ? 3000 : false;
    },
  });

  const deposit = depositResponse;

  // Invalidate profile query when status becomes SUCCESS
  useEffect(() => {
    if (deposit?.status === 'SUCCESS') {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    }
  }, [deposit?.status]);

  // Realtime Countdown Timer calculation
  useEffect(() => {
    if (!deposit || deposit.status !== 'PENDING' || !deposit.expiredAt) {
      setTimeLeft(null);
      return;
    }

    const expiredTimestamp = new Date(deposit.expiredAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((expiredTimestamp - now) / 1000));
      setTimeLeft(diffSeconds);
      if (diffSeconds <= 0) {
        refetch();
      }
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [deposit, refetch]);

  const handleCopy = (text: string, type: 'ref' | 'total') => {
    navigator.clipboard.writeText(text);
    if (type === 'ref') {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedTotal(true);
      setTimeout(() => setCopiedTotal(false), 2000);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };

  // Auth Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)] font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="p-6 bg-white dark:bg-black/90 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] text-center">
            <span className="font-black text-sm uppercase tracking-wider block">
              MEMUAT SESI PENGGUNA...
            </span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not Logged In
  if (!authUser) {
    return (
      <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)] font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card variant="white" shadow="xl" borderWidth="3" className="max-w-md w-full p-6 text-center rounded-2xl">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3 stroke-[2.5]" />
            <h2 className="font-black text-base uppercase text-[var(--nb-text)] mb-2">
              AUTENTIKASI DIPERLUKAN
            </h2>
            <p className="text-xs font-bold text-[var(--nb-text-muted)] mb-6">
              Silakan login terlebih dahulu untuk melihat invoice deposit Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="yellow"
                onClick={() => navigate('/login')}
                className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
              >
                LOGIN SEKARANG
              </Button>
              <Button
                variant="white"
                onClick={() => navigate('/')}
                className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
              >
                BERANDA
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)] font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="p-8 bg-white dark:bg-black/90 border-[3.5px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] text-center max-w-sm w-full">
            <Clock className="w-10 h-10 mx-auto mb-4 text-amber-500 animate-spin stroke-[2.5]" />
            <span className="font-black text-sm uppercase tracking-wider block text-[var(--nb-text)]">
              MEMUAT INVOICE DEPOSIT...
            </span>
            <span className="font-mono text-xs font-bold text-[var(--nb-text-muted)] mt-1 block">
              #{depositRef}
            </span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error / Not Found State
  if (isError || !deposit) {
    return (
      <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)] font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card variant="white" shadow="xl" borderWidth="3" className="max-w-md w-full p-6 text-center rounded-2xl">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3 stroke-[2.5]" />
            <h2 className="font-black text-base uppercase text-[var(--nb-text)] mb-2">
              INVOICE TIDAK DITEMUKAN
            </h2>
            <p className="text-xs font-bold text-[var(--nb-text-muted)] mb-6">
              {(error as any)?.message || 'Invoice deposit tidak ditemukan atau Anda tidak memiliki izin akses.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="yellow"
                onClick={() => navigate('/dashboard')}
                className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
              >
                KEMBALI KE DASHBOARD
              </Button>
              <Button
                variant="white"
                onClick={() => refetch()}
                className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
              >
                COBA LAGI
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const isPending = deposit.status === 'PENDING';
  const isSuccess = deposit.status === 'SUCCESS';
  const isFailed = deposit.status === 'FAILED';

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)] font-sans">
      <Navbar />

      <main className="flex-1 py-6 sm:py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="white"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>DASHBOARD</span>
            </Button>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 bg-white dark:bg-neutral-900 border-[2.5px] border-black rounded-xl shadow-[2.5px_2.5px_0px_0px_#000] hover:bg-neutral-100 transition-all active:scale-95 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
              title="Refresh Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">CEK STATUS</span>
            </button>
          </div>

          {/* MAIN INVOICE CARD */}
          <Card variant="white" shadow="xl" borderWidth="3" className="rounded-3xl overflow-hidden border-black">
            {/* CARD HEADER */}
            <CardHeader
              headerBg={isSuccess ? '#6EE7B7' : isFailed ? '#FCA5A5' : 'var(--nb-yellow)'}
              className="border-b-[3px] border-black p-4 sm:p-5 flex flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-white dark:bg-black border-[2px] border-black rounded-xl shadow-[2px_2px_0px_0px_#000] shrink-0">
                  <CreditCard className="w-5 h-5 text-black dark:text-white stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black/70 block">
                    INVOICE DEPOSIT SALDO
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-xs sm:text-sm text-black truncate">
                      #{deposit.paymentRef}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(deposit.paymentRef, 'ref')}
                      className="p-1 hover:bg-black/10 rounded transition-colors text-black cursor-pointer"
                      title="Salin Referensi"
                    >
                      {copiedRef ? <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-800" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                  </div>
                </div>
              </div>

              <Badge
                variant={isSuccess ? 'mint' : isFailed ? 'pink' : 'yellow'}
                size="sm"
                className="font-black uppercase tracking-wider text-[11px] py-1 px-2.5 shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
              >
                {isSuccess && <CheckCircle className="w-3.5 h-3.5 inline mr-1 stroke-[3]" />}
                {isPending && <Clock className="w-3.5 h-3.5 inline mr-1 stroke-[3] animate-spin" />}
                {isFailed && <XCircle className="w-3.5 h-3.5 inline mr-1 stroke-[3]" />}
                {isSuccess ? 'BERHASIL' : isPending ? 'MENUNGGU' : 'GAGAL'}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* Status Alert Banner */}
              {isSuccess && (
                <Callout tone="mint" title="🎉 DEPOSIT SALDO BERHASIL!">
                  Saldo sebesar <b>{formatRupiah(deposit.amount)}</b> telah berhasil ditambahkan ke <b>Saldo Akun</b> Anda!
                </Callout>
              )}

              {isFailed && (
                <Callout tone="pink" title="❌ DEPOSIT GAGAL / KEDALUWARSA">
                  Alasan: <b>{deposit.failureReason || 'Waktu pembayaran berakhir atau dibatalkan sistem.'}</b>
                </Callout>
              )}

              {isPending && (
                <Callout tone="yellow" title="⏳ MENUNGGU PEMBAYARAN">
                  Selesaikan pembayaran sebelum batas waktu berakhir. Status akan terverifikasi secara otomatis.
                </Callout>
              )}

              {/* Rincian Nominal & Total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
                <div>
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] block tracking-wider">
                    NOMINAL SALDO MASUK
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans block mt-0.5">
                    {formatRupiah(deposit.amount)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] block tracking-wider">
                    TOTAL HARUS DIBAYAR
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-sans">
                      {formatRupiah(deposit.totalAmount)}
                    </span>
                    <Button
                      variant="white"
                      size="sm"
                      onClick={() => handleCopy(String(deposit.totalAmount), 'total')}
                      className="text-[10px] py-0.5 px-2 h-auto font-black shadow-[1.5px_1.5px_0px_0px_#000]"
                    >
                      {copiedTotal ? 'DISALIN!' : 'SALIN'}
                    </Button>
                  </div>
                </div>

                {(deposit.fee > 0 || deposit.uniqueCode > 0) && (
                  <div className="sm:col-span-2 pt-2 border-t border-dashed border-neutral-300 dark:border-neutral-700 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono font-bold text-[var(--nb-text-muted)]">
                    {deposit.fee > 0 && (
                      <span>Biaya Admin: <strong className="text-[var(--nb-text)]">{formatRupiah(deposit.fee)}</strong></span>
                    )}
                    {deposit.uniqueCode > 0 && (
                      <span className="text-purple-600 dark:text-purple-400">Kode Unik: <strong>+{deposit.uniqueCode}</strong></span>
                    )}
                  </div>
                )}
              </div>

              {/* PAYMENT DETAILS SECTION (Reused Modular Component) */}
              {isPending && (
                <div className="pt-2 border-t-[2.5px] border-dashed border-neutral-300 dark:border-neutral-700">
                  <PaymentDetails
                    methodName={deposit.paymentMethod}
                    gatewayCode={deposit.paymentMethodRel?.gateway?.code}
                    paymentType={deposit.paymentMethodRel?.type}
                    totalAmount={deposit.totalAmount}
                    uniqueCode={deposit.uniqueCode}
                    bankName={deposit.paymentMethodRel?.bankName}
                    accountNumber={deposit.paymentMethodRel?.accountNumber}
                    accountHolder={deposit.paymentMethodRel?.accountHolder}
                    qrString={deposit.qrString || deposit.paymentMethodRel?.qrString}
                    qrImageUrl={deposit.qrImageUrl}
                    checkoutUrl={deposit.checkoutUrl}
                    paymentUrl={deposit.paymentUrl}
                    instructions={deposit.instructions}
                    timeLeft={timeLeft}
                  />
                </div>
              )}

              {/* Timestamp & Metadata Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono text-[var(--nb-text-muted)] border-t border-neutral-200 dark:border-neutral-800">
                <span>Dibuat: {formatDate(deposit.createdAt)}</span>
                {deposit.paidAt && (
                  <span>Dibayar: {formatDate(deposit.paidAt)}</span>
                )}
              </div>

              {/* Bottom Action CTA */}
              <div className="pt-2">
                <Button
                  variant={isSuccess ? 'mint' : 'yellow'}
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  className="w-full font-black uppercase text-xs sm:text-sm tracking-wider shadow-[4px_4px_0px_0px_#000] flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4 stroke-[2.5]" />
                  <span>KEMBALI KE DASHBOARD</span>
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};
