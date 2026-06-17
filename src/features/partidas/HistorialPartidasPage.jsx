import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Chip, Skeleton,
  TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, Pagination, Box,
} from '@mui/material';
import { usePartidas } from './hooks/usePartidas';

const ESTADO_COLORS = {
  esperando: { label: 'Esperando', color: 'warning' },
  en_curso:  { label: 'En curso',  color: 'info' },
  finalizada:{ label: 'Finalizada',color: 'success' },
};

const formatFecha = (iso) => {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
};

function HistorialPartidasPage() {
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const query = usePartidas({ page, limit: LIMIT });
  const partidas = query.data?.data || [];
  const meta = query.data?.meta;
  const totalPages = meta?.total_pages ?? 1;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Historial de cuestionarios tomados</h1>
        <p className="text-slate-500 text-sm mt-1">
          {meta?.total != null ? `${meta.total} partida${meta.total !== 1 ? 's' : ''} en total` : ''}
        </p>
      </div>

      {query.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          Error al cargar el historial.
        </div>
      )}

      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b', py: 1.5 }}>Fecha y hora</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>Cuestionario</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }} align="center">Participantes</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>Finalizado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {query.isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton height={20} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : partidas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    No hay partidas registradas aún.
                  </TableCell>
                </TableRow>
              ) : (
                partidas.map((p) => {
                  const estado = ESTADO_COLORS[p.estado_partida] || { label: p.estado_partida, color: 'default' };
                  return (
                    <TableRow key={p.id_partida} hover>
                      <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>
                        {formatFecha(p.iniciado_en || p.fecha_creacion)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color="#1e293b">
                          {p.titulo_prueba || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-700">
                          {p.codigo_acceso}
                        </code>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="#475569">{p.total_participantes ?? 0}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={estado.label}
                          color={estado.color}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {formatFecha(p.finalizado_en)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
              size="small"
            />
          </Box>
        )}
      </Card>
    </div>
  );
}

export default HistorialPartidasPage;
