[← Volver al índice](INDEX.md)

# 🔌 API Reference - eduLLM-Front-Profesor

Catálogo de todos los endpoints REST consumidos por este frontend, organizados por dominio. La base de todas las peticiones es `VITE_GATEWAY_URL/api/profesor` (default: `http://localhost:8085/api/profesor`).

> **Autenticación:** el Gateway valida la cookie de sesión y añade los headers `X-User-Id`, `X-User-Role`, `X-Username` al microservicio. Adicionalmente el cliente envía `Authorization: Bearer <token>` y `profesor_id` como query param (inyectado automáticamente por el interceptor de `api.js`).

---

## 🗺️ Resumen de endpoints

| Método | Ruta | Servicio frontend | Descripción |
|---|---|---|---|
| `GET` | `/dashboard` | `dashboardService.getStats` | Estadísticas principales del panel |
| `GET` | `/dashboard/graficas` | `dashboardService.getGraficas` | Datos para las 3 gráficas |
| `GET` | `/cuestionarios` | `cuestionarioService.getAll` | Lista paginada de cuestionarios |
| `POST` | `/cuestionarios` | `cuestionarioService.create` | Crear cuestionario (manual o IA) |
| `GET` | `/cuestionarios/:id` | `cuestionarioService.getById` | Detalle con preguntas y opciones |
| `PUT` | `/cuestionarios/:id` | `cuestionarioService.update` | Actualizar cuestionario |
| `DELETE` | `/cuestionarios/:id` | `cuestionarioService.remove` | Soft delete |
| `GET` | `/partidas` | `partidaService.getHistory` | Historial de partidas |
| `POST` | `/partidas` | `partidaService.create` | Crear nueva sesión de quiz |
| `GET` | `/partidas/:id` | `partidaService.getById` | Detalle de una partida |
| `PUT` | `/partidas/:id/iniciar` | `partidaService.iniciar` | Iniciar partida |
| `PUT` | `/partidas/:id/siguiente-pregunta` | `partidaService.siguientePregunta` | Avanzar a siguiente pregunta |
| `PUT` | `/partidas/:id/finalizar` | `partidaService.finalizar` | Finalizar partida |
| `GET` | `/partidas/:id/resultados` | `partidaService.getResultados` | Resultados completos |
| `GET` | `/partidas/:id/ranking` | `partidaService.getRanking` | Ranking por puntaje |
| `GET` | `/materias` | `materiaService.getAll` | Materias activas del profesor |
| `GET` | `/materias/:id` | `materiaService.getById` | Detalle de una materia |

---

## 📋 Detalle de endpoints

### Dashboard

#### `GET /dashboard`
Estadísticas principales del panel.

**Query params** (auto-inyectados): `profesor_id`

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "total_estudiantes": 45,
    "total_cuestionarios": 12,
    "total_materias": 3,
    "partidas_pendientes": [
      { "id_partida": 7, "codigo_acceso": "AB12CD", "estado_partida": "esperando", "titulo_prueba": "Fracciones básicas", "fecha_creacion": "2026-06-11T14:00:00Z" }
    ],
    "materias": [
      { "id_profesor_materia": 2, "materia": "Matemáticas", "periodo": "2026-I", "es_activo": true }
    ]
  }
}
```

#### `GET /dashboard/graficas`
Datos para las tres gráficas del dashboard.

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "barra_horizontal": [{ "estudiante": "Juan Pérez", "puntaje_promedio": 720 }],
    "barra_vertical": [{ "quiz": "Fracciones básicas", "puntaje_promedio": 650 }],
    "distribucion_puntajes": [
      { "rango": "0-20", "cantidad": 2 }, { "rango": "21-40", "cantidad": 5 },
      { "rango": "41-60", "cantidad": 8 }, { "rango": "61-80", "cantidad": 15 },
      { "rango": "81-100", "cantidad": 10 }
    ]
  }
}
```

---

### Cuestionarios

#### `GET /cuestionarios`
Lista paginada.

**Query params:** `profesor_id` (auto), `page` (default 1), `limit` (default 20), `materia_id` (opcional)

**Respuesta 200:**
```json
{
  "success": true,
  "data": [{ "id_prueba": 1, "titulo": "...", "total_preguntas": 8, "materia": "Ciencias", "fecha_creacion": "..." }],
  "meta": { "total": 12, "page": 1, "limit": 20, "total_pages": 1 }
}
```

#### `POST /cuestionarios`
Crear cuestionario. El campo `esIA: true` marca origen IA.

**Body:**
```json
{
  "esIA": false,
  "materia_id": 1,
  "profesor_id": 22,
  "title": "Fracciones básicas",
  "questions": [
    {
      "question": "¿Cuánto es 1/2 + 1/4?",
      "options": ["3/4", "1/2", "1/4", "2/3"],
      "solutions": [0],
      "cooldown": 5,
      "time": 30,
      "image": null
    }
  ]
}
```

> `solutions` = array de índices (base 0) de las opciones correctas en `options`.  
> Para el formulario manual: `materia_id` viene del selector de materias activas (`materiaService.getAll()` filtrado por `es_activo: true`).

**Respuesta 201:**
```json
{ "success": true, "data": { "id_partida": 9, "codigo_acceso": "AB12CD", ... } }
```

#### `GET /cuestionarios/:id`
Detalle con preguntas y opciones (incluye `es_correcta` para el profesor).

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id_prueba": 1,
    "titulo": "Fracciones básicas",
    "tbl_t_pregunta": [
      {
        "id_pregunta": 10, "texto": "¿Cuánto es 1/2 + 1/4?", "tiempo_limite": 30, "cooldown": 5,
        "tbl_t_opcion": [
          { "id_opcion": 40, "texto": "3/4", "orden": 1, "es_correcta": true },
          { "id_opcion": 41, "texto": "1/2", "orden": 2, "es_correcta": false }
        ]
      }
    ]
  }
}
```

#### `PUT /cuestionarios/:id`
Actualizar. Las preguntas con `id` se actualizan; sin `id` se crean nuevas.

#### `DELETE /cuestionarios/:id`
Soft delete.

---

### Partidas

#### `POST /partidas`
Crear sesión de quiz. Genera el código de acceso de 6 caracteres automáticamente.

**Body:**
```json
{ "profesor_id": 22, "prueba_id": 1 }
```

**Respuesta 201:**
```json
{
  "success": true,
  "data": { "id_partida": 9, "codigo_acceso": "AB12CD", "estado_partida": "esperando", ... }
}
```

#### `PUT /partidas/:id/iniciar`
Estado `esperando` → `en_curso`. Emite `partida:iniciada` por Socket.io.

**Error 400** si `estado_partida !== 'esperando'`.

#### `PUT /partidas/:id/siguiente-pregunta`
Avanza pregunta. Emite `partida:pregunta` **sin** `es_correcta` a estudiantes.

**Respuesta 200** incluye la pregunta con `es_correcta` (solo para el profesor).

**Error 400** si ya no hay más preguntas (se debe llamar `/finalizar`).

#### `PUT /partidas/:id/finalizar`
Finaliza la partida. Emite `partida:finalizada`.

#### `GET /partidas/:id/resultados`
Resultados completos con detalle por estudiante.

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id_partida": 9,
    "prueba": { "titulo": "Fracciones", "total_preguntas": 8 },
    "total_participantes": 22,
    "participaciones": [
      {
        "posicion": 1, "nombre": "Ana García", "puntaje_total": 7800, "respuestas_correctas": 7,
        "respuestas": [
          { "pregunta": "¿Cuánto es 1/2 + 1/4?", "opcion_elegida": "3/4", "fue_correcta": true, "puntaje_obtenido": 980, "tiempo_ms": 4200 }
        ]
      }
    ]
  }
}
```

#### `GET /partidas/:id/ranking`
Ranking ordenado por puntaje descendente.

---

### Materias

#### `GET /materias`
Lista de materias asignadas al profesor. Para el formulario manual de cuestionarios, filtrar por `es_activo: true`.

**Respuesta 200:**
```json
{
  "success": true,
  "data": [
    {
      "id_profesor_materia": 2,
      "materia": { "id_materia": 5, "nombre": "Matemáticas", "grado": "4A" },
      "periodo": "2026-I", "es_activo": true,
      "total_estudiantes": 30, "total_cuestionarios": 5
    }
  ]
}
```

---

## Códigos de error

| Código | Descripción |
|---|---|
| 400 | Validación fallida o estado incorrecto |
| 401 | No autenticado → el interceptor redirige a login |
| 403 | Rol incorrecto |
| 404 | Recurso no encontrado |
| 409 | Violación de unicidad |
| 502/503 | Servicio externo no disponible |
| 500 | Error interno |

---

> **Nota para IA:** Si cambia la firma de un endpoint (body, query params o respuesta) → actualiza la sección correspondiente en `API.md` y el método en `SERVICES.md`.

---

## Última revisión
- **Fecha:** 2026-06-17
- **Versión:** 1.1.0

---

## Instrucciones para actualizar este doc
- Si se añade un endpoint nuevo → añade su fila al resumen y su sección de detalle.
- Si cambia el body o la respuesta → actualiza el ejemplo JSON.

[← Volver al índice](INDEX.md)
