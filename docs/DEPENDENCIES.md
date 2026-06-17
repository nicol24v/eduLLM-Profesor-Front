[← Volver al índice](INDEX.md)

# 📦 Dependencias - eduLLM-Front-Profesor

Catálogo de dependencias npm declaradas en `package.json`.

---

## Dependencias de producción

| Paquete | Versión | Uso |
|---|---|---|
| `react` | ^18.2.0 | Framework UI principal |
| `react-dom` | ^18.2.0 | Renderizado en el DOM |
| `react-router-dom` | ^6.21.0 | Enrutamiento del SPA |
| `@mui/material` | ^5.15.0 | Componentes UI de Material Design |
| `@mui/icons-material` | ^5.15.0 | Iconos de Material UI |
| `@emotion/react` | ^11.11.1 | CSS-in-JS (peer dep de MUI) |
| `@emotion/styled` | ^11.11.0 | CSS-in-JS styled components (peer dep de MUI) |
| `axios` | ^1.6.2 | Cliente HTTP con interceptores |
| `socket.io-client` | ^4.7.4 | Cliente WebSocket para eventos en tiempo real |
| `zustand` | ^4.4.7 | Estado global ligero (authStore, gameStore) |
| `@tanstack/react-query` | ^5.12.2 | Fetching, caché e invalidación de datos del servidor |
| `react-hook-form` | ^7.48.2 | Gestión de formularios controlados |
| `@hookform/resolvers` | ^3.3.2 | Adaptadores de validación (Zod) para RHF |
| `zod` | ^3.22.4 | Schema validation para formularios |
| `notistack` | ^3.0.1 | Sistema de notificaciones (snackbars) |
| `lodash` | ^4.17.21 | Utilidades de colecciones y strings |
| `validator` | ^13.11.0 | Sanitización y validación de strings |

---

## Dependencias de desarrollo

| Paquete | Versión | Uso |
|---|---|---|
| `vite` | ^5.0.10 | Bundler y servidor de desarrollo |
| `@vitejs/plugin-react` | ^4.2.1 | Plugin de React para Vite (Fast Refresh) |
| `tailwindcss` | ^3.4.19 | Framework CSS utility-first |
| `postcss` | ^8.5.15 | Procesador CSS (requerido por Tailwind) |
| `autoprefixer` | ^10.5.0 | Prefijado automático de propiedades CSS |

---

> **Nota para IA:** Si se añade o elimina una dependencia del `package.json` → actualiza esta tabla.

---

## Última revisión
- **Fecha:** 2026-06-17
- **Versión:** 1.1.0

---

## Instrucciones para actualizar este doc
- Cuando se instale o desinstale un paquete → actualiza la tabla correspondiente.

[← Volver al índice](INDEX.md)
