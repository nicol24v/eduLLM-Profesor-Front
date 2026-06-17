[← Volver al índice](INDEX.md)

# 🗃️ Stores (Zustand) - eduLLM-Front-Profesor

Documentación de los stores de estado global gestionados con Zustand.

---

## `authStore` — Sesión del profesor

**Ruta:** `src/stores/authStore.js`  
**Persistencia:** `localStorage` bajo la clave `profesor-auth-storage`

### Estado

| Campo | Tipo | Descripción |
|---|---|---|
| `token` | `string \| null` | Token JWT de la sesión actual |
| `user` | `object \| null` | Datos del usuario autenticado |

### Estructura de `user` (respuesta de `/api/auth/verify`)

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "rol": "ROLE_PROFESOR",
  "authenticated": true,
  "username": "profesor1",
  "idUsuario": 22
}
```

> `user.idUsuario` se usa como `profesor_id` en todas las peticiones al backend.

### Acciones

| Acción | Descripción |
|---|---|
| `login(token, user)` | Guarda token y user en el store |
| `setUser(user)` | Actualiza solo el objeto user |
| `logout()` | Limpia token y user |

### Uso típico

```js
// Leer profesor_id
const idUsuario = useAuthStore.getState().user?.idUsuario;

// En el interceptor de api.js
const user = useAuthStore.getState().user;
config.params = { profesor_id: user?.idUsuario, ...config.params };
```

---

## `gameStore` — Estado del juego en tiempo real

**Ruta:** `src/stores/gameStore.js`  
**Persistencia:** ninguna (en memoria, se resetea al desconectar)

### Estado

| Campo | Tipo | Descripción |
|---|---|---|
| `socket` | `Socket \| null` | Instancia del socket Socket.io activo |
| `codigoAcceso` | `string \| null` | Código de 6 caracteres de la sala |
| `partidaId` | `number \| null` | ID de la partida activa |
| `titulo` | `string` | Título del cuestionario en juego |
| `totalPreguntas` | `number` | Total de preguntas del cuestionario |
| `gameStatus` | `string` | Estado actual del juego (ver tabla) |
| `players` | `array` | Lista de jugadores conectados |
| `playerCount` | `number` | Contador de jugadores |
| `currentQuestion` | `object \| null` | Pregunta activa con opciones |
| `currentQuestionIndex` | `number` | Índice de la pregunta actual (base 0) |
| `leaderboard` | `array` | Ranking de la partida |
| `results` | `array` | Resultados detallados |
| `answerCount` | `number` | Respuestas recibidas para la pregunta actual |

### Valores de `gameStatus`

| Valor | Significado |
|---|---|
| `SHOW_ROOM` | Sala de espera activa |
| `SHOW_START` | Partida iniciada — transición a juego |
| `SHOW_QUESTION` | Pregunta en pantalla |
| `FINISHED` | Partida finalizada |

### Acciones

| Acción | Trigger | Descripción |
|---|---|---|
| `initGame({ partidaId, codigoAcceso, titulo, totalPreguntas })` | Tras `POST /partidas` | Inicializa la partida en el store |
| `setSocket(socket)` | Al conectar | Guarda la instancia del socket |
| `addPlayer({ nickname, socket_id })` | Evento `student:joined` | Añade jugador a la lista |
| `setGameStatus(status)` | Evento `partida:iniciada` | Actualiza el estado del juego |
| `setCurrentQuestion(data)` | Evento `partida:pregunta` | Guarda pregunta activa y cambia status a `SHOW_QUESTION` |
| `setFinished(data)` | Evento `partida:finalizada` | Cambia status a `FINISHED` |
| `incrementAnswerCount()` | Evento `respuesta:recibida` | Incrementa el contador de respuestas |
| `resetGame()` | Al desconectar | Limpia todo el estado del juego |

---

> **Nota para IA:** Si se añade un nuevo campo al store o una nueva acción, actualiza las tablas de este documento.

---

## Última revisión
- **Fecha:** 2026-06-17
- **Versión:** 1.1.0

---

## Instrucciones para actualizar este doc
- Si cambia la estructura del `user` en `authStore` → actualiza el JSON de ejemplo.
- Si se añaden campos o acciones al `gameStore` → actualiza las tablas.

[← Volver al índice](INDEX.md)
