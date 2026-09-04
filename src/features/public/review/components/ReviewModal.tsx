import React, { useState } from 'react';
import { Dialog } from '../../../../components/ui/Dialog';
import { Button } from '../../../../components/ui/Button';
import { Textarea } from '../../../../components/ui/Textarea';
import { Star, Sparkles, AlertCircle } from 'lucide-react';
import { submitUserReview, type ReviewSatisfactionType } from '../../../../utils/api';

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number | string;
  productName: string;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  productName,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [satisfaction, setSatisfaction] = useState<ReviewSatisfactionType>('SANGAT_PUAS');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const satisfactionOptions: Array<{ value: ReviewSatisfactionType; label: string; emoji: string }> = [
    { value: 'KURANG_PUAS', label: 'Kurang Puas', emoji: '🙁' },
    { value: 'PUAS', label: 'Puas', emoji: '😊' },
    { value: 'SANGAT_PUAS', label: 'Sangat Puas', emoji: '🤩' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Silakan pilih rating 1-5 bintang.');
      return;
    }
    if (!satisfaction) {
      setErrorMsg('Silakan pilih tingkat kepuasan Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await submitUserReview({
        transactionId,
        rating,
        satisfaction,
        comment: comment.trim() || null,
      });

      if (res?.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res?.message || 'Gagal mengirim ulasan.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengirim ulasan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="BAGAIMANA PESANANMU?">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left font-sans">
        
        {/* Product Item Target Subtitle */}
        <div className="p-3 bg-[var(--nb-yellow)] border-[2.5px] border-black rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
            <span className="font-black text-xs sm:text-sm uppercase text-black truncate">
              {productName || 'Item Pesanan'}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 rounded">
            SUKSES
          </span>
        </div>

        {/* 1. Rating Bintang Interaktif (1-5) */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase text-[var(--nb-text)]">
            1. BERIKAN RATING BINTANG
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const activeScore = hoverRating !== null ? hoverRating : rating;
              const isFilled = starVal <= activeScore;

              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(null)}
                  className={`p-2 border-[2.5px] border-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] ${
                    isFilled ? 'bg-[var(--nb-yellow)]' : 'bg-white hover:bg-yellow-50'
                  }`}
                  aria-label={`Beri ${starVal} bintang`}
                >
                  <Star
                    className={`w-6 h-6 stroke-[2.5] ${
                      isFilled ? 'fill-black text-black' : 'text-neutral-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Pilihan Kepuasan (Satisfaction) */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase text-[var(--nb-text)]">
            2. TINGKAT KEPUASAN
          </label>
          <div className="grid grid-cols-3 gap-2">
            {satisfactionOptions.map((opt) => {
              const isSelected = satisfaction === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSatisfaction(opt.value)}
                  className={`p-2.5 border-[2.5px] border-black font-black text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                    isSelected
                      ? 'bg-[var(--nb-mint)] text-black ring-2 ring-black font-black'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Komentar Opsional */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase text-[var(--nb-text)]">
            3. KOMENTAR <span className="text-[10px] text-[var(--nb-text-muted)] lowercase font-bold">(opsional)</span>
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ceritakan pengalamanmu... (contoh: Proses sangat cepat dan terpercaya!)"
            maxLength={500}
            rows={3}
            className="w-full text-xs font-bold border-[2.5px] border-black bg-white focus:outline-none"
          />
          <div className="text-right text-[10px] font-mono font-bold text-[var(--nb-text-muted)]">
            {comment.length} / 500
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-100 border-[2px] border-rose-500 rounded text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t-[2px] border-dashed border-neutral-300">
          <Button
            type="button"
            variant="white"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
            className="font-black text-xs uppercase"
          >
            NANTI SAJA
          </Button>
          <Button
            type="submit"
            variant="yellow"
            size="md"
            disabled={isSubmitting}
            className="font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000]"
          >
            {isSubmitting ? 'MENGIRIM...' : 'KIRIM ULASAN'}
          </Button>
        </div>

      </form>
    </Dialog>
  );
};
