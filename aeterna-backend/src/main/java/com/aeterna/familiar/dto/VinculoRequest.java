package com.aeterna.familiar.dto;

import com.aeterna.familiar.NivelAcceso;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VinculoRequest {

    @NotNull
    private Long usuarioId;

    @NotNull
    private Long residenteId;

    private String vinculo;

    private NivelAcceso nivelAcceso = NivelAcceso.COMPLETO;
}
