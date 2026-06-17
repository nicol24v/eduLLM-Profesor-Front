import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Skeleton, Chip } from '@mui/material';
import { People, Quiz, School, PlayCircle } from '@mui/icons-material';
import { useDashboard } from './hooks/useDashboard';

const statCards = [
  { key: 'total_estudiantes',  label: 'Estudiantes',       icon: <People />,      color: '#2563eb', bg: '#eff6ff' },
  { key: 'total_cuestionarios', label: 'Cuestionarios',    icon: <Quiz />,        color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'total_materias',     label: 'Materias',          icon: <School />,      color: '#059669', bg: '#ecfdf5' },
  { key: 'partidas_pendientes', label: 'Partidas activas', icon: <PlayCircle />,  color: '#d97706', bg: '#fffbeb' },
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
  const { stats } = useDashboard();
  const data = stats.data;

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
          <Grid item xs={12} sm={6} lg={3} key={card.key}>
            <StatCard card={card} value={data?.[card.key]} loading={stats.isLoading} />
          </Grid>
        ))}
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
                <div key={m.id_materia} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{m.nombre}</p>
                    {m.descripcion && (
                      <p className="text-xs text-slate-500 mt-0.5">{m.descripcion}</p>
                    )}
                  </div>
                  {m.grado && (
                    <Chip label={`Grado ${m.grado}`} size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 500 }} />
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
