import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Avatar, LinearProgress, Chip, Box } from '@mui/material';
import {
  NavigateNext, Leaderboard, StopCircle, EmojiEvents, CheckCircle,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import useGameStore from '../../stores/gameStore';
import partidaService from '../../services/partidaService';

/* ─── HTML entity decoder ─── */
function decodeHtmlEntities(text) {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

/* ─── Timer hook ─── */
function useCountdown(seconds, active) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => { setRemaining(seconds); }, [seconds]);
  useEffect(() => {
    if (!active || remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [active, remaining]);
  return remaining;
}

/* ─── Leaderboard table ─── */
function LeaderboardTable({ leaderboard }) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="w-full max-w-lg mx-auto space-y-2">
      {leaderboard.map((entry, idx) => (
        <div
          key={entry.socket_id || entry.nombre || idx}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
            idx === 0 ? 'bg-yellow-500/20 border-yellow-400/40' :
            idx === 1 ? 'bg-slate-400/20 border-slate-400/30' :
            idx === 2 ? 'bg-orange-400/20 border-orange-400/30' :
            'bg-white/10 border-white/10'
          }`}
        >
          <span className="text-xl w-8 text-center">{medals[idx] || `${idx + 1}`}</span>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563eb', fontSize: '0.8rem', fontWeight: 700 }}>
            {(entry.nickname || entry.nombre || '?').charAt(0).toUpperCase()}
          </Avatar>
          <p className="flex-1 text-white font-semibold text-sm">
            {entry.nickname || entry.nombre || `Jugador ${idx + 1}`}
          </p>
          <div className="text-right">
            <p className="text-white font-bold">{entry.puntaje_total ?? 0} pts</p>
            {entry.respuestas_correctas != null && (
              <p className="text-slate-400 text-xs">{entry.respuestas_correctas} correctas</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main page ─── */
function JuegoPage() {
  const { codigoAcceso } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const {
    gameStatus, titulo, totalPreguntas,
    currentQuestion, currentQuestionIndex,
    leaderboard, playerCount, partidaId,
    setGameStatus, setLeaderboard,
  } = useGameStore();

  const [busy, setBusy] = useState(false);
  const answersOpen = gameStatus === 'SELECT_ANSWER';

  const countdown = useCountdown(currentQuestion?.tiempo_limite ?? 20, answersOpen);
  const cooldownCount = useCountdown(currentQuestion?.cooldown ?? 5, gameStatus === 'SHOW_QUESTION');

  // Transición automática SHOW_QUESTION → SELECT_ANSWER cuando termina el cooldown
  useEffect(() => {
    if (gameStatus === 'SHOW_QUESTION' && cooldownCount === 0) {
      setGameStatus('SELECT_ANSWER');
    }
  }, [gameStatus, cooldownCount, setGameStatus]);

  // Al finalizar, cargar el ranking final
  useEffect(() => {
    if (gameStatus === 'FINISHED' && partidaId) {
      partidaService.getRanking(partidaId)
        .then((data) => setLeaderboard(data))
        .catch(() => {});
    }
  }, [gameStatus, partidaId, setLeaderboard]);

  const handleNextQuestion = useCallback(async () => {
    setBusy(true);
    try {
      await partidaService.siguientePregunta(partidaId);
      // 'partida:pregunta' socket event actualizará el store → SHOW_QUESTION
    } catch (err) {
      enqueueSnackbar(err.message || 'Error al avanzar pregunta', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  }, [partidaId, enqueueSnackbar]);

  const handleShowLeaderboard = useCallback(async () => {
    setBusy(true);
    try {
      const data = await partidaService.getRanking(partidaId);
      setLeaderboard(data);
      setGameStatus('SHOW_LEADERBOARD');
    } catch (err) {
      enqueueSnackbar(err.message || 'Error al obtener leaderboard', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  }, [partidaId, setLeaderboard, setGameStatus, enqueueSnackbar]);

  const handleEndGame = useCallback(async () => {
    setBusy(true);
    try {
      await partidaService.finalizar(partidaId);
      // 'partida:finalizada' socket event → setFinished() → FINISHED
    } catch (err) {
      enqueueSnackbar(err.message || 'Error al finalizar la partida', { variant: 'error' });
      setBusy(false);
    }
  }, [partidaId, enqueueSnackbar]);

  const isLastQuestion = currentQuestionIndex + 1 >= totalPreguntas;

  /* ─── SHOW_START ─── */
  if (gameStatus === 'SHOW_START') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-blue-300 text-sm uppercase tracking-widest mb-4">¡Partida iniciada!</div>
        <h1 className="text-white text-4xl font-black mb-2">{titulo}</h1>
        <p className="text-slate-400 mb-10">{totalPreguntas} preguntas · {playerCount} participante{playerCount !== 1 ? 's' : ''}</p>
        <Button
          variant="contained"
          size="large"
          endIcon={<NavigateNext />}
          onClick={handleNextQuestion}
          disabled={busy}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 8, py: 1.75, fontSize: '1.1rem', bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}
        >
          {busy ? 'Cargando...' : 'Primera pregunta'}
        </Button>
      </div>
    );
  }

  /* ─── SHOW_QUESTION / SELECT_ANSWER ─── */
  if (gameStatus === 'SHOW_QUESTION' || gameStatus === 'SELECT_ANSWER') {
    const q = currentQuestion;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col px-4 pt-8 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 max-w-3xl mx-auto w-full">
          <Chip
            label={`Pregunta ${currentQuestionIndex + 1} / ${totalPreguntas}`}
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#e2e8f0', fontWeight: 600 }}
          />
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            {answersOpen ? (
              <>
                <span className="text-blue-300 font-bold text-lg">{countdown}s</span>
                <span>para responder</span>
              </>
            ) : (
              <>
                <span className="text-yellow-300 font-bold text-lg">{cooldownCount}s</span>
                <span>mostrando pregunta</span>
              </>
            )}
          </div>
          <Chip
            label={`${playerCount} jugadores`}
            sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}
          />
        </div>

        {/* Progress */}
        <Box sx={{ mb: 4, maxWidth: '48rem', mx: 'auto', width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={answersOpen ? (countdown / (q?.tiempo_limite ?? 20)) * 100 : 100}
            sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: answersOpen ? '#3b82f6' : '#f59e0b' } }}
          />
        </Box>

        {/* Question card */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6 border border-white/20 text-center">
            {q?.image_url && (
              <img src={decodeHtmlEntities(q.image_url)} alt="pregunta" referrerPolicy="no-referrer" className="max-h-40 mx-auto mb-4 rounded-lg object-contain" />
            )}
            <p className="text-white text-xl font-bold leading-snug">{q?.texto}</p>
            {!answersOpen && (
              <p className="text-yellow-300 text-sm mt-3 animate-pulse">Preparando respuestas...</p>
            )}
          </div>

          {/* Answer options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {q?.opciones?.map((op, idx) => {
              const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706'];
              const isCorrect = op.es_correcta;
              return (
                <div
                  key={op.id_opcion || idx}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    isCorrect
                      ? 'border-green-400 bg-green-500/20'
                      : answersOpen
                      ? 'border-white/20 bg-white/10'
                      : 'border-white/10 bg-white/5 opacity-60'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <p className="text-white text-sm font-medium flex-1">{op.texto}</p>
                  {isCorrect && <CheckCircle sx={{ color: '#4ade80', fontSize: 20 }} />}
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {answersOpen && (
              <Button
                variant="contained"
                startIcon={<Leaderboard />}
                onClick={handleShowLeaderboard}
                disabled={busy}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
              >
                {busy ? 'Cargando...' : 'Ver leaderboard'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─── SHOW_LEADERBOARD ─── */
  if (gameStatus === 'SHOW_LEADERBOARD') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center px-4 pt-10 pb-8">
        <div className="text-center mb-6">
          <Leaderboard sx={{ color: '#818cf8', fontSize: 40, mb: 1 }} />
          <h2 className="text-white text-2xl font-black">Leaderboard</h2>
          <p className="text-slate-400 text-sm">Pregunta {currentQuestionIndex + 1} de {totalPreguntas}</p>
        </div>

        <div className="w-full max-w-lg mb-8">
          <LeaderboardTable leaderboard={leaderboard} />
        </div>

        <div className="flex gap-3">
          {!isLastQuestion ? (
            <Button
              variant="contained"
              endIcon={<NavigateNext />}
              onClick={handleNextQuestion}
              disabled={busy}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 5, bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}
            >
              {busy ? 'Cargando...' : 'Siguiente pregunta'}
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<StopCircle />}
              onClick={handleEndGame}
              disabled={busy}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 5, bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
            >
              {busy ? 'Finalizando...' : 'Terminar juego'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  /* ─── FINISHED ─── */
  if (gameStatus === 'FINISHED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center px-4 pt-10 pb-8">
        <div className="text-center mb-8">
          <EmojiEvents sx={{ color: '#fbbf24', fontSize: 56, mb: 2 }} />
          <h2 className="text-white text-3xl font-black mb-1">¡Juego finalizado!</h2>
          <p className="text-slate-400">{titulo}</p>
        </div>

        <div className="w-full max-w-lg mb-8">
          <LeaderboardTable leaderboard={leaderboard} />
        </div>

        <Button
          variant="contained"
          onClick={() => navigate('/cuestionarios')}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 6 }}
        >
          Volver a mis cuestionarios
        </Button>
      </div>
    );
  }

  /* ─── Fallback ─── */
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Conectando al juego...</p>
      </div>
    </div>
  );
}

export default JuegoPage;
