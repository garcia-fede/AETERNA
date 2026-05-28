---
name: architecture-decisions
description: Decisiones arquitectonicas clave tomadas en AETERNA y su justificacion
metadata:
  type: project
---

## Estructura de paquetes backend
Modular por dominio flat (no Clean Architecture con capas separadas): todo en com.aeterna.<modulo>/ con Entity, Repository, Service, Controller, dto/ al mismo nivel. Simple y efectivo para el scope del proyecto.

## Lazy loading — fetch joins obligatorios
Todas las entidades con relaciones @ManyToOne(LAZY) deben tener @Query con JOIN FETCH cuando el Response DTO accede a la relacion. Decisiones tomadas:
- MedicamentoRepository.findByResidenteIdAndActivoTrue: JOIN FETCH m.residente
- MedicamentoRepository.findActivosPorTurno: JOIN FETCH m.residente
- AdministracionRepository.findByFechaAndTurno: JOIN FETCH a.medicamento, m.residente
- AdministracionRepository.findHistorialPorResidente: JOIN FETCH todo
**Why**: LazyInitializationException en produccion si se accede a proxies fuera de sesion JPA activa.

## @Transactional en service
- Metodos de lectura con JOIN: @Transactional(readOnly = true)
- Metodos de escritura: @Transactional
- Controllers: sin @Transactional (solo HTTP)

## ElementCollection para enums SET
Medicamento.horariosTurnos usa @ElementCollection con tabla medicamento_turnos. El Set debe ser mutable (new HashSet<>()) para que Hibernate pueda operar. Set.of() produce Set inmutable — NUNCA usar directamente en builders para campos @ElementCollection.

## Cache frontend (React Query staleTime)
- Residentes: 2 min (cambian poco)
- Medicamentos por residente: 1 min
- Tomas del turno (tablero): 30s + refetchInterval 60s (dato operativo critico)
- Historial administraciones: 30s, enabled solo cuando modal abierto
- Invalidacion explicita con queryClient.invalidateQueries tras mutaciones

## Roles en sidebar (Layout.tsx)
NavItem tiene propiedad opcional roles?: Rol[]. Si roles no esta definido, el item es visible para todos los roles autenticados. El filtro se hace en render, no en rutas.

## Why
Decisiones orientadas a simplicidad maxima sin sacrificar correctitud. El proyecto es de seminario pero con estandares de produccion.

## How to apply
Antes de agregar cualquier nueva entidad con relaciones LAZY, verificar que las queries tienen JOIN FETCH donde se necesite.
