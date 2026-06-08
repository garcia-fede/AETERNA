package com.aeterna.medicacion.dto;

import com.aeterna.medicacion.EstadoAdministracion;
import com.aeterna.medicacion.Turno;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdministracionRequest {

    @NotNull(message = "El medicamento es obligatorio")
    private Long medicamentoId;

    @NotNull(message = "El estado es obligatorio")
    private EstadoAdministracion estado;

    @NotNull(message = "El turno es obligatorio")
    private Turno turno;

    private String observaciones;

    private LocalDateTime fechaHora;
}
