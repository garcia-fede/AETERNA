package com.aeterna.bienestar.dto;

import com.aeterna.bienestar.EstadoAnimo;
import com.aeterna.bienestar.EstadoComida;
import com.aeterna.medicacion.Turno;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BienestarDiarioRequest {

    @NotNull
    private LocalDate fecha;

    @NotNull
    private Turno turno;

    // Higiene
    private Boolean higieneBanio;
    private Boolean higieneIntima;
    private Boolean cambioRopa;

    // Alimentacion
    private EstadoComida desayuno;
    private EstadoComida almuerzo;
    private EstadoComida merienda;
    private EstadoComida cena;

    @Min(0) @Max(10000)
    private Integer hidratacionMl;

    private EstadoAnimo estadoAnimo;

    // Signos vitales
    @Min(0) @Max(300)
    private Integer presionSistolica;

    @Min(0) @Max(300)
    private Integer presionDiastolica;

    @DecimalMin("30.0") @DecimalMax("45.0")
    private BigDecimal temperatura;

    @Min(0) @Max(100)
    private Integer saturacion;

    @Min(0) @Max(600)
    private Integer glucemia;

    @DecimalMin("0.0") @DecimalMax("300.0")
    private BigDecimal peso;

    private String observaciones;
}
