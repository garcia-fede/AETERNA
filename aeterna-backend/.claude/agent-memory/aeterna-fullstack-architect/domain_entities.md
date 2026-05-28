---
name: domain-entities
description: Entidades del dominio AETERNA, tablas, relaciones y campos clave
metadata:
  type: project
---

## Iteracion 1

### Usuario (tabla: usuarios)
id, nombre, apellido, email (unique), passwordHash, rol (Rol enum), activo, createdAt, updatedAt
Roles: ADMIN, PERSONAL, FAMILIAR

### Residente (tabla: residentes)
id, nombre, apellido, fechaNacimiento, dni (unique), numeroHabitacion, sector, estado (EstadoResidente enum), obraSocial, numeroAfiliado, contactoFamiliarNombre, contactoFamiliarTelefono, observaciones (TEXT), activo, createdAt, updatedAt
EstadoResidente: ACTIVO, INTERNADO, HOSPITALIZADO, ALTA, FALLECIDO

## Iteracion 2

### Medicamento (tabla: medicamentos_residente)
id, residente_id (FK->residentes LAZY), nombreMedicamento (150), dosis (50), via (50), frecuencia (150), observaciones (TEXT), activo, desde (LocalDate), createdAt, updatedAt
horariosTurnos: @ElementCollection en tabla medicamento_turnos (medicamento_id, turno)

### Administracion (tabla: administraciones_medicacion)
id, medicamento_id (FK->medicamentos_residente LAZY), personal_id (FK->usuarios LAZY), fecha (LocalDate), fechaHora (LocalDateTime), turno (Turno enum), estado (EstadoAdministracion enum), observaciones (TEXT), createdAt

### Enums modulo medicacion
Turno: MANIANA, TARDE, NOCHE
EstadoAdministracion: ADMINISTRADA, OMITIDA, CON_DEMORA

## Iteracion 3

### BienestarDiario (tabla: bienestar_diario)
id, residente_id (FK LAZY), personal_id (FK LAZY), fecha (LocalDate), turno (Turno enum)
Higiene: higieneBanio, higieneIntima, cambioRopa (Boolean, default false)
Alimentacion: desayuno, almuerzo, merienda, cena (EstadoComida enum, nullable)
hidratacionMl (Integer nullable), estadoAnimo (EstadoAnimo enum nullable)
Vitales: presionSistolica, presionDiastolica, saturacion, glucemia (Integer nullable), temperatura (BigDecimal 4,1), peso (BigDecimal 5,2)
observaciones (TEXT), createdAt, updatedAt
UniqueConstraint: (residente_id, fecha, turno) — un registro por turno por residente
Turno reusado de com.aeterna.medicacion.Turno

### Novedad (tabla: novedades)
id, residente_id (FK LAZY), personal_id (FK LAZY)
tipo (TipoNovedad enum), descripcion (TEXT), prioridad (PrioridadNovedad, default MEDIA)
visibleFamiliar (Boolean, default false), visibleTurnoEntrante (Boolean, default true)
fechaHora (LocalDateTime), createdAt
Hard delete (MVP — las novedades erroneas se borran)

### Enums modulo bienestar
EstadoComida: COMPLETO, PARCIAL, RECHAZADO, NO_APLICA
EstadoAnimo: TRISTE, ENTRISTECIDO, NEUTRAL, TRANQUILO, ANIMADO

### Enums modulo novedad
TipoNovedad: INCIDENCIA_CLINICA, FALTA_INSUMO, OBSERVACION, CAIDA_ACCIDENTE, VISITA_MEDICA, CAMBIO_ESTADO
PrioridadNovedad: BAJA, MEDIA, ALTA, CRITICA

## Iteracion 4

### FamiliarResidente (tabla: familiar_residente)
id, usuario_id (FK->usuarios LAZY, not null), residente_id (FK->residentes LAZY, not null)
vinculo (VARCHAR 50, nullable), nivelAcceso (NivelAcceso enum, default COMPLETO), createdAt
UniqueConstraint: (usuario_id, residente_id)
NivelAcceso: COMPLETO, SOLO_LECTURA, LIMITADO (MVP: los 3 ven lo mismo en frontend, guardado como metadato)
Repo: findByUsuarioIdFetch, findByResidenteIdFetch, findFirstByUsuarioId, existsByUsuarioIdAndResidenteId

### Usuario — ampliaciones Iteracion 4
UsuarioService ampliado con: listar(rol), crear, actualizarConEmail, activarDesactivar, cambiarPassword
UsuarioController: GET /api/usuarios?rol=, GET /{id}, POST, PUT /{id}, PATCH /{id}/activo, PATCH /{id}/password
UsuarioRepository: +findAllByRol(Rol)

## Seeds existentes (post-Iteracion 4)
- admin@aeterna.com / Admin123! (Rol.ADMIN)
- 3 residentes: Gonzalez hab 101, Fernandez hab 102, Martinez hab 205
- 5 medicamentos: Enalapril+Paracetamol(Gonzalez), Metformina+Atorvastatina(Fernandez), Omeprazol(Martinez)
- 3 registros BienestarDiario para hoy (Gonzalez y Fernandez turno MANIANA, Martinez turno TARDE)
- 4 novedades de ejemplo con tipos y prioridades variados

## Seeds existentes (post-Iteracion 4)
- admin@aeterna.com / Admin123! (Rol.ADMIN)
- maria.gonzalez@familia.com / Familiar123! (Rol.FAMILIAR, vinculada a residente Gonzalez, vinculo="Hija", nivelAcceso=COMPLETO)
- 3 residentes + medicamentos + bienestar + novedades (idem iteracion 3)
- Residente Gonzalez tiene al menos 2 novedades con visibleFamiliar=true (INCIDENCIA_CLINICA y VISITA_MEDICA "Visita medica de control...")
