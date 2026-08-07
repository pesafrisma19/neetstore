import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import { Input } from '../../../../../components/ui/Input';
import { Switch } from '../../../../../components/ui/Switch';
import { Tag } from 'lucide-react';

interface BrandBasicSectionProps {
  formData: any;
  categories: any[];
  isEditing?: boolean;
  onChange: (field: string, value: any) => void;
  onNameChange: (name: string) => void;
}

export const BrandBasicSection: React.FC<BrandBasicSectionProps> = ({
  formData,
  categories,
  onChange,
  onNameChange,
}) => {
  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="var(--nb-yellow)" className="flex items-center justify-between">
        <CardTitle className="text-base font-black text-[var(--nb-text-on-accent)] flex items-center gap-2">
          <Tag className="w-5 h-5 stroke-[3]" />
          <span>1. INFORMASI DASAR & KATEGORI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nama Brand / Game *"
            name="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
            placeholder="Contoh: Mobile Legends: Bang Bang"
            required
          />

          <Input
            label="Slug URL *"
            name="slug"
            value={formData.slug}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('slug', e.target.value)}
            placeholder="Contoh: mobile-legends"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
              Kategori Utama *
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('categoryId', e.target.value)}
              className="w-full px-4 py-2.5 font-bold text-xs bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[2px_2px_0px_0px_var(--nb-shadow-yellow)] transition-all cursor-pointer"
            >
              <option value="">Pilih Kategori...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Publisher / Developer"
            name="publisher"
            value={formData.publisher}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('publisher', e.target.value)}
            placeholder="Contoh: Moonton, Garena, Tencent"
          />
        </div>

        <div className="flex items-center justify-between p-3.5 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)]">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
              Status Brand
            </label>
            <span className="text-xs font-bold text-[var(--nb-text-muted)]">
              {formData.isActive ? 'Brand Aktif (Tampil di Publik & Admin)' : 'Brand Nonaktif (Sembunyikan)'}
            </span>
          </div>
          <Switch checked={formData.isActive} onChange={(val: boolean) => onChange('isActive', val)} />
        </div>
      </CardContent>
    </Card>
  );
};
