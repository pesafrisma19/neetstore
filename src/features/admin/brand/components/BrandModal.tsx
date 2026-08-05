import React, { useState, useEffect } from 'react';
import { Dialog } from '../../../../components/ui/Dialog';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Save } from 'lucide-react';
import { apiFetch, createAdminBrand, updateAdminBrand } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: any | null;
  onSuccess: () => void;
}

export const BrandModal: React.FC<BrandModalProps> = ({ isOpen, onClose, brand, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    thumbnail: '',
    publisher: '',
    description: '',
    googlePlayId: '',
    bannerUrl: '',
    validationGameCode: '',
    whatsNew: '',
    releasedOn: '',
    updatedOn: '',
    promoScreenshots: [] as string[],
    eventsAndOffers: [] as any[],
    customFields: [] as any[],
    isActive: true,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      apiFetch<any[]>('/admin/categories').then((res) => {
        setCategories(res || []);
        if (!brand && res && res.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: res[0].id.toString() }));
        }
      }).catch(console.error);

      if (brand) {
        setFormData({
          name: brand.name || '',
          slug: brand.slug || '',
          categoryId: brand.categoryId?.toString() || '',
          thumbnail: brand.thumbnail || '',
          publisher: brand.publisher || '',
          description: brand.description || '',
          googlePlayId: brand.googlePlayId || '',
          bannerUrl: brand.bannerUrl || '',
          validationGameCode: brand.validationGameCode || '',
          whatsNew: brand.whatsNew || '',
          releasedOn: brand.releasedOn || '',
          updatedOn: brand.updatedOn || '',
          promoScreenshots: brand.promoScreenshots || [],
          eventsAndOffers: brand.eventsAndOffers || [],
          customFields: brand.customFields || [],
          isActive: brand.isActive ?? true,
        });
      } else {
        setFormData({
          name: '',
          slug: '',
          categoryId: '',
          thumbnail: '',
          publisher: '',
          description: '',
          googlePlayId: '',
          bannerUrl: '',
          validationGameCode: '',
          whatsNew: '',
          releasedOn: '',
          updatedOn: '',
          promoScreenshots: [],
          eventsAndOffers: [],
          customFields: [],
          isActive: true,
        });
      }
    }
  }, [isOpen, brand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
      };

      if (brand?.id) {
        await updateAdminBrand(brand.id, payload);
      } else {
        await createAdminBrand(payload);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast({ title: 'ERROR', message: error.message || 'Gagal menyimpan Brand.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title={brand ? 'EDIT BRAND' : 'TAMBAH BRAND BARU'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase">Nama Brand</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ 
                  ...formData, 
                  name: val,
                  // Auto-generate slug if it's new
                  ...(!brand && { slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })
                });
              }}
              className="border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black uppercase">Slug URL</label>
            <Input
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-neutral-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black uppercase">Kategori</label>
          <select
            required
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full p-2.5 border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold outline-none focus:bg-yellow-50 bg-white"
          >
            <option value="">Pilih Kategori...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black uppercase">Publisher / Developer</label>
          <Input
            value={formData.publisher}
            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            className="border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            placeholder="Contoh: Moonton, Tencent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black uppercase">Deskripsi Brand</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2.5 border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold outline-none focus:bg-yellow-50 bg-white"
            placeholder="Deskripsi game / layanan..."
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black uppercase">Google Play ID (Opsional)</label>
          <div className="flex gap-2">
            <Input
              value={formData.googlePlayId}
              onChange={(e) => setFormData({ ...formData, googlePlayId: e.target.value })}
              className="border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1"
              placeholder="Contoh: com.mobile.legends"
            />
            <Button
              type="button"
              variant="purple"
              onClick={async () => {
                if (!formData.googlePlayId) {
                  addToast({ title: 'PERHATIAN', message: 'Masukkan Google Play ID dulu!', type: 'error' });
                  return;
                }
                try {
                  const res = await apiFetch<any>('/admin/brands/scrape-playstore', {
                    method: 'POST',
                    body: JSON.stringify({ appId: formData.googlePlayId })
                  });
                  if (res && res.name) {
                    setFormData({
                      ...formData,
                      name: res.name || formData.name,
                      thumbnail: res.thumbnail || formData.thumbnail,
                      publisher: res.publisher || formData.publisher,
                      description: res.description || formData.description,
                      bannerUrl: res.bannerUrl || formData.bannerUrl,
                      whatsNew: res.whatsNew || formData.whatsNew,
                      releasedOn: res.releasedOn || formData.releasedOn,
                      updatedOn: res.updatedOn || formData.updatedOn,
                      promoScreenshots: res.promoScreenshots || formData.promoScreenshots,
                      eventsAndOffers: res.eventsAndOffers || formData.eventsAndOffers,
                      ...((!brand && !formData.slug && res.name) && { slug: res.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })
                    });
                    addToast({ title: 'SUKSES', message: 'Berhasil Fetch dari Google Play! 🎉', type: 'success' });
                  } else {
                    addToast({ title: 'ERROR', message: 'Gagal mengambil data dari Google Play.', type: 'error' });
                  }
                } catch (e: any) {
                  addToast({ title: 'ERROR', message: e.message || 'Terjadi kesalahan saat fetch.', type: 'error' });
                }
              }}
              className="font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap"
            >
              FETCH METADATA
            </Button>
          </div>
          <p className="text-xs font-bold text-neutral-500">Gunakan untuk auto-fetch icon & deskripsi via Play Store.</p>
        </div>

        <div className="space-y-2 p-4 bg-purple-50 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <label className="text-sm font-black uppercase text-purple-900">Kode Validasi NEETflix (Opsional)</label>
          <Input
            value={formData.validationGameCode}
            onChange={(e) => setFormData({ ...formData, validationGameCode: e.target.value })}
            className="border-[3px] border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            placeholder="Contoh: mobile-legends, free-fire"
          />
          <p className="text-xs font-bold text-purple-800">Digunakan untuk auto-cek nickname dan kuota 2X Diamond.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase">URL Thumbnail</label>
            <Input
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black uppercase">URL Banner</label>
            <Input
              value={formData.bannerUrl}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
              className="border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black uppercase">Patch Notes (What's New)</label>
          <textarea
            value={formData.whatsNew}
            onChange={(e) => setFormData({ ...formData, whatsNew: e.target.value })}
            className="w-full p-2.5 border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium outline-none focus:bg-yellow-50 bg-white resize-y min-h-[80px]"
            placeholder="Catatan update..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase text-neutral-500">Tanggal Rilis</label>
            <Input
              value={formData.releasedOn}
              readOnly
              className="border-[3px] border-neutral-300 rounded-none bg-neutral-100 text-neutral-500 cursor-not-allowed font-bold"
              placeholder="Otomatis terisi..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black uppercase text-neutral-500">Update Terakhir</label>
            <Input
              value={formData.updatedOn}
              readOnly
              className="border-[3px] border-neutral-300 rounded-none bg-neutral-100 text-neutral-500 cursor-not-allowed font-bold"
              placeholder="Otomatis terisi..."
            />
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-2">
              <h4 className="font-black uppercase text-sm">📸 Promo Screenshots ({formData.promoScreenshots?.length || 0})</h4>
              <Button
                type="button"
                variant="dark"
                size="sm"
                onClick={() => setFormData({ ...formData, promoScreenshots: [...(formData.promoScreenshots || []), ''] })}
                className="h-7 text-xs border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                + TAMBAH URL
              </Button>
            </div>
            {formData.promoScreenshots?.map((url: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => {
                    const newArr = [...formData.promoScreenshots];
                    newArr[index] = e.target.value;
                    setFormData({ ...formData, promoScreenshots: newArr });
                  }}
                  className="border-[2px] border-black rounded-none h-8 text-xs"
                  placeholder="https://..."
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const newArr = formData.promoScreenshots.filter((_: any, i: number) => i !== index);
                    setFormData({ ...formData, promoScreenshots: newArr });
                  }}
                  className="h-8 w-8 p-0 border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
                >
                  X
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-2">
              <h4 className="font-black uppercase text-sm">🎉 Events & Offers ({formData.eventsAndOffers?.length || 0})</h4>
              <Button
                type="button"
                variant="dark"
                size="sm"
                onClick={() => setFormData({ ...formData, eventsAndOffers: [...(formData.eventsAndOffers || []), { title: '', badge: '', bannerUrl: '' }] })}
                className="h-7 text-xs border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                + TAMBAH EVENT
              </Button>
            </div>
            {formData.eventsAndOffers?.map((ev: any, index: number) => (
              <div key={index} className="p-3 bg-white border-[2px] border-black flex flex-col gap-2 relative">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const newArr = formData.eventsAndOffers.filter((_: any, i: number) => i !== index);
                    setFormData({ ...formData, eventsAndOffers: newArr });
                  }}
                  className="absolute -top-3 -right-3 h-6 w-6 p-0 border-2 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-xs z-10"
                >
                  X
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={ev.title}
                    onChange={(e) => {
                      const newArr = [...formData.eventsAndOffers];
                      newArr[index].title = e.target.value;
                      setFormData({ ...formData, eventsAndOffers: newArr });
                    }}
                    className="border-[2px] border-black rounded-none h-8 text-xs"
                    placeholder="Judul Event..."
                  />
                  <Input
                    value={ev.badge}
                    onChange={(e) => {
                      const newArr = [...formData.eventsAndOffers];
                      newArr[index].badge = e.target.value;
                      setFormData({ ...formData, eventsAndOffers: newArr });
                    }}
                    className="border-[2px] border-black rounded-none h-8 text-xs"
                    placeholder="Badge (Contoh: Diskon 50%)"
                  />
                </div>
                <Input
                  value={ev.bannerUrl}
                  onChange={(e) => {
                    const newArr = [...formData.eventsAndOffers];
                    newArr[index].bannerUrl = e.target.value;
                    setFormData({ ...formData, eventsAndOffers: newArr });
                  }}
                  className="border-[2px] border-black rounded-none h-8 text-xs"
                  placeholder="URL Banner Event..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* CUSTOM FIELDS BUILDER */}
        <div className="p-4 bg-purple-50 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center justify-between border-b-[2px] border-black pb-2">
            <h4 className="font-black uppercase text-sm">⚙️ Custom Input Fields ({formData.customFields?.length || 0})</h4>
            <Button
              type="button"
              variant="dark"
              size="sm"
              onClick={() => {
                const newField = {
                  id: `f_${Date.now()}`,
                  name: `field_${(formData.customFields?.length || 0) + 1}`,
                  label: '',
                  fieldType: 'INPUT',
                  inputType: 'text',
                  selectOptions: ''
                };
                setFormData({ ...formData, customFields: [...(formData.customFields || []), newField] });
              }}
              className="h-7 text-xs border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              + TAMBAH FORM
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.customFields?.map((field: any, index: number) => (
              <div key={field.id} className="p-3 bg-white border-[2px] border-black flex flex-col gap-3 relative">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const newArr = formData.customFields.filter((_: any, i: number) => i !== index);
                    setFormData({ ...formData, customFields: newArr });
                  }}
                  className="absolute -top-3 -right-3 h-6 w-6 p-0 border-2 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-xs z-10"
                >
                  X
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase">Label Tampilan</label>
                    <Input
                      value={field.label}
                      onChange={(e) => {
                        const newArr = [...formData.customFields];
                        newArr[index].label = e.target.value;
                        setFormData({ ...formData, customFields: newArr });
                      }}
                      className="border-[2px] border-black rounded-none h-8 text-xs"
                      placeholder="Contoh: User ID"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase">Tipe Elemen</label>
                    <select
                      value={field.fieldType}
                      onChange={(e) => {
                        const newArr = [...formData.customFields];
                        newArr[index].fieldType = e.target.value;
                        setFormData({ ...formData, customFields: newArr });
                      }}
                      className="w-full h-8 px-2 border-[2px] border-black rounded-none text-xs outline-none focus:bg-yellow-50 bg-white"
                    >
                      <option value="INPUT">Input Teks Bebas</option>
                      <option value="SELECT">Pilihan Dropdown</option>
                    </select>
                  </div>
                  {field.fieldType === 'INPUT' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase">Format Input</label>
                      <select
                        value={field.inputType}
                        onChange={(e) => {
                          const newArr = [...formData.customFields];
                          newArr[index].inputType = e.target.value;
                          setFormData({ ...formData, customFields: newArr });
                        }}
                        className="w-full h-8 px-2 border-[2px] border-black rounded-none text-xs outline-none focus:bg-yellow-50 bg-white"
                      >
                        <option value="text">Teks Bebas</option>
                        <option value="number">Angka Saja</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                  )}
                </div>

                {field.fieldType === 'SELECT' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase">Opsi Pilihan (Pisahkan dgn Enter)</label>
                    <textarea
                      value={field.selectOptions}
                      onChange={(e) => {
                        const newArr = [...formData.customFields];
                        newArr[index].selectOptions = e.target.value;
                        setFormData({ ...formData, customFields: newArr });
                      }}
                      className="w-full p-2 border-[2px] border-black rounded-none text-xs outline-none focus:bg-yellow-50 bg-white min-h-[60px]"
                      placeholder="value|Teks Tampilan&#10;asia|Server Asia&#10;global|Server Global"
                    />
                  </div>
                )}
              </div>
            ))}
            {formData.customFields?.length === 0 && (
              <p className="text-xs text-neutral-500 font-bold italic text-center py-2">
                Tidak ada custom form tambahan.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t-[3px] border-black">
          <label className="flex items-center gap-2 font-black uppercase text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 accent-black"
            />
            Brand Aktif
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="mint"
            disabled={loading}
            className="font-black uppercase tracking-wide border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Brand'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
