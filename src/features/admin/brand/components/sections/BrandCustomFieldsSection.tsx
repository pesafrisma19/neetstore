import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { Badge } from '../../../../../components/ui/Badge';
import { Sliders, Plus, Trash2 } from 'lucide-react';

interface BrandCustomFieldsSectionProps {
  customFields: any[];
  onChange: (fields: any[]) => void;
}

export const BrandCustomFieldsSection: React.FC<BrandCustomFieldsSectionProps> = ({
  customFields = [],
  onChange,
}) => {
  const handleAddField = () => {
    const newField = {
      id: `f_${Date.now()}`,
      name: `field_${customFields.length + 1}`,
      label: '',
      fieldType: 'INPUT',
      inputType: 'text',
      selectOptions: '',
    };
    onChange([...customFields, newField]);
  };

  const handleRemoveField = (index: number) => {
    const updated = customFields.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateField = (index: number, key: string, value: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="var(--nb-mint)" className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-black text-[var(--nb-text-on-accent)] flex items-center gap-2">
            <Sliders className="w-5 h-5 stroke-[3]" />
            <span>4. FORM BUILDER INPUT PELANGGAN (USER ID & ZONE ID)</span>
          </CardTitle>
          <Badge variant="cyan" size="sm">
            {customFields.length} FORM FIELDS
          </Badge>
        </div>

        <Button type="button" variant="yellow" size="sm" onClick={handleAddField}>
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>TAMBAH INPUT FIELD</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {customFields.map((field, index) => (
          <div
            key={field.id || index}
            className="p-4 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow-mint)] relative space-y-3"
          >
            <div className="flex items-center justify-between border-b-[2px] border-[var(--nb-border)] pb-2">
              <span className="font-black text-xs uppercase text-[var(--nb-text)]">
                INPUT FIELD #{index + 1}
              </span>
              <Button
                type="button"
                variant="pink"
                size="sm"
                onClick={() => handleRemoveField(index)}
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                <span>HAPUS</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Label Tampilan (mis. User ID / Zone ID)"
                value={field.label || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateField(index, 'label', e.target.value)}
                placeholder="Contoh: User ID"
                required
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
                  Tipe Elemen
                </label>
                <select
                  value={field.fieldType || 'INPUT'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateField(index, 'fieldType', e.target.value)}
                  className="w-full px-3 py-2 font-bold text-xs bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[2px_2px_0px_0px_var(--nb-shadow)]"
                >
                  <option value="INPUT">Input Teks Bebas</option>
                  <option value="SELECT">Pilihan Dropdown (Server List)</option>
                </select>
              </div>

              {field.fieldType === 'INPUT' && (
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
                    Format Karakter
                  </label>
                  <select
                    value={field.inputType || 'text'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateField(index, 'inputType', e.target.value)}
                    className="w-full px-3 py-2 font-bold text-xs bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[2px_2px_0px_0px_var(--nb-shadow)]"
                  >
                    <option value="text">Teks Bebas / Alfanumerik</option>
                    <option value="number">Angka Saja (Numeric)</option>
                    <option value="email">Format Email</option>
                  </select>
                </div>
              )}
            </div>

            {field.fieldType === 'SELECT' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
                  Opsi Pilihan (Pisahkan dengan Enter: `value|label`)
                </label>
                <textarea
                  value={field.selectOptions || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleUpdateField(index, 'selectOptions', e.target.value)}
                  placeholder="asia|Server Asia&#10;global|Server Global&#10;europe|Server Eropa"
                  rows={3}
                  className="w-full p-2.5 font-mono text-xs font-bold bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[2px_2px_0px_0px_var(--nb-shadow)]"
                />
              </div>
            )}
          </div>
        ))}

        {customFields.length === 0 && (
          <div className="p-8 text-center bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] font-bold text-xs text-[var(--nb-text-muted)] uppercase tracking-wider">
            Belum ada custom field tambahan. Form checkout default akan menggunakan 1 input User ID.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
