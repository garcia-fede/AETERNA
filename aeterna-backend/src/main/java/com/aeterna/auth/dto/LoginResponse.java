package com.aeterna.auth.dto;

import com.aeterna.usuario.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {

    private String token;
    private Long userId;
    private String nombre;
    private String apellido;
    private String email;
    private Rol rol;
}
