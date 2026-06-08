package com.aeterna.asignacion.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PersonalConResidentesResponse {

    private Long usuarioId;
    private String nombre;
    private String apellido;
    private String email;
    private Boolean activo;
    private List<ResidenteAsignadoDto> residentes;

    @Data
    @Builder
    public static class ResidenteAsignadoDto {
        private Long asignacionId;
        private Long residenteId;
        private String nombre;
        private String apellido;
        private String habitacion;
        private String sector;
    }
}
