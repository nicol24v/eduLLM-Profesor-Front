import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  socket: null,
  codigoAcceso: null,
  partidaId: null,
  titulo: '',
  totalPreguntas: 0,
  gameStatus: 'SHOW_ROOM',
  players: [],
  playerCount: 0,
  currentQuestion: null,
  currentQuestionIndex: -1,
  leaderboard: [],
  results: [],
  answerCount: 0,

  setSocket: (socket) => set({ socket }),

  resetGame: () => set({
    socket: null,
    codigoAcceso: null,
    partidaId: null,
    titulo: '',
    totalPreguntas: 0,
    gameStatus: 'SHOW_ROOM',
    players: [],
    playerCount: 0,
    currentQuestion: null,
    currentQuestionIndex: -1,
    leaderboard: [],
    results: [],
    answerCount: 0,
  }),

  initGame: ({ partidaId, codigoAcceso, titulo, totalPreguntas }) =>
    set({ partidaId, codigoAcceso, titulo, totalPreguntas, gameStatus: 'SHOW_ROOM' }),

  setGameStatus: (gameStatus) => set({ gameStatus }),

  addPlayer: ({ nickname, socket_id }) => {
    const players = get().players;
    const exists = players.find((p) => p.socket_id === socket_id);
    if (!exists) {
      set((s) => ({
        players: [...s.players, { socket_id, nickname }],
        playerCount: s.playerCount + 1,
      }));
    }
  },

  setCurrentQuestion: (question) =>
    set({
      currentQuestion: question,
      currentQuestionIndex: question.numero - 1,
      totalPreguntas: question.total,
      gameStatus: 'SHOW_QUESTION',
      answerCount: 0,
    }),

  setLeaderboard: (leaderboard) => set({ leaderboard }),

  setFinished: () => set({ gameStatus: 'FINISHED' }),

  incrementAnswerCount: () => set((s) => ({ answerCount: s.answerCount + 1 })),
}));

export default useGameStore;
