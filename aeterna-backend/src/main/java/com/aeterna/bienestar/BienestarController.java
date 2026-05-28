package com.aeterna.bienestar;

import com.aeterna.bienestar.dto.BienestarDiarioRequest;
import com.aeterna.bienestar.dto.BienestarDiarioResponse;
import com.aeterna.bienestar.dto.EstadoCuidadosTurnoResponse;
import com.aeterna.common.dto.ApiResponse;
import com.aeterna.medicacion.Turno;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bienestar")
@RequiredArgsConstructor
public class BienestarController {

    private final BienestarDiarioService bienestarService;

    @GetMapping("/turno")
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL')")
    public ResponseEntity<ApiResponse<List<EstadoCuidadosTurnoResponse>>> estadoCuidadosTurno(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam Turno turno) {
        List<EstadoCuidadosTurnoResponse> estado = bienestarService.listarEstadoCuidadosTurno(fecha, turno);
        return ResponseEntity.ok(ApiResponse.ok(estado));
    }

    @GetMapping("/residentes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL', 'FAMILIAR')")
    public ResponseEntity<ApiResponse<BienestarDiarioResponse>> obtenerPorResidente(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam Turno turno) {
        BienestarDiarioResponse response = bienestarService.obtenerOTraerNull(id, fecha, turno);
        if (response == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Sin registro para ese turno"));
        }
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/residentes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL')")
    public ResponseEntity<ApiResponse<BienestarDiarioResponse>> guardar(
            @PathVariable Long id,
            @Valid @RequestBody BienestarDiarioRequest request,
            Authentication authentication) {
        BienestarDiarioResponse response = bienestarService.guardar(id, request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Registro guardado correctamente"));
    }

    @GetMapping("/residentes/{id}/historial")
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL', 'FAMILIAR')")
    public ResponseEntity<ApiResponse<List<BienestarDiarioResponse>>> historial(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        List<BienestarDiarioResponse> historial = bienestarService.historialPorResidente(id, desde, hasta);
        return ResponseEntity.ok(ApiResponse.ok(historial));
    }
}
