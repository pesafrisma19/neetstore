import React, { useState, useEffect } from 'react';
import { Dialog } from '../../../../components/ui/Dialog';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Switch } from '../../../../components/ui/Switch';
import { Save } from 'lucide-react';
import { apiFetch } from '../../../../utils/api';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any | null;
  onSuccess: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, category, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    googlePlayId: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name || '',
          slug: category.slug || '',
          icon: category.icon || '',
          googlePlayId: category.googlePlayId || '',
          isActive: category.isActive !== undefined ? category.isActive : true,
        });
      } else {
        setFormData({ name: '', slug: '', icon: '', googlePlayId: '', isActive: true });
      }
      setError(null);
    }
  }, [isOpen, category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (category) {
        await apiFetch(`/admin/categories/${category.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        await apiFetch('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: { 'Content-Type': 'application/json' },
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kategori');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={category ? 'Edit Kategori' : 'Tambah Kategori'} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm font-bold p-2 bg-red-100 rounded border border-red-500">{error}</div>}
        
        <div>
          <label className="block text-sm font-bold text-[var(--nb-text)] mb-1">Nama Kategori</label>
          <Input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Contoh: Games" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--nb-text)] mb-1">Slug</label>
          <Input 
            name="slug" 
            value={formData.slug} 
            onChange={handleChange} 
            placeholder="Contoh: games" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--nb-text)] mb-1">Ikon (URL/Emoji)</label>
          <Input 
            name="icon" 
            value={formData.icon} 
            onChange={handleChange} 
            placeholder="Contoh: 🎮 atau https://..." 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--nb-text)] mb-1">Google Play ID (Opsional)</label>
          <Input 
            name="googlePlayId" 
            value={formData.googlePlayId} 
            onChange={handleChange} 
            placeholder="Contoh: com.mobile.legends" 
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="block text-sm font-bold text-[var(--nb-text)]">Status Aktif</label>
          <Switch 
            checked={formData.isActive} 
            onChange={handleToggle} 
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t-2 border-[var(--nb-border)]">
          <Button type="button" variant="white" onClick={onClose} disabled={loading}>Batal</Button>
          <Button type="submit" variant="yellow" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
