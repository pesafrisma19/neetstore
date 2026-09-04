import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminPricingRules, deleteAdminPricingRule, repriceAdminPricingRules } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2, RefreshCw, AlertCircle, Sparkles, DollarSign } from 'lucide-react';
import type { PricingRuleData } from '../../types';
import { PricingRuleModal } from '../components/PricingRuleModal';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { useToast } from '../../../../components/ui/ToastContext';

interface TabPricingRulesProps {
  pricingRules: PricingRuleData[];
  onAddPricingRule: () => void;
  onEditPricingRule: (rule: PricingRuleData) => void;
  onDeletePricingRule: (id: number) => void;
  onReprice: () => void;
  isRepricing?: boolean;
  isDeletingId?: number | null;
}

export const TabPricingRules: React.FC<TabPricingRulesProps> = ({
  pricingRules,
  onAddPricingRule,
  onEditPricingRule,
  onDeletePricingRule,
  onReprice,
  isRepricing,
  isDeletingId,
}) => {
  const formatMarginLabel = (percent: number = 0, flat: number = 0) => {
    if (percent > 0 && flat > 0) return `${percent}% + Rp ${flat.toLocaleString('id-ID')}`;
    if (percent > 0) return `${percent}%`;
    if (flat > 0) return `Rp ${flat.toLocaleString('id-ID')}`;
    return '0 (Asli)';
  };

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="var(--nb-cyan)" className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-black text-[var(--nb-text-on-accent)] flex items-center gap-2">
            <DollarSign className="w-5 h-5 stroke-[3]" />
            <span>ATURAN MARGIN HARGA (DUAL MARGIN 4 LEVEL)</span>
          </CardTitle>
          <Badge variant="yellow" size="sm">
            {pricingRules.length} ATURAN
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="purple"
            size="sm"
            onClick={onReprice}
            isLoading={isRepricing}
            disabled={isRepricing}
            title="Hitung ulang harga jual seluruh produk berdasarkan DB originalPrice & Pricing Rules terbaru"
          >
            <Sparkles className="w-4 h-4 stroke-[3]" />
            <span>{isRepricing ? 'SINKRONISASI...' : 'TERAPKAN ULANG HARGA'}</span>
          </Button>

          <Button variant="yellow" size="sm" onClick={onAddPricingRule}>
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>TAMBAH ATURAN MARGIN</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TARGET TIPE</TableHead>
              <TableHead>NAMA TARGET</TableHead>
              <TableHead>🌐 GUEST</TableHead>
              <TableHead>👤 MEMBER</TableHead>
              <TableHead>💼 RESELLER</TableHead>
              <TableHead>👑 VIP</TableHead>
              <TableHead className="text-right">AKSI</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pricingRules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <Badge
                    variant={
                      rule.targetType === 'GLOBAL'
                        ? 'yellow'
                        : rule.targetType === 'CATEGORY'
                        ? 'purple'
                        : rule.targetType === 'BRAND'
                        ? 'pink'
                        : rule.targetType === 'PROVIDER'
                        ? 'cyan'
                        : 'mint'
                    }
                    size="sm"
                  >
                    {rule.targetType}
                  </Badge>
                </TableCell>

                <TableCell className="font-black text-[var(--nb-text)]">
                  {rule.targetName || 'SEMUA PRODUK (GLOBAL)'}
                </TableCell>

                <TableCell className="font-black text-[var(--nb-pink)] text-xs">
                  {formatMarginLabel(rule.guestPercent, rule.guestFlat)}
                </TableCell>

                <TableCell className="font-black text-[var(--nb-cyan)] text-xs">
                  {formatMarginLabel(rule.memberPercent, rule.memberFlat)}
                </TableCell>

                <TableCell className="font-black text-[var(--nb-purple)] text-xs">
                  {formatMarginLabel(rule.resellerPercent, rule.resellerFlat)}
                </TableCell>

                <TableCell className="font-black text-[var(--nb-mint)] text-xs">
                  {formatMarginLabel(rule.vipPercent, rule.vipFlat)}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="yellow" size="sm" onClick={() => onEditPricingRule(rule)}>
                      <Edit className="w-3.5 h-3.5 stroke-[3]" />
                      <span className="hidden sm:inline">EDIT</span>
                    </Button>
                    {rule.targetType !== 'GLOBAL' && (
                      <Button
                        variant="pink"
                        size="sm"
                        onClick={() => onDeletePricingRule(rule.id)}
                        disabled={isDeletingId === rule.id}
                        isLoading={isDeletingId === rule.id}
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {pricingRules.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-[var(--nb-text-muted)] font-bold text-xs uppercase tracking-wider">
                  Belum ada aturan margin harga. Klik "TAMBAH ATURAN MARGIN" untuk membuat aturan baru.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const PricingRulesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRuleData | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<PricingRuleData | null>(null);

  // TanStack Query for Pricing Rules list
  const {
    data: pricingRules = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PricingRuleData[]>({
    queryKey: queryKeys.admin.pricingRules.all,
    queryFn: async () => {
      const res = await getAdminPricingRules();
      return Array.isArray(res) ? res : [];
    },
  });

  // TanStack Mutation for Delete Rule
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminPricingRule(id),
    onMutate: (id) => {
      setDeletingId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pricingRules.all });
      addToast({ title: 'SUKSES', message: 'Aturan margin berhasil dihapus.', type: 'success' });
    },
    onError: (err: any) => {
      addToast({ title: 'ERROR', message: err.message || 'Gagal menghapus aturan margin.', type: 'error' });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  // Keputusan 2A Mutation: Reprice All Products (Tanpa provider API call)
  const repriceMutation = useMutation({
    mutationFn: () => repriceAdminPricingRules(),
    onSuccess: (data) => {
      addToast({
        title: 'SUKSES',
        message: data?.message || `Berhasil menghitung ulang harga untuk ${data?.updatedCount || 0} produk! 🎉`,
        type: 'success',
      });
    },
    onError: (err: any) => {
      addToast({ title: 'ERROR', message: err.message || 'Gagal menghitung ulang harga produk.', type: 'error' });
    },
  });

  const handleAdd = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rule: PricingRuleData) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const target = pricingRules.find((r) => r.id === id) || null;
    setRuleToDelete(target || ({ id, targetType: 'Rule', targetId: id } as any));
  };

  const handleReprice = () => {
    if (!window.confirm('Terapkan ulang harga pada seluruh produk berdasarkan Pricing Rule terbaru di database? (Operasi ini murni kalkulasi lokal tanpa memanggil API Provider)')) return;
    repriceMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {isLoading && (
        <Card variant="white" shadow="md" borderWidth="4" className="p-12 text-center border-brutal">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-[var(--nb-yellow)] mb-3 stroke-[3]" />
          <p className="font-black text-sm uppercase tracking-wider text-[var(--nb-text)]">
            Memuat Data Aturan Margin...
          </p>
        </Card>
      )}

      {isError && (
        <Card variant="white" shadow="md" borderWidth="4" className="p-8 text-center border-[4px] border-red-600">
          <AlertCircle className="w-10 h-10 mx-auto text-red-600 mb-3 stroke-[3]" />
          <p className="font-black text-sm text-red-600 uppercase tracking-wider mb-4">
            {(error as any)?.message || 'Gagal memuat daftar Aturan Margin.'}
          </p>
          <Button variant="yellow" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2 stroke-[3]" />
            COBA LAGI
          </Button>
        </Card>
      )}

      {!isLoading && !isError && (
        <TabPricingRules
          pricingRules={pricingRules}
          onAddPricingRule={handleAdd}
          onEditPricingRule={handleEdit}
          onDeletePricingRule={handleDelete}
          onReprice={handleReprice}
          isRepricing={repriceMutation.isPending}
          isDeletingId={deletingId}
        />
      )}

      <PricingRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRule={editingRule}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(ruleToDelete)}
        onClose={() => setRuleToDelete(null)}
        onConfirm={() => {
          if (ruleToDelete) {
            deleteMutation.mutate(ruleToDelete.id);
            setRuleToDelete(null);
          }
        }}
        title="HAPUS ATURAN MARGIN?"
        description={`Apakah Anda yakin ingin menghapus Aturan Margin (${ruleToDelete?.targetType || 'Rule'}) ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="HAPUS"
        cancelLabel="BATAL"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
