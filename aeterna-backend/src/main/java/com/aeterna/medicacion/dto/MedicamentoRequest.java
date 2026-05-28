package com.aeterna.medicacion.dto;

import com.aeterna.medicacion.Turno;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class MedicamentoRequest {

    @NotBlank(message = "El nombre del medicamento es obligatorio")
    private String nombreMedicamento;

    private String dosis;

    private String via;

    private String frecuencia;

    @NotEmpty(message = "Debe seleccionar al menos un turno")
    private Set<Turno> horariosTurnos;

    private String observaciones;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate desde;
}
