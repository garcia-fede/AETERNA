---
name: api-contracts
description: Endpoints REST disenados, sus contratos y restricciones de acceso
metadata:
  type: project
---

## Auth
POST /api/auth/login — publico — body: {email, password} — response: {token, userId, nombre, apellido, email, rol}

## Residentes
GET /api/residentes — ADMIN+PERSONAL+FAMILIAR — lista activos
GET /api/residentes/{id} — ADMIN+PERSONAL+FAMILIAR
POST /api/residentes — ADMIN
PUT /api/residentes/{id} — ADMIN
DELETE /api/residentes/{id} — ADMIN (soft delete activo=false)

## Medicamentos (Iteracion 2)
GET /api/residentes/{residenteId}/medicamentos — ADMIN+PERSONAL+FAMILIAR — lista activos del residente
POST /api/residentes/{residenteId}/medicamentos — ADMIN
PUT /api/medicamentos/{id} — ADMIN
DELETE /api/medicamentos/{id} — ADMIN (soft delete)

## Administraciones (Iteracion 2)
GET /api/administraciones/turno?fecha=YYYY-MM-DD&turno=MANIANA|TARDE|NOCHE — ADMIN+PERSONAL — devuelve List<TomaPendienteResponse>
POST /api/administraciones — ADMIN+PERSONAL — body: {medicamentoId, estado, turno, observaciones?} — personal del JWT
GET /api/administraciones/residentes/{residenteId}?desde=YYYY-MM-DD&hasta=YYYY-MM-DD — ADMIN+PERSONAL+FAMILIAR

## Bienestar (Iteracion 3)
GET /api/bienestar/turno?fecha=YYYY-MM-DD&turno=MANIANA|TARDE|NOCHE — ADMIN+PERSONAL — lista EstadoCuidadosTurno
POST /api/residentes/{residenteId}/bienestar — ADMIN+PERSONAL — upsert por (residente, fecha, turno)
GET /api/residentes/{residenteId}/bienestar?desde=YYYY-MM-DD&hasta=YYYY-MM-DD — ADMIN+PERSONAL+FAMILIAR

## Novedades (Iteracion 3)
GET /api/novedades?residenteId=&tipo=&prioridad= — ADMIN+PERSONAL — filtros opcionales
POST /api/novedades — ADMIN+PERSONAL
PATCH /api/novedades/{id}/visibilidad?visibleFamiliar=&visibleTurnoEntrante= — ADMIN
PATCH /api/novedades/{id}/prioridad?prioridad= — ADMIN
DELETE /api/novedades/{id} — ADMIN
GET /api/novedades/residentes/{residenteId} — ADMIN+PERSONAL+FAMILIAR

## Familiar (Iteracion 4)
GET /api/familiar/mi-residente — FAMILIAR — residente vinculado del usuario autenticado
GET /api/familiar/vinculos — ADMIN — lista todos los vinculos
POST /api/familiar/vinculos — ADMIN
DELETE /api/familiar/vinculos/{id} — ADMIN

## Usuarios Admin (Iteracion 4)
GET /api/usuarios?rol= — ADMIN
GET /api/usuarios/{id} — ADMIN
POST /api/usuarios — ADMIN
PUT /api/usuarios/{id} — ADMIN
PATCH /api/usuarios/{id}/activo?activo= — ADMIN
PATCH /api/usuarios/{id}/password — ADMIN

## Dashboard (Iteracion 5)
GET /api/dashboard/resumen — ADMIN+PERSONAL — devuelve ResumenDashboardResponse:
  {residentesActivos, tomasPendientesTurno, tomasAdministradasHoy, cuidadosRegistradosHoy,
   totalNovedadesHoy, novedadesPorPrioridad:{baja,media,alta,critica}, actividadReciente:[top10]}

## Notas
- @DateTimeFormat(iso = ISO.DATE) en @RequestParam de LocalDate
- authentication.getName() en controllers para obtener email del JWT
- Duplicado en (medicamento, fecha, turno) lanza BadRequestException 400
- Novedad usa createdAt para filtrar por dia (no fechaHora) en el dashboard
