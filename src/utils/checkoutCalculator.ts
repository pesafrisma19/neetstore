export type DiscountType = 'FLAT' | 'PERCENT';

export interface CheckoutBreakdownParams {
  basePrice: number;
  appliedDiscount?: number;
  appliedDiscountType?: DiscountType | string;
  pointsUsed?: number;
  feeFlat?: number;
  feePercent?: number;
  feeMinimumAmount?: number | null;
}

export interface CheckoutBreakdownResult {
  basePrice: number;
  discountAmount: number;
  pointsUsed: number;
  discountedPrice: number;
  adminFee: number;
  grandTotal: number;
}

export interface MaxRedeemablePointsParams {
  userPoints: number;
  basePrice: number;
  appliedDiscount?: number;
  appliedDiscountType?: DiscountType | string;
  feeFlat?: number;
  feePercent?: number;
  feeMinimumAmount?: number | null;
  minAmount?: number | null;
}

/**
 * Helper terpusat untuk kalkulasi komponen harga checkout Rupiah.
 * Bebas dari floating-point precision error (misal 15250.700000000003).
 * Setiap komponen dibulatkan (Math.round) pada saat dihitung.
 */
export function calculateCheckoutBreakdown(params: CheckoutBreakdownParams): CheckoutBreakdownResult {
  const basePrice = Math.round(params.basePrice || 0);

  // 1. Hitung Potongan Diskon Voucher dari Base Price
  let discountAmount = 0;
  if (params.appliedDiscount && params.appliedDiscount > 0) {
    if (params.appliedDiscountType === 'PERCENT') {
      discountAmount = Math.round((basePrice * params.appliedDiscount) / 100);
    } else {
      discountAmount = Math.round(params.appliedDiscount);
    }
  }

  // 2. Potongan Poin Reward (1 Poin = Rp1)
  const pointsUsed = Math.max(0, Math.round(params.pointsUsed || 0));

  // 3. Harga Produk Setelah Diskon Voucher & Poin (Minimal 0)
  const discountedPrice = Math.max(0, basePrice - discountAmount - pointsUsed);

  // 4. Biaya Layanan Pembayaran (Dihitung dari discountedPrice & dibulatkan)
  // Threshold: Jika feeMinimumAmount != null dan discountedPrice < feeMinimumAmount -> adminFee = 0
  let adminFee = 0;
  const isFeeApplicable = params.feeMinimumAmount === undefined || params.feeMinimumAmount === null || discountedPrice >= params.feeMinimumAmount;
  if (isFeeApplicable) {
    adminFee = Math.round((params.feeFlat || 0) + (discountedPrice * (params.feePercent || 0)) / 100);
  }

  // 5. Grand Total Pembayaran
  const grandTotal = discountedPrice + adminFee;

  return {
    basePrice,
    discountAmount,
    pointsUsed,
    discountedPrice,
    adminFee,
    grandTotal: grandTotal > 0 ? grandTotal : 0,
  };
}

/**
 * Menghitung estimasi perolehan poin reward dari nominal harga produk.
 * Aturan Bisnis: Setiap kelipatan Rp1.000 = 1 poin (floor).
 */
export function calculateRewardPoints(amount?: number | null): number {
  if (typeof amount !== 'number' || isNaN(amount) || amount < 1000) {
    return 0;
  }
  return Math.floor(amount / 1000);
}

/**
 * Menghitung estimasi jumlah poin maksimum yang bisa digunakan secara otomatis (Auto-Max Redeem).
 * Menggunakan Binary Search deterministic dengan validator calculateCheckoutBreakdown asli
 * sehingga memperhitungkan feeFlat, feePercent, dan feeMinimumAmount secara presisi.
 */
export function calculateMaxRedeemablePoints(params: MaxRedeemablePointsParams): number {
  const userPoints = Math.max(0, Math.floor(params.userPoints || 0));
  if (userPoints <= 0) return 0;

  const basePrice = Math.round(params.basePrice || 0);
  if (basePrice <= 0) return 0;

  // Hitung voucher discount
  let voucherDiscount = 0;
  if (params.appliedDiscount && params.appliedDiscount > 0) {
    if (params.appliedDiscountType === 'PERCENT') {
      voucherDiscount = Math.round((basePrice * params.appliedDiscount) / 100);
    } else {
      voucherDiscount = Math.round(params.appliedDiscount);
    }
  }

  const netProductPrice = Math.max(0, basePrice - voucherDiscount);
  if (netProductPrice <= 0) return 0;

  const minimumPayable = (params.minAmount && params.minAmount > 0) ? params.minAmount : 1;

  let low = 0;
  let high = Math.min(userPoints, netProductPrice);
  let bestPoints = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidateBreakdown = calculateCheckoutBreakdown({
      basePrice,
      appliedDiscount: params.appliedDiscount || 0,
      appliedDiscountType: params.appliedDiscountType || 'FLAT',
      pointsUsed: mid,
      feeFlat: params.feeFlat || 0,
      feePercent: params.feePercent || 0,
      feeMinimumAmount: params.feeMinimumAmount,
    });

    if (candidateBreakdown.grandTotal >= minimumPayable) {
      bestPoints = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestPoints;
}
