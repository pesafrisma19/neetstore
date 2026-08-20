import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWartopcoinCatalog, importWartopcoinProducts, type WartopcoinCatalogItem } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { useToast } from '../../../../components/ui/ToastContext';
import { X, Search, Download, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface GetProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GetProductModal: React.FC<GetProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch live catalog from Wartopcoin
  const {
    data: catalogResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['wartopcoin', 'catalog'],
    queryFn: getWartopcoinCatalog,
    enabled: isOpen,
    staleTime: 60 * 1000,
  });

  const products: WartopcoinCatalogItem[] = useMemo(() => {
    return catalogResponse?.data?.products || [];
  }, [catalogResponse]);

  // Unique brands list for filter dropdown
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filterBrand !== 'ALL' && p.brand !== filterBrand) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = p.productName?.toLowerCase().includes(q);
        const matchCode = p.productCode?.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchBrand) return false;
      }
      return true;
    });
  }, [products, filterBrand, searchQuery]);

  // Checkbox handlers
  const handleToggleSelect = (code: string, brandMapped: boolean) => {
    if (!brandMapped) return;
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    const next = new Set(selectedCodes);
    filteredProducts.forEach((p) => {
      if (p.brandMapped) next.add(p.productCode);
    });
    setSelectedCodes(next);
  };

  const handleDeselectAllVisible = () => {
    const next = new Set(selectedCodes);
    filteredProducts.forEach((p) => {
      next.delete(p.productCode);
    });
    setSelectedCodes(next);
  };

  // 2. Mutation for Selective Import
  const importMutation = useMutation({
    mutationFn: async (codes: string[]) => {
      const res = await importWartopcoinProducts(codes);
      if (res?.error) throw new Error(res.error);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers.all });
      queryClient.invalidateQueries({ queryKey: ['wartopcoin', 'catalog'] });

      const summary = res?.data;
      addToast({
        title: 'IMPORT BERHASIL',
        message: `Sukses import: ${summary?.imported || 0} baru, ${summary?.updated || 0} diperbarui, ${summary?.skipped || 0} dilewati.`,
        type: 'success',
      });

      if (summary?.errors && summary.errors.length > 0) {
        addToast({
          title: 'CATATAN IMPORT',
          message: summary.errors.slice(0, 3).join(' | '),
          type: 'warning',
        });
      }

      setSelectedCodes(new Set());
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      addToast({
        title: 'IMPORT GAGAL',
        message: err.message || 'Gagal mengimport produk terpilih.',
        type: 'error',
      });
    },
  });

  const handleImport = () => {
    const codes = Array.from(selectedCodes);
    if (codes.length === 0) return;
    importMutation.mutate(codes);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-[var(--nb-yellow)] border-b-[3px] border-black p-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-6 h-6 text-black" />
            <div>
              <CardTitle className="text-base sm:text-lg font-black uppercase text-black">
                GET PRODUCT (WARTOPCOIN LIVE)
              </CardTitle>
              <p className="text-xs font-bold text-black/80">
                Pilih dan import produk dari server Wartopcoin ke database NEETSTORE (Default: Non-aktif)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white border-2 border-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </CardHeader>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-neutral-50 border-b-2 border-black flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Filter Brand */}
            <div className="w-48 sm:w-60">
              <Select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                options={[
                  { label: 'Semua Brand Game', value: 'ALL' },
                  ...availableBrands.map((b) => ({ label: b, value: b })),
                ]}
              />
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <Input
                placeholder="Cari nama / SKU produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="white"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="white"
              size="sm"
              onClick={handleSelectAllVisible}
              disabled={filteredProducts.length === 0}
              className="text-xs font-bold"
            >
              Pilih Semua ({filteredProducts.filter((p) => p.brandMapped).length})
            </Button>
            <Button
              variant="white"
              size="sm"
              onClick={handleDeselectAllVisible}
              disabled={selectedCodes.size === 0}
              className="text-xs font-bold"
            >
              Batalkan Pilihan
            </Button>
          </div>
        </div>

        {/* Catalog Table Body */}
        <CardContent className="flex-1 overflow-y-auto p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-black mb-3" />
              <p className="font-black text-sm uppercase">Mengambil Katalog Live dari Wartopcoin...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="font-black text-sm text-red-600 uppercase mb-1">Gagal Memuat Katalog Wartopcoin</p>
              <p className="text-xs text-neutral-600">{(error as any)?.message || 'Pastikan kredensial Member Code & API Key sudah valid.'}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">
              <p className="font-bold text-sm">Tidak ada produk yang cocok dengan filter.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-neutral-100 sticky top-0 z-10 border-b-2 border-black">
                <TableRow>
                  <TableHead className="w-12 text-center">Pilih</TableHead>
                  <TableHead className="w-28">Kode (SKU)</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead className="w-36">Brand (Game)</TableHead>
                  <TableHead className="w-24">Tipe</TableHead>
                  <TableHead className="w-32 text-right">Harga Modal</TableHead>
                  <TableHead className="w-28 text-center">Status DB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((item) => {
                  const isChecked = selectedCodes.has(item.productCode);
                  const isMapped = item.brandMapped;

                  return (
                    <TableRow
                      key={item.productCode}
                      className={`hover:bg-neutral-50 ${!isMapped ? 'opacity-60 bg-neutral-100/50' : ''} ${isChecked ? 'bg-amber-50/70' : ''}`}
                    >
                      <TableCell className="text-center">
                        <Checkbox
                          checked={isChecked}
                          disabled={!isMapped}
                          onChange={() => handleToggleSelect(item.productCode, isMapped)}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-bold text-xs">
                        {item.productCode}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-xs text-black">{item.productName}</div>
                        {item.isFlashsale && (
                          <Badge variant="orange" className="text-[10px] py-0 px-1 mt-0.5">
                            ⚡ Flash Sale
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-bold">{item.brand}</div>
                        {isMapped ? (
                          <span className="text-[10px] text-green-700 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 inline" /> Mapped
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3 inline" /> Belum Terdaftar
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{item.type || '-'}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs text-black">
                        Rp {item.price.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.isImported ? (
                          <Badge variant="mint" className="text-[10px] py-0.5 px-1.5">
                            Sudah di DB
                          </Badge>
                        ) : (
                          <Badge variant="white" className="text-[10px] py-0.5 px-1.5 bg-neutral-200">
                            Baru
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Footer Action Bar */}
        <div className="p-4 bg-neutral-100 border-t-[3px] border-black flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-neutral-700">
            Terpilih: <span className="font-black text-black text-sm">{selectedCodes.size}</span> produk
            {selectedCodes.size > 0 && ' siap diimport ke database'}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="white" size="md" onClick={onClose} disabled={importMutation.isPending}>
              Batal
            </Button>
            <Button
              variant="yellow"
              size="md"
              onClick={handleImport}
              disabled={selectedCodes.size === 0 || importMutation.isPending}
              isLoading={importMutation.isPending}
              className="font-black uppercase shadow-[3px_3px_0px_0px_#000]"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span>
                {importMutation.isPending
                  ? 'Mengimport...'
                  : `IMPORT PRODUK TERPILIH (${selectedCodes.size})`}
              </span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
