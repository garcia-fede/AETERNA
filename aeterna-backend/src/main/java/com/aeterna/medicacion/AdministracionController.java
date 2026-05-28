package com.aeterna.medicacion;

import com.aeterna.common.dto.ApiResponse;
import com.aeterna.medicacion.dto.AdministracionRequest;
import com.aeterna.medicacion.dto.AdministracionResponse;
import com.aeterna.medicacion.dto.TomaPendienteResponse;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/administraciones")
@RequiredArgsConstructor
public class AdministracionController {

    private final AdministracionService administracionService;

    @GetMapping("/turno")
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL')")
    public ResponseEntity<ApiResponse<List<TomaPendienteResponse>>> listarTomasPendientes(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam Turno turno) {
        List<TomaPendienteResponse> tomas = administracionService.listarTomasPendientes(fecha, turno);
        return ResponseEntity.ok(ApiResponse.ok(tomas));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL')")
    public ResponseEntity<ApiResponse<AdministracionResponse>> registrar(
            @Valid @RequestBody AdministracionRequest request,
            Authentication authentication) {
        Administracion creada = administracionService.registrarAdministracion(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(AdministracionResponse.from(creada), "Administración registrada correctamente"));
    }

    @GetMapping("/residentes/{residenteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL', 'FAMILIAR')")
    public ResponseEntity<ApiResponse<List<AdministracionResponse>>> historialPorResidente(
            @PathVariable Long residenteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        List<AdministracionResponse> historial = administracionService.historialPorResidente(residenteId, desde, hasta)
                .stream()
                .map(AdministracionResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(historial));
    }
}
