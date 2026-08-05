import React, { useState, useEffect } from 'react';
import {
  getAdminRegions,
  getAdminBrands,
  createAdminRegion,
  updateAdminRegion,
  deleteAdminRegion,
  type RegionData,
} from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Dialog } from '../../../../components/ui/Dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../../../../components/ui/ToastContext';
import { COUNTRIES } from '../../../../utils/countries';

const getCountryFlagEmoji = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const RegionsPage: React.FC = () => {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination States
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<RegionData | null>(null);
  const [formBrandId, setFormBrandId] = useState<string>('');
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formMappingMode, setFormMappingMode] = useState<'ALLOW' | 'BLOCK'>('ALLOW');
  const [formMappingCountries, setFormMappingCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Record<number, boolean>>({});

  const toggleExpandCountries = (id: number) => {
    setExpandedCountries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toast Context
  const { addToast } = useToast();

  const fetchBrands = async () => {
    try {
      const data = await getAdminBrands();
      if (Array.isArray(data)) {
        setBrands(data.map((b) => ({ id: b.id, name: b.name })));
        if (data.length > 0 && !formBrandId) {
          setFormBrandId(String(data[0].id));
        }
      }
    } catch (err) {
      console.error('Gagal memuat brand:', err);
    }
  };

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const brandId = selectedBrand !== 'ALL' ? parseInt(selectedBrand) : undefined;
      const res = await getAdminRegions({
        brandId,
        search: search.trim() || undefined,
        page: currentPage,
        pageSize,
      });

      if (res && Array.isArray(res.items)) {
        setRegions(res.items);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCount(res.pagination.total || 0);
        } else {
          setTotalPages(1);
          setTotalCount(res.items.length);
        }
      } else {
        setRegions([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Gagal memuat daftar Region', type: 'error' });
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [selectedBrand, currentPage, search]);

  const handleOpenAddModal = () => {
    setEditingRegion(null);
    setFormName('');
    setFormCode('');
    setFormSortOrder(0);
    setFormMappingMode('ALLOW');
    setFormMappingCountries([]);
    setCountrySearch('');
    setFormIsActive(true);
    if (brands.length > 0) {
      setFormBrandId(selectedBrand !== 'ALL' ? selectedBrand : String(brands[0].id));
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (region: RegionData) => {
    setEditingRegion(region);
    setFormBrandId(String(region.brandId));
    setFormName(region.name);
    setFormCode(region.code || '');
    setFormSortOrder(region.sortOrder || 0);
    setFormMappingMode(region.mappingMode || 'ALLOW');
    try {
      setFormMappingCountries(Array.isArray(region.mappingCountries) ? region.mappingCountries : []);
    } catch {
      setFormMappingCountries([]);
    }
    setCountrySearch('');
    setFormIsActive(region.isActive);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      addToast({ title: 'VALIDASI', message: 'Nama Region wajib diisi', type: 'error' });
      return;
    }
    if (!formBrandId) {
      addToast({ title: 'VALIDASI', message: 'Brand wajib dipilih', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        brandId: parseInt(formBrandId),
        name: formName.trim(),
        code: formCode.trim() || null,
        sortOrder: Number(formSortOrder) || 0,
        mappingMode: formMappingMode,
        mappingCountries: formMappingCountries,
        isActive: formIsActive,
      };

      if (editingRegion) {
        await updateAdminRegion(editingRegion.id, payload);
        addToast({ title: 'SUKSES', message: `Region "${formName}" berhasil diperbarui`, type: 'success' });
      } else {
        await createAdminRegion(payload);
        addToast({ title: 'SUKSES', message: `Region "${formName}" berhasil ditambahkan`, type: 'success' });
      }

      setIsModalOpen(false);
      fetchRegions();
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Gagal menyimpan Region', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Region "${name}"?`)) {
      return;
    }

    try {
      await deleteAdminRegion(id);
      addToast({ title: 'SUKSES', message: `Region "${name}" berhasil dihapus`, type: 'success' });
      fetchRegions();
    } catch (err: any) {
      // Menampilkan error backend jika ditolak oleh safe delete guard (attached products)
      addToast({
        title: 'GAGAL HAPUS',
        message: err.message || 'Tidak dapat menghapus Region yang masih terhubung ke produk',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
        <CardHeader headerBg="#00F0FF" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base text-[var(--nb-text)] uppercase font-black">
              SERVER REGION GAME
            </CardTitle>
            <p className="text-xs text-[var(--nb-text-muted)] font-bold mt-1 uppercase">
              Kelola daftar region server publik per Brand Game
            </p>
          </div>
          <Button variant="yellow" size="sm" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>TAMBAH REGION</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 stroke-[3] absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)]" />
              <Input
                placeholder="Cari region / kode..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 text-sm py-1.5"
              />
            </div>

            <Select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              fullWidth={false}
              className="w-full sm:w-64"
              options={[
                { value: 'ALL', label: 'SEMUA BRAND GAME' },
                ...brands.map((b) => ({ value: String(b.id), label: b.name })),
              ]}
            />
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border-2 border-black rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>NAMA REGION</TableHead>
                  <TableHead>BRAND GAME</TableHead>
                  <TableHead>PEMETAAN NEGARA</TableHead>
                  <TableHead className="text-center">URUTAN (SORT)</TableHead>
                  <TableHead className="text-center">STATUS</TableHead>
                  <TableHead className="text-right">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 font-black uppercase text-[var(--nb-text-muted)]">
                      Memuat data region...
                    </TableCell>
                  </TableRow>
                ) : regions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 font-bold text-[var(--nb-text-muted)]">
                      Belum ada Region server yang ditambahkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  regions.map((reg, idx) => {
                    const countryList = Array.isArray(reg.mappingCountries) ? reg.mappingCountries : [];
                    const mode = reg.mappingMode || 'ALLOW';
                    const isExpanded = !!expandedCountries[reg.id];
                    const visibleList = isExpanded ? countryList : countryList.slice(0, 4);

                    return (
                      <TableRow key={reg.id}>
                        <TableCell className="font-mono text-xs font-bold">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </TableCell>
                        <TableCell className="font-black text-[var(--nb-text)]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{reg.name}</span>
                            {reg.code && <Badge variant="white" size="sm" className="font-mono">{reg.code}</Badge>}
                          </div>
                          <span className="block text-[10px] font-mono text-[var(--nb-text-muted)] font-normal">
                            slug: {reg.slug}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-xs">
                          {reg.brand ? reg.brand.name : `Brand #${reg.brandId}`}
                        </TableCell>
                        <TableCell className="font-bold text-xs">
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant={mode === 'BLOCK' ? 'pink' : 'mint'} size="sm" className="font-black">
                              {mode === 'BLOCK' ? 'BLOKIR' : 'KHUSUS'}
                            </Badge>
                            {countryList.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[280px] items-center">
                                {visibleList.map((code) => (
                                  <span key={code} className="inline-flex items-center gap-0.5 text-[10px] font-black px-1 py-0.2 bg-[var(--nb-surface-alt)] border border-[var(--nb-border)] rounded">
                                    <span>{getCountryFlagEmoji(code)}</span>
                                    <span>{code}</span>
                                  </span>
                                ))}
                                {countryList.length > 4 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandCountries(reg.id)}
                                    className="text-[10px] font-black text-[var(--nb-purple)] hover:text-[var(--nb-pink)] underline cursor-pointer ml-1 select-none"
                                  >
                                    {isExpanded ? '▲ Sembunyikan' : `+${countryList.length - 4} lagi (Lihat Semua)`}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-[var(--nb-text-muted)] italic font-semibold">Semua negara</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold">
                          {reg.sortOrder}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={reg.isActive ? 'mint' : 'pink'} size="sm">
                            {reg.isActive ? 'AKTIF' : 'NON-AKTIF'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="purple" size="sm" onClick={() => handleOpenEditModal(reg)}>
                              <Edit className="w-3.5 h-3.5 stroke-[3]" />
                              <span>EDIT</span>
                            </Button>
                            <Button variant="pink" size="sm" onClick={() => handleDelete(reg.id, reg.name)}>
                              <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs font-bold text-[var(--nb-text-muted)]">
                Menampilkan {regions.length} dari {totalCount} Region (Halaman {currentPage} dari {totalPages})
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="white"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                  <span>SEBELUMNYA</span>
                </Button>
                <Button
                  variant="white"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  <span>SELANJUTNYA</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog Form Create / Edit Region */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRegion ? 'EDIT SERVER REGION' : 'TAMBAH SERVER REGION BARU'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-black uppercase mb-1.5">
              BRAND GAME <span className="text-red-500">*</span>
            </label>
            <Select
              value={formBrandId}
              onChange={(e) => setFormBrandId(e.target.value)}
              fullWidth
              options={brands.map((b) => ({ value: String(b.id), label: b.name }))}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1.5">
              NAMA REGION <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Contoh: Turkey, Brazil, Indonesia, Global"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1.5">
              KODE REGION (OPSIONAL)
            </label>
            <Input
              placeholder="Contoh: TR, BR, ID, GL"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1.5">
              URUTAN TAMPIL (SORT ORDER)
            </label>
            <Input
              type="number"
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
            />
            <span className="text-[10px] text-[var(--nb-text-muted)] font-bold mt-1 block">
              Angka lebih kecil akan tampil lebih awal di Halaman Checkout.
            </span>
          </div>

          <div className="p-3 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] space-y-3 rounded-lg">
            <label className="block text-xs font-black uppercase text-[var(--nb-text)]">
              MODE PEMETAAN NEGARA (AUTO-LOCK REGION)
            </label>
            <Select
              value={formMappingMode}
              onChange={(e) => setFormMappingMode(e.target.value as 'ALLOW' | 'BLOCK')}
              fullWidth
              options={[
                { value: 'ALLOW', label: 'KHUSUS - Hanya negara dicentang yang diizinkan' },
                { value: 'BLOCK', label: 'BLOKIR - Semua diizinkan KECUALI yang dicentang' },
              ]}
            />

            {/* Box Ringkasan Negara Terpilih (Persistent Badges) */}
            {formMappingCountries.length > 0 && (
              <div className="space-y-1.5 p-2.5 bg-[var(--nb-surface)] border-[2px] border-[var(--nb-border)] rounded-md">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-[var(--nb-text-muted)]">
                  <span>NEGARA TERPILIH ({formMappingCountries.length})</span>
                  <button
                    type="button"
                    onClick={() => setFormMappingCountries([])}
                    className="text-red-500 hover:underline cursor-pointer font-bold"
                  >
                    Hapus Semua
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {formMappingCountries.map((code) => {
                    const found = COUNTRIES.find((c) => c.code === code);
                    const name = found ? found.name : code;
                    const flag = getCountryFlagEmoji(code);
                    return (
                      <Badge
                        key={code}
                        variant={formMappingMode === 'BLOCK' ? 'pink' : 'cyan'}
                        size="sm"
                        className="flex items-center gap-1 text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_var(--nb-shadow)]"
                      >
                        <span>{flag}</span>
                        <span>{name} ({code})</span>
                        <button
                          type="button"
                          onClick={() => setFormMappingCountries((prev) => prev.filter((c) => c !== code))}
                          className="ml-1 font-extrabold hover:text-red-600 cursor-pointer"
                        >
                          ✕
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2 mt-2">
              <label className="block text-xs font-black uppercase text-[var(--nb-text-muted)]">
                PILIH NEGARA
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)]" />
                <Input
                  placeholder="Cari negara (misal: Indonesia)..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="pl-8 py-1.5 text-xs bg-[var(--nb-surface)]"
                />
              </div>

              <div className="max-h-40 overflow-y-auto border-2 border-[var(--nb-border)] bg-[var(--nb-surface)] p-2 space-y-1 rounded-md">
                {COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 ? (
                  <div className="text-xs text-center text-[var(--nb-text-muted)] py-2 font-bold">Negara tidak ditemukan</div>
                ) : (
                  COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.toLowerCase().includes(countrySearch.toLowerCase())).map(country => (
                    <div key={country.code} className="flex items-center gap-2 hover:bg-[var(--nb-surface-alt)] p-1 rounded">
                      <Checkbox
                        checked={formMappingCountries.includes(country.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormMappingCountries(prev => [...prev, country.code]);
                          } else {
                            setFormMappingCountries(prev => prev.filter(c => c !== country.code));
                          }
                        }}
                      />
                      <span className="text-xs font-bold uppercase text-[var(--nb-text)]">
                        {getCountryFlagEmoji(country.code)} {country.name} ({country.code})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Checkbox
              label="STATUS REGION AKTIF (Dapat dipilih di Checkout)"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
            <Button variant="white" type="button" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              BATAL
            </Button>
            <Button variant="yellow" type="submit" disabled={submitting}>
              {submitting ? 'MENYIMPAN...' : editingRegion ? 'SIMPAN PERUBAHAN' : 'TAMBAH REGION'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
