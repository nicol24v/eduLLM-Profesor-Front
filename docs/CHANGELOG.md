[← Volver al índice](INDEX.md)

# 📜 Changelog - eduLLM-Front-Profesor

Bitácora cronológica de cambios significativos del frontend del módulo Profesor.

---

## [1.1.0] - 2026-06-17

### Añadido
- **`partidaService`:** 5 métodos nuevos (`create`, `iniciar`, `siguientePregunta`, `finalizar`, `getResultados`) cubriendo el ciclo de vida completo de una partida vía HTTP REST.
- **`usePartidas` hook:** mutations para crear e iniciar partidas, avanzar preguntas y finalizar. Nuevo hook `usePartidaResultados(id)`.
- **`docs/`:** Carpeta de documentación técnica creada con `INDEX.md`, `API.md`, `ARCHITECTURE.md`, `SERVICES.md`, `SOCKET.md`, `STORE.md`, `INTEGRATIONS.md`, `DEPENDENCIES.md` y `CHANGELOG.md`.

### Modificado
- **`api.js` interceptor:** auto-inyección de `profesor_id` (= `idUsuario` del authStore) como query param en todas las peticiones GET/DELETE.
- **`useGameSocket.js`:** reescritura completa. Eliminados eventos legacy `manager:*`. El hook ahora solo gestiona la conexión y recepción de eventos (`teacher:join`, `student:joined`, `partida:iniciada`, `partida:pregunta`, `partida:finalizada`, `respuesta:recibida`). El control del juego pasa por HTTP.
- **`gameStore.js`:** actualización de acciones para alinear con los nuevos eventos Socket.io.
- **`SalaEsperaPage.jsx`:** reemplaza `startGame()` vía socket por `iniciarPartida()` vía HTTP.
- **`JuegoPage.jsx`:** reemplaza `nextQuestion()` y `endGame()` vía socket por mutations HTTP.

### Eliminado
- Eventos socket legacy: `manager:create_game`, `manager:start`, `manager:next_question`, `manager:show_leaderboard`, `manager:end_game`, `manager:kick_player`, `manager:rejoin`.
- Listeners socket legacy: `game:player_joined`, `game:player_left`, `game:started`, `game:question_manager`, `game:open_answers`, `game:leaderboard`, `game:responses`, `game:finished`.

---

## [1.1.1] - 2026-06-18

### Corregido
- **Caché de React Query no invalidada tras actualizar cuestionario:** Al editar un cuestionario desde `CuestionarioEditorPage`, el PUT se enviaba correctamente pero la UI seguía mostrando datos anteriores por `staleTime: 30s`. Se agregó `queryClient.invalidateQueries` para las claves `['cuestionarios']` y `['cuestionario', id]` después del update exitoso.
- **`useCuestionarios.js`:** Se añadió mutación `update` con invalidación automática de caché para reuso futuro.

---

## [1.0.0] - 2026-06-11

### Añadido
- Estructura inicial del proyecto con Vite + React 18.
- Autenticación vía `ms-auth` con verificación de cookie de sesión (`AuthGate`).
- `dashboardService`: `getStats`, `getGraficas`.
- `cuestionarioService`: CRUD completo (`getAll`, `getById`, `create`, `update`, `remove`).
- `partidaService` (parcial): `getHistory`, `getById`, `getRanking`.
- `materiaService`: `getAll`, `getById`.
- `useGameSocket` (legacy): control del juego vía eventos `manager:*`.
- Páginas: `DashboardPage`, `CuestionarioListPage`, `CuestionarioEditorPage`, `HistorialPartidasPage`, `SalaEsperaPage`, `JuegoPage`, `CursosPage`.
- Stores Zustand: `authStore` (persistido), `gameStore` (en memoria).

---

> **Nota para IA:** Cada vez que se completen cambios en la base de código → añade una entrada en `CHANGELOG.md` con versión semántica, fecha y descripción de lo añadido/modificado/eliminado.

---

## Última revisión
- **Fecha:** 2026-06-17
- **Versión:** 1.1.0

---

## Instrucciones para actualizar este doc
- Cuando se complete un conjunto de cambios → añade una nueva sección con versión y fecha.
- Usa los verbos: **Añadido**, **Modificado**, **Eliminado**, **Corregido**.

[← Volver al índice](INDEX.md)
