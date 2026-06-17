# Índice de Documentación - eduLLM-Front-Profesor

Este documento sirve como el mapa principal y única fuente de verdad para la navegación de la documentación técnica del frontend del módulo Profesor de la plataforma **EduLLM**.

---

## 🗂️ Archivos de Documentación

| Documento | Descripción |
|---|---|
| 🏁 [README.md](README.md) | Vista general del proyecto, propósito del frontend y guía de inicio rápido. |
| 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura de componentes, rutas, flujo de autenticación y flujo del juego. |
| 🔌 [API.md](API.md) | Catálogo de endpoints consumidos, mapeados a los servicios del frontend. |
| ⚙️ [SERVICES.md](SERVICES.md) | Detalle de cada archivo de servicio (`api.js`, `dashboardService`, etc.). |
| 🔌 [SOCKET.md](SOCKET.md) | Eventos Socket.io: cliente → servidor y servidor → cliente. |
| 🗃️ [STORE.md](STORE.md) | Stores de Zustand: `authStore` y `gameStore`. |
| 🌐 [INTEGRATIONS.md](INTEGRATIONS.md) | Integración con el Gateway, `ms-profesor` y `ms-auth`. |
| 📦 [DEPENDENCIES.md](DEPENDENCIES.md) | Catálogo de dependencias npm declaradas en `package.json`. |
| 📜 [CHANGELOG.md](CHANGELOG.md) | Bitácora histórica de versiones y cambios del frontend. |

---

> **Nota para IA:** Este índice es el punto de entrada para comprender el frontend del profesor. Si se agregan o eliminan archivos de documentación, este índice debe actualizarse de inmediato para conservar la integridad referencial.

---

## Última revisión
- **Fecha:** 2026-06-17
- **Versión:** 1.1.0

---

## Instrucciones para actualizar este doc
- Si cambia la estructura de archivos en la carpeta `/docs` → actualiza `INDEX.md`.
- Si se actualiza el estado general del repositorio → actualiza la fecha y versión.
