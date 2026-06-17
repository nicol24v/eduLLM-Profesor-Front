import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Avatar, Chip } from '@mui/material';
import { PlayArrow, People } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import useGameStore from '../../stores/gameStore';
import { useGameSocket } from '../../hooks/useGameSocket';
import { useIniciarPartida } from './hooks/usePartidas';

function SalaEsperaPage() {
  const { codigoAcceso } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { connect } = useGameSocket();
  const iniciarPartida = useIniciarPartida();

  const { titulo, totalPreguntas, players, playerCount, gameStatus, partidaId } = useGameStore();
  const [starting, setStarting] = useState(false);

  // Conectar socket al montar; si no hay partidaId (recarga de página), volver a cuestionarios
  useEffect(() => {
    if (partidaId) {
      connect(partidaId);
    } else {
      navigate('/cuestionarios', { replace: true });
    }
  }, [partidaId, connect, navigate]);

  // Navegar al juego cuando el socket confirme que la partida inició
  useEffect(() => {
    if (gameStatus === 'SHOW_START') {
      navigate(`/juego/${codigoAcceso}`, { replace: true });
    }
  }, [gameStatus, codigoAcceso, navigate]);

  const handleStart = async () => {
    if (playerCount === 0) {
      enqueueSnackbar('Espera que al menos un estudiante se una antes de iniciar.', { variant: 'warning' });
      return;
    }
    setStarting(true);
    try {
      await iniciarPartida.mutateAsync(partidaId);
      // La navegación ocurre al recibir 'partida:iniciada' por socket → gameStatus SHOW_START
    } catch (err) {
      enqueueSnackbar(err.message || 'Error al iniciar la partida', { variant: 'error' });
      setStarting(false);
    }
  };

  const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-start pt-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-blue-300 text-sm font-medium uppercase tracking-widest mb-2">Sala de espera</p>
        <h1 className="text-white text-3xl font-bold mb-1">{titulo || 'Cuestionario'}</h1>
        {totalPreguntas > 0 && (
          <p className="text-slate-400 text-sm">{totalPreguntas} preguntas</p>
        )}
      </div>

      {/* Access code */}
      <div className="bg-white/10 backdrop-blur rounded-2xl px-10 py-7 text-center mb-8 border border-white/20">
        <p className="text-slate-300 text-sm mb-2">Código de acceso</p>
        <p className="text-white text-5xl font-black tracking-[0.25em] font-mono">{codigoAcceso}</p>
        <p className="text-slate-400 text-xs mt-3">Los estudiantes ingresan este código para unirse</p>
      </div>

      {/* Player count */}
      <div className="flex items-center gap-2 mb-6">
        <People sx={{ color: '#93c5fd', fontSize: 20 }} />
        <Chip
          label={`${playerCount} estudiante${playerCount !== 1 ? 's' : ''} conectado${playerCount !== 1 ? 's' : ''}`}
          sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#e2e8f0', fontWeight: 600 }}
        />
      </div>

      {/* Players grid */}
      {players.length > 0 && (
        <div className="w-full max-w-lg mb-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {players.map((p, idx) => (
              <div key={p.socket_id || idx} className="flex flex-col items-center gap-1.5 bg-white/10 rounded-xl py-3 px-2 border border-white/10">
                <Avatar
                  sx={{
                    width: 36, height: 36,
                    bgcolor: colors[idx % colors.length],
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  {(p.nickname || '?').charAt(0).toUpperCase()}
                </Avatar>
                <p className="text-white text-xs font-medium text-center truncate w-full px-1">
                  {p.nickname || `Jugador ${idx + 1}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {players.length === 0 && (
        <div className="flex flex-col items-center gap-2 mb-8 text-slate-400">
          <div className="w-10 h-10 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-sm">Esperando estudiantes...</p>
        </div>
      )}

      {/* Start button */}
      <Button
        variant="contained"
        size="large"
        startIcon={<PlayArrow />}
        onClick={handleStart}
        disabled={starting || playerCount === 0}
        sx={{
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 700,
          px: 8,
          py: 1.75,
          fontSize: '1.1rem',
          bgcolor: '#16a34a',
          '&:hover': { bgcolor: '#15803d' },
          '&:disabled': { bgcolor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)' },
        }}
      >
        {starting ? 'Iniciando...' : 'Iniciar partida'}
      </Button>

      <p className="text-slate-500 text-xs mt-4">
        La partida comenzará para todos los participantes al mismo tiempo
      </p>
    </div>
  );
}

export default SalaEsperaPage;
