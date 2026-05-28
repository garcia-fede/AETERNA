package com.aeterna.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NovedadesPorPrioridadDto {

    private Long baja;
    private Long media;
    private Long alta;
    private Long critica;
}
