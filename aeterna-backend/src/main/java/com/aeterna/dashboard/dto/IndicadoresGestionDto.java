package com.aeterna.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Indicadores gerenciales para el rol ADMIN. Es la sección que se muestra
 * debajo del estado operativo del dashboard. Null para roles no-admin.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IndicadoresGestionDto {

    // ── Adherencia a la medicación ──────────────────────────────
    /** % de tomas administradas sobre programadas hoy (0-100). */
    private double adherenciaHoy;
    /** % de tomas omitidas sobre programadas hoy (0-100). */
    private double tasaOmisionHoy;
    /** % de tomas con demora sobre programadas hoy (0-100). */
    private double tasaDemoraHoy;
    /** Tomas programadas hoy (todos los turnos). */
    private long tomasProgramadasHoy;
    /** Serie de adherencia diaria de los últimos 7 días. */
    private List<PuntoTendenciaDto> adherencia7dias;

    // ── Cobertura de cuidados ───────────────────────────────────
    /** % de residentes activos con cuidado registrado en el turno actual (0-100). */
    private double coberturaCuidadosTurno;
    /** Residentes activos sin cuidado registrado en el turno actual. */
    private long residentesSinCuidadoTurno;
    /** Registros de bienestar por día en los últimos 7 días. */
    private List<PuntoTendenciaDto> cuidados7dias;

    // ── Carga del personal ──────────────────────────────────────
    /** Residentes activos por cuidador con asignaciones activas. */
    private double ratioResidentesPorCuidador;
    /** Residentes activos sin ningún cuidador asignado. */
    private long residentesSinAsignar;
    /** Personal (rol PERSONAL) activo sin asignaciones. */
    private long personalSinAsignaciones;
    /** Distribución de residentes asignados por cuidador. */
    private List<CargaCuidadorDto> cargaPorCuidador;
}
