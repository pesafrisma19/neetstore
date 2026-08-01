import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Label } from '../../../../components/ui/Label';
import { X, Save } from 'lucide-react';
import { apiFetch } from '../../../../utils/api';
import type { PricingRuleData } from '../../types';

interface PricingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingRule?: PricingRuleData | null;
}

export const PricingRuleModal: React.FC<PricingRuleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingRule,
}) => {
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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        console.error('Error fetching options:', err);
      }
    };

    if (isOpen) {
      loadTargetOptions();
    }
  }, [targetType, isOpen]);

  // Populate data when editing
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
    setErrorMessage('');
  }, [editingRule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
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
        await apiFetch(`/admin/pricing-rules/${editingRule.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/admin/pricing-rules', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed submit pricing rule:', err);
      setErrorMessage(err.message || 'Gagal menyimpan Aturan Margin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl w-full max-w-2xl text-left overflow-hidden">
        {/* Header */}
        <div className="bg-[#00F0FF] border-b-4 border-black p-4 flex items-center justify-between">
          <h3 className="font-black text-lg text-black">
            {editingRule ? 'EDIT ATURAN MARGIN HARGA' : 'TAMBAH ATURAN MARGIN HARGA'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-lg transition">
            <X className="w-6 h-6 stroke-[3] text-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold rounded-lg text-sm">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Target Type & Target Id */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-black mb-1 block">TARGET ATURAN MARGIN</Label>
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
              <div>
                <Label className="font-black mb-1 block">PILIH ITEM TARGET</Label>
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

          <div className="p-3 bg-blue-50 border-2 border-blue-400 rounded-lg text-xs font-bold text-blue-900">
            💡 <strong>Rumus Perhitungan:</strong> Harga Jual = (Harga Modal + Flat Rp) + (Harga Modal × Percent %)
          </div>

          {/* Dual Margin Inputs for 4 User Roles */}
          <div className="border-2 border-black rounded-xl p-4 bg-gray-50 space-y-4">
            <h4 className="font-black text-sm text-black border-b-2 border-black pb-2">RINCIAN MARGIN KEUNTUNGAN (DUAL MARGIN)</h4>

            {/* Guest / Publik */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <Label className="font-black text-xs text-pink-600">🌐 ROLE GUEST (GUEST)</Label>
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
            <div className="grid grid-cols-2 gap-3 items-center">
              <Label className="font-black text-xs text-blue-700">👤 ROLE MEMBER</Label>
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
            <div className="grid grid-cols-2 gap-3 items-center">
              <Label className="font-black text-xs text-purple-700">💼 ROLE RESELLER</Label>
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
            <div className="grid grid-cols-2 gap-3 items-center">
              <Label className="font-black text-xs text-emerald-700">👑 ROLE VIP</Label>
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
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="pink" onClick={onClose} disabled={loading}>
              BATAL
            </Button>
            <Button type="submit" variant="yellow" disabled={loading}>
              <Save className="w-4 h-4 stroke-[3]" />
              <span>{loading ? 'MENYIMPAN...' : 'SIMPAN MARGIN'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
