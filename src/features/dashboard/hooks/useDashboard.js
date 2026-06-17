import { useQuery } from '@tanstack/react-query';
import dashboardService from '../../../services/dashboardService';

export function useDashboard() {
  const stats = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const graficas = useQuery({
    queryKey: ['dashboard-graficas'],
    queryFn: dashboardService.getGraficas,
  });

  return { stats, graficas };
}
