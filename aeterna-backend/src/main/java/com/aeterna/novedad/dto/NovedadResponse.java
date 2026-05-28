package com.aeterna.novedad.dto;

import com.aeterna.novedad.Novedad;
import com.aeterna.novedad.PrioridadNovedad;
import com.aeterna.novedad.TipoNovedad;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NovedadResponse {

    private Long id;
    private Long residenteId;
    private String residenteNombre;
    private String residenteHabitacion;
    private Long personalId;
    private String personalNombreCompleto;
    private TipoNovedad tipo;
    private String descripcion;
    private PrioridadNovedad prioridad;
    private Boolean visibleFamiliar;
    private Boolean visibleTurnoEntrante;
    private LocalDateTime fechaHora;
    private LocalDateTime createdAt;

    public static NovedadResponse from(Novedad n) {
        return NovedadResponse.builder()
                .id(n.getId())
                .residenteId(n.getResidente().getId())
                .residenteNombre(n.getResidente().getApellido() + ", " + n.getResidente().getNombre())
                .residenteHabitacion(n.getResidente().getNumeroHabitacion())
                .personalId(n.getPersonal().getId())
                .personalNombreCompleto(n.getPersonal().getNombre() + " " + n.getPersonal().getApellido())
                .tipo(n.getTipo())
                .descripcion(n.getDescripcion())
                .prioridad(n.getPrioridad())
                .visibleFamiliar(n.getVisibleFamiliar())
                .visibleTurnoEntrante(n.getVisibleTurnoEntrante())
                .fechaHora(n.getFechaHora())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
