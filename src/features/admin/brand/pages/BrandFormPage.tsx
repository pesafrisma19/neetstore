import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminBrandById, getAdminCategories, createAdminBrand, updateAdminBrand } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Card } from '../../../../components/ui/Card';
import { useToast } from '../../../../components/ui/ToastContext';
import { ArrowLeft, Save, RefreshCw, AlertCircle } from 'lucide-react';

import { BrandBasicSection } from '../components/sections/BrandBasicSection';
import { BrandGooglePlaySection } from '../components/sections/BrandGooglePlaySection';
import { BrandValidationSection } from '../components/sections/BrandValidationSection';
import { BrandCustomFieldsSection } from '../components/sections/BrandCustomFieldsSection';
import { BrandMediaSection } from '../components/sections/BrandMediaSection';
import { BrandContentSection } from '../components/sections/BrandContentSection';

export const BrandFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const brandId = id ? parseInt(id, 10) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    publisher: '',
    googlePlayId: '',
    thumbnail: '',
    bannerUrl: '',
    description: '',
    validationGameCode: '',
    whatsNew: '',
    releasedOn: '',
    updatedOn: '',
    promoScreenshots: [] as string[],
    eventsAndOffers: [] as any[],
    customFields: [] as any[],
    isActive: true,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // 1. Fetch categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => (await getAdminCategories()) || [],
  });

  // 2. Fetch Brand Detail if Editing
  const {
    data: brandData,
    isLoading: isBrandLoading,
    isError: isBrandError,
    error: brandFetchError,
  } = useQuery<any>({
    queryKey: brandId ? queryKeys.admin.brands.detail(brandId) : ['none'],
    queryFn: async () => {
      if (!brandId) return null;
      return getAdminBrandById(brandId);
    },
    enabled: Boolean(brandId),
  });

  useEffect(() => {
    if (isEditing && brandData) {
      setFormData({
        name: brandData.name || '',
        slug: brandData.slug || '',
        categoryId: brandData.categoryId?.toString() || (categories[0]?.id?.toString() || ''),
        publisher: brandData.publisher || '',
        googlePlayId: brandData.googlePlayId || '',
        thumbnail: brandData.thumbnail || '',
        bannerUrl: brandData.bannerUrl || '',
        description: brandData.description || '',
        validationGameCode: brandData.validationGameCode || '',
        whatsNew: brandData.whatsNew || '',
        releasedOn: brandData.releasedOn || '',
        updatedOn: brandData.updatedOn || '',
        promoScreenshots: Array.isArray(brandData.promoScreenshots) ? brandData.promoScreenshots : [],
        eventsAndOffers: Array.isArray(brandData.eventsAndOffers) ? brandData.eventsAndOffers : [],
        customFields: Array.isArray(brandData.customFields) ? brandData.customFields : [],
        isActive: brandData.isActive ?? true,
      });
      setIsDirty(false);
    } else if (!isEditing) {
      if (categories.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: categories[0].id.toString() }));
      }
    }
  }, [isEditing, brandData, categories]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleNameChange = (name: string) => {
    if (!isEditing) {
      const autoSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({ ...prev, name, slug: autoSlug }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
    setIsDirty(true);
  };

  const handleScrapeSuccess = (scrapedData: any) => {
    setFormData((prev) => ({
      ...prev,
      name: scrapedData.name || prev.name,
      thumbnail: scrapedData.thumbnail || prev.thumbnail,
      publisher: scrapedData.publisher || prev.publisher,
      description: scrapedData.description || prev.description,
      bannerUrl: scrapedData.bannerUrl || prev.bannerUrl,
      whatsNew: scrapedData.whatsNew || prev.whatsNew,
      releasedOn: scrapedData.releasedOn || prev.releasedOn,
      updatedOn: scrapedData.updatedOn || prev.updatedOn,
      promoScreenshots: scrapedData.promoScreenshots || prev.promoScreenshots,
      eventsAndOffers: scrapedData.eventsAndOffers || prev.eventsAndOffers,
      googlePlayId: scrapedData.googlePlayId !== undefined ? scrapedData.googlePlayId : prev.googlePlayId,
      ...(!isEditing && !prev.slug && scrapedData.name
        ? {
            slug: scrapedData.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)+/g, ''),
          }
        : {}),
    }));
    setIsDirty(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
      };

      if (brandId) {
        return updateAdminBrand(brandId, payload);
      }
      return createAdminBrand(payload);
    },
    onSuccess: () => {
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.brands.all });
      if (brandId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.brands.detail(brandId) });
      }
      addToast({
        title: 'SUKSES',
        message: isEditing ? 'Brand berhasil diperbarui!' : 'Brand baru berhasil dibuat!',
        type: 'success',
      });
      navigate('/admin/brands');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Gagal menyimpan data Brand');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Nama Brand wajib diisi');
      return;
    }
    if (!formData.slug.trim()) {
      setErrorMsg('Slug URL wajib diisi');
      return;
    }
    if (!formData.categoryId) {
      setErrorMsg('Kategori Utama wajib dipilih');
      return;
    }

    saveMutation.mutate();
  };

  if (isEditing && isBrandLoading) {
    return (
      <Card variant="white" shadow="md" borderWidth="4" className="p-12 text-center">
        <RefreshCw className="w-10 h-10 animate-spin mx-auto text-[var(--nb-yellow)] mb-3 stroke-[3]" />
        <p className="font-black text-sm uppercase tracking-wider text-[var(--nb-text)]">
          Memuat Data Brand...
        </p>
      </Card>
    );
  }

  if (isEditing && isBrandError) {
    return (
      <Card variant="white" shadow="md" borderWidth="4" className="p-8 text-center border-[4px] border-red-600 space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-red-600 stroke-[3]" />
        <p className="font-black text-sm text-red-600 uppercase tracking-wider">
          {(brandFetchError as any)?.message || 'Gagal memuat detail Brand.'}
        </p>
        <Link to="/admin/brands">
          <Button variant="yellow" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2 stroke-[3]" />
            KEMBALI KE DAFTAR BRAND
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-[var(--nb-surface)] border-[4px] border-[var(--nb-border)] shadow-[6px_6px_0px_0px_var(--nb-shadow-yellow)]">
        <div className="flex items-center gap-3">
          <Link to="/admin/brands">
            <Button type="button" variant="white" size="sm">
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>KEMBALI</span>
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black uppercase text-[var(--nb-text)] m-0 leading-tight">
              {isEditing ? `EDIT BRAND: ${formData.name || '...'}` : 'TAMBAH BRAND BARU'}
            </h1>
            <span className="text-xs font-bold text-[var(--nb-text-muted)]">
              {isEditing ? `ID: ${brandId} | Slug: ${formData.slug}` : 'Kelola data master game, validasi & form input'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="orange" size="sm">
              PERUBAHAN BELUM DISIMPAN
            </Badge>
          )}
          <Button
            type="submit"
            variant="yellow"
            size="md"
            isLoading={saveMutation.isPending}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2 stroke-[3]" />
            {saveMutation.isPending ? 'MENYIMPAN...' : 'SIMPAN BRAND'}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-100 border-[3px] border-red-600 text-red-900 font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--nb-shadow)]">
          {errorMsg}
        </div>
      )}

      {/* Form Sections */}
      <BrandBasicSection
        formData={formData}
        categories={categories}
        isEditing={isEditing}
        onChange={handleFieldChange}
        onNameChange={handleNameChange}
      />

      <BrandGooglePlaySection
        formData={formData}
        onScrapeSuccess={handleScrapeSuccess}
      />

      <BrandValidationSection
        formData={formData}
        onChange={handleFieldChange}
      />

      <BrandCustomFieldsSection
        customFields={formData.customFields}
        onChange={(fields) => handleFieldChange('customFields', fields)}
      />

      <BrandMediaSection
        formData={formData}
        onChange={handleFieldChange}
      />

      <BrandContentSection
        formData={formData}
        onChange={handleFieldChange}
      />

      {/* Bottom Sticky Action Bar */}
      <div className="flex items-center justify-between p-4 bg-[var(--nb-surface)] border-[4px] border-[var(--nb-border)] shadow-[6px_6px_0px_0px_var(--nb-shadow)] sticky bottom-4 z-20">
        <Link to="/admin/brands">
          <Button type="button" variant="white" size="md">
            BATAL
          </Button>
        </Link>

        <Button
          type="submit"
          variant="yellow"
          size="md"
          isLoading={saveMutation.isPending}
          disabled={saveMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2 stroke-[3]" />
          {saveMutation.isPending ? 'MENYIMPAN BRAND...' : 'SIMPAN SEMUA PERUBAHAN'}
        </Button>
      </div>
    </form>
  );
};
