[← Volver al índice](INDEX.md)

# ⚙️ Servicios - eduLLM-Front-Profesor

Detalle de cada archivo de servicio en `src/services/`. Todos usan la instancia de axios configurada en `api.js`.

---

## `api.js` — Cliente base

**Ruta:** `src/services/api.js`

Cliente axios singleton con baseURL `VITE_GATEWAY_URL/api/profesor`.

### Interceptor de request

1. Lee `idUsuario` de `authStore.getState().user` y lo añade como `profesor_id` en:
   - **GET / DELETE:** query param `?profesor_id={idUsuario}`
2. Añade `Authorization: Bearer {token}` desde `localStorage.getItem('jwtToken')`.
3. Sanitiza el body en POST/PUT/PATCH con `sanitizeData()` (protección XSS).

### Interceptor de response

- Si el backend devuelve `401`: elimina `jwtToken` de localStorage y llama `redirectToLogin()`.

---

## `dashboardService.js`

**Ruta:** `src/services/dashboardService.js`

| Método | Endpoint | Retorna |
|---|---|---|
| `getStats()` | `GET /dashboard` | `data` del dashboard (stats + materias + partidas pendientes) |
| `getGraficas()` | `GET /dashboard/graficas` | `data` con los tres datasets de gráficas |

---

## `cuestionarioService.js`

**Ruta:** `src/services/cuestionarioService.js`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `getAll(params)` | `GET /cuestionarios` | `{ page, limit, materia_id }` | `{ data, meta }` completo |
| `getById(id)` | `GET /cuestionarios/:id` | `id` | `data` con preguntas y opciones |
| `create(data)` | `POST /cuestionarios` | body completo (ver API.md) | `{ success, message }` |
| `update(id, data)` | `PUT /cuestionarios/:id` | `id`, body parcial | `{ success, message }` |
| `remove(id)` | `DELETE /cuestionarios/:id` | `id` | `{ success, message }` |

**Nota:** `create` acepta el mismo objeto que se construye en el formulario. No hay transformación en el servicio.

---

## `partidaService.js`

**Ruta:** `src/services/partidaService.js`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `getHistory(params)` | `GET /partidas` | `{ page, limit, prueba_id }` | `{ data, meta }` |
| `getById(id)` | `GET /partidas/:id` | `id` | `data` de la partida |
| `getRanking(id)` | `GET /partidas/:id/ranking` | `id` | array de posiciones |
| `create(data)` | `POST /partidas` | `{ profesor_id, prueba_id }` | `data` con `id_partida` y `codigo_acceso` |
| `iniciar(id)` | `PUT /partidas/:id/iniciar` | `id` | `data` con nuevo estado |
| `siguientePregunta(id)` | `PUT /partidas/:id/siguiente-pregunta` | `id` | pregunta actual con `es_correcta` |
| `finalizar(id)` | `PUT /partidas/:id/finalizar` | `id` | `data` con `finalizado_en` |
| `getResultados(id)` | `GET /partidas/:id/resultados` | `id` | resultados completos con participaciones |

---

## `materiaService.js`

**Ruta:** `src/services/materiaService.js`

| Método | Endpoint | Retorna |
|---|---|---|
| `getAll()` | `GET /materias` | Array de materias del profesor |
| `getById(id)` | `GET /materias/:id` | Detalle de materia con estudiantes |

**Uso en formulario manual:** `getAll()` → filtrar por `es_activo: true` para poblar el selector de materia.

---

> **Nota para IA:** Si se añade un método nuevo a cualquier servicio → añade su fila aquí. Si cambian los parámetros → actualiza la tabla.

---

## Última revisión
- **Fecha:** 2026-06-17
- **Versión:** 1.1.0

---

## Instrucciones para actualizar este doc
- Cualquier cambio en la firma de un método de servicio → refleja en la tabla correspondiente.

[← Volver al índice](INDEX.md)
