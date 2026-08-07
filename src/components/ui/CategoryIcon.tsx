import React from 'react';
import {
  Gamepad2,
  Gem,
  Gift,
  Crown,
  Zap,
  Coins,
  Ticket,
  ShoppingBag,
  Smartphone,
  Flame,
  Tv,
  Wifi,
  CreditCard,
  Tag,
  Sparkles,
  Package,
  Shield,
  Heart,
  Star,
  Radio,
  Layers,
  Globe,
  HelpCircle,
  type LucideProps
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, React.FC<LucideProps>> = {
  Gamepad2,
  Gem,
  Gift,
  Crown,
  Zap,
  Coins,
  Ticket,
  ShoppingBag,
  Smartphone,
  Flame,
  Tv,
  Wifi,
  CreditCard,
  Tag,
  Sparkles,
  Package,
  Shield,
  Heart,
  Star,
  Radio,
  Layers,
  Globe,
};

export const DEFAULT_CATEGORY_ICON_NAME = 'Gamepad2';

export interface CategoryIconProps {
  iconName?: string | null;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  className = 'w-5 h-5',
  size,
}) => {
  const IconComponent =
    (iconName && CATEGORY_ICONS[iconName]) ||
    CATEGORY_ICONS[DEFAULT_CATEGORY_ICON_NAME] ||
    HelpCircle;

  return <IconComponent className={className} size={size} />;
};
