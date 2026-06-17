import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import partidaService from '../../../services/partidaService';
import useAuthStore from '../../../stores/authStore';

export function usePartidas(params = {}) {
  return useQuery({
    queryKey: ['partidas', params],
    queryFn: () => partidaService.getHistory(params),
  });
}

export function usePartida(id) {
  return useQuery({
    queryKey: ['partida', id],
    queryFn: () => partidaService.getById(id),
    enabled: !!id,
  });
}

export function usePartidaResultados(id) {
  return useQuery({
    queryKey: ['partida-resultados', id],
    queryFn: () => partidaService.getResultados(id),
    enabled: !!id,
  });
}

export function useCreatePartida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prueba_id) => {
      const profesor_id = useAuthStore.getState().user?.idUsuario;
      return partidaService.create({ profesor_id, prueba_id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partidas'] }),
  });
}

export function useIniciarPartida() {
  return useMutation({
    mutationFn: (id) => partidaService.iniciar(id),
  });
}

export function useSiguientePregunta() {
  return useMutation({
    mutationFn: (id) => partidaService.siguientePregunta(id),
  });
}

export function useFinalizarPartida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => partidaService.finalizar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partidas'] }),
  });
}
