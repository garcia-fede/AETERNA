package com.aeterna.asignacion.dto;

import com.aeterna.asignacion.AsignacionPersonal;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AsignacionResponse {

    private Long id;
    private Long usuarioId;
    private String usuarioEmail;
    private String usuarioNombreCompleto;
    private Long residenteId;
    private String residenteNombre;
    private String residenteApellido;
    private String residenteHabitacion;
    private String residenteSector;
    private LocalDate fechaAsignacion;
    private LocalDateTime createdAt;

    public static AsignacionResponse from(AsignacionPersonal a) {
        return AsignacionResponse.builder()
                .id(a.getId())
                .usuarioId(a.getUsuario().getId())
                .usuarioEmail(a.getUsuario().getEmail())
                .usuarioNombreCompleto(a.getUsuario().getNombre() + " " + a.getUsuario().getApellido())
                .residenteId(a.getResidente().getId())
                .residenteNombre(a.getResidente().getNombre())
                .residenteApellido(a.getResidente().getApellido())
                .residenteHabitacion(a.getResidente().getNumeroHabitacion())
                .residenteSector(a.getResidente().getSector())
                .fechaAsignacion(a.getFechaAsignacion())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
