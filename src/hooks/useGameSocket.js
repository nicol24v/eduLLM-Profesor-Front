import { useCallback } from 'react';
import { io } from 'socket.io-client';
import useGameStore from '../stores/gameStore';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8085';

let globalSocket = null;

export const useGameSocket = () => {
  const {
    setSocket, addPlayer, setPlayers, setGameStatus,
    setCurrentQuestion, setFinished, incrementAnswerCount, resetGame,
  } = useGameStore();

  const connect = useCallback((codigoAcceso) => {
    if (globalSocket?.connected) {
      globalSocket.emit('manager:rejoin', { codigoAcceso }, (ack) => {
        if (ack?.ok && ack.data?.players) {
          setPlayers(
            ack.data.players.map((p) => ({
              playerId: p.playerId,
              nickname: p.nickname,
            })),
          );
        }
      });
      return;
    }

    const token = localStorage.getItem('jwtToken');
    const s = io(GATEWAY, {
      path: '/game/socket.io',
      query: { role: 'manager' },
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      s.emit('manager:rejoin', { codigoAcceso }, (ack) => {
        if (ack?.ok && ack.data?.players) {
          setPlayers(
            ack.data.players.map((p) => ({
              playerId: p.playerId,
              nickname: p.nickname,
            })),
          );
        }
      });
    });

    s.on('game:player_joined', (data) => addPlayer(data));
    s.on('game:started', () => setGameStatus('SHOW_START'));
    s.on('game:question_manager', (data) => setCurrentQuestion(data));
    s.on('game:finished', () => setFinished());
    s.on('game:open_answers', () => incrementAnswerCount());

    globalSocket = s;
    setSocket(s);
  }, [addPlayer, setPlayers, setGameStatus, setCurrentQuestion, setFinished, incrementAnswerCount, setSocket]);

  const disconnect = useCallback(() => {
    globalSocket?.disconnect();
    globalSocket = null;
    resetGame();
  }, [resetGame]);

  return { connect, disconnect };
};
