---
name: project-context
description: Contexto general del proyecto AETERNA — gestión geriátrica, stack y estado actual
metadata:
  type: project
---

**Proyecto:** AETERNA — Gestión Integral para Residencias Geriátricas
**Tipo:** Proyecto académico UADE, Seminario, 1er cuatrimestre 2026.
**Estado actual (2026-05-27):** Directorio vacío, solo existe el PDF de presentación. A punto de arrancar el desarrollo.

**Stack confirmado:**
- Backend: Java 21 + Spring Boot 3 + Spring Security + JWT + Spring Data JPA + MySQL + Maven
- Frontend: React + TypeScript + Vite + TailwindCSS + React Query + shadcn/ui + Zustand (mínimo)
- Auth: JWT en localStorage/sessionStorage del browser
- Sin Redis, sin microservicios, sin arquitectura hexagonal

**Estructura de carpetas acordada (pendiente de confirmar):**
- `aeterna-backend/` — Spring Boot monolito
- `aeterna-frontend/` — React + Vite

**Why:** Proyecto académico que debe ser funcional y demostrable, sin complejidad innecesaria.
**How to apply:** Todo el desarrollo debe apuntar a tener algo funcional rápido. MVP primero, features después.

Relacionado: [[user-profile]], [[feedback-preferences]], [[functional-analysis]]
