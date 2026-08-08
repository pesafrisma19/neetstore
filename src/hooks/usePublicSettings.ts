import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import { getPublicSettings } from '../utils/api';

export interface PublicSettings {
  site_name?: string;
  site_tagline?: string;
  logo_url?: string;
  favicon_url?: string;
  wa_number?: string;
  support_email?: string;
  default_meta_title?: string;
  meta_description?: string;
  og_image_url?: string;
  maintenance_mode?: boolean;
  maintenance_message?: string;
  min_deposit_amount?: number;
  max_deposit_amount?: number;
  upgrade_reseller_price?: number;
  upgrade_vip_price?: number;
  level_upgrade_enabled?: boolean;
  [key: string]: any;
}

export const usePublicSettings = () => {
  const { data, isLoading, isError, refetch } = useQuery<PublicSettings>({
    queryKey: queryKeys.public.settings,
    queryFn: () => getPublicSettings(),
    staleTime: 5 * 60 * 1000, // 5 menit cache stale time
  });

  return {
    settings: data || {},
    isLoading,
    isError,
    refetch,
  };
};
