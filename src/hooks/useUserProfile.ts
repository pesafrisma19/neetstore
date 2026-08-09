import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import { queryKeys } from '../services/queryKeys';
import type { UserProfile } from '../contexts/AuthContext';

export function useUserProfile(isAuthenticated: boolean, isAuthLoading: boolean) {
  const query = useQuery<UserProfile | null>({
    queryKey: queryKeys.user.profile,
    queryFn: async (): Promise<UserProfile | null> => {
      const res = await apiFetch<UserProfile>('/user/me');
      return res || null;
    },
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 30 * 1000,
  });

  return {
    user: query.data || null,
    isLoading: isAuthLoading || (isAuthenticated && query.isLoading),
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
