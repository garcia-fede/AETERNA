package com.aeterna.bienestar.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EstadoCuidadosTurnoResponse {

    private Long residenteId;
    private String residenteNombre;
    private String residenteHabitacion;
    private Boolean registrado;
    private Long bienestarId;
}
