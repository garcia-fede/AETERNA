package com.aeterna.novedad.dto;

import com.aeterna.novedad.PrioridadNovedad;
import com.aeterna.novedad.TipoNovedad;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NovedadRequest {

    @NotNull
    private Long residenteId;

    @NotNull
    private TipoNovedad tipo;

    @NotBlank
    private String descripcion;

    private PrioridadNovedad prioridad;

    private Boolean visibleFamiliar;

    private Boolean visibleTurnoEntrante;

    private LocalDateTime fechaHora;
}
