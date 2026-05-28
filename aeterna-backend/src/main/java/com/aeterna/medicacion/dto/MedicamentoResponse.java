package com.aeterna.medicacion.dto;

import com.aeterna.medicacion.Medicamento;
import com.aeterna.medicacion.Turno;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class MedicamentoResponse {

    private Long id;
    private Long residenteId;
    private String residenteNombre;
    private String nombreMedicamento;
    private String dosis;
    private String via;
    private String frecuencia;
    private Set<Turno> horariosTurnos;
    private String observaciones;
    private Boolean activo;
    private LocalDate desde;
    private LocalDateTime createdAt;

    public static MedicamentoResponse from(Medicamento m) {
        return MedicamentoResponse.builder()
                .id(m.getId())
                .residenteId(m.getResidente().getId())
                .residenteNombre(m.getResidente().getApellido() + ", " + m.getResidente().getNombre())
                .nombreMedicamento(m.getNombreMedicamento())
                .dosis(m.getDosis())
                .via(m.getVia())
                .frecuencia(m.getFrecuencia())
                .horariosTurnos(m.getHorariosTurnos())
                .observaciones(m.getObservaciones())
                .activo(m.getActivo())
                .desde(m.getDesde())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
