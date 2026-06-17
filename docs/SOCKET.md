[← Volver al índice](INDEX.md)

# 🔌 Socket.io — eduLLM-Front-Profesor

Documentación del protocolo WebSocket entre el frontend del profesor y `ms-profesor`.

**Conexión:** `VITE_GATEWAY_URL` (mismo host que HTTP, default `ws://localhost:8085`)

---

## Contexto de arquitectura

El socket es **solo para recepción de eventos en tiempo real**. El control del juego (crear partida, iniciar, avanzar pregunta, finalizar) se hace exclusivamente vía HTTP REST. El socket permite que todos los clientes en la sala reciban actualizaciones sin polling.

```
Profesor (HTTP) → iniciar partida → Backend → emite partida:iniciada → todos los sockets de la sala
```

---

## Hook: `useGameSocket`

**Ruta:** `src/hooks/useGameSocket.js`

### API pública del hook

| Función | Descripción |
|---|---|
| `connect(partida_id)` | Conecta al servidor y emite `teacher:join` para suscribirse a la sala |
| `disconnect()` | Desconecta y resetea el `gameStore` |

---

## Eventos del cliente → servidor

| Evento | Payload | Cuándo se emite |
|---|---|---|
| `teacher:join` | `{ partida_id }` | Al conectar, inmediatamente después de `connect(partida_id)` |

---

## Eventos del servidor → cliente

| Evento | Payload | Acción en `gameStore` | Cuándo ocurre |
|---|---|---|---|
| `student:joined` | `{ nickname, socket_id }` | `addPlayer({ nickname, socket_id })` | Un estudiante entra a la sala |
| `partida:iniciada` | `{ id_partida, estado_partida }` | `setGameStatus('SHOW_START')` | Profesor llama `PUT /partidas/:id/iniciar` |
| `partida:pregunta` | `{ id_pregunta, texto, tiempo_limite, numero, total, opciones[] }` | `setCurrentQuestion(data)` | Profesor llama `PUT /partidas/:id/siguiente-pregunta` |
| `partida:finalizada` | `{ id_partida, finalizado_en }` | `setFinished(data)` | Profesor llama `PUT /partidas/:id/finalizar` |
| `respuesta:recibida` | `{ partida_estudiante_id, pregunta_id, tiempo_ms }` | `incrementAnswerCount()` | Un estudiante envía una respuesta |

> `partida:pregunta` que recibe el profesor **incluye** `es_correcta` en las opciones (campo adicional que no se envía a los estudiantes).

---

## Estados del juego (`gameStatus` en `gameStore`)

| Estado | Descripción | Página activa |
|---|---|---|
| `SHOW_ROOM` | Sala de espera, esperando estudiantes | `SalaEsperaPage` |
| `SHOW_START` | Partida iniciada, transición al juego | `SalaEsperaPage` → navega a `JuegoPage` |
| `SHOW_QUESTION` | Mostrando pregunta activa | `JuegoPage` |
| `FINISHED` | Partida finalizada | `JuegoPage` → navega a resultados |

---

## Opciones de conexión

```js
io(GATEWAY, {
  query: { role: 'teacher' },
  auth: { token: localStorage.getItem('jwtToken') },
  withCredentials: true,
  transports: ['websocket', 'polling'],
})
```

---

> **Nota para IA:** Si el backend añade nuevos eventos Socket.io → añade la fila al cuadro de "Eventos del servidor → cliente" y la acción correspondiente en `gameStore`.

---

## Última revisión
- **Fecha:** 2026-06-17
- **Versión:** 1.1.0

---

## Instrucciones para actualizar este doc
- Cualquier evento nuevo o cambio de payload → actualiza las tablas de eventos.
- Si cambian los estados del juego → actualiza la tabla de `gameStatus`.

[← Volver al índice](INDEX.md)
