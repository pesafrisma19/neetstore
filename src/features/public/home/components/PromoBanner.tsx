import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { BannerSlider } from './BannerSlider';

interface PromoBannerProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = () => {
  // Undi warna neon acak untuk kurungan Card luar (termasuk mode gelap)
  const cardTone = React.useMemo(() => {
    const tones = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    return tones[Math.floor(Math.random() * tones.length)];
  }, []);

  return (
    <div className="w-full my-4 sm:my-6">
      <Card
        variant={cardTone}
        shadow="xl"
        borderWidth="4"
        className="p-3 sm:p-5 md:p-6 relative overflow-hidden bg-brutalist-grid"
      >
        <BannerSlider />
      </Card>
    </div>
  );
};

