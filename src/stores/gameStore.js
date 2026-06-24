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
    set({
      partidaId, codigoAcceso, titulo, totalPreguntas,
      gameStatus: 'SHOW_ROOM', players: [], playerCount: 0,
      currentQuestion: null, currentQuestionIndex: -1,
      leaderboard: [], results: [], answerCount: 0,
    }),

  setGameStatus: (gameStatus) => set({ gameStatus }),

  addPlayer: ({ playerId, nickname }) => {
    const players = get().players;
    const exists = players.find((p) => p.playerId === playerId);
    if (!exists) {
      set((s) => ({
        players: [...s.players, { playerId, nickname }],
        playerCount: s.playerCount + 1,
      }));
    }
  },

  setPlayers: (players) => set({
    players,
    playerCount: players.length,
  }),

  setCurrentQuestion: (question) =>
    set({
      currentQuestion: question,
      currentQuestionIndex: question.index,
      totalPreguntas: question.total,
      gameStatus: 'SHOW_QUESTION',
      answerCount: 0,
    }),

  setLeaderboard: (leaderboard) => set({ leaderboard }),

  setFinished: () => set({ gameStatus: 'FINISHED' }),

  incrementAnswerCount: () => set((s) => ({ answerCount: s.answerCount + 1 })),
}));

export default useGameStore;
