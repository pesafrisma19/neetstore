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

  // Available icon keys array
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
      // Auto generate slug if creating new
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

  // Mutation for Create / Update
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
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {errorMsg && (
          <div className="p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 text-sm font-bold">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-black uppercase text-[var(--nb-text)] mb-1">
            Nama Kategori
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Contoh: Games, Pulsa, Voucher"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-[var(--nb-text)] mb-1">
            Slug
          </label>
          <Input
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="Contoh: games, pulsa, voucher"
            required
          />
        </div>

        {/* Lucide Icon Picker Section */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-black uppercase text-[var(--nb-text)]">
              Icon (Lucide)
            </label>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--nb-surface-alt)] border border-[var(--nb-border)] rounded text-xs font-bold">
              <span>Preview:</span>
              <CategoryIcon iconName={formData.icon} className="w-4 h-4 text-[var(--nb-yellow)]" />
              <span className="font-mono text-xs">{formData.icon}</span>
            </div>
          </div>

          {/* Icon Search */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--nb-text-muted)]" />
            <input
              type="text"
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              placeholder="Cari nama icon..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-bold bg-[var(--nb-surface)] border-2 border-[var(--nb-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
            />
          </div>

          {/* Icon Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-[var(--nb-surface-alt)] border-2 border-[var(--nb-border)] rounded-lg">
            {filteredIconKeys.map((iconKey) => {
              const isSelected = formData.icon === iconKey;
              return (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => handleSelectIcon(iconKey)}
                  title={iconKey}
                  className={`relative flex flex-col items-center justify-center p-2 rounded border-2 transition-all ${
                    isSelected
                      ? 'bg-[var(--nb-yellow)] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] scale-105 z-10'
                      : 'bg-[var(--nb-surface)] border-transparent hover:border-[var(--nb-border)] hover:bg-[var(--nb-surface-alt)]'
                  }`}
                >
                  <CategoryIcon iconName={iconKey} className="w-5 h-5" />
                  {isSelected && (
                    <Check className="absolute top-0.5 right-0.5 w-3 h-3 text-black stroke-[3]" />
                  )}
                </button>
              );
            })}
            {filteredIconKeys.length === 0 && (
              <div className="col-span-full py-4 text-center text-xs font-bold text-[var(--nb-text-muted)]">
                Tidak ada icon yang cocok.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--nb-border)]">
          <div>
            <label className="block text-xs font-black uppercase text-[var(--nb-text)]">
              Status Kategori
            </label>
            <span className="text-xs text-[var(--nb-text-muted)]">
              {formData.isActive ? 'Kategori Aktif' : 'Kategori Nonaktif'}
            </span>
          </div>
          <Switch checked={formData.isActive} onChange={handleToggle} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t-2 border-[var(--nb-border)]">
          <Button
            type="button"
            variant="white"
            onClick={onClose}
            disabled={saveMutation.isPending}
          >
            BATAL
          </Button>
          <Button type="submit" variant="yellow" disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'MENYIMPAN...' : 'SIMPAN'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
