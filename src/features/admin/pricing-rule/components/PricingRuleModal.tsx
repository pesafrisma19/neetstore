import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '../../../../components/ui/Dialog';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Save, Info } from 'lucide-react';
import { apiFetch, createAdminPricingRule, updateAdminPricingRule } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import type { PricingRuleData } from '../../types';
import { useToast } from '../../../../components/ui/ToastContext';

interface PricingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRule?: PricingRuleData | null;
}

export const PricingRuleModal: React.FC<PricingRuleModalProps> = ({
  isOpen,
  onClose,
  editingRule,
}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [targetType, setTargetType] = useState<'GLOBAL' | 'PROVIDER' | 'CATEGORY' | 'BRAND' | 'PRODUCT'>('GLOBAL');
  const [targetId, setTargetId] = useState<number | ''>('');

  const [guestPercent, setGuestPercent] = useState<number>(0);
  const [guestFlat, setGuestFlat] = useState<number>(0);

  const [memberPercent, setMemberPercent] = useState<number>(0);
  const [memberFlat, setMemberFlat] = useState<number>(0);

  const [resellerPercent, setResellerPercent] = useState<number>(0);
  const [resellerFlat, setResellerFlat] = useState<number>(0);

  const [vipPercent, setVipPercent] = useState<number>(0);
  const [vipFlat, setVipFlat] = useState<number>(0);

  const [targetOptions, setTargetOptions] = useState<{ id: number; name: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load target options based on targetType
  useEffect(() => {
    const loadTargetOptions = async () => {
      if (targetType === 'GLOBAL') {
        setTargetOptions([]);
        setTargetId('');
        return;
      }

      try {
        let endpoint = '';
        if (targetType === 'CATEGORY') endpoint = '/admin/categories';
        else if (targetType === 'BRAND') endpoint = '/admin/brands';
        else if (targetType === 'PROVIDER') endpoint = '/admin/providers';
        else if (targetType === 'PRODUCT') endpoint = '/admin/products?limit=200';

        const res = await apiFetch<any>(endpoint);
        let items: { id: number; name: string }[] = [];

        if (Array.isArray(res)) {
          items = res.map((x: any) => ({ id: x.id, name: x.name }));
        } else if (res && Array.isArray(res.data)) {
          items = res.data.map((x: any) => ({ id: x.id, name: x.name }));
        }
        setTargetOptions(items);

        if (items.length > 0 && !editingRule) {
          setTargetId(items[0].id);
        }
      } catch (err) {
        console.error('Error fetching target options:', err);
      }
    };

    if (isOpen) {
      loadTargetOptions();
    }
  }, [targetType, isOpen]);

  // Populate form fields when editing rule changes
  useEffect(() => {
    if (editingRule) {
      setTargetType(editingRule.targetType || 'GLOBAL');
      setTargetId(editingRule.targetId || '');
      setGuestPercent(editingRule.guestPercent || 0);
      setGuestFlat(editingRule.guestFlat || 0);
      setMemberPercent(editingRule.memberPercent || 0);
      setMemberFlat(editingRule.memberFlat || 0);
      setResellerPercent(editingRule.resellerPercent || 0);
      setResellerFlat(editingRule.resellerFlat || 0);
      setVipPercent(editingRule.vipPercent || 0);
      setVipFlat(editingRule.vipFlat || 0);
    } else {
      setTargetType('GLOBAL');
      setTargetId('');
      setGuestPercent(5);
      setGuestFlat(500);
      setMemberPercent(3);
      setMemberFlat(300);
      setResellerPercent(2);
      setResellerFlat(200);
      setVipPercent(1);
      setVipFlat(100);
    }
    setErrorMsg(null);
  }, [editingRule, isOpen]);

  // TanStack Mutation for Create / Update
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        targetType,
        targetId: targetType === 'GLOBAL' ? null : Number(targetId),
        guestPercent: Number(guestPercent),
        guestFlat: Number(guestFlat),
        memberPercent: Number(memberPercent),
        memberFlat: Number(memberFlat),
        resellerPercent: Number(resellerPercent),
        resellerFlat: Number(resellerFlat),
        vipPercent: Number(vipPercent),
        vipFlat: Number(vipFlat),
      };

      if (editingRule?.id) {
        return updateAdminPricingRule(editingRule.id, payload);
      }
      return createAdminPricingRule(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pricingRules.all });
      addToast({
        title: 'SUKSES',
        message: editingRule ? 'Aturan margin berhasil diperbarui!' : 'Aturan margin baru berhasil dibuat!',
        type: 'success',
      });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Gagal menyimpan Aturan Margin');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    saveMutation.mutate();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={editingRule ? 'EDIT ATURAN MARGIN HARGA' : 'TAMBAH ATURAN MARGIN HARGA'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {errorMsg && (
          <div className="p-3 bg-red-100 border-[3px] border-red-600 text-red-900 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--nb-shadow)]">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Target Type & Target Id */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
              Target Aturan Margin *
            </label>
            <Select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as any)}
              disabled={Boolean(editingRule)}
              options={[
                { value: 'GLOBAL', label: '🌐 GLOBAL (SEMUA PRODUK)' },
                { value: 'PROVIDER', label: '📡 PER PROVIDER (Digiflazz, dll)' },
                { value: 'CATEGORY', label: '📁 PER KATEGORI (Games, Pulsa, dll)' },
                { value: 'BRAND', label: '🎮 PER BRAND (Mobile Legends, dll)' },
                { value: 'PRODUCT', label: '💎 PER PRODUK / SKU SPESIFIK' },
              ]}
            />
          </div>

          {targetType !== 'GLOBAL' && (
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
                Pilih Item Target *
              </label>
              <Select
                value={String(targetId)}
                onChange={(e) => setTargetId(Number(e.target.value))}
                disabled={Boolean(editingRule)}
                required
                options={targetOptions.map((opt) => ({
                  value: String(opt.id),
                  label: `${opt.name} (ID: ${opt.id})`,
                }))}
              />
            </div>
          )}
        </div>

        <div className="p-3 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow-cyan)] flex items-start gap-2.5">
          <Info className="w-5 h-5 text-[var(--nb-cyan)] shrink-0 mt-0.5 stroke-[3]" />
          <p className="text-xs font-bold text-[var(--nb-text)]">
            <strong>RUMUS MARGIN:</strong> Harga Jual = Math.round(Harga Modal + Flat Rp + (Harga Modal × Percent %))
          </p>
        </div>

        {/* Dual Margin Inputs for 4 User Roles */}
        <div className="border-[3px] border-[var(--nb-border)] p-4 bg-[var(--nb-surface-alt)] shadow-[4px_4px_0px_0px_var(--nb-shadow)] space-y-4">
          <h4 className="font-black text-xs uppercase tracking-wider text-[var(--nb-text)] border-b-[2px] border-[var(--nb-border)] pb-2">
            RINCIAN MARGIN KEUNTUNGAN (DUAL MARGIN 4 LEVEL)
          </h4>

          {/* Guest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <span className="font-black text-xs uppercase text-[var(--nb-pink)]">
              🌐 ROLE GUEST (PUBLIK)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Percent %"
                value={guestPercent}
                onChange={(e) => setGuestPercent(Number(e.target.value))}
                step="0.1"
              />
              <Input
                type="number"
                placeholder="Flat Rp"
                value={guestFlat}
                onChange={(e) => setGuestFlat(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <span className="font-black text-xs uppercase text-[var(--nb-cyan)]">
              👤 ROLE MEMBER
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Percent %"
                value={memberPercent}
                onChange={(e) => setMemberPercent(Number(e.target.value))}
                step="0.1"
              />
              <Input
                type="number"
                placeholder="Flat Rp"
                value={memberFlat}
                onChange={(e) => setMemberFlat(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Reseller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <span className="font-black text-xs uppercase text-[var(--nb-purple)]">
              💼 ROLE RESELLER
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Percent %"
                value={resellerPercent}
                onChange={(e) => setResellerPercent(Number(e.target.value))}
                step="0.1"
              />
              <Input
                type="number"
                placeholder="Flat Rp"
                value={resellerFlat}
                onChange={(e) => setResellerFlat(Number(e.target.value))}
              />
            </div>
          </div>

          {/* VIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <span className="font-black text-xs uppercase text-[var(--nb-mint)]">
              👑 ROLE VIP
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Percent %"
                value={vipPercent}
                onChange={(e) => setVipPercent(Number(e.target.value))}
                step="0.1"
              />
              <Input
                type="number"
                placeholder="Flat Rp"
                value={vipFlat}
                onChange={(e) => setVipFlat(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t-[3px] border-[var(--nb-border)]">
          <Button type="button" variant="pink" onClick={onClose} disabled={saveMutation.isPending}>
            BATAL
          </Button>
          <Button
            type="submit"
            variant="yellow"
            isLoading={saveMutation.isPending}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2 stroke-[3]" />
            <span>{saveMutation.isPending ? 'MENYIMPAN...' : 'SIMPAN MARGIN'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
