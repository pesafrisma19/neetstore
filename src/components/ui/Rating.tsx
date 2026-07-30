import React from 'react';
import { Star } from 'lucide-react';

export interface RatingProps {
  score: number; // 0 to 5
  maxStars?: number;
  showScore?: boolean;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  score,
  maxStars = 5,
  showScore = true,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const filled = idx < Math.floor(score);
          return (
            <div
              key={idx}
              className={`p-1 border-[2px] border-[var(--nb-border)] shadow-[1.5px_1.5px_0px_0px_#000] ${
                filled ? 'bg-[var(--nb-yellow)]' : 'bg-[var(--nb-surface)]'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 stroke-[3] ${
                  filled ? 'fill-black text-[var(--nb-text)]' : 'text-[var(--nb-text)]/30'
                }`}
              />
            </div>
          );
        })}
      </div>
      {showScore && (
        <span className="text-xs font-black px-2 py-0.5 border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface)] shadow-[1.5px_1.5px_0px_0px_#000]">
          {score.toFixed(1)}
        </span>
      )}
    </div>
  );
};
