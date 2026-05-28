package com.aeterna.familiar.dto;

import com.aeterna.familiar.FamiliarResidente;
import com.aeterna.familiar.NivelAcceso;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VinculoResponse {

    private Long id;
    private Long usuarioId;
    private String usuarioEmail;
    private String usuarioNombreCompleto;
    private Long residenteId;
    private String residenteNombre;
    private String residenteApellido;
    private String residenteHabitacion;
    private String vinculo;
    private NivelAcceso nivelAcceso;

    public static VinculoResponse from(FamiliarResidente fr) {
        return VinculoResponse.builder()
                .id(fr.getId())
                .usuarioId(fr.getUsuario().getId())
                .usuarioEmail(fr.getUsuario().getEmail())
                .usuarioNombreCompleto(fr.getUsuario().getNombre() + " " + fr.getUsuario().getApellido())
                .residenteId(fr.getResidente().getId())
                .residenteNombre(fr.getResidente().getNombre())
                .residenteApellido(fr.getResidente().getApellido())
                .residenteHabitacion(fr.getResidente().getNumeroHabitacion())
                .vinculo(fr.getVinculo())
                .nivelAcceso(fr.getNivelAcceso())
                .build();
    }
}
