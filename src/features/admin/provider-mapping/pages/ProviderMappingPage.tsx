import React, { useState, useEffect } from 'react';
import {
  getAdminProviderMappingAudit,
  getAdminBrands,
  getAdminProviders,
  getAdminRegions,
  getAdminProductCategories,
  createAdminProviderMapping,
  updateAdminProviderMapping,
  previewAdminProviderMapping,
  applyAdminProviderMapping,
  type AuditItemData,
  type RegionData,
  type ProductCategoryData,
  type MappingPreviewData,
} from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Dialog } from '../../../../components/ui/Dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Search, ShieldAlert, CheckCircle2, Eye, Zap } from 'lucide-react';
import { useToast } from '../../../../components/ui/ToastContext';

export const ProviderMappingPage: React.FC = () => {
  // Master Audit & Option States
  const [auditItems, setAuditItems] = useState<AuditItemData[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [providers, setProviders] = useState<{ id: number; name: string }[]>([]);
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedProvider, setSelectedProvider] = useState('ALL');

  // Rule Modal Dialog Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAuditItem, setActiveAuditItem] = useState<AuditItemData | null>(null);
  const [formProviderId, setFormProviderId] = useState<string>('');
  const [formBrandId, setFormBrandId] = useState<string>('');
  const [formProviderValue, setFormProviderValue] = useState<string>('');
  const [formRegionId, setFormRegionId] = useState<string>('');
  const [formProductCategoryId, setFormProductCategoryId] = useState<string>('');
  const [formPriority, setFormPriority] = useState<number>(10);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

  // Phase 4B: Preview Drawer & Bulk Apply States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<MappingPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);

  // Toast Context
  const { addToast } = useToast();

  const fetchMasterOptions = async () => {
    try {
      const [brandsData, providersData] = await Promise.all([getAdminBrands(), getAdminProviders()]);
      if (Array.isArray(brandsData)) {
        setBrands(brandsData.map((b) => ({ id: b.id, name: b.name })));
      }
      if (Array.isArray(providersData)) {
        setProviders(providersData.map((p) => ({ id: p.id, name: p.name })));
      }
    } catch (err) {
      console.error('Gagal memuat master opsi:', err);
    }
  };

  const fetchAuditView = async () => {
    setLoading(true);
    try {
      const brandId = selectedBrand !== 'ALL' ? parseInt(selectedBrand) : undefined;
      const providerId = selectedProvider !== 'ALL' ? parseInt(selectedProvider) : undefined;

      const data = await getAdminProviderMappingAudit({
        brandId,
        providerId,
        search: search.trim() || undefined,
      });

      if (Array.isArray(data)) {
        setAuditItems(data);
      } else {
        setAuditItems([]);
      }
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Gagal memuat Audit Provider Mapping', type: 'error' });
      setAuditItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterOptions();
  }, []);

  useEffect(() => {
    fetchAuditView();
  }, [selectedBrand, selectedProvider, search]);

  const fetchBrandRegionsAndCategories = async (bId: number) => {
    try {
      const [regRes, catRes] = await Promise.all([
        getAdminRegions({ brandId: bId, active: true }),
        getAdminProductCategories({ active: true }),
      ]);
      setRegions(regRes?.items || []);
      setProductCategories(catRes?.items || []);
    } catch (err) {
      console.error('Gagal memuat region & category per brand:', err);
      setRegions([]);
      setProductCategories([]);
    }
  };

  const handleOpenModalForRule = async (item: AuditItemData) => {
    setActiveAuditItem(item);
    setFormProviderId(String(item.providerId));
    setFormBrandId(String(item.brandId));
    setFormProviderValue(item.providerValue);

    if (item.rule) {
      setFormRegionId(item.rule.region ? String(item.rule.region.id) : '');
      setFormProductCategoryId(item.rule.productCategory ? String(item.rule.productCategory.id) : '');
      setFormPriority(item.rule.priority ?? 10);
      setFormIsActive(item.rule.isActive ?? true);
    } else {
      setFormRegionId('');
      setFormProductCategoryId('');
      setFormPriority(10);
      setFormIsActive(true);
    }

    await fetchBrandRegionsAndCategories(item.brandId);
    setIsModalOpen(true);
  };

  const handleSubmitRuleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAuditItem) return;

    setSubmitting(true);
    try {
      const payload = {
        providerId: parseInt(formProviderId),
        brandId: parseInt(formBrandId),
        providerProductType: formProviderValue,
        regionId: formRegionId ? parseInt(formRegionId) : null,
        productCategoryId: formProductCategoryId ? parseInt(formProductCategoryId) : null,
        priority: Number(formPriority) || 10,
        isActive: formIsActive,
      };

      if (activeAuditItem.rule && activeAuditItem.rule.id) {
        await updateAdminProviderMapping(activeAuditItem.rule.id, payload);
        addToast({
          title: 'SUKSES',
          message: `Aturan mapping "${formProviderValue}" berhasil diperbarui`,
          type: 'success',
        });
      } else {
        await createAdminProviderMapping(payload);
        addToast({
          title: 'SUKSES',
          message: `Aturan mapping baru "${formProviderValue}" berhasil dibuat`,
          type: 'success',
        });
      }

      setIsModalOpen(false);
      fetchAuditView();
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Gagal menyimpan aturan mapping', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Phase 4B: Open Preview Drawer
  const handleOpenPreview = async (item: AuditItemData) => {
    if (!item.rule || !item.rule.id) {
      addToast({
        title: 'PERINGATAN',
        message: 'Buat aturan pemetaan terlebih dahulu sebelum melihat Preview Impact',
        type: 'error',
      });
      return;
    }

    setActiveAuditItem(item);
    setSelectedRuleId(item.rule.id);
    setPreviewLoading(true);
    setIsPreviewOpen(true);

    try {
      const res = await previewAdminProviderMapping({ ruleId: item.rule.id });
      setPreviewData(res);
    } catch (err: any) {
      addToast({ title: 'ERROR PREVIEW', message: err.message || 'Gagal memuat Preview Impact SKU', type: 'error' });
      setPreviewData(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Phase 4B: Execute Atomic Bulk Apply
  const handleExecuteBulkApply = async () => {
    if (!selectedRuleId || !activeAuditItem) return;

    const confirmText = `Apakah Anda yakin ingin mengeksekusi Bulk Apply untuk Provider Value "${activeAuditItem.providerValue}"?\n\nSistem akan secara atomik memperbarui ${previewData?.totalImpacted || 0} produk SKU di Database.`;
    if (!window.confirm(confirmText)) return;

    setApplyLoading(true);
    try {
      const res = await applyAdminProviderMapping({ ruleId: selectedRuleId });
      if (res) {
        addToast({
          title: 'BULK APPLY SUKSES',
          message: res.message || `Berhasil memperbarui ${res.updated} SKU produk scara atomik!`,
          type: 'success',
        });
        setIsPreviewOpen(false);
        fetchAuditView();
      } else {
        throw new Error('Gagal terhubung ke server');
      }
    } catch (err: any) {
      addToast({ title: 'ERROR BULK APPLY', message: err.message || 'Gagal mengeksekusi Bulk Apply', type: 'error' });
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
        <CardHeader headerBg="#00F0FF" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base text-[var(--nb-text)] uppercase font-black">
              INTEGRASI PROVIDER: AUDIT & PROVIDER MAPPING RULE ENGINE
            </CardTitle>
            <p className="text-xs text-[var(--nb-text-muted)] font-bold mt-1 uppercase">
              Petakan nilai mentah tipe produk dari Suplier (Digiflazz/Vip) ke Region & ProductCategory etalase
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 stroke-[3] absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)]" />
              <Input
                placeholder="Cari provider value (Turkey/Umum)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm py-1.5"
              />
            </div>

            <Select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              fullWidth={false}
              className="w-full sm:w-56"
              options={[
                { value: 'ALL', label: 'SEMUA BRAND GAME' },
                ...brands.map((b) => ({ value: String(b.id), label: b.name })),
              ]}
            />

            <Select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              fullWidth={false}
              className="w-full sm:w-48"
              options={[
                { value: 'ALL', label: 'SEMUA PROVIDER' },
                ...providers.map((p) => ({ value: String(p.id), label: p.name })),
              ]}
            />
          </div>

          {/* Audit View Table */}
          <div className="overflow-x-auto border-2 border-black rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>BRAND GAME</TableHead>
                  <TableHead>PROVIDER VALUE (MENTAH)</TableHead>
                  <TableHead className="text-center">JUMLAH SKU</TableHead>
                  <TableHead>HASIL PEMETAAN REGION & KATEGORI</TableHead>
                  <TableHead className="text-center">STATUS AUDIT</TableHead>
                  <TableHead className="text-right">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 font-black uppercase text-[var(--nb-text-muted)]">
                      Memuat data audit provider mapping...
                    </TableCell>
                  </TableRow>
                ) : auditItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 font-bold text-[var(--nb-text-muted)]">
                      Tidak ada data audit provider yang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  auditItems.map((item, idx) => (
                    <TableRow key={`${item.brandId}-${item.providerId}-${item.providerValue}`}>
                      <TableCell className="font-mono text-xs font-bold">{idx + 1}</TableCell>
                      <TableCell className="font-black text-[var(--nb-text)]">{item.brandName}</TableCell>
                      <TableCell className="font-mono font-bold text-xs">
                        <Badge variant="white" className="border-2 border-black font-black">
                          {item.providerValue}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono font-black text-sm">
                        {item.productCount} SKU
                      </TableCell>
                      <TableCell>
                        {item.rule ? (
                          <div className="text-xs space-y-0.5 font-bold">
                            <div>
                              <span className="text-[var(--nb-text-muted)]">Region:</span>{' '}
                              <Badge variant="purple" size="sm">
                                {item.rule.region ? item.rule.region.name : '(Bebas Region)'}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-[var(--nb-text-muted)] font-normal">Kategori:</span>{' '}
                              <Badge variant="yellow" size="sm">
                                {item.rule.productCategory ? item.rule.productCategory.name : '(Bebas Kategori)'}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-red-500 italic">Belum Dipetakan</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.isMapped ? (
                          <Badge variant="mint" size="sm" className="gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>MAPPED</span>
                          </Badge>
                        ) : (
                          <Badge variant="pink" size="sm" className="gap-1 animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>⚠️ UNMAPPED</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.isMapped && (
                            <Button variant="mint" size="sm" onClick={() => handleOpenPreview(item)}>
                              <Eye className="w-3.5 h-3.5 stroke-[3]" />
                              <span>PREVIEW IMPACT</span>
                            </Button>
                          )}
                          <Button variant={item.isMapped ? 'purple' : 'yellow'} size="sm" onClick={() => handleOpenModalForRule(item)}>
                            {item.isMapped ? <Edit className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
                            <span>{item.isMapped ? 'EDIT ATURAN' : 'BUAT ATURAN'}</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog Create / Edit Rule Mapping */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeAuditItem?.rule ? 'EDIT ATURAN PEMETAAN' : 'BUAT ATURAN PEMETAAN BARU'}
      >
        <form onSubmit={handleSubmitRuleForm} className="space-y-4 text-left">
          <div className="p-3 bg-[var(--nb-surface-alt)] border-2 border-black rounded-md space-y-1 text-xs font-bold">
            <div>
              <span className="text-[var(--nb-text-muted)]">Brand:</span> {activeAuditItem?.brandName}
            </div>
            <div>
              <span className="text-[var(--nb-text-muted)]">Provider Value:</span>{' '}
              <span className="font-mono text-blue-600">{activeAuditItem?.providerValue}</span>
            </div>
            <div>
              <span className="text-[var(--nb-text-muted)]">Total SKU Terdampak:</span>{' '}
              <span className="font-mono">{activeAuditItem?.productCount} Produk</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1.5">
              TARGET REGION SERVER
            </label>
            <Select
              value={formRegionId}
              onChange={(e) => setFormRegionId(e.target.value)}
              fullWidth
              options={[
                { value: '', label: '-- BEBAS REGION (TANPA REGION KHUSUS) --' },
                ...regions.map((r) => ({ value: String(r.id), label: `${r.name} (${r.code || 'GL'})` })),
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1.5">
              TARGET KATEGORI PRODUK WEB
            </label>
            <Select
              value={formProductCategoryId}
              onChange={(e) => setFormProductCategoryId(e.target.value)}
              fullWidth
              options={[
                { value: '', label: '-- BEBAS KATEGORI (TANPA TAB KATEGORI KHUSUS) --' },
                ...productCategories.map((c) => ({ value: String(c.id), label: c.name })),
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1.5">
              PRIORITAS ATURAN (PRIORITY)
            </label>
            <Input
              type="number"
              value={formPriority}
              onChange={(e) => setFormPriority(parseInt(e.target.value) || 10)}
            />
          </div>

          <div className="pt-2">
            <Checkbox
              label="ATURAN PEMETAAN AKTIF"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
            <Button variant="white" type="button" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              BATAL
            </Button>
            <Button variant="yellow" type="submit" disabled={submitting}>
              {submitting ? 'MENYIMPAN...' : activeAuditItem?.rule ? 'SIMPAN PERUBAHAN' : 'BUAT ATURAN'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Phase 4B: Modal Dialog Preview Impact & Atomic Bulk Apply */}
      <Dialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`PREVIEW IMPACT: "${activeAuditItem?.providerValue || ''}"`}
      >
        <div className="space-y-4 text-left">
          {previewLoading ? (
            <div className="text-center py-8 font-black uppercase text-[var(--nb-text-muted)]">
              Memuat data preview impact SKU...
            </div>
          ) : !previewData ? (
            <div className="text-center py-6 font-bold text-red-500">
              Gagal memuat data preview impact.
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[var(--nb-surface-alt)] border-2 border-black rounded-lg">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] block">TOTAL IMPACT SKU</span>
                  <span className="text-lg font-mono font-black text-blue-600">{previewData.totalImpacted} Produk</span>
                </div>
                <div className="p-3 bg-[var(--nb-surface-alt)] border-2 border-black rounded-lg">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] block">TARGET REGION</span>
                  <span className="text-sm font-bold">{previewData.targetRegion ? previewData.targetRegion.name : '(Bebas)'}</span>
                </div>
                <div className="p-3 bg-[var(--nb-surface-alt)] border-2 border-black rounded-lg">
                  <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] block">TARGET KATEGORI</span>
                  <span className="text-sm font-bold">{previewData.targetCategory ? previewData.targetCategory.name : '(Bebas)'}</span>
                </div>
              </div>

              {/* SKU List Table */}
              <div className="max-h-60 overflow-y-auto border-2 border-black rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>NAMA PRODUK</TableHead>
                      <TableHead>PERUBAHAN REGION</TableHead>
                      <TableHead>PERUBAHAN KATEGORI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.products.map((prod) => (
                      <TableRow key={prod.id}>
                        <TableCell className="font-mono text-xs font-bold">{prod.sku}</TableCell>
                        <TableCell className="font-bold text-xs">{prod.name}</TableCell>
                        <TableCell className="text-xs font-mono">
                          <span className="text-gray-400">{prod.currentRegion}</span>
                          <span className="mx-1 font-bold text-blue-600">→</span>
                          <span className="font-bold text-green-600">{prod.targetRegion}</span>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          <span className="text-gray-400">{prod.currentCategory}</span>
                          <span className="mx-1 font-bold text-blue-600">→</span>
                          <span className="font-bold text-yellow-600">{prod.targetCategory}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                <Button variant="white" type="button" onClick={() => setIsPreviewOpen(false)} disabled={applyLoading}>
                  BATAL
                </Button>
                <Button variant="yellow" type="button" onClick={handleExecuteBulkApply} disabled={applyLoading || previewData.totalImpacted === 0}>
                  <Zap className="w-4 h-4 stroke-[3] fill-black" />
                  <span>{applyLoading ? 'MENJALANKAN BULK APPLY...' : 'EKSEKUSI BULK APPLY SEKARANG'}</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};
