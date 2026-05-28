package com.aeterna.usuario;

import com.aeterna.common.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UsuarioResponse>>> listar(
            @RequestParam(required = false) Rol rol) {
        List<UsuarioResponse> usuarios = usuarioService.listar(rol)
                .stream()
                .map(UsuarioResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(usuarios));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponse>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(UsuarioResponse.from(usuarioService.buscarPorId(id))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioResponse>> crear(@Valid @RequestBody UsuarioRequest request) {
        Usuario creado = usuarioService.crear(
                request.getNombre(),
                request.getApellido(),
                request.getEmail(),
                request.getPassword(),
                request.getRol()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(UsuarioResponse.from(creado), "Usuario creado correctamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateRequest request) {
        Usuario actualizado = usuarioService.actualizarConEmail(
                id,
                request.getNombre(),
                request.getApellido(),
                request.getEmail(),
                request.getRol()
        );
        return ResponseEntity.ok(ApiResponse.ok(UsuarioResponse.from(actualizado)));
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<ApiResponse<Void>> activarDesactivar(
            @PathVariable Long id,
            @RequestParam boolean activo) {
        usuarioService.activarDesactivar(id, activo);
        String msg = activo ? "Usuario activado correctamente" : "Usuario desactivado correctamente";
        return ResponseEntity.ok(ApiResponse.ok(null, msg));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<ApiResponse<Void>> cambiarPassword(
            @PathVariable Long id,
            @Valid @RequestBody CambiarPasswordRequest request) {
        usuarioService.cambiarPassword(id, request.getPasswordNueva());
        return ResponseEntity.ok(ApiResponse.ok(null, "Contraseña actualizada correctamente"));
    }

    // DTOs
    @Data
    static class UsuarioRequest {
        @NotBlank private String nombre;
        @NotBlank private String apellido;
        @NotBlank @Email private String email;
        @NotBlank @Size(min = 8) private String password;
        @NotNull private Rol rol;
    }

    @Data
    static class UsuarioUpdateRequest {
        @NotBlank private String nombre;
        @NotBlank private String apellido;
        @NotBlank @Email private String email;
        @NotNull private Rol rol;
    }

    @Data
    static class CambiarPasswordRequest {
        @NotBlank @Size(min = 8) private String passwordNueva;
    }

    record UsuarioResponse(Long id, String nombre, String apellido, String email, Rol rol,
                           Boolean activo, LocalDateTime createdAt, LocalDateTime updatedAt) {
        static UsuarioResponse from(Usuario u) {
            return new UsuarioResponse(
                    u.getId(), u.getNombre(), u.getApellido(), u.getEmail(),
                    u.getRol(), u.getActivo(), u.getCreatedAt(), u.getUpdatedAt()
            );
        }
    }
}
