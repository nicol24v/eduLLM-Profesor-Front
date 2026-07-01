import { useQuery } from '@tanstack/react-query';
import dashboardService from '../../../services/dashboardService';

export function useAnalitica() {
  return useQuery({
    queryKey: ['dashboard-analitica'],
    queryFn: dashboardService.getAnalitica,
    staleTime: 5 * 60 * 1000,
  });
}
