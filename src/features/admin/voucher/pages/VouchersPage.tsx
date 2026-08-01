import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit } from 'lucide-react';
import type { VoucherData } from '../../types';

interface TabVouchersProps {
  vouchers: VoucherData[];
  onAddVoucher: () => void;
  onEditVoucher: (voucher: VoucherData) => void;
}

export const TabVouchers: React.FC<TabVouchersProps> = ({
  vouchers,
  onAddVoucher,
  onEditVoucher,
}) => {
  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="#00F0FF" className="flex items-center justify-between">
        <CardTitle className="text-base text-[var(--nb-text)]">MANAJEMEN KODE VOUCHER & PROMO DISKON</CardTitle>
        <Button variant="yellow" size="sm" onClick={onAddVoucher}>
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>TAMBAH VOUCHER</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>KODE</TableHead>
              <TableHead>TIPE DISKON</TableHead>
              <TableHead>NILAI DISKON</TableHead>
              <TableHead>PENGGUNAAN</TableHead>
              <TableHead className="text-right">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-black text-[var(--nb-text)]">{v.code}</TableCell>
                <TableCell className="font-bold text-[var(--nb-text-muted)]">{v.discountType}</TableCell>
                <TableCell className="font-black text-[var(--nb-text)]">
                  {v.discountType === 'FLAT' ? `Rp ${v.discountValue.toLocaleString('id-ID')}` : `${v.discountValue}%`}
                </TableCell>
                <TableCell className="font-bold text-[var(--nb-text-muted)]">{v.usedCount} / {v.maxUsage} terpakai</TableCell>
                <TableCell className="text-right">
                  <Button variant="yellow" size="sm" onClick={() => onEditVoucher(v)}>
                    <Edit className="w-3.5 h-3.5 stroke-[3]" />
                    <span>EDIT</span>
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

export const VouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const data = await apiFetch<VoucherData[]>('/admin/vouchers')
          .catch(() => apiFetch<VoucherData[]>('/vouchers'))
          .catch(() => null);
        setVouchers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed fetching vouchers:', e);
        setVouchers([]);
      }
    };
    fetchVouchers();
  }, []);

  return (
    <TabVouchers
      vouchers={vouchers}
      onAddVoucher={() => {}}
      onEditVoucher={() => {}}
    />
  );
};
