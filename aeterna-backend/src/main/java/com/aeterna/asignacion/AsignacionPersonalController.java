package com.aeterna.asignacion;

import com.aeterna.asignacion.dto.AsignacionResponse;
import com.aeterna.asignacion.dto.PersonalConResidentesResponse;
import com.aeterna.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asignaciones/personal")
@RequiredArgsConstructor
public class AsignacionPersonalController {

    private final AsignacionPersonalService asignacionPersonalService;

    /**
     * Lista todos los usuarios PERSONAL con sus residentes asignados.
     * Vista de gestión para el ADMIN.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PersonalConResidentesResponse>>> listarPersonalConResidentes() {
        return ResponseEntity.ok(ApiResponse.ok(asignacionPersonalService.listarTodoElPersonalConResidentes()));
    }

    /**
     * Lista los residentes asignados a un miembro del personal específico.
     */
    @GetMapping("/{usuarioId}/residentes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AsignacionResponse>>> listarResidentesPorPersonal(
            @PathVariable Long usuarioId) {
        return ResponseEntity.ok(ApiResponse.ok(asignacionPersonalService.listarPorPersonal(usuarioId)));
    }

    /**
     * Asigna un residente a un miembro del personal.
     */
    @PostMapping("/{usuarioId}/residentes/{residenteId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AsignacionResponse>> asignar(
            @PathVariable Long usuarioId,
            @PathVariable Long residenteId) {
        AsignacionResponse response = asignacionPersonalService.asignar(usuarioId, residenteId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Residente asignado correctamente"));
    }

    /**
     * Desasigna (soft delete) un residente de un miembro del personal.
     */
    @DeleteMapping("/{usuarioId}/residentes/{residenteId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> desasignar(
            @PathVariable Long usuarioId,
            @PathVariable Long residenteId) {
        asignacionPersonalService.desasignar(usuarioId, residenteId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Residente desasignado correctamente"));
    }
}
