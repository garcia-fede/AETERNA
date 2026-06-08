package com.aeterna.familiar.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonalAsignadoResponse {
    private Long id;
    private String nombre;
    private String apellido;
}
