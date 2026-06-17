[← Volver al índice](INDEX.md)

# 🏁 eduLLM-Front-Profesor

Frontend del módulo **Profesor** de la plataforma educativa **EduLLM**. Permite a los docentes gestionar cuestionarios, lanzar sesiones de quiz en vivo (partidas) y visualizar resultados y estadísticas.

---

## Propósito

Este frontend es el panel de control del profesor dentro de EduLLM. Se comunica exclusivamente con el `ms-profesor` a través del API Gateway, y utiliza Socket.io para recibir eventos en tiempo real durante las sesiones de quiz.

---

## Funcionalidades principales

| Módulo | Descripción |
|---|---|
| **Dashboard** | Estadísticas generales (estudiantes, cuestionarios, materias, partidas activas) y gráficas de rendimiento |
| **Cuestionarios** | Crear, editar y eliminar cuestionarios con soporte para generación manual e IA |
| **Partidas** | Lanzar sesiones de quiz en vivo, controlar el flujo de preguntas y visualizar respuestas en tiempo real |
| **Resultados** | Ver resultados detallados y ranking de cada partida |
| **Cursos/Materias** | Consultar las materias asignadas y sus estudiantes |

---

## Inicio rápido

### Prerequisitos

- Node.js 18+
- El API Gateway (`eduLLM-Gateway`) corriendo en el puerto 8085
- El microservicio `ms-profesor` corriendo y accesible vía Gateway

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_GATEWAY_URL=http://localhost:8085
VITE_AUTH_URL=http://localhost:8085/login
VITE_SKIP_AUTH_VERIFY=false
```

Para desarrollo local sin backend de auth:
```env
VITE_SKIP_AUTH_VERIFY=true
```

### Instalación y ejecución

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Arquitectura resumida

```
Profesor → Browser → Gateway (port 8085) → ms-profesor
                              ↑
                         ms-auth (verify)
```

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para el detalle completo.

---

## Documentación técnica

Ver el [Índice de documentación](INDEX.md) para navegar todos los documentos técnicos.

---

## Última revisión
- **Fecha:** 2026-06-17
- **Versión:** 1.1.0

[← Volver al índice](INDEX.md)
