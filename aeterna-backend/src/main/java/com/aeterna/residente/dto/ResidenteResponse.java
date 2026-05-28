package com.aeterna.residente.dto;

import com.aeterna.residente.EstadoResidente;
import com.aeterna.residente.Residente;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

@Data
@Builder
public class ResidenteResponse {

    private Long id;
    private String nombre;
    private String apellido;
    private String nombreCompleto;
    private LocalDate fechaNacimiento;
    private Integer edad;
    private String dni;
    private String numeroHabitacion;
    private String sector;
    private EstadoResidente estado;
    private String obraSocial;
    private String numeroAfiliado;
    private String contactoFamiliarNombre;
    private String contactoFamiliarTelefono;
    private String observaciones;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ResidenteResponse from(Residente r) {
        int edad = Period.between(r.getFechaNacimiento(), LocalDate.now()).getYears();
        return ResidenteResponse.builder()
                .id(r.getId())
                .nombre(r.getNombre())
                .apellido(r.getApellido())
                .nombreCompleto(r.getApellido() + ", " + r.getNombre())
                .fechaNacimiento(r.getFechaNacimiento())
                .edad(edad)
                .dni(r.getDni())
                .numeroHabitacion(r.getNumeroHabitacion())
                .sector(r.getSector())
                .estado(r.getEstado())
                .obraSocial(r.getObraSocial())
                .numeroAfiliado(r.getNumeroAfiliado())
                .contactoFamiliarNombre(r.getContactoFamiliarNombre())
                .contactoFamiliarTelefono(r.getContactoFamiliarTelefono())
                .observaciones(r.getObservaciones())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
