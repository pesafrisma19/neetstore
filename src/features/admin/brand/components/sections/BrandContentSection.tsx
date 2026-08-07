import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface BrandContentSectionProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const BrandContentSection: React.FC<BrandContentSectionProps> = ({
  formData,
  onChange,
}) => {
  const eventsAndOffers: any[] = formData.eventsAndOffers || [];

  const handleAddEvent = () => {
    onChange('eventsAndOffers', [...eventsAndOffers, { title: '', badge: '', bannerUrl: '' }]);
  };

  const handleRemoveEvent = (index: number) => {
    const updated = eventsAndOffers.filter((_, i) => i !== index);
    onChange('eventsAndOffers', updated);
  };

  const handleUpdateEvent = (index: number, key: string, val: string) => {
    const updated = [...eventsAndOffers];
    updated[index] = { ...updated[index], [key]: val };
    onChange('eventsAndOffers', updated);
  };

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="var(--nb-orange)" className="flex items-center justify-between">
        <CardTitle className="text-base font-black text-[var(--nb-text-on-accent)] flex items-center gap-2">
          <FileText className="w-5 h-5 stroke-[3]" />
          <span>6. DESKRIPSI, PATCH NOTES & EVENT PROMO</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-1.5 flex flex-col">
          <label className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
            Deskripsi Lengkap Game / Layanan
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('description', e.target.value)}
            placeholder="Tuliskan deskripsi lengkap game, instruksi top up, atau catatan penting..."
            rows={4}
            className="w-full p-3 font-semibold text-xs bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[2px_2px_0px_0px_var(--nb-shadow-yellow)] transition-all resize-y min-h-[90px]"
          />
        </div>

        <div className="space-y-1.5 flex flex-col">
          <label className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
            Catatan Patch Notes (What's New)
          </label>
          <textarea
            value={formData.whatsNew || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('whatsNew', e.target.value)}
            placeholder="Catatan update patch terbaru dari PlayStore / Game..."
            rows={3}
            className="w-full p-3 font-semibold text-xs bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[2px_2px_0px_0px_var(--nb-shadow-cyan)] transition-all resize-y min-h-[70px]"
          />
        </div>

        {/* Events & Offers Section */}
        <div className="p-4 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b-[2px] border-[var(--nb-border)] pb-2">
            <span className="font-black text-xs uppercase text-[var(--nb-text)]">
              🎉 Events & Offers Promo ({eventsAndOffers.length})
            </span>
            <Button type="button" variant="yellow" size="sm" onClick={handleAddEvent}>
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>TAMBAH EVENT PROMO</span>
            </Button>
          </div>

          <div className="space-y-3">
            {eventsAndOffers.map((ev, idx) => (
              <div
                key={idx}
                className="p-3 bg-[var(--nb-surface)] border-[2.5px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow-yellow)] space-y-2 relative"
              >
                <div className="flex items-center justify-between border-b border-[var(--nb-border)] pb-1.5">
                  <span className="font-black text-[11px] uppercase text-[var(--nb-text)]">
                    EVENT #{idx + 1}
                  </span>
                  <Button
                    type="button"
                    variant="pink"
                    size="sm"
                    onClick={() => handleRemoveEvent(idx)}
                  >
                    <Trash2 className="w-3 h-3 stroke-[3]" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    label="Judul Event"
                    value={ev.title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateEvent(idx, 'title', e.target.value)}
                    placeholder="Contoh: Diskon Topup MLBB"
                  />
                  <Input
                    label="Badge Promo"
                    value={ev.badge || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateEvent(idx, 'badge', e.target.value)}
                    placeholder="Contoh: Diskon 50% / Event Spesial"
                  />
                </div>

                <Input
                  label="URL Banner Event"
                  value={ev.bannerUrl || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateEvent(idx, 'bannerUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            ))}

            {eventsAndOffers.length === 0 && (
              <p className="text-xs font-bold text-[var(--nb-text-muted)] text-center py-2">
                Belum ada banner event promo yang ditambahkan.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
