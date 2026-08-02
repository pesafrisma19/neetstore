import React, { useState, useEffect } from 'react';
import {
  getAdminProviderMappingAudit,
  getAdminBrands,
  getAdminProviders,
  getAdminRegions,
  getAdminProductCategories,
  createAdminProviderMapping,
  updateAdminProviderMapping,
  type AuditItemData,
  type RegionData,
  type ProductCategoryData,
} from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Dialog } from '../../../../components/ui/Dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';
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

  // Modal Dialog Form States
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
        getAdminProductCategories({ brandId: bId, active: true }),
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
                        {item.isMapped ? (
                          <Button variant="purple" size="sm" onClick={() => handleOpenModalForRule(item)}>
                            <Edit className="w-3.5 h-3.5 stroke-[3]" />
                            <span>EDIT ATURAN</span>
                          </Button>
                        ) : (
                          <Button variant="yellow" size="sm" onClick={() => handleOpenModalForRule(item)}>
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>BUAT ATURAN</span>
                          </Button>
                        )}
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
            <span className="text-[10px] text-[var(--nb-text-muted)] font-bold mt-1 block">
              Produk dengan nilai ini akan dikelompokkan ke Region Server yang dipilih.
            </span>
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
            <span className="text-[10px] text-[var(--nb-text-muted)] font-bold mt-1 block">
              Produk dengan nilai ini akan dikelompokkan ke Tab Kategori yang dipilih.
            </span>
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
    </div>
  );
};
