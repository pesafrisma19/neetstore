import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { PricingRuleData } from '../../types';

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
  const formatMarginLabel = (percent: number, flat: number) => {
    if (percent > 0 && flat > 0) return `${percent}% + Rp ${flat.toLocaleString('id-ID')}`;
    if (percent > 0) return `${percent}%`;
    if (flat > 0) return `Rp ${flat.toLocaleString('id-ID')}`;
    return '0 (Asli)';
  };

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="#00F0FF" className="flex items-center justify-between">
        <CardTitle className="text-base text-[var(--nb-text)]">LEVEL 3: ATURAN MARGIN HARGA GLOBAL / KHUSUS</CardTitle>
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
            {pricingRules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <Badge 
                    variant={
                      rule.targetType === 'GLOBAL' ? 'yellow' : 
                      rule.targetType === 'CATEGORY' ? 'purple' : 'mint'
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
                    <span>EDIT MARGIN</span>
                  </Button>
                  <Button variant="pink" size="sm" onClick={() => onDeletePricingRule(rule.id)}>
                    <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const PricingRulesPage: React.FC = () => {
  const [pricingRules, setPricingRules] = useState<PricingRuleData[]>([]);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await apiFetch<PricingRuleData[]>('/admin/pricing-rules');
        setPricingRules(data || []);
      } catch (e) {
        console.error('Failed fetching pricing rules:', e);
      }
    };
    fetchRules();
  }, []);

  return (
    <TabPricingRules
      pricingRules={pricingRules}
      onAddPricingRule={() => {}}
      onEditPricingRule={() => {}}
      onDeletePricingRule={() => {}}
    />
  );
};
