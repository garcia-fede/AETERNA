package com.aeterna.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumenDashboardResponse {

    private long residentesActivos;
    private long tomasPendientesTurno;
    private long tomasAdministradasHoy;
    private long cuidadosRegistradosHoy;
    private long totalNovedadesHoy;
    private NovedadesPorPrioridadDto novedadesPorPrioridad;
    private List<EventoActividadDto> actividadReciente;
    /** Indicadores gerenciales. Solo se completa para el rol ADMIN; null en otros casos. */
    private IndicadoresGestionDto indicadoresGestion;
}
