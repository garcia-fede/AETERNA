package com.aeterna.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventoActividadDto {

    private String tipo;
    private String titulo;
    private String residenteNombre;
    private String residenteHabitacion;
    private String usuarioNombre;
    private LocalDateTime fechaHora;
    private String prioridad;
    private String estado;
}
