package com.aeterna.medicacion;

import com.aeterna.common.dto.ApiResponse;
import com.aeterna.medicacion.dto.MedicamentoRequest;
import com.aeterna.medicacion.dto.MedicamentoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class MedicamentoController {

    private final MedicamentoService medicamentoService;

    @GetMapping("/api/residentes/{residenteId}/medicamentos")
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL', 'FAMILIAR')")
    public ResponseEntity<ApiResponse<List<MedicamentoResponse>>> listarPorResidente(
            @PathVariable Long residenteId) {
        List<MedicamentoResponse> lista = medicamentoService.listarPorResidente(residenteId)
                .stream()
                .map(MedicamentoResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(lista));
    }

    @PostMapping("/api/residentes/{residenteId}/medicamentos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MedicamentoResponse>> crear(
            @PathVariable Long residenteId,
            @Valid @RequestBody MedicamentoRequest request) {
        Medicamento creado = medicamentoService.crear(residenteId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MedicamentoResponse.from(creado), "Medicamento creado correctamente"));
    }

    @PutMapping("/api/medicamentos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MedicamentoResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody MedicamentoRequest request) {
        Medicamento actualizado = medicamentoService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok(MedicamentoResponse.from(actualizado), "Medicamento actualizado correctamente"));
    }

    @DeleteMapping("/api/medicamentos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> darDeBaja(@PathVariable Long id) {
        medicamentoService.darDeBaja(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Medicamento dado de baja correctamente"));
    }
}
