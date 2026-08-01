import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { PricingRuleData } from '../../types';
import { PricingRuleModal } from '../components/PricingRuleModal';

interface TabPricingRulesProps {
  pricingRules: PricingRuleData[];
  onAddPricingRule: () => void;
  onEditPricingRule: (rule: PricingRuleData) => void;
  onDeletePricingRule: (id: number) => void;
}

export const TabPricingRules: React.FC<TabPricingRulesProps> = ({
  pricingRules,
  onAddPricingRule,
  onEditPricingRule,
  onDeletePricingRule,
}) => {
  const formatMarginLabel = (percent: number = 0, flat: number = 0) => {
    if (percent > 0 && flat > 0) return `${percent}% + Rp ${flat.toLocaleString('id-ID')}`;
    if (percent > 0) return `${percent}%`;
    if (flat > 0) return `Rp ${flat.toLocaleString('id-ID')}`;
    return '0 (Asli)';
  };

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="#00F0FF" className="flex items-center justify-between">
        <CardTitle className="text-base text-[var(--nb-text)]">ATURAN MARGIN HARGA (DUAL MARGIN 4 LEVEL)</CardTitle>
        <Button variant="yellow" size="sm" onClick={onAddPricingRule}>
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>TAMBAH ATURAN MARGIN</span>
        </Button>
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
            {pricingRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500 font-bold">
                  Belum ada aturan margin harga. Klik tombol "TAMBAH ATURAN MARGIN" untuk membuat aturan baru.
                </TableCell>
              </TableRow>
            ) : (
              pricingRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Badge 
                      variant={
                        rule.targetType === 'GLOBAL' ? 'yellow' : 
                        rule.targetType === 'CATEGORY' ? 'purple' : 
                        rule.targetType === 'BRAND' ? 'pink' : 'mint'
                      }
                      size="sm"
                    >
                      {rule.targetType}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-black text-[var(--nb-text)]">
                    {rule.targetName || 'SEMUA PRODUK (GLOBAL)'}
                  </TableCell>

                  <TableCell className="font-black text-pink-600 text-xs">
                    {formatMarginLabel(rule.guestPercent, rule.guestFlat)}
                  </TableCell>

                  <TableCell className="font-black text-blue-700 text-xs">
                    {formatMarginLabel(rule.memberPercent, rule.memberFlat)}
                  </TableCell>

                  <TableCell className="font-black text-purple-700 text-xs">
                    {formatMarginLabel(rule.resellerPercent, rule.resellerFlat)}
                  </TableCell>

                  <TableCell className="font-black text-emerald-700 text-xs">
                    {formatMarginLabel(rule.vipPercent, rule.vipFlat)}
                  </TableCell>

                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button variant="yellow" size="sm" onClick={() => onEditPricingRule(rule)}>
                      <Edit className="w-3.5 h-3.5 stroke-[3]" />
                      <span>EDIT</span>
                    </Button>
                    {rule.targetType !== 'GLOBAL' && (
                      <Button variant="pink" size="sm" onClick={() => onDeletePricingRule(rule.id)}>
                        <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const PricingRulesPage: React.FC = () => {
  const [pricingRules, setPricingRules] = useState<PricingRuleData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRuleData | null>(null);

  const fetchRules = async () => {
    try {
      const data = await apiFetch<PricingRuleData[]>('/admin/pricing-rules');
      setPricingRules(data || []);
    } catch (e) {
      console.error('Failed fetching pricing rules:', e);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAdd = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rule: PricingRuleData) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus Aturan Margin ini?')) return;
    try {
      await apiFetch(`/admin/pricing-rules/${id}`, { method: 'DELETE' });
      fetchRules();
    } catch (err: any) {
      alert(`Gagal menghapus aturan margin: ${err.message || 'Terjadi kesalahan'}`);
    }
  };

  return (
    <>
      <TabPricingRules
        pricingRules={pricingRules}
        onAddPricingRule={handleAdd}
        onEditPricingRule={handleEdit}
        onDeletePricingRule={handleDelete}
      />
      <PricingRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRules}
        editingRule={editingRule}
      />
    </>
  );
};
