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

8. **Asignación** — qué residentes tiene asignados un trabajador en un turno.

**Relaciones clave:**
- Usuario (FAMILIAR) → vinculado a 1 Residente
- Residente → tiene 1 Habitación
- Residente → tiene N medicamentos activos
- Residente → tiene N registros de bienestar (uno por turno/día)
- Residente → tiene N novedades
- Personal → tiene N asignaciones de residentes por turno

**Pendiente de confirmar:** estructura exacta de turnos (si es una tabla separada o solo un enum).

Relacionado: [[functional-analysis]]
