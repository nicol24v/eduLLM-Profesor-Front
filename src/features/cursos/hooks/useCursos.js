import { useQuery } from '@tanstack/react-query';
import materiaService from '../../../services/materiaService';

export function useCursos() {
  return useQuery({
    queryKey: ['materias'],
    queryFn: materiaService.getAll,
  });
}

export function useCurso(id) {
  return useQuery({
    queryKey: ['materia', id],
    queryFn: () => materiaService.getById(id),
    enabled: !!id,
  });
}
