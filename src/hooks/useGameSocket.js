import { useCallback } from 'react';
import { io } from 'socket.io-client';
import useGameStore from '../stores/gameStore';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8085';

// Singleton a nivel de módulo: sobrevive unmount/mount entre SalaEsperaPage y JuegoPage.
let globalSocket = null;

export const useGameSocket = () => {
  const {
    setSocket, addPlayer, setGameStatus,
    setCurrentQuestion, setFinished, incrementAnswerCount, resetGame,
  } = useGameStore();

  const connect = useCallback((partida_id) => {
    if (globalSocket?.connected) return;

    const token = localStorage.getItem('jwtToken');
    const s = io(GATEWAY, {
      query: { role: 'teacher' },
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      s.emit('teacher:join', { partida_id });
    });

    s.on('student:joined', (data) => addPlayer(data));
    s.on('partida:iniciada', () => setGameStatus('SHOW_START'));
    s.on('partida:pregunta', (data) => setCurrentQuestion(data));
    s.on('partida:finalizada', () => setFinished());
    s.on('respuesta:recibida', () => incrementAnswerCount());

    globalSocket = s;
    setSocket(s);
  }, [addPlayer, setGameStatus, setCurrentQuestion, setFinished, incrementAnswerCount, setSocket]);

  const disconnect = useCallback(() => {
    globalSocket?.disconnect();
    globalSocket = null;
    resetGame();
  }, [resetGame]);

  return { connect, disconnect };
};
