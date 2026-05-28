---
name: project-iteracion1
description: Iteración 1 completada — estructura base del proyecto, auth JWT, entidades usuario/residente, frontend funcional
metadata:
  type: project
---

Iteración 1 construida y compilada exitosamente (mvn compile OK, tsc OK, npm install OK).

**Why:** Primera iteración del sistema AETERNA — base funcional end-to-end login + gestión de residentes.

**How to apply:** Al continuar en iteración 2, estas entidades y patrones ya existen y deben extenderse, no reescribirse.

## Decisiones técnicas confirmadas

- Roles: ADMIN, PERSONAL, FAMILIAR (no se diferencia enfermero/jefe de turno)
- Habitaciones: campo `numeroHabitacion VARCHAR` en tabla `residentes` (sin tabla separada)
- MySQL expuesto en puerto 3307 (para no chocar con MySQL local en 3306)
- JWT stateless, token guardado en sessionStorage via Zustand persist middleware
- ddl-auto: update (Hibernate gestiona el schema — no se usa Flyway en esta etapa)
- DataSeeder crea admin@aeterna.com / Admin123! y 3 residentes de ejemplo si la BD está vacía

## Estructura de paquetes backend

```
com.aeterna
├── AeternaApplication.java          (@EnableJpaAuditing)
├── config/
│   ├── SecurityConfig.java          (JWT stateless, CORS localhost:5173)
│   ├── JwtService.java              (jjwt 0.12.6)
│   ├── JwtAuthFilter.java           (OncePerRequestFilter)
│   └── DataSeeder.java              (CommandLineRunner seed)
├── auth/
│   ├── AuthController.java          (POST /api/auth/login, /register)
│   └── dto/ (LoginRequest, LoginResponse, RegisterRequest)
├── usuario/
│   ├── Usuario.java + Rol.java
│   ├── UsuarioRepository/Service/Controller
│   └── (DTOs inlineados en UsuarioController como records/inner classes)
├── residente/
│   ├── Residente.java + EstadoResidente.java
│   ├── ResidenteRepository/Service/Controller
│   └── dto/ (ResidenteRequest, ResidenteResponse con static from())
└── common/
    ├── dto/ApiResponse.java         (wrapper {success, message, data})
    └── exception/ (NotFoundException, BadRequestException, GlobalExceptionHandler)
```

## Estructura frontend

```
src/
├── main.tsx          (BrowserRouter + QueryClientProvider + Toaster)
├── App.tsx           (rutas con ProtectedRoute)
├── types/index.ts    (Usuario, Residente, LoginRequest/Response, ApiResponse)
├── services/api.ts   (axios + interceptors JWT desde sessionStorage)
├── stores/authStore.ts  (Zustand persist en sessionStorage)
├── components/
│   ├── Layout.tsx        (sidebar + nav + logout)
│   ├── ProtectedRoute.tsx
│   └── ui/ (Button, Input, Card, Badge, Modal)
└── features/
    ├── auth/LoginPage.tsx
    ├── dashboard/DashboardPage.tsx  (stats: total, activos, internados)
    └── residentes/
        ├── ResidentesPage.tsx       (tabla con search, acciones ADMIN)
        ├── ResidenteFormModal.tsx   (crear/editar)
        └── residentesService.ts    (axios calls)
```

## Endpoints operativos en Iteración 1

- POST /api/auth/login — público
- POST /api/auth/register — ADMIN only
- GET  /api/usuarios — ADMIN
- GET  /api/usuarios/{id} — ADMIN
- PUT  /api/usuarios/{id} — ADMIN
- DELETE /api/usuarios/{id} — ADMIN (soft delete)
- GET  /api/residentes — ADMIN, PERSONAL, FAMILIAR
- GET  /api/residentes/{id} — ADMIN, PERSONAL, FAMILIAR
- POST /api/residentes — ADMIN
- PUT  /api/residentes/{id} — ADMIN
- DELETE /api/residentes/{id} — ADMIN (soft delete)

## Cache frontend definida

- queryKey: ['residentes'] → staleTime: 2 minutos
- Invalidación explícita en mutaciones (crear, editar, eliminar)
- refetchOnWindowFocus: false (global en QueryClient)
