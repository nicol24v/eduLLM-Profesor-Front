# eduLLM-Front-Profesor — Claude Context

## CodeGraph
- Siempre usar `codegraph_explore` antes de leer archivos.
- Si no hay `.codegraph/`, usar Read/Grep solo para lo estrictamente necesario.

## Arquitectura de Auth
- La autenticación es manejada por el **ms-auth** (microservicio externo).
- El Gateway (`VITE_GATEWAY_URL`) expone `/login` que redirige al ms-auth.
- **No hay login interno** en este frontend. Si el usuario no está autenticado o no tiene el rol correcto, se redirige a `VITE_AUTH_URL` (o `GATEWAY/login`).

### Flujo AuthGate (`src/App.jsx`)
1. Llama a `GET /api/auth/verify` via el hook `useAuth.verifyAuth()`
2. Sin sesión válida → `redirectToLogin()` → ms-auth (no hay cookie que limpiar)
3. Sesión válida pero rol incorrecto → muestra panel "No tienes acceso..." 3 seg → `logoutAndRedirect()` (llama `POST /api/auth/logout` para limpiar cookie, luego redirige)
4. OK → renderiza `<Layout><AppRoutes /></Layout>`

### Variables de entorno relevantes
| Variable | Descripcion |
|---|---|
| `VITE_GATEWAY_URL` | URL del API Gateway (default: `http://localhost:8085`) |
| `VITE_AUTH_URL` | URL de login del ms-auth (default: `GATEWAY/login`) |
| `VITE_SKIP_AUTH_VERIFY` | `true` para saltar verificacion en dev local |

### Archivos clave de auth
- `src/utils/auth.js` — `redirectToLogin()`, `logoutAndRedirect()` (hace POST logout antes de redirigir), `getLoginUrl()`
- `src/hooks/useAuth.js` — `verifyAuth()`, `isProfesor`, `isAuthenticated`
- `src/stores/authStore.js` — estado Zustand persistido (`profesor-auth-storage`)
- `src/App.jsx` — `AuthGate` component (guardia de autenticacion y rol)

### Gateway routes (eduLLM-Gateway/config/application.yml)
- `ms-profesor` predicate: `Path=/api/profesor/**` (simplificado, antes tenia trailing slashes que causaban 404)
- `ROLE_PROFESOR` role-rules: `/api/profesor/**` (antes tenia rutas individuales con bugs: trailing slash, falta de `/` inicial)
