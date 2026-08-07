import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { Image, Plus, Trash2 } from 'lucide-react';

interface BrandMediaSectionProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const BrandMediaSection: React.FC<BrandMediaSectionProps> = ({
  formData,
  onChange,
}) => {
  const promoScreenshots: string[] = formData.promoScreenshots || [];

  const handleAddScreenshot = () => {
    onChange('promoScreenshots', [...promoScreenshots, '']);
  };

  const handleRemoveScreenshot = (index: number) => {
    const updated = promoScreenshots.filter((_, i) => i !== index);
    onChange('promoScreenshots', updated);
  };

  const handleUpdateScreenshot = (index: number, val: string) => {
    const updated = [...promoScreenshots];
    updated[index] = val;
    onChange('promoScreenshots', updated);
  };

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="var(--nb-pink)" className="flex items-center justify-between">
        <CardTitle className="text-base font-black text-[var(--nb-text-on-accent)] flex items-center gap-2">
          <Image className="w-5 h-5 stroke-[3]" />
          <span>5. MEDIA & GALERI PROMO</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              label="URL Poster / Thumbnail (1:1)"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('thumbnail', e.target.value)}
              placeholder="https://..."
            />
            {formData.thumbnail && (
              <div className="w-20 h-20 border-[3px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] overflow-hidden bg-[var(--nb-surface-alt)]">
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Input
              label="URL Landscape Banner Header"
              name="bannerUrl"
              value={formData.bannerUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('bannerUrl', e.target.value)}
              placeholder="https://..."
            />
            {formData.bannerUrl && (
              <div className="w-full h-20 border-[3px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] overflow-hidden bg-[var(--nb-surface-alt)]">
                <img
                  src={formData.bannerUrl}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Promo Screenshots Gallery */}
        <div className="p-4 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow-pink)] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b-[2px] border-[var(--nb-border)] pb-2">
            <span className="font-black text-xs uppercase text-[var(--nb-text)]">
              📸 Promo Screenshots ({promoScreenshots.length} URLs)
            </span>
            <Button type="button" variant="yellow" size="sm" onClick={handleAddScreenshot}>
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>TAMBAH URL SCREENSHOT</span>
            </Button>
          </div>

          <div className="space-y-2.5">
            {promoScreenshots.map((url, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateScreenshot(idx, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
                <Button
                  type="button"
                  variant="pink"
                  size="sm"
                  onClick={() => handleRemoveScreenshot(idx)}
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                </Button>
              </div>
            ))}

            {promoScreenshots.length === 0 && (
              <p className="text-xs font-bold text-[var(--nb-text-muted)] text-center py-2">
                Belum ada URL screenshot gameplay yang ditambahkan.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
