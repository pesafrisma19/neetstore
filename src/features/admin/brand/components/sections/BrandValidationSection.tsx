import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import { Input } from '../../../../../components/ui/Input';
import { ShieldCheck, Info } from 'lucide-react';

interface BrandValidationSectionProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const BrandValidationSection: React.FC<BrandValidationSectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="var(--nb-purple)" className="flex items-center justify-between">
        <CardTitle className="text-base font-black text-[var(--nb-text-on-accent)] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 stroke-[3]" />
          <span>3. INTEGRASI VALIDASI AKUN & PROVIDER NEETFLIX</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Kode Validasi NEETflix (validationGameCode)"
          name="validationGameCode"
          value={formData.validationGameCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('validationGameCode', e.target.value)}
          placeholder="Contoh: mobile-legends, free-fire, mcgg"
          helperText="Kosongkan jika game ini tidak mendukung auto-validasi nickname"
        />

        <div className="p-4 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow-purple)] flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--nb-purple)] shrink-0 mt-0.5 stroke-[3]" />
          <div className="text-xs font-bold text-[var(--nb-text)] space-y-1">
            <p className="font-black uppercase">PETUNJUK KODE VALIDASI:</p>
            <p>
              Kode game ini dikirimkan ke provider NEETflix (`api.neetflix.monster`) saat pengguna mengetikkan User ID di halaman checkout publik.
            </p>
            <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px] text-[var(--nb-text-muted)]">
              <li>Mobile Legends: `mobile-legends`</li>
              <li>Free Fire: `free-fire`</li>
              <li>Magic Chess: `mcgg`</li>
              <li>Honor of Kings: `hok`</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
