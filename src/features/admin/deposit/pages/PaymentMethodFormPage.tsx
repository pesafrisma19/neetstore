import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { ArrowLeft, Save, CreditCard, Building2, Zap, RefreshCw } from 'lucide-react';
import { 
  getAdminPaymentGateways, 
  getAdminPaymentMethodById, 
  createAdminPaymentMethod, 
  updateAdminPaymentMethod,
  getNeetPayPaymentChannelsAdmin
} from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

interface PaymentGatewayData {
  id: number;
  name: string;
  code: string;
}

export const PaymentMethodFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [gateways, setGateways] = useState<PaymentGatewayData[]>([]);
  const [neetpayChannels, setNeetpayChannels] = useState<Array<{ id: string; name: string; method: string; provider: string }>>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'BANK_TRANSFER',
    paymentGatewayId: '',
    usageScope: 'BOTH',
    feeFlat: 0,
    feePercent: 0,
    feeMinimumAmount: '' as string | number,
    minAmount: '' as string | number,
    maxAmount: '' as string | number,
    iconUrl: '',
    instructions: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    qrString: '',
    isActive: true,
    useUniqueCode: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const gatewaysData = await getAdminPaymentGateways().catch(() => []);
        setGateways(Array.isArray(gatewaysData) ? gatewaysData : []);

        if (isEdit && id) {
          const methodData = await getAdminPaymentMethodById(Number(id));
          if (methodData) {
            let scope = 'BOTH';
            if (methodData.forTransaction && !methodData.forDeposit) scope = 'TRANSACTION';
            if (!methodData.forTransaction && methodData.forDeposit) scope = 'DEPOSIT';

            setFormData({
              name: methodData.name || '',
              code: methodData.code || '',
              type: methodData.type || 'BANK_TRANSFER',
              paymentGatewayId: methodData.paymentGatewayId ? String(methodData.paymentGatewayId) : '',
              usageScope: scope,
              feeFlat: methodData.feeFlat || 0,
              feePercent: methodData.feePercent || 0,
              feeMinimumAmount: methodData.feeMinimumAmount !== undefined && methodData.feeMinimumAmount !== null ? methodData.feeMinimumAmount : '',
              minAmount: methodData.minAmount !== undefined && methodData.minAmount !== null ? methodData.minAmount : '',
              maxAmount: methodData.maxAmount !== undefined && methodData.maxAmount !== null ? methodData.maxAmount : '',
              iconUrl: methodData.iconUrl || '',
              instructions: methodData.instructions || '',
              bankName: methodData.bankName || '',
              accountNumber: methodData.accountNumber || '',
              accountHolder: methodData.accountHolder || '',
              qrString: methodData.qrString || '',
              isActive: methodData.isActive ?? true,
              useUniqueCode: methodData.useUniqueCode ?? false,
            });
          }
        }
      } catch (err: any) {
        addToast({ title: 'GAGAL MEMUAT DATA', message: err?.message || 'Gagal memuat metode pembayaran', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  const selectedGateway = gateways.find(g => String(g.id) === formData.paymentGatewayId) || null;
  const isTokoPay = selectedGateway?.code?.toLowerCase() === 'tokopay';
  const isNeetPay = selectedGateway?.code?.toLowerCase() === 'neetpay';
  const isManual = selectedGateway?.code?.toLowerCase() === 'manual';

  useEffect(() => {
    if (isNeetPay && neetpayChannels.length === 0) {
      setIsLoadingChannels(true);
      getNeetPayPaymentChannelsAdmin()
        .then((res) => {
          if (res && res.data && Array.isArray(res.data)) {
            setNeetpayChannels(res.data);
          }
        })
        .catch((err) => {
          console.warn('Gagal memuat channel NeetPay:', err.message);
        })
        .finally(() => {
          setIsLoadingChannels(false);
        });
    }
  }, [isNeetPay, neetpayChannels.length]);

  const handleNameChange = (newName: string) => {
    setFormData(prev => {
      let newCode = prev.code;
      if (!isEdit && isManual && !prev.code) {
        newCode = newName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      }
      return { ...prev, name: newName, code: newCode };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const forTransaction = formData.usageScope === 'TRANSACTION' || formData.usageScope === 'BOTH';
      const forDeposit = formData.usageScope === 'DEPOSIT' || formData.usageScope === 'BOTH';

      let finalCode = formData.code.trim();
      if (!finalCode && isManual) {
        finalCode = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      }

      const payload: any = {
        name: formData.name.trim(),
        code: finalCode,
        type: formData.type,
        paymentGatewayId: formData.paymentGatewayId ? Number(formData.paymentGatewayId) : null,
        feeFlat: Number(formData.feeFlat),
        feePercent: Number(formData.feePercent),
        feeMinimumAmount: formData.feeMinimumAmount !== '' && formData.feeMinimumAmount !== null ? Number(formData.feeMinimumAmount) : null,
        minAmount: formData.minAmount !== '' && formData.minAmount !== null ? Number(formData.minAmount) : null,
        maxAmount: formData.maxAmount !== '' && formData.maxAmount !== null ? Number(formData.maxAmount) : null,
        instructions: formData.instructions.trim() || null,
        isActive: Boolean(formData.isActive),
        forTransaction,
        forDeposit,
        useUniqueCode: Boolean(formData.useUniqueCode),
        iconUrl: formData.iconUrl.trim() || null,
        bankName: isManual && (formData.type === 'BANK_TRANSFER' || formData.type === 'E-WALLET' || formData.type === 'VIRTUAL_ACCOUNT') && formData.bankName.trim() ? formData.bankName.trim() : null,
        accountNumber: isManual && (formData.type === 'BANK_TRANSFER' || formData.type === 'E-WALLET' || formData.type === 'VIRTUAL_ACCOUNT') && formData.accountNumber.trim() ? formData.accountNumber.trim() : null,
        accountHolder: isManual && (formData.type === 'BANK_TRANSFER' || formData.type === 'E-WALLET' || formData.type === 'VIRTUAL_ACCOUNT') && formData.accountHolder.trim() ? formData.accountHolder.trim() : null,
        qrString: isManual && formData.type === 'QRIS' && formData.qrString.trim() ? formData.qrString.trim() : null,
      };

      if (isEdit && id) {
        await updateAdminPaymentMethod(Number(id), payload);
        addToast({ title: 'BERHASIL DIPERBARUI! 🎉', message: `Metode ${payload.name} berhasil disimpan.`, type: 'success' });
      } else {
        await createAdminPaymentMethod(payload);
        addToast({ title: 'BERHASIL DITAMBAHKAN! 🎉', message: `Metode ${payload.name} berhasil dibuat.`, type: 'success' });
      }

      navigate('/admin/payment-methods');
    } catch (err: any) {
      addToast({ title: 'GAGAL MENYIMPAN', message: err?.message || 'Terjadi kesalahan saat menyimpan', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center font-sans">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent mx-auto mb-3" />
        <span className="font-black text-sm uppercase">Memuat formulir pembayaran...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl text-left font-sans pb-12">
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="white"
            size="sm"
            onClick={() => navigate('/admin/payment-methods')}
            className="border-2 border-black"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> KEMBALI
          </Button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2">
              <CreditCard className="w-6 h-6 stroke-[2.5]" />
              <span>{isEdit ? 'EDIT METODE PEMBAYARAN' : 'TAMBAH METODE PEMBAYARAN'}</span>
            </h1>
            <p className="text-xs font-bold text-black/80 mt-0.5">
              Konfigurasikan gateway provider, biaya admin, channel code, serta instruksi bayar.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card variant="white" shadow="xl" borderWidth="4">
          <CardHeader headerBg="#00F0FF" className="border-b-[3px] border-black">
            <CardTitle className="text-base text-black">1. INFORMASI DASAR & GATEWAY</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  NAMA METODE PEMBAYARAN <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Contoh: QRIS NeetPay, QRIS All Payment, BCA Transfer"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  PAYMENT GATEWAY PROVIDER <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.paymentGatewayId}
                  onChange={e => setFormData({ ...formData, paymentGatewayId: e.target.value })}
                  options={[
                    { value: '', label: 'Internal / Tanpa Gateway (Saldo Akun / Manual)' },
                    ...gateways.map(g => ({
                      value: String(g.id),
                      label: `${g.name} (${g.code.toUpperCase()})`
                    }))
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  KATEGORI TIPE PEMBAYARAN <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  options={[
                    { value: 'QRIS', label: 'QRIS (Dynamic / Static QR Code)' },
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer Manual (BCA, Mandiri, BRI, dll)' },
                    { value: 'VIRTUAL_ACCOUNT', label: 'Virtual Account' },
                    { value: 'E-WALLET', label: 'E-Wallet (DANA, GoPay, OVO, ShopeePay)' },
                    { value: 'RETAIL', label: 'Retail Outlet (Indomaret / Alfamart)' },
                    { value: 'SALDO_AKUN', label: 'Saldo Akun Internal (Potong Saldo)' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  DIGUNAKAN UNTUK <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.usageScope}
                  onChange={e => setFormData({ ...formData, usageScope: e.target.value })}
                  options={[
                    { value: 'BOTH', label: 'Keduanya (Transaksi & Deposit)' },
                    { value: 'TRANSACTION', label: 'Transaksi Pembelian Saja' },
                    { value: 'DEPOSIT', label: 'Deposit Saldo Saja' },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                ICON / LOGO PAYMENT METHOD (OPSIONAL)
              </label>
              <Input
                value={formData.iconUrl}
                onChange={e => setFormData({ ...formData, iconUrl: e.target.value })}
                placeholder="Contoh: https://.../dana.png atau /images/payment/dana.png"
              />
              <p className="text-[11px] font-bold text-neutral-600 mt-1">
                Kosongkan untuk menggunakan icon kategori default.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="white" shadow="xl" borderWidth="4">
          <CardHeader headerBg="#FFD700" className="border-b-[3px] border-black">
            <CardTitle className="text-base text-black flex items-center gap-2">
              <Building2 className="w-5 h-5 stroke-[2.5]" />
              <span>2. KONFIGURASI SPESIFIK GATEWAY ({selectedGateway ? selectedGateway.name : 'Internal'})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {isNeetPay && (
              <div className="p-4 bg-purple-50 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
                <div className="font-black text-xs uppercase text-purple-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-700 stroke-[2.5]" />
                    <span>⚡ KONFIGURASI CHANNEL NEETPAY GATEWAY</span>
                  </div>
                  {isLoadingChannels && (
                    <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Memuat Channel...
                    </span>
                  )}
                </div>

                {neetpayChannels.length > 0 && (
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">
                      PILIH CHANNEL DARI NEETPAY (OTOMATIS)
                    </label>
                    <Select
                      value={formData.code}
                      onChange={(e) => {
                        const channelId = e.target.value;
                        const found = neetpayChannels.find((c) => c.id === channelId);
                        setFormData((prev) => {
                          const methodUpper = String(found?.method || '').toUpperCase();
                          let suggestedType = prev.type;
                          if (methodUpper.includes('GOPAY') || methodUpper.includes('WALLET') || methodUpper.includes('DANA') || methodUpper.includes('OVO')) {
                            suggestedType = 'E-WALLET';
                          } else if (methodUpper.includes('QRIS')) {
                            suggestedType = 'QRIS';
                          }
                          return {
                            ...prev,
                            code: channelId,
                            name: prev.name || (found ? found.name : ''),
                            type: suggestedType,
                          };
                        });
                      }}
                      options={[
                        { value: '', label: '-- Pilih Channel dari Akun NeetPay --' },
                        ...neetpayChannels.map((c) => ({
                          value: c.id,
                          label: `${c.name} (${c.method} - ${c.provider} [${c.id}])`,
                        })),
                      ]}
                    />
                    <p className="text-[11px] font-bold text-neutral-600 mt-1">
                      Pilih channel resmi yang terdaftar di akun NeetPay Anda.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    KODE CHANNEL / PAYMENT ACCOUNT ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: cms_7e05fcad2e5249419ad21b56a3eeb4d7"
                  />
                  <p className="text-[11px] font-bold text-neutral-600 mt-1">
                    ID payment account NeetPay (format: <code>cms_xxxxx</code>) yang akan dipanggil saat checkout pelanggan.
                  </p>
                </div>
              </div>
            )}

            {isTokoPay && (
              <div className="p-4 bg-cyan-50 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
                <div className="font-black text-xs uppercase text-cyan-900 flex items-center gap-2">
                  <span>⚡ CONFIGURATION TOKOPAY API GATEWAY</span>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    KODE CHANNEL PROVIDER <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: QRIS_CUSTOM, bca_va, ovo, gopay, mandiri_va"
                  />
                  <p className="text-[11px] font-bold text-neutral-600 mt-1">
                    Kode channel resmi yang terdaftar di dokumentasi API TokoPay.
                  </p>
                </div>
              </div>
            )}

            {isManual && (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] space-y-2">
                  <div className="font-black text-xs uppercase text-yellow-900 flex items-center gap-2">
                    <span>🏦 CONFIGURATION GATEWAY MANUAL TRANSFER</span>
                  </div>
                  <p className="text-xs font-bold text-neutral-700">
                    Sistem akan menggunakan data rekening/tujuan manual berikut untuk invoice deposit dan transaksi manual. Admin akan memverifikasi bukti transfer secara manual.
                  </p>
                </div>

                {/* Manual Bank Transfer / Virtual Account / E-Wallet */}
                {(formData.type === 'BANK_TRANSFER' || formData.type === 'VIRTUAL_ACCOUNT' || formData.type === 'E-WALLET') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-black mb-1">NAMA BANK / PROVIDER</label>
                      <Input
                        value={formData.bankName}
                        onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="Contoh: Bank BCA, Mandiri, DANA"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-black mb-1">NOMOR REKENING / NO HP</label>
                      <Input
                        value={formData.accountNumber}
                        onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="Contoh: 1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-black mb-1">ATAS NAMA (ACCOUNT HOLDER)</label>
                      <Input
                        value={formData.accountHolder}
                        onChange={e => setFormData({ ...formData, accountHolder: e.target.value })}
                        placeholder="Contoh: PT Netstore Indonesia"
                      />
                    </div>
                  </div>
                )}

                {/* Manual QRIS */}
                {formData.type === 'QRIS' && (
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">
                      QR STRING PAYLOAD (EMVCO) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full border-4 border-black p-3 bg-white text-black font-mono font-bold text-xs focus:outline-none focus:border-[var(--nb-primary)] transition-all resize-y"
                      rows={4}
                      value={formData.qrString}
                      onChange={e => setFormData({ ...formData, qrString: e.target.value })}
                      placeholder="00020101021126580016ID.CO.QRIS.WWW..."
                    />
                    <p className="text-[11px] font-bold text-neutral-600 mt-1">
                      Frontend akan otomatis me-render string EMVCo QRIS ini menjadi gambar QR Code interaktif pada halaman invoice pelanggan.
                    </p>
                  </div>
                )}

                {/* Internal code slug for manual */}
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">KODE IDENTIFIER INTERNAL</label>
                  <Input
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: bca_manual (otomatis dibuat dari nama jika kosong)"
                  />
                </div>
              </div>
            )}

            {!selectedGateway && (
              <div className="p-4 bg-neutral-100 border-[3px] border-black font-bold text-xs text-neutral-600">
                Metode pembayaran internal / saldo akun tidak memerlukan kredensial gateway eksternal.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. BIAYA ADMIN & LIMIT */}
        <Card variant="white" shadow="xl" borderWidth="4">
          <CardHeader headerBg="#FF71CE" className="border-b-[3px] border-black">
            <CardTitle className="text-base text-black">3. BIAYA ADMIN & BATAS NOMINAL</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">BIAYA ADMIN TETAP (RP)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.feeFlat}
                  onChange={e => setFormData({ ...formData, feeFlat: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">BIAYA ADMIN PERSEN (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.feePercent}
                  onChange={e => setFormData({ ...formData, feePercent: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">BATAS MINIMAL KENA FEE (RP)</label>
              <Input
                type="number"
                min="0"
                placeholder="Contoh: 500000"
                value={formData.feeMinimumAmount}
                onChange={e => setFormData({ ...formData, feeMinimumAmount: e.target.value })}
              />
              <p className="text-[11px] text-gray-600 mt-1">Kosongkan jika biaya berlaku untuk semua nominal transaksi.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">MINIMUM PEMBAYARAN (RP)</label>
                <Input
                  type="number"
                  placeholder="Kosongkan jika tanpa limit"
                  value={formData.minAmount}
                  onChange={e => setFormData({ ...formData, minAmount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">MAKSIMUM PEMBAYARAN (RP)</label>
                <Input
                  type="number"
                  placeholder="Kosongkan jika tanpa limit"
                  value={formData.maxAmount}
                  onChange={e => setFormData({ ...formData, maxAmount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">INSTRUKSI TAMBAHAN</label>
              <textarea
                className="w-full border-4 border-black p-3 bg-white text-black font-bold text-xs focus:outline-none focus:border-[var(--nb-primary)] transition-all resize-y"
                rows={4}
                value={formData.instructions}
                onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Catatan tambahan / instruksi cara bayar untuk invoice pelanggan..."
              />
            </div>
          </CardContent>
        </Card>

        {/* 4. CONTROL SWITCHES */}
        <Card variant="white" shadow="xl" borderWidth="4">
          <CardHeader headerBg="#00F0FF" className="border-b-[3px] border-black">
            <CardTitle className="text-base text-black">4. CONTROL SWITCHES & KODE UNIK</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">STATUS METODE</label>
                <Select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  options={[
                    { value: 'true', label: 'AKTIF (Dapat Digunakan)' },
                    { value: 'false', label: 'NONAKTIF (Disembunyikan)' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">GUNAKAN KODE UNIK</label>
                <Select
                  value={formData.useUniqueCode ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, useUniqueCode: e.target.value === 'true' })}
                  options={[
                    { value: 'true', label: 'AKTIF (Reservasi Unik 01-99)' },
                    { value: 'false', label: 'NONAKTIF' }
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FORM ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button 
            type="button" 
            variant="white" 
            size="md" 
            onClick={() => navigate('/admin/payment-methods')}
            disabled={isSubmitting}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            BATAL
          </Button>
          <Button 
            type="submit" 
            variant="yellow" 
            size="md" 
            disabled={isSubmitting}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <Save className="w-5 h-5 mr-2 stroke-[2.5]" />
            <span>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN METODE PEMBAYARAN'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
