package com.aeterna.novedad;

import com.aeterna.common.dto.ApiResponse;
import com.aeterna.novedad.dto.NovedadRequest;
import com.aeterna.novedad.dto.NovedadResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/novedades")
@RequiredArgsConstructor
public class NovedadController {

    private final NovedadService novedadService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL')")
    public ResponseEntity<ApiResponse<List<NovedadResponse>>> listar(
            @RequestParam(required = false) Long residenteId,
            @RequestParam(required = false) TipoNovedad tipo,
            @RequestParam(required = false) PrioridadNovedad prioridad) {
        return ResponseEntity.ok(ApiResponse.ok(novedadService.listar(residenteId, tipo, prioridad)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL')")
    public ResponseEntity<ApiResponse<NovedadResponse>> crear(
            @Valid @RequestBody NovedadRequest request,
            Authentication authentication) {
        NovedadResponse response = novedadService.crear(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Novedad creada correctamente"));
    }

    @PatchMapping("/{id}/visibilidad")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NovedadResponse>> actualizarVisibilidad(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean visibleFamiliar,
            @RequestParam(required = false) Boolean visibleTurnoEntrante) {
        return ResponseEntity.ok(ApiResponse.ok(novedadService.actualizarVisibilidad(id, visibleFamiliar, visibleTurnoEntrante)));
    }

    @PatchMapping("/{id}/prioridad")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NovedadResponse>> actualizarPrioridad(
            @PathVariable Long id,
            @RequestParam PrioridadNovedad prioridad) {
        return ResponseEntity.ok(ApiResponse.ok(novedadService.actualizarPrioridad(id, prioridad)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        novedadService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Novedad eliminada"));
    }

    @GetMapping("/residentes/{residenteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL', 'FAMILIAR')")
    public ResponseEntity<ApiResponse<List<NovedadResponse>>> porResidente(@PathVariable Long residenteId) {
        return ResponseEntity.ok(ApiResponse.ok(novedadService.obtenerPorResidente(residenteId)));
    }
}
