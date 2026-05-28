package com.aeterna.residente.dto;

import com.aeterna.residente.EstadoResidente;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ResidenteRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;

    @NotBlank(message = "El DNI es obligatorio")
    private String dni;

    private String numeroHabitacion;

    private String sector;

    private EstadoResidente estado;

    private String obraSocial;

    private String numeroAfiliado;

    private String contactoFamiliarNombre;

    private String contactoFamiliarTelefono;

    private String observaciones;
}
