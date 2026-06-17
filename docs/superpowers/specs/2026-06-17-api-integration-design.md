---
name: api-integration-design
description: Diseño de integración de la capa de servicios del frontend Profesor con el ms-profesor backend y Socket.io
metadata:
  type: project
---

# Diseño: Integración API + Socket.io — eduLLM-Front-Profesor

**Fecha:** 2026-06-17  
**Alcance:** Capa de servicios, hooks de React Query y Socket.io hook

---

## Contexto

El frontend del profesor (`eduLLM-Front-Profesor`) tenía una capa de servicios parcialmente implementada y un hook de Socket.io (`useGameSocket.js`) con eventos incompatibles con el backend actual (`ms-profesor`).

El backend actual implementa:
- **HTTP REST** para control de partidas y CRUD de cuestionarios/materias.
- **Socket.io** solo para push de eventos en tiempo real (el profesor escucha, no controla por socket).

El hook anterior usaba eventos `manager:*` (arquitectura MindBuzz legacy) donde todo el control del juego pasaba por socket.

---

## Decisiones de diseño aprobadas

### 1. Auto-inyección de `profesor_id`

`profesor_id` = `idUsuario` del authStore (campo devuelto por `/api/auth/verify`). Se inyecta automáticamente en el interceptor de request de `api.js`:
- **GET / DELETE:** como query param `?profesor_id={idUsuario}`
- **POST / PUT con body:** el llamador incluye `profesor_id` en el body cuando el endpoint lo requiere

El Gateway también inyecta `X-User-Id` en el header al microservicio, por lo que el backend tiene doble fuente de identidad.

### 2. Formato definitivo de cuestionarios

```json
{
  "esIA": true,
  "materia_id": 1,
  "profesor_id": 1,
  "questions": [
    {
      "question": "Texto de la pregunta",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "solutions": [1],
      "cooldown": 5,
      "time": 20,
      "image": null
    }
  ],
  "title": "Título del cuestionario"
}
```

El campo `solutions` contiene índices (base 0) de las opciones correctas dentro del array `options`.  
`cuestionarioService.create(data)` pasa el body tal cual — sin transformación.  
No existe endpoint `/preguntas` en el scope de este frontend (GBNF no aplica).

### 3. Métodos nuevos en `partidaService`

```
create({ profesor_id, prueba_id })   → POST /partidas
iniciar(id)                          → PUT  /partidas/:id/iniciar
siguientePregunta(id)                → PUT  /partidas/:id/siguiente-pregunta
finalizar(id)                        → PUT  /partidas/:id/finalizar
getResultados(id)                    → GET  /partidas/:id/resultados
```

`POST /partidas` devuelve `{ success: true, data: { id_partida, codigo_acceso, ... } }`.  
El frontend usa `data.id_partida` y `data.codigo_acceso` para navegar a la sala de espera y unirse al socket.

### 4. Reescritura de `useGameSocket.js`

| Antes (legacy manager:*) | Ahora (partida:*) |
|---|---|
| `manager:create_game` → socket | `POST /partidas` → HTTP |
| `manager:start` → socket | `PUT /partidas/:id/iniciar` → HTTP |
| `manager:next_question` → socket | `PUT /partidas/:id/siguiente-pregunta` → HTTP |
| `manager:end_game` → socket | `PUT /partidas/:id/finalizar` → HTTP |
| Escucha `game:player_joined` | Escucha `student:joined` |
| Escucha `game:started` | Escucha `partida:iniciada` |
| Escucha `game:question_manager` | Escucha `partida:pregunta` |
| Escucha `game:finished` | Escucha `partida:finalizada` |
| Escucha `game:responses` | Escucha `respuesta:recibida` |

El hook solo expone `connect(partida_id)` y `disconnect()`.  
Al conectar, emite automáticamente `teacher:join { partida_id }` para suscribirse a la sala.

### 5. Mutations en `usePartidas.js`

```js
createPartida       → POST /partidas
iniciarPartida      → PUT  /partidas/:id/iniciar
siguientePregunta   → PUT  /partidas/:id/siguiente-pregunta
finalizarPartida    → PUT  /partidas/:id/finalizar
```

Nuevo hook `usePartidaResultados(id)` para `GET /partidas/:id/resultados`.

### 6. Cambios mínimos en páginas

**`SalaEsperaPage`:** reemplaza `startGame(codigoAcceso)` vía socket por `iniciarPartida(id)` vía HTTP.  
**`JuegoPage`:** reemplaza `nextQuestion`, `endGame` vía socket por mutations HTTP equivalentes.

---

## Restricciones

- Base de datos SQLite en memoria durante desarrollo; se migra a PostgreSQL en producción.
- `profesor_id` nunca se genera en el frontend — siempre viene del authStore (`idUsuario`).
- El código de acceso de 6 dígitos (`codigo_acceso: "AB12CD"`) lo genera el backend al crear la partida.
- No se toca la UI (colores, layout, componentes visuales) — solo la capa de datos y socket.

---

## Archivos afectados

| Archivo | Tipo de cambio |
|---|---|
| `src/services/api.js` | Interceptor: auto-inyección de `profesor_id` |
| `src/services/partidaService.js` | +5 métodos nuevos |
| `src/hooks/useGameSocket.js` | Reescritura completa |
| `src/stores/gameStore.js` | Actualizar nombres de acciones según nuevos eventos |
| `src/features/partidas/hooks/usePartidas.js` | +4 mutations + hook resultados |
| `src/features/partidas/SalaEsperaPage.jsx` | Reemplazar control socket → HTTP |
| `src/features/partidas/JuegoPage.jsx` | Reemplazar control socket → HTTP |
