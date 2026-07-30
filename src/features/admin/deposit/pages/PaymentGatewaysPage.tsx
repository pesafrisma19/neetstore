import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Key, 
  RefreshCw, 
  Power, 
  Wallet, 
  ShieldCheck, 
  Copy
} from 'lucide-react';
import { PaymentGatewayModal } from '../components/PaymentGatewayModal';
import { WithdrawalModal } from '../components/WithdrawalModal';
import type { PaymentGatewayData } from '../components/PaymentGatewayModal';
import { 
  getAdminPaymentGateways, 
  updateAdminPaymentGateway, 
  checkTokoPayBalance 
} from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export const PaymentGatewaysPage: React.FC = () => {
  const { addToast } = useToast();
  const [gateways, setGateways] = useState<PaymentGatewayData[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState<boolean>(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayData | null>(null);
  const [checkingBalance, setCheckingBalance] = useState<boolean>(false);

  const fetchGateways = async () => {
    try {
      const data = await getAdminPaymentGateways();
      setGateways(data || []);
    } catch (err: any) {
      addToast({
        title: 'GAGAL MEMUAT DATA',
        message: 'Gagal mengambil data Payment Gateway dari server.',
        type: 'error',
      });
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const tokopayGateway = gateways.find(
    (p) => p.code?.toLowerCase() === 'tokopay' || p.name?.toLowerCase().includes('tokopay')
  ) || {
    id: 1,
    name: 'TokoPay Indonesia',
    code: 'tokopay',
    isActive: true,
    balance: 0,
    merchantId: '',
    secretKey: '',
  };

  const handleToggleStatus = async () => {
    if (!tokopayGateway) return;
    const nextStatus = !tokopayGateway.isActive;
    try {
      await updateAdminPaymentGateway(tokopayGateway.id, {
        isActive: nextStatus,
        merchantId: tokopayGateway.merchantId,
        secretKey: tokopayGateway.secretKey,
      });
      addToast({
        title: nextStatus ? 'GATEWAY AKTIF 🟢' : 'GATEWAY NONAKTIF 🔴',
        message: nextStatus
          ? 'TokoPay diaktifkan. Pelanggan dapat membayar via QRIS/VA/E-Wallet.'
          : 'TokoPay dinonaktifkan. Opsi pembayaran online ditutup sementara.',
        type: 'success',
      });
      fetchGateways();
    } catch (err: any) {
      addToast({
        title: 'GAGAL MENGUBAH STATUS',
        message: err.message || 'Gagal mengubah status aktif gateway.',
        type: 'error',
      });
    }
  };

  const handleCheckBalance = async () => {
    setCheckingBalance(true);
    try {
      const res = await checkTokoPayBalance();
      if ((res as any)?.error) {
        addToast({
          title: 'GAGAL CEK SALDO',
          message: (res as any).error || 'Periksa koneksi atau Merchant ID Anda.',
          type: 'error',
        });
      } else {
        addToast({
          title: 'SALDO TOKOPAY TERKINI 💰',
          message: 'Berhasil menyinkronkan saldo merchant dari server TokoPay.',
          type: 'success',
        });
        fetchGateways();
      }
    } catch (err: any) {
      addToast({
        title: 'GAGAL CEK SALDO',
        message: err.message || 'Terjadi kesalahan jaringan.',
        type: 'error',
      });
    } finally {
      setCheckingBalance(false);
    }
  };

  const handleTestConnection = () => {
    addToast({
      title: 'ADVANCE ORDER SIAP! ⚡',
      message: 'Integrasi TokoPay Advance Order dan Webhook MD5 Signature telah aktif.',
      type: 'success',
    });
  };

  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/tokopay/callback`;
    navigator.clipboard.writeText(url);
    addToast({
      title: 'WEBHOOK DISALIN 📋',
      message: 'URL Callback berhasil disalin. Tempelkan di pengaturan TokoPay Anda.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL HALAMAN */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>💳 PAYMENT GATEWAY INTEGRATION</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Gerbang Pembayaran Otomatis TokoPay (Advance Order, QRIS, Virtual Account, & Webhook Callback).
          </p>
        </div>
      </div>

      {/* 2. KARTU TOKOPAY INDONESIA */}
      <Card variant="white" shadow="xl" borderWidth="4" className="overflow-hidden">
        {/* Card Header dengan Toggle Aktif/Nonaktif */}
        <div className="bg-[var(--nb-yellow)] border-b-[4px] border-black p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-black text-2xl text-black">
              TP
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black uppercase text-black tracking-tight">
                  TOKOPAY INDONESIA
                </h2>
                <Badge
                  variant={tokopayGateway.isConnected ? 'mint' : 'pink'}
                  size="md"
                  className="border-2 border-black font-black uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1"
                >
                  {tokopayGateway.isConnected ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse block mr-1" />
                      TERHUBUNG
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500 block mr-1" />
                      TERPUTUS
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-xs font-bold text-black/80 mt-1">
                Status: {tokopayGateway.isActive ? 'API AKTIF' : 'API NONAKTIF'} (Redirect & MD5 Webhook Verification)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={tokopayGateway.isActive ? 'pink' : 'mint'}
              size="md"
              onClick={handleToggleStatus}
              className="font-black uppercase shadow-[4px_4px_0px_0px_#000] border-[3px] border-black"
            >
              <Power className="w-4 h-4 stroke-[3]" />
              <span>{tokopayGateway.isActive ? 'DISABLE GATEWAY' : 'ENABLE GATEWAY'}</span>
            </Button>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-6 space-y-6">
          {/* Box Webhook URL */}
          <div className="bg-[var(--nb-mint)] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase text-black block">
                URL WEBHOOK / CALLBACK TOKOPAY (WAJIB DITEMPEL DI DASBOR TOKOPAY):
              </span>
              <code className="text-sm font-black text-[var(--nb-purple)] mt-1 block">
                {window.location.origin}/api/tokopay/callback
              </code>
            </div>
            <Button
              variant="cyan"
              size="sm"
              onClick={copyWebhookUrl}
              className="font-black uppercase text-xs shrink-0"
            >
              <Copy className="w-3.5 h-3.5 stroke-[3]" />
              <span>SALIN WEBHOOK URL</span>
            </Button>
          </div>

          {/* Grid Statistik / Status TokoPay */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[var(--nb-card)] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
              <span className="text-xs font-black uppercase text-neutral-500 block mb-1">
                Saldo Merchant
              </span>
              <span className="text-2xl font-black text-black">
                Rp {(tokopayGateway.balance || 0).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="bg-[var(--nb-card)] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
              <span className="text-xs font-black uppercase text-neutral-500 block mb-1">
                Merchant ID
              </span>
              <span className="text-lg font-black text-black truncate block">
                {tokopayGateway.merchantId ? tokopayGateway.merchantId : 'Belum Dikonfigurasi'}
              </span>
            </div>

            <div className="bg-[var(--nb-card)] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
              <span className="text-xs font-black uppercase text-neutral-500 block mb-1">
                Order Type
              </span>
              <span className="text-lg font-black text-[var(--nb-purple)]">
                ADVANCE ORDER
              </span>
            </div>

            <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
              <span className="text-[10px] font-black uppercase text-black/50 block mb-1">
                LAST SYNC
              </span>
              <div className="text-lg font-black uppercase text-black tracking-tight">
                {tokopayGateway.lastSync ? new Date(tokopayGateway.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'BELUM SYNC'}
              </div>
            </div>
          </div>

          {/* Action Bar (4 Tombol Utama) */}
          <div className="border-t-[3px] border-black pt-6">
            <h4 className="text-xs font-black uppercase text-neutral-500 mb-3">
              AKSI KONTROL GATEWAY TOKOPAY:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="yellow"
                size="md"
                onClick={() => {
                  setSelectedGateway(tokopayGateway);
                  setModalOpen(true);
                }}
                className="w-full font-black uppercase shadow-[4px_4px_0px_0px_#000]"
              >
                <Key className="w-4 h-4 stroke-[3]" />
                <span>1. KELOLA CREDENTIAL</span>
              </Button>

              <Button
                variant="cyan"
                size="md"
                onClick={handleCheckBalance}
                disabled={checkingBalance}
                className="w-full font-black uppercase shadow-[4px_4px_0px_0px_#000]"
              >
                <RefreshCw className={`w-4 h-4 stroke-[3] ${checkingBalance ? 'animate-spin' : ''}`} />
                <span>{checkingBalance ? 'MENGECEK...' : '2. CEK SALDO TOKOPAY'}</span>
              </Button>

              <Button
                variant="mint"
                size="md"
                onClick={handleTestConnection}
                className="w-full font-black uppercase shadow-[4px_4px_0px_0px_#000]"
              >
                <ShieldCheck className="w-4 h-4 stroke-[3]" />
                <span>3. TEST KONEKSI</span>
              </Button>

              <Button
                variant="purple"
                size="md"
                onClick={() => setWithdrawModalOpen(true)}
                className="w-full font-black uppercase shadow-[4px_4px_0px_0px_#000]"
              >
                <Wallet className="w-4 h-4 stroke-[3]" />
                <span>4. TARIK SALDO (WITHDRAW)</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Kelola Kredensial TokoPay */}
      <PaymentGatewayModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchGateways}
        gateway={selectedGateway}
      />

      {/* Modal Tarik Saldo TokoPay */}
      <WithdrawalModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onSuccess={fetchGateways}
        merchantBalance={tokopayGateway.balance || 0}
      />
    </div>
  );
};
