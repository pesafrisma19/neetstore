import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from '../../../../components/ui/Dialog';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Switch } from '../../../../components/ui/Switch';
import { Save, Search, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminCategory, updateAdminCategory } from '../../../../utils/api';
import { CATEGORY_ICONS, CategoryIcon, DEFAULT_CATEGORY_ICON_NAME } from '../../../../components/ui/CategoryIcon';
import type { CategoryData } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryData | null;
  onSuccess: (message: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: DEFAULT_CATEGORY_ICON_NAME,
    isActive: true,
  });
  const [iconSearch, setIconSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allIconKeys = useMemo(() => Object.keys(CATEGORY_ICONS), []);

  const filteredIconKeys = useMemo(() => {
    if (!iconSearch.trim()) return allIconKeys;
    const query = iconSearch.toLowerCase();
    return allIconKeys.filter((key) => key.toLowerCase().includes(query));
  }, [allIconKeys, iconSearch]);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name || '',
          slug: category.slug || '',
          icon: category.icon && CATEGORY_ICONS[category.icon] ? category.icon : DEFAULT_CATEGORY_ICON_NAME,
          isActive: category.isActive !== undefined ? category.isActive : true,
        });
      } else {
        setFormData({
          name: '',
          slug: '',
          icon: DEFAULT_CATEGORY_ICON_NAME,
          isActive: true,
        });
      }
      setIconSearch('');
      setErrorMsg(null);
    }
  }, [isOpen, category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name' && !category) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({ ...prev, name: value, slug: autoSlug }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const handleSelectIcon = (iconName: string) => {
    setFormData((prev) => ({ ...prev, icon: iconName }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        icon: formData.icon.trim(),
        isActive: formData.isActive,
      };

      if (category?.id) {
        return updateAdminCategory(category.id, payload);
      }
      return createAdminCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      onSuccess(category ? 'Kategori berhasil diperbarui!' : 'Kategori baru berhasil dibuat!');
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Gagal menyimpan kategori');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Nama kategori wajib diisi');
      return;
    }
    if (!formData.slug.trim()) {
      setErrorMsg('Slug wajib diisi');
      return;
    }

    saveMutation.mutate();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'EDIT KATEGORI' : 'TAMBAH KATEGORI BARU'}
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {errorMsg && (
          <div className="p-3.5 bg-red-100 border-[3px] border-red-600 text-red-900 font-black text-xs uppercase tracking-wide shadow-[3px_3px_0px_0px_var(--nb-shadow)]">
            {errorMsg}
          </div>
        )}

        <Input
          label="Nama Kategori"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Contoh: Games, Pulsa, Voucher"
          required
        />

        <Input
          label="Slug (URL Friendly)"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="Contoh: games, pulsa, voucher"
          required
        />

        {/* Lucide Icon Picker Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
              Icon (Lucide)
            </label>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[var(--nb-yellow)] border-[2.5px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] text-xs font-black text-[#000000]">
              <span>TERPILIH:</span>
              <CategoryIcon iconName={formData.icon} className="w-4 h-4" />
              <span className="font-mono text-xs">{formData.icon}</span>
            </div>
          </div>

          {/* Icon Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nb-text-muted)] pointer-events-none" />
            <input
              type="text"
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              placeholder="Cari nama icon Lucide..."
              className="w-full pl-9 pr-3 py-2 font-bold text-xs bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] placeholder:text-[var(--nb-text-muted)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[2px_2px_0px_0px_var(--nb-shadow-cyan)] transition-all"
            />
          </div>

          {/* Icon Selection Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2.5 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)]">
            {filteredIconKeys.map((iconKey) => {
              const isSelected = formData.icon === iconKey;
              return (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => handleSelectIcon(iconKey)}
                  title={iconKey}
                  className={`relative flex flex-col items-center justify-center p-2.5 border-[2.5px] border-[var(--nb-border)] cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-[var(--nb-yellow)] text-[#000000] shadow-[3px_3px_0px_0px_var(--nb-shadow-purple)] -translate-x-0.5 -translate-y-0.5 font-black z-10'
                      : 'bg-[var(--nb-surface)] text-[var(--nb-text)] hover:bg-[var(--nb-surface-alt)] hover:shadow-[2px_2px_0px_0px_var(--nb-shadow)] active:translate-x-0.5 active:translate-y-0.5'
                  }`}
                >
                  <CategoryIcon iconName={iconKey} className="w-5 h-5" />
                  <span className="text-[9px] font-mono font-bold truncate max-w-full mt-1">
                    {iconKey}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--nb-pink)] text-black border border-[var(--nb-border)] flex items-center justify-center rounded-full shadow-[1px_1px_0px_0px_var(--nb-shadow)]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
            {filteredIconKeys.length === 0 && (
              <div className="col-span-full py-6 text-center text-xs font-bold text-[var(--nb-text-muted)]">
                Tidak ada icon yang cocok dengan pencarian "{iconSearch}".
              </div>
            )}
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)]">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
              Status Kategori
            </label>
            <span className="text-xs font-bold text-[var(--nb-text-muted)]">
              {formData.isActive ? 'Kategori Aktif (Tampil di Publik)' : 'Kategori Nonaktif (Sembunyikan)'}
            </span>
          </div>
          <Switch checked={formData.isActive} onChange={handleToggle} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t-[3px] border-[var(--nb-border)]">
          <Button
            type="button"
            variant="white"
            size="md"
            onClick={onClose}
            disabled={saveMutation.isPending}
          >
            BATAL
          </Button>
          <Button
            type="submit"
            variant="yellow"
            size="md"
            isLoading={saveMutation.isPending}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2 stroke-[3]" />
            {saveMutation.isPending ? 'MENYIMPAN...' : 'SIMPAN'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
