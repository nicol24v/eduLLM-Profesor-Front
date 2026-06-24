import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Skeleton, Chip, Button } from '@mui/material';
import { People, Quiz, School, PlayCircle, ArrowForward } from '@mui/icons-material';
import { useDashboard } from './hooks/useDashboard';
import useGameStore from '../../stores/gameStore';

const statCards = [
  { key: 'total_estudiantes',  label: 'Estudiantes',       icon: <People />,      color: '#2563eb', bg: '#eff6ff' },
  { key: 'total_cuestionarios', label: 'Cuestionarios',    icon: <Quiz />,        color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'total_materias',     label: 'Materias',          icon: <School />,      color: '#059669', bg: '#ecfdf5' },
];

function StatCard({ card, value, loading }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ p: 1, borderRadius: '8px', bgcolor: card.bg, color: card.color, display: 'flex' }}>
            {card.icon}
          </Box>
        </Box>
        {loading ? (
          <Skeleton width={60} height={40} />
        ) : (
          <Typography variant="h4" fontWeight={700} color="#1e293b">{value ?? '—'}</Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{card.label}</Typography>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const { stats } = useDashboard();
  const data = stats.data;
  const pendingPartidas = Array.isArray(data?.partidas_pendientes) ? data.partidas_pendientes : [];
  const initGame = useGameStore((s) => s.initGame);

  const handleIrSala = (p) => {
    initGame({
      partidaId: p.id_partida,
      codigoAcceso: p.codigo_acceso,
      titulo: p.titulo_prueba || '',
      totalPreguntas: 0,
    });
    navigate(`/sala-espera/${p.codigo_acceso}`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen de tu actividad docente</p>
      </div>

      {stats.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          Error al cargar estadísticas. Verifica la conexión con el servidor.
        </div>
      )}

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} lg={4} key={card.key}>
            <StatCard card={card} value={data?.[card.key]} loading={stats.isLoading} />
          </Grid>
        ))}
        <Grid item xs={12} sm={6} lg={4}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', minHeight: 148 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#fffbeb', color: '#d97706', display: 'flex' }}>
                  <PlayCircle />
                </Box>
                <Chip
                  label={`${pendingPartidas.length} activa${pendingPartidas.length !== 1 ? 's' : ''}`}
                  size="small"
                  color={pendingPartidas.length > 0 ? 'warning' : 'default'}
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                />
              </Box>
              <Typography variant="body2" fontWeight={600} color="#1e293b" sx={{ mb: 1 }}>
                Partidas activas
              </Typography>
              {stats.isLoading ? (
                <Skeleton height={20} />
              ) : pendingPartidas.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No hay partidas activas.</Typography>
              ) : (
                <div className="space-y-1.5">
                  {pendingPartidas.slice(0, 5).map((p) => (
                    <div key={p.id_partida} className="flex items-center justify-between py-1">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-xs font-medium text-slate-700 truncate">{p.titulo_prueba || '—'}</p>
                        <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-500">
                          {p.codigo_acceso}
                        </code>
                      </div>
                      <Button
                        size="small"
                        variant="text"
                        endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                        onClick={() => handleIrSala(p)}
                        sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 'auto', p: 0.5 }}
                      >
                        Ir
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Materias asignadas */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#1e293b' }}>
            Materias asignadas
          </Typography>

          {stats.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} height={56} sx={{ borderRadius: 2 }} />)}
            </div>
          ) : !data?.materias?.length ? (
            <Typography variant="body2" color="text.secondary">No tienes materias asignadas.</Typography>
          ) : (
            <div className="space-y-2">
              {data.materias.map((m) => (
                <div key={m.id_profesor_materia} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{m.materia}</p>
                    {m.periodo && (
                      <p className="text-xs text-slate-500 mt-0.5">{m.periodo}</p>
                    )}
                  </div>
                  {m.es_activo !== undefined && (
                    <Chip label={m.es_activo ? 'Activo' : 'Inactivo'} size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 500 }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
