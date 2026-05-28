package com.aeterna.bienestar.dto;

import com.aeterna.bienestar.BienestarDiario;
import com.aeterna.bienestar.EstadoAnimo;
import com.aeterna.bienestar.EstadoComida;
import com.aeterna.medicacion.Turno;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BienestarDiarioResponse {

    private Long id;
    private Long residenteId;
    private String residenteNombre;
    private Long personalId;
    private String personalNombreCompleto;
    private LocalDate fecha;
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
    private Integer hidratacionMl;

    private EstadoAnimo estadoAnimo;

    // Signos vitales
    private Integer presionSistolica;
    private Integer presionDiastolica;
    private BigDecimal temperatura;
    private Integer saturacion;
    private Integer glucemia;
    private BigDecimal peso;

    private String observaciones;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BienestarDiarioResponse from(BienestarDiario b) {
        return BienestarDiarioResponse.builder()
                .id(b.getId())
                .residenteId(b.getResidente().getId())
                .residenteNombre(b.getResidente().getApellido() + ", " + b.getResidente().getNombre())
                .personalId(b.getPersonal().getId())
                .personalNombreCompleto(b.getPersonal().getNombre() + " " + b.getPersonal().getApellido())
                .fecha(b.getFecha())
                .turno(b.getTurno())
                .higieneBanio(b.getHigieneBanio())
                .higieneIntima(b.getHigieneIntima())
                .cambioRopa(b.getCambioRopa())
                .desayuno(b.getDesayuno())
                .almuerzo(b.getAlmuerzo())
                .merienda(b.getMerienda())
                .cena(b.getCena())
                .hidratacionMl(b.getHidratacionMl())
                .estadoAnimo(b.getEstadoAnimo())
                .presionSistolica(b.getPresionSistolica())
                .presionDiastolica(b.getPresionDiastolica())
                .temperatura(b.getTemperatura())
                .saturacion(b.getSaturacion())
                .glucemia(b.getGlucemia())
                .peso(b.getPeso())
                .observaciones(b.getObservaciones())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
