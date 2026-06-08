package com.aeterna.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Cantidad de residentes asignados a un cuidador. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CargaCuidadorDto {
    private Long usuarioId;
    private String nombre;
    private long residentesAsignados;
}
