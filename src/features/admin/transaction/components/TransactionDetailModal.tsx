import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { X, RefreshCw, AlertTriangle, ShieldCheck, User, ShoppingBag } from 'lucide-react';
import { getAdminTransactionById } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { TransactionStatusBadge } from './TransactionStatusBadge';

interface TransactionDetailModalProps {
  transactionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transactionId,
  isOpen,
  onClose,
}) => {
  const {
    data: detail,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.admin.transactions.detail(transactionId || 0),
    queryFn: () => getAdminTransactionById(transactionId!),
    enabled: isOpen && transactionId !== null && transactionId > 0,
  });

  if (!isOpen || !transactionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <Card variant="white" className="w-full max-w-3xl border-[4px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[var(--nb-yellow)] p-4 border-b-[3px] border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm" className="font-mono font-black border-2">
              #{detail?.invoiceId || `TRX-${transactionId}`}
            </Badge>
            <h3 className="text-lg font-black uppercase text-black">
              DETAIL TRANSAKSI & LOG AUDIT
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-black hover:bg-black/10 rounded transition-colors font-black"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-left">
          {isLoading ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-10 h-10 stroke-[2] mx-auto mb-3 animate-spin text-neutral-400" />
              <p className="text-sm font-black uppercase">MEMUAT DETAIL TRANSAKSI...</p>
            </div>
          ) : isError ? (
            <div className="py-8 text-center">
              <AlertTriangle className="w-10 h-10 stroke-[2] mx-auto mb-2 text-red-500" />
              <p className="text-sm font-black uppercase text-red-600">GAGAL MEMUAT DETAIL</p>
              <p className="text-xs font-bold text-neutral-600 mt-1">{(error as any)?.message || 'Transaksi tidak ditemukan.'}</p>
            </div>
          ) : detail ? (
            <>
              {/* 1. INFORMASI UTAMA TRANSAKSI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kartu Informasi Pesanan */}
                <div className="bg-neutral-50 p-4 border-[2.5px] border-black space-y-2 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-neutral-500 uppercase font-black mb-2">
                    <ShoppingBag className="w-4 h-4 text-black" />
                    <span>INFORMASI PRODUK & STATUS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Invoice ID:</span>
                    <span className="font-mono font-black text-black">{detail.invoiceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Produk:</span>
                    <span className="font-black text-black">{detail.product?.name || `Produk #${detail.productId}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SKU Provider:</span>
                    <span className="font-mono text-black">{detail.product?.sku || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-neutral-200">
                    <span className="text-neutral-500">Status Pembayaran:</span>
                    <TransactionStatusBadge type="payment" status={detail.paymentStatus} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Status Order:</span>
                    <TransactionStatusBadge type="order" status={detail.orderStatus} />
                  </div>
                  {detail.refundStatus && detail.refundStatus !== 'NONE' && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">Status Refund:</span>
                      <TransactionStatusBadge type="refund" status={detail.refundStatus} />
                    </div>
                  )}
                </div>

                {/* Kartu Informasi Pembeli & Target */}
                <div className="bg-neutral-50 p-4 border-[2.5px] border-black space-y-2 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-neutral-500 uppercase font-black mb-2">
                    <User className="w-4 h-4 text-black" />
                    <span>PELANGGAN & TARGET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Username:</span>
                    <span className="font-black text-black">{detail.user?.username || 'GUEST / GUEST USER'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email:</span>
                    <span className="font-mono text-neutral-700">{detail.user?.email || detail.email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Target Account / ID:</span>
                    <span className="font-mono font-black text-black">{detail.targetAccount} {detail.targetZone ? `(${detail.targetZone})` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Total Nominal:</span>
                    <span className="font-black text-green-700">Rp {(detail.amount || 0).toLocaleString('id-ID')}</span>
                  </div>
                  {(detail.refundStatus === 'PENDING' || detail.refundStatus === 'REFUNDED') && (
                    <>
                      <div className="flex justify-between text-neutral-500">
                        <span>Biaya Admin / Fee:</span>
                        <span className="font-mono">Rp {(detail.feeAmount || 0).toLocaleString('id-ID')} (Tidak direfund)</span>
                      </div>
                      <div className="flex justify-between text-purple-700 pt-1 border-t border-purple-200">
                        <span className="font-black">Nominal Refund:</span>
                        <span className="font-black font-mono text-sm">
                          Rp {Math.max(0, (detail.amount || 0) - (detail.feeAmount || 0)).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Metode Bayar:</span>
                    <span className="font-black uppercase text-black">{detail.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Box Khusus Panduan Refund Guest */}
              {detail.refundStatus === 'PENDING' && (!detail.user && !detail.userId) && (
                <div className="bg-amber-50 border-[2.5px] border-amber-500 p-4 shadow-[3px_3px_0px_0px_#f59e0b] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-black uppercase text-amber-950">
                    <span>⚠️ PANDUAN REFUND MANUAL GUEST</span>
                    <span className="text-sm font-black bg-amber-200 px-2 py-0.5 border border-amber-600 rounded">
                      Rp {Math.max(0, (detail.amount || 0) - (detail.feeAmount || 0)).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="font-bold text-amber-900 m-0">
                    Silakan transfer manual ke rekening/e-wallet Guest sebesar <strong className="underline">Rp {Math.max(0, (detail.amount || 0) - (detail.feeAmount || 0)).toLocaleString('id-ID')}</strong> (Formula: Total Rp {(detail.amount || 0).toLocaleString('id-ID')} - Fee Rp {(detail.feeAmount || 0).toLocaleString('id-ID')}).
                  </p>
                  <p className="text-[11px] font-semibold text-amber-800 m-0 italic">
                    *Biaya admin Rp {(detail.feeAmount || 0).toLocaleString('id-ID')} tidak termasuk refund. Setelah transfer berhasil, klik tombol "REFUND GUEST" untuk menyelesaikan status.
                  </p>
                </div>
              )}

              {/* 2. SN / VOUCHER & CATATAN PROVIDER */}
              <div className="bg-white p-4 border-[2.5px] border-black space-y-2 text-xs font-bold">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 uppercase font-black">SN / Kode Voucher:</span>
                  <span className="font-mono font-black text-black bg-yellow-100 px-2 py-0.5 border border-black">
                    {detail.sn || '-'}
                  </span>
                </div>
                {detail.providerMessage && (
                  <div className="pt-2 border-t border-neutral-200">
                    <span className="text-neutral-500 uppercase font-black block mb-1">Catatan Provider (Internal):</span>
                    <p className="font-mono text-[11px] text-neutral-700 bg-neutral-100 p-2 border border-neutral-300 rounded">
                      {detail.providerMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* 3. LOG AUDIT AKTIVITAS ADMIN (ACTIVITY LOG) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 font-black uppercase text-sm border-b-2 border-black pb-1">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <span>RIWAYAT LOG AUDIT (ACTIVITY LOGS)</span>
                </div>

                {(!detail.activityLogs || detail.activityLogs.length === 0) ? (
                  <div className="bg-neutral-50 border-[2px] border-neutral-300 p-4 text-center text-xs font-bold text-neutral-500">
                    Belum ada catatan aktivitas perubahan manual pada transaksi ini.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {detail.activityLogs.map((log: any) => (
                      <div key={log.id} className="bg-neutral-50 border-[2px] border-black p-3 text-xs font-bold space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="cyan" size="sm" className="font-mono text-[10px]">
                            {log.action}
                          </Badge>
                          <span className="text-[10px] font-mono text-neutral-500">
                            {new Date(log.createdAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-black">
                          Admin: <span className="font-black">{log.user?.username || `Admin #${log.userId || '-'}`}</span> ({log.ipAddress || 'IP N/A'})
                        </div>
                        {log.details && (
                          <div className="bg-white p-2 border border-neutral-300 font-mono text-[11px] text-neutral-700 mt-1">
                            {log.details.oldStatus && (
                              <div>Perubahan Status: <span className="font-black text-amber-700">{log.details.oldStatus}</span> &rarr; <span className="font-black text-green-700">{log.details.newStatus}</span></div>
                            )}
                            {log.details.reason && (
                              <div>Alasan: <span className="italic">{log.details.reason}</span></div>
                            )}
                            {log.details.sn && (
                              <div>SN Disimpan: <span className="font-black">{log.details.sn}</span></div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-100 p-4 border-t-[3px] border-black flex justify-end">
          <Button variant="white" size="sm" onClick={onClose} className="font-black uppercase">
            TUTUP
          </Button>
        </div>
      </Card>
    </div>
  );
};
