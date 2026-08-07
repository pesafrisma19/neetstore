import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Callout } from '../../../../components/ui/Callout';
import { Save, Gift, FileText, Wallet } from 'lucide-react';
import { getAdminSettings, updateAdminSettings } from '../../../../utils/api';

interface SystemSettingsData {
  invoicePrefix: string;
  cashbackPercent: number;
  referralBonusPoints: number;
  pointValueRupiah: number;
  minPointRedeem: number;
  TOKOPAY_MERCHANT_ID?: string;
  TOKOPAY_SECRET_KEY?: string;
}

const INITIAL_SETTINGS: SystemSettingsData = {
  invoicePrefix: 'INV-',
  cashbackPercent: 1.0,
  referralBonusPoints: 500,
  pointValueRupiah: 1,
  minPointRedeem: 1000,
  TOKOPAY_MERCHANT_ID: '',
  TOKOPAY_SECRET_KEY: '',
};

interface TabSettingsProps {
  onShowToast: (title: string, message: string, type?: 'success' | 'error') => void;
}

export const TabSettings: React.FC<TabSettingsProps> = ({ onShowToast }) => {
  const [settings, setSettings] = useState<SystemSettingsData>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getAdminSettings();
      if (data) {
        setSettings({
          invoicePrefix: data.invoicePrefix || INITIAL_SETTINGS.invoicePrefix,
          cashbackPercent: parseFloat(data.cashbackPercent) || INITIAL_SETTINGS.cashbackPercent,
          referralBonusPoints: parseInt(data.referralBonusPoints) || INITIAL_SETTINGS.referralBonusPoints,
          pointValueRupiah: parseInt(data.pointValueRupiah) || INITIAL_SETTINGS.pointValueRupiah,
          minPointRedeem: parseInt(data.minPointRedeem) || INITIAL_SETTINGS.minPointRedeem,
          TOKOPAY_MERCHANT_ID: data.TOKOPAY_MERCHANT_ID || '',
          TOKOPAY_SECRET_KEY: data.TOKOPAY_SECRET_KEY || '',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateAdminSettings(settings);
      onShowToast(
        'PENGATURAN BERHASIL DISIMPAN',
        'Data pengaturan telah diperbarui di database secara dinamis!',
        'success'
      );
    } catch (error: any) {
      onShowToast('GAGAL MENYIMPAN', error?.message || 'Terjadi kesalahan sistem', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 text-left">
      
      {/* 1. ATURAN POIN REWARD & CASHBACK */}
      <Card variant="white" shadow="xl" borderWidth="4">
        <CardHeader headerBg="#FFDC00" className="flex items-center justify-between">
          <CardTitle className="text-base text-[var(--nb-text)] flex items-center gap-2">
            <Gift className="w-5 h-5 stroke-[3]" />
            <span>PENGATURAN POIN REWARD &amp; CASHBACK DINAMIS</span>
          </CardTitle>
          <Badge variant="pink" size="sm">SISTEM REWARD</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Callout tone="yellow" title="💡 ATURAN POIN DINAMIS">
            Pengaturan poin reward akan memotong tagihan checkout atau diberikan sebagai cashback saat transaksi selesai.
          </Callout>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cashback Poin (% dari Total Belanja)"
              type="number"
              step="0.1"
              value={settings.cashbackPercent}
              onChange={(e) => setSettings({ ...settings, cashbackPercent: parseFloat(e.target.value) || 0 })}
              helperText="Setiap transaksi selesai, pembeli mendapat % cashback poin ini."
            />

            <Input
              label="Bonus Poin Referral (Saat Teman Transaksi)"
              type="number"
              value={settings.referralBonusPoints}
              onChange={(e) => setSettings({ ...settings, referralBonusPoints: parseInt(e.target.value) || 0 })}
              helperText="Bonus poin untuk pemilik kode referral ketika teman sukses transaksi."
            />

            <Input
              label="Nilai Kurs Poin (1 Poin = Rp ?)"
              type="number"
              value={settings.pointValueRupiah}
              onChange={(e) => setSettings({ ...settings, pointValueRupiah: parseInt(e.target.value) || 1 })}
              helperText="Standar: 1 Poin = Rp 1 untuk potongan checkout."
            />

            <Input
              label="Minimal Poin yang Boleh Ditukar (Redeem Min)"
              type="number"
              value={settings.minPointRedeem}
              onChange={(e) => setSettings({ ...settings, minPointRedeem: parseInt(e.target.value) || 1000 })}
              helperText="Batas minimal poin yang dapat ditukarkan user ke Saldo Deposit."
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. ATURAN LIMIT DEPOSIT & PREFIX REFERENCE */}
      <Card variant="white" shadow="xl" borderWidth="4">
        <CardHeader headerBg="#6EE7B7" className="flex items-center justify-between">
          <CardTitle className="text-base text-[var(--nb-text)] flex items-center gap-2">
            <FileText className="w-5 h-5 stroke-[3]" />
            <span>PENGATURAN LIMIT DEPOSIT &amp; PREFIX REFERENCE</span>
          </CardTitle>
          <Badge variant="purple" size="sm">KONFIGURASI SISTEM</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nominal Minimum Deposit (Rp)"
              type="number"
              value={(settings as any).min_deposit_amount ?? 10000}
              onChange={(e) => setSettings({ ...settings, min_deposit_amount: parseInt(e.target.value) || 0 } as any)}
              helperText="Batas minimal pengisian saldo deposit user."
            />

            <Input
              label="Nominal Maksimum Deposit (Rp)"
              type="number"
              value={(settings as any).max_deposit_amount ?? 5000000}
              onChange={(e) => setSettings({ ...settings, max_deposit_amount: parseInt(e.target.value) || 0 } as any)}
              helperText="Batas maksimal pengisian saldo deposit user dalam 1 kali transaksi."
            />

            <Input
              label="Batas Kadaluarsa Transfer Manual (Jam)"
              type="number"
              value={(settings as any).manual_deposit_expiry_hours ?? 24}
              onChange={(e) => setSettings({ ...settings, manual_deposit_expiry_hours: parseInt(e.target.value) || 24 } as any)}
              helperText="Batas waktu (jam) tiket transfer manual aktif sebelum otomatis FAILED/EXPIRED."
            />

            <Input
              label="Prefix Reference Deposit"
              value={(settings as any).deposit_reference_prefix ?? 'DEP'}
              onChange={(e) => setSettings({ ...settings, deposit_reference_prefix: e.target.value.toUpperCase() } as any)}
              placeholder="DEP"
              helperText="Format prefix reference ID deposit (Contoh: DEP-)."
            />

            <Input
              label="Prefix Reference Transaksi Toko"
              value={(settings as any).transaction_reference_prefix ?? 'TRX'}
              onChange={(e) => setSettings({ ...settings, transaction_reference_prefix: e.target.value.toUpperCase() } as any)}
              placeholder="TRX"
              helperText="Format prefix reference ID transaksi toko (Contoh: TRX-)."
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. API PAYMENT GATEWAY (TOKOPAY) */}
      <Card variant="white" shadow="xl" borderWidth="4">
        <CardHeader headerBg="#00D2FF" className="flex items-center justify-between">
          <CardTitle className="text-base text-[var(--nb-text)] flex items-center gap-2">
            <Wallet className="w-5 h-5 stroke-[3]" />
            <span>KREDENSIAL TOKOPAY (ADVANCE ORDER)</span>
          </CardTitle>
          <Badge variant="cyan" size="sm">PAYMENT GATEWAY</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Callout tone="cyan" title="💡 TOKOPAY WEBHOOK">
            URL Webhook Anda adalah: <b>{window.location.origin}/api/tokopay/callback</b>. Silakan masukkan di dashboard TokoPay.
          </Callout>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="TokoPay Merchant ID"
              value={settings.TOKOPAY_MERCHANT_ID || ''}
              onChange={(e) => setSettings({ ...settings, TOKOPAY_MERCHANT_ID: e.target.value })}
              placeholder="Contoh: M240304UQFNY519"
              helperText="Merchant ID dari akun TokoPay Anda."
            />

            <Input
              label="TokoPay Secret Key"
              value={settings.TOKOPAY_SECRET_KEY || ''}
              onChange={(e) => setSettings({ ...settings, TOKOPAY_SECRET_KEY: e.target.value })}
              placeholder="Masukkan Secret Key..."
              type="password"
              helperText="Rahasia: Digunakan untuk enkripsi."
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Action Button */}
      <div className="flex justify-end pt-2">
        <Button type="submit" variant="yellow" size="lg" className="shadow-[4px_4px_0px_0px_var(--nb-shadow)]" disabled={loading}>
          <Save className="w-5 h-5 stroke-[3]" />
          <span>{loading ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN DINAMIS'}</span>
        </Button>
      </div>

    </form>
  );
};

