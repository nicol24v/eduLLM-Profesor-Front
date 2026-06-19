import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cuestionarioService from '../../../services/cuestionarioService';

export function useCuestionarios(params = {}) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['cuestionarios', params],
    queryFn: () => cuestionarioService.getAll(params),
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => cuestionarioService.update(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['cuestionarios'] });
      qc.invalidateQueries({ queryKey: ['cuestionario', variables.id] });
    },
  });

  const remove = useMutation({
    mutationFn: (id) => cuestionarioService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cuestionarios'] }),
  });

  return { list, update, remove };
}

export function useCuestionario(id) {
  return useQuery({
    queryKey: ['cuestionario', id],
    queryFn: () => cuestionarioService.getById(id),
    enabled: !!id,
  });
}
