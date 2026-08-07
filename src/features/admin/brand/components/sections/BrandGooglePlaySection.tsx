import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { Download, Sparkles } from 'lucide-react';
import { apiFetch } from '../../../../../utils/api';
import { useToast } from '../../../../../components/ui/ToastContext';

interface BrandGooglePlaySectionProps {
  formData: any;
  onScrapeSuccess: (scrapedData: any) => void;
}

export const BrandGooglePlaySection: React.FC<BrandGooglePlaySectionProps> = ({
  formData,
  onScrapeSuccess,
}) => {
  const [fetching, setFetching] = useState(false);
  const { addToast } = useToast();

  const handleScrape = async () => {
    if (!formData.googlePlayId?.trim()) {
      addToast({ title: 'PERHATIAN', message: 'Masukkan Google Play ID terlebih dahulu!', type: 'error' });
      return;
    }

    setFetching(true);
    try {
      const res = await apiFetch<any>('/admin/brands/scrape-playstore', {
        method: 'POST',
        body: JSON.stringify({ appId: formData.googlePlayId.trim() }),
      });

      if (res && res.name) {
        onScrapeSuccess(res);
        addToast({ title: 'SUKSES', message: 'Berhasil auto-fetch metadata dari Google Play Store! 🎉', type: 'success' });
      } else {
        addToast({ title: 'ERROR', message: 'Gagal mengambil data dari Google Play.', type: 'error' });
      }
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Terjadi kesalahan saat fetch metadata.', type: 'error' });
    } finally {
      setFetching(false);
    }
  };

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="var(--nb-cyan)" className="flex items-center justify-between">
        <CardTitle className="text-base font-black text-[var(--nb-text-on-accent)] flex items-center gap-2">
          <Download className="w-5 h-5 stroke-[3]" />
          <span>2. INTEGRASI GOOGLE PLAY STORE & SCRAPER ENGINE</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Input
              label="Google Play App ID"
              name="googlePlayId"
              value={formData.googlePlayId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onScrapeSuccess({ googlePlayId: e.target.value })}
              placeholder="Contoh: com.mobile.legends, com.dts.freefireth"
              helperText="Format App ID dari URL Play Store (misal com.mobile.legends)"
            />
          </div>

          <Button
            type="button"
            variant="purple"
            size="md"
            onClick={handleScrape}
            isLoading={fetching}
            disabled={fetching}
            className="shrink-0 mb-[2px]"
          >
            <Sparkles className="w-4 h-4 mr-2 stroke-[3]" />
            {fetching ? 'FETCHING...' : 'AUTO-FETCH METADATA'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Input
            label="Tanggal Rilis (Auto PlayStore)"
            name="releasedOn"
            value={formData.releasedOn}
            readOnly
            placeholder="Terisi otomatis setelah fetch..."
            className="bg-[var(--nb-surface-alt)] cursor-not-allowed opacity-80"
          />

          <Input
            label="Update Terakhir (Auto PlayStore)"
            name="updatedOn"
            value={formData.updatedOn}
            readOnly
            placeholder="Terisi otomatis setelah fetch..."
            className="bg-[var(--nb-surface-alt)] cursor-not-allowed opacity-80"
          />
        </div>
      </CardContent>
    </Card>
  );
};
