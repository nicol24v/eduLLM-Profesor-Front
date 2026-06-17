# API Integration — Profesor Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alinear la capa de servicios, Socket.io y pages del frontend del profesor con los endpoints REST y eventos Socket.io del backend `ms-profesor`.

**Architecture:** El control del juego pasa exclusivamente por HTTP REST (`POST /partidas`, `PUT /partidas/:id/iniciar`, etc.); Socket.io es solo para recibir eventos push en tiempo real. `profesor_id` se auto-inyecta desde `authStore.user.idUsuario` en el interceptor de axios, evitando que cada servicio lo gestione individualmente.

**Tech Stack:** React 18, Vite, Axios, TanStack React Query 5, Zustand 4, Socket.io-client 4.7, MUI 5

## Global Constraints

- No hay framework de tests instalado — verificación manual en DevTools (Network tab + Console).
- Base URL de API: `VITE_GATEWAY_URL/api/profesor` (default: `http://localhost:8085/api/profesor`).
- `profesor_id` = `useAuthStore.getState().user?.idUsuario` — nunca se genera en el frontend.
- El código de acceso de 6 chars (`codigo_acceso`) lo genera el backend en `POST /partidas`.
- No modificar UI (colores, layout, tipografía). Solo capa de datos y socket.
- `solutions` en el body de cuestionario son índices base-0 del array `options`.
- La DB es SQLite en memoria: reiniciar el backend limpia todos los datos.

---

## File Map

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/services/api.js` | Modificar | Auto-inyección de `profesor_id` en interceptor |
| `src/services/partidaService.js` | Modificar | +5 métodos del ciclo de vida de partida |
| `src/stores/gameStore.js` | Modificar | Alinear acciones con nuevos eventos Socket.io |
| `src/hooks/useGameSocket.js` | Reescribir | Solo recepción de eventos; control por HTTP |
| `src/features/partidas/hooks/usePartidas.js` | Modificar | +4 mutations + hook `usePartidaResultados` |
| `src/features/cuestionarios/CuestionarioListPage.jsx` | Modificar | Reemplazar `createGame` socket por HTTP `createPartida` |
| `src/features/partidas/SalaEsperaPage.jsx` | Modificar | Conectar socket en mount; `iniciarPartida` por HTTP |
| `src/features/partidas/JuegoPage.jsx` | Modificar | Control del juego por HTTP; transición timer SHOW_QUESTION→SELECT_ANSWER |

---

## Task 1: `api.js` — Auto-inyección de `profesor_id`

**Files:**
- Modify: `src/services/api.js`

**Interfaces:**
- Produces: todas las peticiones GET/DELETE incluyen `?profesor_id={idUsuario}` automáticamente.

- [ ] **Step 1: Agregar import de authStore al interceptor**

Editar `src/services/api.js`. Reemplazar el contenido completo con:

```js
import axios from 'axios';
import { sanitizeData } from '../utils/sanitize';
import { redirectToLogin } from '../utils/auth';
import useAuthStore from '../stores/authStore';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8085';

const api = axios.create({
  baseURL: `${GATEWAY}/api/profesor`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const idUsuario = useAuthStore.getState().user?.idUsuario;
  if (idUsuario) {
    if (['get', 'delete'].includes(config.method?.toLowerCase())) {
      config.params = { profesor_id: idUsuario, ...config.params };
    }
  }

  if (config.data && ['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
    if (typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = sanitizeData(config.data);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwtToken');
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;
```

- [ ] **Step 2: Verificar en DevTools**

1. Iniciar dev: `npm run dev`
2. Iniciar sesión / con `VITE_SKIP_AUTH_VERIFY=true`
3. Abrir DevTools → Network tab
4. Navegar al Dashboard
5. Verificar que la petición a `/api/profesor/dashboard` incluye `?profesor_id=22` (o el id del usuario) en la URL.

- [ ] **Step 3: Commit**

```bash
git add src/services/api.js
git commit -m "feat(api): auto-inject profesor_id query param from authStore"
```

---

## Task 2: `partidaService.js` — Métodos del ciclo de vida

**Files:**
- Modify: `src/services/partidaService.js`

**Interfaces:**
- Consumes: `api` instance de Task 1.
- Produces:
  - `partidaService.create({ profesor_id, prueba_id })` → Promise `{ success, data: { id_partida, codigo_acceso, estado_partida } }`
  - `partidaService.iniciar(id)` → Promise `{ success, data: { id_partida, estado_partida, iniciado_en } }`
  - `partidaService.siguientePregunta(id)` → Promise `{ id_pregunta, texto, tiempo_limite, cooldown, numero, total, opciones[] }`
  - `partidaService.finalizar(id)` → Promise `{ success, data: { id_partida, estado_partida, finalizado_en } }`
  - `partidaService.getResultados(id)` → Promise `{ id_partida, prueba, total_participantes, participaciones[] }`

- [ ] **Step 1: Reemplazar contenido de `partidaService.js`**

```js
import api from './api';

const partidaService = {
  getHistory: (params = {}) =>
    api.get('/partidas', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/partidas/${id}`).then((r) => r.data.data),

  getRanking: (id) =>
    api.get(`/partidas/${id}/ranking`).then((r) => r.data.data),

  create: (data) =>
    api.post('/partidas', data).then((r) => r.data),

  iniciar: (id) =>
    api.put(`/partidas/${id}/iniciar`).then((r) => r.data.data),

  siguientePregunta: (id) =>
    api.put(`/partidas/${id}/siguiente-pregunta`).then((r) => r.data.data),

  finalizar: (id) =>
    api.put(`/partidas/${id}/finalizar`).then((r) => r.data.data),

  getResultados: (id) =>
    api.get(`/partidas/${id}/resultados`).then((r) => r.data.data),
};

export default partidaService;
```

- [ ] **Step 2: Verificar en DevTools**

Con el backend corriendo:
1. Abrir DevTools → Console
2. Ejecutar:
```js
import('/src/services/partidaService.js').then(m => console.log(Object.keys(m.default)))
// Esperado: ['getHistory', 'getById', 'getRanking', 'create', 'iniciar', 'siguientePregunta', 'finalizar', 'getResultados']
```
(O simplemente verificar que el archivo guardado no tiene errores de sintaxis en el editor.)

- [ ] **Step 3: Commit**

```bash
git add src/services/partidaService.js
git commit -m "feat(partidas): add create, iniciar, siguientePregunta, finalizar, getResultados"
```

---

## Task 3: `gameStore.js` — Alinear con nuevos eventos Socket.io

**Files:**
- Modify: `src/stores/gameStore.js`

**Interfaces:**
- Consumes: nuevos payloads de Socket.io (`student:joined: { nickname, socket_id }`, `partida:pregunta: { id_pregunta, texto, tiempo_limite, cooldown, numero, total, opciones[] }`, `partida:finalizada: { id_partida, finalizado_en }`).
- Produces (acciones que usará `useGameSocket.js` en Task 4 y las páginas en Tasks 6–8):
  - `addPlayer({ nickname, socket_id })` — añade jugador, incrementa `playerCount`
  - `setGameStatus(status)` — cambia el estado del juego
  - `setCurrentQuestion(question)` — guarda pregunta, pone status `SHOW_QUESTION`, resetea `answerCount`
  - `setLeaderboard(leaderboard[])` — actualiza leaderboard sin cambiar gameStatus
  - `setFinished()` — pone status `FINISHED`
  - `incrementAnswerCount()` — incrementa contador de respuestas recibidas
  - `initGame({ partidaId, codigoAcceso, titulo, totalPreguntas })` — inicializa partida
  - `resetGame()` — limpia todo el estado

- [ ] **Step 1: Reemplazar contenido de `gameStore.js`**

```js
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
```

- [ ] **Step 2: Verificar en DevTools**

```js
// En la consola del navegador con la app corriendo:
const store = window.__ZUSTAND_STORE__ // No disponible por defecto
// Alternativa: verificar que la app carga sin errores de import en la consola.
```
Basta con que la app cargue sin errores de runtime y el Dashboard y lista de cuestionarios funcionen.

- [ ] **Step 3: Commit**

```bash
git add src/stores/gameStore.js
git commit -m "feat(gameStore): align with new socket events, add answerCount, fix addPlayer signature"
```

---

## Task 4: `useGameSocket.js` — Reescritura completa

**Files:**
- Modify: `src/hooks/useGameSocket.js`

**Interfaces:**
- Consumes: `gameStore` acciones de Task 3; `io` de socket.io-client.
- Produces:
  - `connect(partida_id: number)` — crea o reutiliza el socket, emite `teacher:join`, adjunta listeners.
  - `disconnect()` — desconecta y llama `resetGame()`.

- [ ] **Step 1: Reescribir `useGameSocket.js`**

```js
import { useCallback } from 'react';
import { io } from 'socket.io-client';
import useGameStore from '../stores/gameStore';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8085';

// Singleton a nivel de módulo: sobrevive unmount/mount entre páginas.
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
```

- [ ] **Step 2: Verificar**

1. Iniciar el backend `ms-profesor` y tener un cuestionario creado.
2. Desde la app, crear una partida (lo hará en Task 6 — por ahora, verificar que la importación no rompe la app).
3. Verificar en consola que no hay errores de import al cargar `CuestionarioListPage` o cualquier página.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useGameSocket.js
git commit -m "feat(socket): rewrite useGameSocket — teacher:join + partida:* events, HTTP control"
```

---

## Task 5: `usePartidas.js` — Mutations del ciclo de partida

**Files:**
- Modify: `src/features/partidas/hooks/usePartidas.js`

**Interfaces:**
- Consumes: `partidaService` de Task 2; `useAuthStore` para `idUsuario`.
- Produces:
  - `useCreatePartida()` → `{ mutateAsync(prueba_id) }` — crea partida, invalida caché de partidas.
  - `useIniciarPartida()` → `{ mutateAsync(id) }`
  - `useSiguientePregunta()` → `{ mutateAsync(id) }`
  - `useFinalizarPartida()` → `{ mutateAsync(id) }`
  - `usePartidaResultados(id)` → `useQuery` con `{ data, isLoading, isError }`

- [ ] **Step 1: Reemplazar contenido de `usePartidas.js`**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import partidaService from '../../../services/partidaService';
import useAuthStore from '../../../stores/authStore';

export function usePartidas(params = {}) {
  return useQuery({
    queryKey: ['partidas', params],
    queryFn: () => partidaService.getHistory(params),
  });
}

export function usePartida(id) {
  return useQuery({
    queryKey: ['partida', id],
    queryFn: () => partidaService.getById(id),
    enabled: !!id,
  });
}

export function usePartidaResultados(id) {
  return useQuery({
    queryKey: ['partida-resultados', id],
    queryFn: () => partidaService.getResultados(id),
    enabled: !!id,
  });
}

export function useCreatePartida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prueba_id) => {
      const profesor_id = useAuthStore.getState().user?.idUsuario;
      return partidaService.create({ profesor_id, prueba_id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partidas'] }),
  });
}

export function useIniciarPartida() {
  return useMutation({
    mutationFn: (id) => partidaService.iniciar(id),
  });
}

export function useSiguientePregunta() {
  return useMutation({
    mutationFn: (id) => partidaService.siguientePregunta(id),
  });
}

export function useFinalizarPartida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => partidaService.finalizar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partidas'] }),
  });
}
```

- [ ] **Step 2: Verificar**

Con `VITE_SKIP_AUTH_VERIFY=true`, verificar que la app carga sin errores de import. Las mutations se verificarán en Tasks 6–8.

- [ ] **Step 3: Commit**

```bash
git add src/features/partidas/hooks/usePartidas.js
git commit -m "feat(partidas): add create/iniciar/siguiente/finalizar mutations + usePartidaResultados"
```

---

## Task 6: `CuestionarioListPage.jsx` — Reemplazar createGame por HTTP

**Files:**
- Modify: `src/features/cuestionarios/CuestionarioListPage.jsx`

**Interfaces:**
- Consumes: `useCreatePartida()` de Task 5; `gameStore.initGame` de Task 3.
- Produces: navega a `/sala-espera/:codigo_acceso` con el store inicializado.

- [ ] **Step 1: Actualizar `CuestionarioListPage.jsx`**

Reemplazar las líneas 1–52 (imports + componente hasta `handleStartQuiz`):

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, Button, IconButton,
  Skeleton, Tooltip, Radio, RadioGroup, FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete, PlayArrow } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useCuestionarios } from './hooks/useCuestionarios';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useCreatePartida } from '../partidas/hooks/usePartidas';
import useGameStore from '../../stores/gameStore';

function CuestionarioListPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { list, remove } = useCuestionarios();
  const createPartida = useCreatePartida();
  const initGame = useGameStore((s) => s.initGame);

  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [starting, setStarting] = useState(false);

  const cuestionarios = list.data?.data || [];
  const total = list.data?.meta?.total ?? cuestionarios.length;

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(deleteTarget.id_prueba);
      enqueueSnackbar('Cuestionario eliminado', { variant: 'success' });
      if (selectedId === deleteTarget.id_prueba) setSelectedId(null);
    } catch {
      enqueueSnackbar('Error al eliminar el cuestionario', { variant: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStartQuiz = async () => {
    if (!selectedId) {
      enqueueSnackbar('Selecciona un cuestionario primero', { variant: 'warning' });
      return;
    }
    const selectedCuestionario = cuestionarios.find((q) => q.id_prueba === selectedId);
    setStarting(true);
    try {
      const response = await createPartida.mutateAsync(selectedId);
      const { id_partida, codigo_acceso } = response.data;
      initGame({
        partidaId: id_partida,
        codigoAcceso: codigo_acceso,
        titulo: selectedCuestionario?.titulo || '',
        totalPreguntas: selectedCuestionario?._count?.tbl_t_pregunta
          ?? selectedCuestionario?.tbl_t_pregunta?.length
          ?? 0,
      });
      navigate(`/sala-espera/${codigo_acceso}`);
    } catch (err) {
      enqueueSnackbar(err.message || 'Error al crear la partida', { variant: 'error' });
    } finally {
      setStarting(false);
    }
  };
```

El resto del JSX (retorno del componente, lista de cuestionarios, botón de inicio, `ConfirmDialog`) **no cambia**.

- [ ] **Step 2: Verificar flujo de creación de partida**

1. Con backend corriendo: crear un cuestionario si no existe.
2. En la UI: seleccionar un cuestionario y hacer clic en "Iniciar cuestionario seleccionado".
3. DevTools → Network: verificar petición `POST /api/profesor/partidas` con body `{ profesor_id: 22, prueba_id: X }`.
4. Verificar que la respuesta incluye `id_partida` y `codigo_acceso`.
5. Verificar que navega a `/sala-espera/:codigo_acceso`.

- [ ] **Step 3: Commit**

```bash
git add src/features/cuestionarios/CuestionarioListPage.jsx
git commit -m "feat(cuestionarios): replace socket createGame with HTTP createPartida"
```

---

## Task 7: `SalaEsperaPage.jsx` — Conectar socket y control HTTP

**Files:**
- Modify: `src/features/partidas/SalaEsperaPage.jsx`

**Interfaces:**
- Consumes: `useGameSocket().connect(partida_id)` de Task 4; `useIniciarPartida()` de Task 5; `gameStore.partidaId` de Task 3.
- Produces: socket conectado + navegación a `/juego/:codigoAcceso` cuando llega `partida:iniciada`.

- [ ] **Step 1: Reemplazar `SalaEsperaPage.jsx`**

```jsx
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

  // Conectar socket al montar (require partidaId del store)
  useEffect(() => {
    if (partidaId) {
      connect(partidaId);
    } else {
      // Sin partidaId (ej: recarga de página), volver a cuestionarios
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
```

- [ ] **Step 2: Verificar flujo de sala de espera**

1. Desde `CuestionarioListPage`, crear una partida y navegar a la sala.
2. DevTools → Network: verificar que hay una conexión WebSocket abierta.
3. DevTools → WS frames: verificar que se emitió `teacher:join { partida_id }` al conectar.
4. (Opcional) Abrir la vista de estudiante en otra pestaña y unirse: verificar que aparece en la grilla.
5. Clic en "Iniciar partida": DevTools → Network: verificar `PUT /api/profesor/partidas/:id/iniciar` → `200`.
6. Verificar que navega a `/juego/:codigoAcceso`.

- [ ] **Step 3: Commit**

```bash
git add src/features/partidas/SalaEsperaPage.jsx
git commit -m "feat(sala-espera): connect socket on mount, start game via HTTP"
```

---

## Task 8: `JuegoPage.jsx` — Control HTTP + transición timer

**Files:**
- Modify: `src/features/partidas/JuegoPage.jsx`

**Interfaces:**
- Consumes: `partidaService` de Task 2 (directamente, sin hook wrapper para evitar overhead); `gameStore` de Task 3.
- Produces: flujo completo de preguntas → leaderboard → finalización vía HTTP.

- [ ] **Step 1: Reemplazar `JuegoPage.jsx`**

```jsx
import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Avatar, LinearProgress, Chip, Box } from '@mui/material';
import {
  NavigateNext, Leaderboard, StopCircle, EmojiEvents, CheckCircle,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import useGameStore from '../../stores/gameStore';
import partidaService from '../../services/partidaService';

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
              <img src={q.image_url} alt="pregunta" className="max-h-40 mx-auto mb-4 rounded-lg object-contain" />
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
```

- [ ] **Step 2: Verificar flujo completo del juego**

1. Desde `CuestionarioListPage`, crear partida → sala espera → iniciar.
2. Navega a `/juego/:codigoAcceso` en estado `SHOW_START`.
3. Clic "Primera pregunta" → DevTools Network: `PUT /partidas/:id/siguiente-pregunta` → `200`.
4. Verificar que aparece la pantalla de pregunta (cooldown → respuestas abiertas por timer).
5. Clic "Ver leaderboard" → DevTools Network: `GET /partidas/:id/ranking` → `200` con array.
6. Verificar pantalla de leaderboard con datos.
7. Última pregunta → Clic "Terminar juego" → `PUT /partidas/:id/finalizar` → `200`.
8. Socket emite `partida:finalizada` → pantalla `FINISHED` con ranking final.

- [ ] **Step 3: Commit**

```bash
git add src/features/partidas/JuegoPage.jsx
git commit -m "feat(juego): game control via HTTP, auto SHOW_QUESTION→SELECT_ANSWER timer"
```

---

## Self-Review

### Spec coverage

| Requisito del spec | Task |
|---|---|
| Auto-inyectar `profesor_id` desde authStore | Task 1 |
| `POST /partidas`, `PUT /iniciar`, `PUT /siguiente`, `PUT /finalizar`, `GET /resultados` | Task 2 |
| Alinear gameStore con `student:joined`, `partida:*` | Task 3 |
| Reescribir useGameSocket con `teacher:join` y nuevos eventos | Task 4 |
| Mutations en usePartidas + usePartidaResultados | Task 5 |
| Reemplazar `createGame` socket por HTTP en CuestionarioListPage | Task 6 |
| SalaEsperaPage conecta socket en mount, inicia por HTTP | Task 7 |
| JuegoPage control HTTP, timer cooldown→SELECT_ANSWER | Task 8 |
| Código acceso 6 dígitos generado por backend | Task 6 (se usa `response.data.codigo_acceso`) |
| No modificar UI visual | ✓ JSX preservado en Tasks 7–8 |

### Type consistency

- `addPlayer({ nickname, socket_id })` — definido en Task 3, consumido en Task 4. ✓
- `setCurrentQuestion(question)` donde `question.numero` es 1-based — Task 3 usa `question.numero - 1`. ✓
- `setLeaderboard(leaderboard[])` — Task 3 solo actualiza datos, Task 8 también actualiza `gameStatus`. ✓
- `partidaService.siguientePregunta(id)` — retorna `data` del objeto pregunta, Task 8 lo invoca sin usar el retorno (el socket lleva la actualización). ✓
- `response.data.id_partida` y `response.data.codigo_acceso` — asumen que el backend devuelve `data` dentro de la respuesta (Opción A confirmada). ✓
