---
name: feedback-preferences
description: Preferencias técnicas confirmadas: sin overengineering, stack simple, JWT en browser storage
metadata:
  type: feedback
---

**Regla principal:** Sin overengineering. Capas básicas Controller → Service → Repository. Nada más.

**Why:** El usuario lo pidió explícitamente: "No te compliques mucho con el código." Es un proyecto académico, no un sistema enterprise real.

**How to apply:**
- NO usar arquitectura hexagonal, Clean Architecture compleja, ni CQRS.
- NO usar Redis (prohibido explícitamente).
- NO microservicios — monolito modular simple.
- JWT guardado en sessionStorage/localStorage del browser (no httpOnly cookies).
- Frontend: React Query para server state, Zustand solo si hace falta para UI global.
- Si dudás entre dos opciones técnicas, elegí la más simple y justificá en una línea.
- No generar código con capas innecesarias (mappers complejos, event buses, etc.) a menos que se pida.
