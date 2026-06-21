package com.aeterna.auth;

import com.aeterna.common.dto.ApiResponse;
import com.aeterna.usuario.Usuario;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints públicos (sin autenticación) para que un usuario establezca su
 * contraseña a partir del link de invitación recibido por email.
 */
@RestController
@RequestMapping("/api/auth/reset-password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    /** Valida que el token siga siendo usable y devuelve datos básicos del usuario. */
    @GetMapping("/validar")
    public ResponseEntity<ApiResponse<TokenInfoResponse>> validar(@RequestParam String token) {
        Usuario usuario = passwordResetService.validarToken(token);
        return ResponseEntity.ok(ApiResponse.ok(
                new TokenInfoResponse(usuario.getNombre(), usuario.getApellido(), usuario.getEmail())));
    }

    /** Establece la nueva contraseña usando el token. */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> restablecer(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.restablecer(request.getToken(), request.getPasswordNueva());
        return ResponseEntity.ok(ApiResponse.ok(null, "Contraseña establecida correctamente"));
    }

    @Data
    static class ResetPasswordRequest {
        @NotBlank private String token;
        @NotBlank @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        private String passwordNueva;
    }

    record TokenInfoResponse(String nombre, String apellido, String email) {}
}
