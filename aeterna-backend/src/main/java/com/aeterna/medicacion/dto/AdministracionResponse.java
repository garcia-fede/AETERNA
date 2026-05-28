package com.aeterna.medicacion.dto;

import com.aeterna.medicacion.Administracion;
import com.aeterna.medicacion.EstadoAdministracion;
import com.aeterna.medicacion.Turno;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AdministracionResponse {

    private Long id;
    private Long medicamentoId;
    private String nombreMedicamento;
    private String dosis;
    private Long residenteId;
    private String residenteNombre;
    private Long personalId;
    private String personalNombreCompleto;
    private LocalDate fecha;
    private LocalDateTime fechaHora;
    private Turno turno;
    private EstadoAdministracion estado;
    private String observaciones;

    public static AdministracionResponse from(Administracion a) {
        return AdministracionResponse.builder()
                .id(a.getId())
                .medicamentoId(a.getMedicamento().getId())
                .nombreMedicamento(a.getMedicamento().getNombreMedicamento())
                .dosis(a.getMedicamento().getDosis())
                .residenteId(a.getMedicamento().getResidente().getId())
                .residenteNombre(a.getMedicamento().getResidente().getApellido() + ", " + a.getMedicamento().getResidente().getNombre())
                .personalId(a.getPersonal().getId())
                .personalNombreCompleto(a.getPersonal().getNombre() + " " + a.getPersonal().getApellido())
                .fecha(a.getFecha())
                .fechaHora(a.getFechaHora())
                .turno(a.getTurno())
                .estado(a.getEstado())
                .observaciones(a.getObservaciones())
                .build();
    }
}
