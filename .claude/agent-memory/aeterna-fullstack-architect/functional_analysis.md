---
name: functional-analysis
description: Análisis funcional completo extraído del PPT — roles, user stories, módulos, flujos
metadata:
  type: project
---

**Roles confirmados:**
- ADMIN (Administrador/Gerencia): gestión de usuarios, configuración institucional, supervisión operativa, auditoría
- PERSONAL (Personal de Geriátrico): incluye enfermeros y jefes de turno — registran cuidados, medicación, novedades, ven residentes asignados
- FAMILIAR: portal de consulta read-only del estado de su familiar residente

**User Story Mappings identificados:**

### Rol FAMILIAR — "Consultar estado y evolución en tiempo real"
- MVP: login, ver resumen diario (higiene/comidas), verificar medicación del día, ver incidencias y falta de insumos
- Release 1: recupero de contraseña, registro de estado de ánimo, filtrar historial clínico por fecha, alertas de insumos faltantes
- Release 2: indicadores de última actualización médica, descargar resumen semanal, alertas críticas y reportar preocupaciones

### Rol PERSONAL — "Registrar y gestionar el cuidado diario"
- MVP: login, ver lista de residentes asignados, registrar ingesta de comidas, administrar medicación y marcar como entregada, reportar incidencias
- Release 1: recupero de contraseña, ver perfil de residente, documentar rutinas de higiene, registrar signos vitales, notas de cambio de turno
- Release 2: observaciones de otros miembros del staff, registrar actividades recreativas, consultar plan de cuidados, resumen de tareas pendientes

### Rol ADMIN — "Gestionar accesos y supervisar la operación"
- MVP: crear cuentas de personal, dar alta residentes, asociar familiares, configuración institucional básica, tablero básico de tareas críticas y medicaciones pendientes
- Release 1: modificar roles, desactivar cuentas, configurar turnos rotativos, indicadores de cumplimiento de tratamientos
- Release 2: auditoría completa (quién hizo qué/cuándo), exportar métricas y reportes

**User Flows confirmados:**
1. Personal carga estados: login → panel personal → seleccionar residente → registrar (estado general / medicación / novedades diarias)
2. Familiar consulta estado: login → panel principal → visualizar panel del residente → estado diario / medicación / alertas
3. Admin registra usuarios: login → panel admin → gestión usuarios → crear usuario → seleccionar tipo (familiar/personal) → asignar residente o permisos → guardar

**Módulos funcionales identificados:**
1. Auth (login, JWT, roles)
2. Usuarios (CRUD, roles, activar/desactivar)
3. Residentes (alta, perfil, datos clínicos, asignación a habitación)
4. Medicación (plan farmacológico, administración diaria, historial)
5. Bienestar (higiene, alimentación, hidratación, ánimo, signos vitales)
6. Novedades/Alertas (incidencias, prioridades, visibilidad)
7. Asignación de residentes a personal por turno
8. Portal Familiar (vistas read-only del residente)
9. Dashboard operativo (tablero de turno para personal)
10. Configuración institucional (admin)

**Módulos fuera del MVP inicial (para releases posteriores):**
- Auditoría completa
- Reportes exportables
- Recupero de contraseña por email
- Actividades recreativas
- Indicadores avanzados por turno

Relacionado: [[domain-entities]], [[project-context]]
