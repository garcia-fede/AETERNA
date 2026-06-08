---
name: domain-entities
description: Entidades de dominio confirmadas del PDF de presentación AETERNA
metadata:
  type: project
---

**Entidades principales identificadas en el PDF:**

1. **Usuario** — personal del geriátrico y familiares. Tiene rol, email, estado activo/inactivo.
   - Roles confirmados: ADMIN, PERSONAL (enfermero/jefe), FAMILIAR
   - El familiar tiene vínculo con un residente específico y nivel de acceso (completo / solo lectura / limitado)

2. **Residente** — persona alojada en el geriátrico. Tiene nombre, edad, habitación, sector, estado actual, médico asignado, obra social, diagnósticos al ingreso, alergias, dieta.

3. **Habitación** — tiene número, sector (Ala Norte, Ala Sur, etc.), estado.

4. **Medicación / Plan farmacológico** — medicamentos activos por residente. Cada item tiene: medicamento, dosis, vía, frecuencia, horario. Se registra administración (hora, quién administró, observaciones, estado: administrada/omitida/con demora).

5. **Bienestar diario** — registro de cuidados diarios: higiene (baño, higiene íntima, cambio de ropa), alimentación (desayuno/almuerzo/merienda/cena con estado: completo/parcial/rechazado), hidratación (ml), estado de ánimo (triste/entristecido/neutral/tranquilo/animado), controles vitales (presión, temperatura, saturación, glucemia, peso).

6. **Novedad / Incidencia** — evento registrado sobre un residente. Tiene tipo (incidencia clínica, falta de insumo, observación general, caída/accidente, visita médica, cambio de estado), descripción, prioridad (baja/media/alta/crítica), visibilidad (cronología interna / portal familiar / turno entrante / médico de cabecera), adjuntos.

7. **Turno** — turno de trabajo del personal. Mañana 06:00-14:00, Tarde 14:00-22:00, Noche 22:00-06:00 (inferido de los prototipos).

8. **AsignacionPersonal** — tabla `asignaciones_personal`, vincula Usuario (PERSONAL) con Residente.
   - Campos: id, usuario_id (FK), residente_id (FK), fecha_asignacion, activo (boolean, soft delete), created_at
   - Constraint unique: (usuario_id, residente_id)
   - Rol validado en service: solo acepta usuarios con rol PERSONAL
   - Soft delete: `activo = false` al desasignar (no se borra el registro)
   - Ubicación backend: paquete `com.aeterna.asignacion`
   - DTOs: `AsignacionResponse`, `PersonalConResidentesResponse` (con inner class `ResidenteAsignadoDto`)

**Relaciones clave:**
- Usuario (FAMILIAR) → vinculado a 1 Residente via `familiar_residente`
- Usuario (PERSONAL) → vinculado a N Residentes via `asignaciones_personal`
- Residente → tiene 1 Habitación
- Residente → tiene N medicamentos activos
- Residente → tiene N registros de bienestar (uno por turno/día)
- Residente → tiene N novedades
- Personal → tiene N asignaciones de residentes

**Lógica de filtrado en ResidenteService.listarActivos():**
- Si rol == PERSONAL: devuelve solo los residentes con asignación activa
- Si rol == ADMIN: devuelve todos los activos (sin filtro)
- Usa SecurityContextHolder para obtener el email del usuario autenticado

**Seeds de personal:**
- `enfermero@aeterna.com / Personal123!` (Marcos Rodríguez) — asignado a residentes 0 y 1
- `enfermera@aeterna.com / Personal123!` (Laura Sánchez) — asignada a residente 2

**Pendiente de confirmar:** estructura exacta de turnos (si es una tabla separada o solo un enum). Confirmado que `Turno` es un enum: MANIANA, TARDE, NOCHE.

Relacionado: [[functional-analysis]], [[project-iteracion1]]
