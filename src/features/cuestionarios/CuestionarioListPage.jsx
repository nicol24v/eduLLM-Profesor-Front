import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, Button, IconButton,
  Skeleton, Tooltip, Radio, RadioGroup, FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete, PlayArrow } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useCuestionarios } from './hooks/useCuestionarios';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useCreatePartida } from '../partidas/hooks/usePartidas';
import useGameStore from '../../stores/gameStore';

function CuestionarioListPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { list, remove } = useCuestionarios();
  const createPartida = useCreatePartida();
  const initGame = useGameStore((s) => s.initGame);

  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [starting, setStarting] = useState(false);

  const cuestionarios = list.data?.data || [];
  const total = list.data?.meta?.total ?? cuestionarios.length;

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(deleteTarget.id_prueba);
      enqueueSnackbar('Cuestionario eliminado', { variant: 'success' });
      if (selectedId === deleteTarget.id_prueba) setSelectedId(null);
    } catch {
      enqueueSnackbar('Error al eliminar el cuestionario', { variant: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStartQuiz = async () => {
    if (!selectedId) {
      enqueueSnackbar('Selecciona un cuestionario primero', { variant: 'warning' });
      return;
    }
    const selectedCuestionario = cuestionarios.find((q) => q.id_prueba === selectedId);
    setStarting(true);
    try {
      const response = await createPartida.mutateAsync(selectedId);
      const { id_partida, codigo_acceso } = response.data;
      initGame({
        partidaId: id_partida,
        codigoAcceso: codigo_acceso,
        titulo: selectedCuestionario?.titulo || '',
        totalPreguntas: selectedCuestionario?._count?.tbl_t_pregunta
          ?? selectedCuestionario?.tbl_t_pregunta?.length
          ?? 0,
      });
      navigate(`/sala-espera/${codigo_acceso}`);
    } catch (err) {
      enqueueSnackbar(err.message || 'Error al crear la partida', { variant: 'error' });
    } finally {
      setStarting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis cuestionarios</h1>
          <p className="text-slate-500 text-sm mt-1">{total} cuestionario{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}</p>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/cuestionarios/nuevo')}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          Nuevo cuestionario
        </Button>
      </div>

      {/* Error */}
      {list.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          Error al cargar los cuestionarios.
        </div>
      )}

      {/* List */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {list.isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} height={64} sx={{ borderRadius: 2 }} />)}
            </div>
          ) : cuestionarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">No tienes cuestionarios aún.</p>
              <button
                onClick={() => navigate('/cuestionarios/nuevo')}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Crear el primero
              </button>
            </div>
          ) : (
            <RadioGroup value={selectedId?.toString() || ''} onChange={(e) => setSelectedId(Number(e.target.value))}>
              <div className="divide-y divide-slate-100">
                {cuestionarios.map((q) => {
                  const nPreguntas = q.tbl_t_pregunta?.length ?? q._count?.tbl_t_pregunta ?? 0;
                  const isSelected = selectedId === q.id_prueba;
                  return (
                    <div
                      key={q.id_prueba}
                      className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <FormControlLabel
                        value={q.id_prueba.toString()}
                        control={<Radio size="small" />}
                        label=""
                        sx={{ m: 0 }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{q.titulo}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {nPreguntas} pregunta{nPreguntas !== 1 ? 's' : ''}
                          {q.descripcion && ` · ${q.descripcion}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/cuestionarios/${q.id_prueba}/editar`)}
                            sx={{ color: '#64748b' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(q)}
                            sx={{ color: '#ef4444' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Start button */}
      <div className="flex justify-center">
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrow />}
          onClick={handleStartQuiz}
          disabled={!selectedId || starting}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            px: 6,
            py: 1.5,
            fontSize: '1rem',
            bgcolor: selectedId ? '#16a34a' : undefined,
            '&:hover': { bgcolor: selectedId ? '#15803d' : undefined },
          }}
        >
          {starting ? 'Creando sala...' : 'Iniciar cuestionario seleccionado'}
        </Button>
      </div>

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar cuestionario"
        message={`¿Eliminar "${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default CuestionarioListPage;
