---
name: project-context
description: Estado del proyecto AETERNA por iteracion, stack tecnico y configuracion
metadata:
  type: project
---

## Stack tecnico
- Backend: Java 21, Spring Boot 3.3.4, Spring Security, JWT (jjwt 0.12.6), Spring Data JPA, MySQL 8, Maven, Lombok
- Frontend: React 18, TypeScript, Vite, React Router 6, Zustand 5, Axios, TailwindCSS, React Query (TanStack v5), lucide-react, react-hot-toast
- DB: MySQL en puerto 3307 (Docker), base aeterna_db, user aeterna_user/aeterna_pass
- Sin Redis. Cache frontend con React Query (staleTime) + sessionStorage para auth.
- ddl-auto: update (Hibernate crea/actualiza tablas automaticamente)

## Iteracion 1 — COMPLETADA
- Auth (JWT login), Usuarios, Residentes
- Roles: ADMIN, PERSONAL, FAMILIAR (enum Rol en com.aeterna.usuario)
- Seed: admin@aeterna.com / Admin123!, 3 residentes de ejemplo

## Iteracion 2 — COMPLETADA (2026-05-27)
- Modulo medicacion completo: Medicamento, Administracion, enums Turno/EstadoAdministracion
- TableroTurnoPage: vista principal del flujo operativo de enfermeria
- Seeds: 5 medicamentos para los 3 residentes existentes
- Ver [[api-contracts]] para endpoints

## Iteracion 3 — COMPLETADA (2026-05-27)
- Modulo bienestar: BienestarDiario, enums EstadoComida/EstadoAnimo, upsert por residente+fecha+turno
- Modulo novedades: Novedad, enums TipoNovedad/PrioridadNovedad, filtros con params opcionales
- Frontend: CuidadosTurnoPage, BienestarFormModal, HistorialBienestarModal, NovedadesPage, NovedadFormModal, NovedadDetalleModal, NovedadesResidenteModal
- Seeds idempotentes: 3 bienestar de hoy, 4 novedades
- Sidebar: +Cuidados del turno (HeartPulse), +Novedades (Bell)
- ResidentesPage: +2 acciones por fila (HeartPulse historial cuidados, Bell novedades residente)

## Iteracion 4 — COMPLETADA (2026-05-27)
- Modulo familiar: FamiliarResidente (tabla familiar_residente), NivelAcceso enum
- Admin usuarios ampliado: crear, actualizar (con email), activar/desactivar, cambiar password, filtrar por rol
- Portal familiar: rutas /familiar, /familiar/medicacion, /familiar/bienestar, /familiar/novedades
- Seeds: maria.gonzalez@familia.com / Familiar123! vinculada a residente Gonzalez
- Layout actualizado: sidebar por rol, FAMILIAR ve 4 items, ADMIN ve +Usuarios en seccion Admin
- LoginPage: redirige a /familiar si rol=FAMILIAR, sino /dashboard
- App.tsx: HomeRedirect por rol

## Iteracion 5 — COMPLETADA (2026-05-27)
- Modulo dashboard: DashboardService, DashboardController, TurnoUtil, DTOs (ResumenDashboardResponse, NovedadesPorPrioridadDto, EventoActividadDto)
- Endpoint: GET /api/dashboard/resumen — ADMIN+PERSONAL — devuelve metricas operativas del dia
- Repos extendidos: MedicamentoRepository+countActivosByTurno, AdministracionRepository+countByFechaAndTurno/countByFechaAndEstado/findTop10ByFecha, BienestarDiarioRepository+countByFecha/findTop5ByFecha, NovedadRepository+countByPrioridadAndCreatedAtBetween/findTop10DelDia
- Frontend: DashboardPage reescrito con KpiCard/BarrasPrioridad/ActividadFeed, dashboardService.ts, tipos ResumenDashboard+EventoActividad en types/index.ts
- Cache: staleTime=30s, refetchInterval=60s
- Skeleton con animate-pulse durante carga

## Proximas iteraciones planificadas
- Iteracion 6: (pendiente definir)

## Why
Proyecto de seminario universitario con objetivo de nivel produccion real.

## How to apply
Al retomar conversacion, esta memoria da contexto completo del estado sin releer todo el codigo.
