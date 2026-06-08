package com.aeterna.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Un punto de una serie temporal (ej. adherencia o cuidados por día). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PuntoTendenciaDto {
    private LocalDate fecha;
    private double valor;
}
