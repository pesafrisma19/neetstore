export type DiscountType = 'FLAT' | 'PERCENT';

export interface CheckoutBreakdownParams {
  basePrice: number;
  appliedDiscount: number;
  appliedDiscountType: DiscountType | string;
  feeFlat: number;
  feePercent: number;
  feeMinimumAmount?: number | null;
}

export interface CheckoutBreakdownResult {
  basePrice: number;
  discountAmount: number;
  discountedPrice: number;
  adminFee: number;
  grandTotal: number;
}

/**
 * Helper terpusat untuk kalkulasi komponen harga checkout Rupiah.
 * Bebas dari floating-point precision error (misal 15250.700000000003).
 * Setiap komponen dibulatkan (Math.round) pada saat dihitung.
 */
export function calculateCheckoutBreakdown(params: CheckoutBreakdownParams): CheckoutBreakdownResult {
  const basePrice = Math.round(params.basePrice || 0);

  // 1. Hitung Potongan Diskon dari Base Price
  let discountAmount = 0;
  if (params.appliedDiscount > 0) {
    if (params.appliedDiscountType === 'PERCENT') {
      discountAmount = Math.round((basePrice * params.appliedDiscount) / 100);
    } else {
      discountAmount = Math.round(params.appliedDiscount);
    }
  }

  // 2. Harga Setelah Diskon (Minimal 0)
  const discountedPrice = Math.max(0, basePrice - discountAmount);

  // 3. Biaya Layanan Pembayaran (Dihitung dari discountedPrice & dibulatkan)
  // Threshold: Jika feeMinimumAmount != null dan discountedPrice < feeMinimumAmount -> adminFee = 0
  let adminFee = 0;
  const isFeeApplicable = params.feeMinimumAmount === undefined || params.feeMinimumAmount === null || discountedPrice >= params.feeMinimumAmount;
  if (isFeeApplicable) {
    adminFee = Math.round((params.feeFlat || 0) + (discountedPrice * (params.feePercent || 0)) / 100);
  }

  // 4. Grand Total Pembayaran
  const grandTotal = discountedPrice + adminFee;

  return {
    basePrice,
    discountAmount,
    discountedPrice,
    adminFee,
    grandTotal: grandTotal > 0 ? grandTotal : 0,
  };
}

/**
 * Menghitung estimasi perolehan poin reward dari nominal harga produk.
 * Aturan Bisnis: Setiap kelipatan Rp1.000 = 1 poin (floor).
 *
 * Contoh:
 * - 999     -> 0
 * - 1000    -> 1
 * - 1999    -> 1
 * - 2000    -> 2
 * - 30344   -> 30
 * - 31276   -> 31
 * - 62392   -> 62
 * - 93425   -> 93
 * - 1495597 -> 1495
 */
export function calculateRewardPoints(amount?: number | null): number {
  if (typeof amount !== 'number' || isNaN(amount) || amount < 1000) {
    return 0;
  }
  return Math.floor(amount / 1000);
}
