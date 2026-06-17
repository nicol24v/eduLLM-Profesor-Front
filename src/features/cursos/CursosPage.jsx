import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Chip, Skeleton,
  Grid, Divider, Avatar, Collapse, IconButton,
} from '@mui/material';
import { People, Quiz, ExpandMore, ExpandLess, School } from '@mui/icons-material';
import { useCursos, useCurso } from './hooks/useCursos';

function EstudiantesPanel({ materiaId, open }) {
  const { data, isLoading } = useCurso(open ? materiaId : null);
  const estudiantes = data?.estudiantes || [];

  if (!open) return null;

  return (
    <Collapse in={open}>
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2" fontWeight={600} color="#475569" sx={{ mb: 1.5 }}>
        Estudiantes matriculados
      </Typography>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} height={32} sx={{ borderRadius: 1 }} />)}
        </div>
      ) : estudiantes.length === 0 ? (
        <p className="text-xs text-slate-400">No hay estudiantes matriculados.</p>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {estudiantes.map((e) => (
            <div key={e.id_estudiante} className="flex items-center gap-2 text-sm text-slate-700">
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: '#e0e7ff', color: '#4338ca' }}>
                {(e.nombre || e.primer_nombre || '?').charAt(0).toUpperCase()}
              </Avatar>
              <span>{e.nombre || `${e.primer_nombre ?? ''} ${e.apellido_paterno ?? ''}`.trim()}</span>
              {e.correo && <span className="text-slate-400 text-xs">· {e.correo}</span>}
            </div>
          ))}
        </div>
      )}
    </Collapse>
  );
}

function CursoCard({ materia }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <School sx={{ color: '#2563eb', fontSize: 20 }} />
            </div>
            <div>
              <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
                {materia.materia?.nombre || 'Materia'}
              </Typography>
              {materia.materia?.grado && (
                <Typography variant="caption" color="text.secondary">
                  Grado {materia.materia.grado}
                </Typography>
              )}
            </div>
          </div>
          <Chip
            label={materia.es_activo ? 'Activo' : 'Inactivo'}
            size="small"
            color={materia.es_activo ? 'success' : 'default'}
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </div>

        {materia.materia?.descripcion && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
            {materia.materia.descripcion}
          </Typography>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <People sx={{ fontSize: 15, color: '#64748b' }} />
            <span>{materia.total_estudiantes ?? 0} estudiante{(materia.total_estudiantes ?? 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Quiz sx={{ fontSize: 15, color: '#64748b' }} />
            <span>{materia.total_cuestionarios ?? 0} cuestionario{(materia.total_cuestionarios ?? 0) !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {materia.periodo && (
          <Typography variant="caption" color="text.secondary">
            Período: {materia.periodo}
          </Typography>
        )}

        {/* Expand students */}
        {(materia.total_estudiantes ?? 0) > 0 && (
          <>
            <Divider sx={{ mt: 2, mb: 1 }} />
            <div
              className="flex items-center justify-between cursor-pointer py-1 text-blue-600 hover:text-blue-700"
              onClick={() => setExpanded(!expanded)}
            >
              <Typography variant="caption" fontWeight={600}>
                {expanded ? 'Ocultar estudiantes' : 'Ver estudiantes'}
              </Typography>
              <IconButton size="small" sx={{ p: 0.25 }}>
                {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </IconButton>
            </div>
            <EstudiantesPanel materiaId={materia.id_profesor_materia} open={expanded} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CursosPage() {
  const { data: materias = [], isLoading, isError } = useCursos();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mis cursos</h1>
        <p className="text-slate-500 text-sm mt-1">
          {!isLoading && `${materias.length} materia${materias.length !== 1 ? 's' : ''} asignada${materias.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          Error al cargar los cursos.
        </div>
      )}

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Skeleton height={160} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : materias.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <School sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <p className="text-sm">No tienes materias asignadas.</p>
        </div>
      ) : (
        <Grid container spacing={3}>
          {materias.map((m) => (
            <Grid item xs={12} sm={6} lg={4} key={m.id_profesor_materia}>
              <CursoCard materia={m} />
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}

export default CursosPage;
