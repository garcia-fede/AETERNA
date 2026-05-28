package com.aeterna.residente;

import com.aeterna.common.dto.ApiResponse;
import com.aeterna.residente.dto.ResidenteRequest;
import com.aeterna.residente.dto.ResidenteResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/residentes")
@RequiredArgsConstructor
public class ResidenteController {

    private final ResidenteService residenteService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL', 'FAMILIAR')")
    public ResponseEntity<ApiResponse<List<ResidenteResponse>>> listar() {
        List<ResidenteResponse> residentes = residenteService.listarActivos()
                .stream()
                .map(ResidenteResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(residentes));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL', 'FAMILIAR')")
    public ResponseEntity<ApiResponse<ResidenteResponse>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(ResidenteResponse.from(residenteService.buscarPorId(id))));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResidenteResponse>> crear(@Valid @RequestBody ResidenteRequest request) {
        Residente creado = residenteService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(ResidenteResponse.from(creado), "Residente creado correctamente"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResidenteResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ResidenteRequest request) {
        Residente actualizado = residenteService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok(ResidenteResponse.from(actualizado), "Residente actualizado correctamente"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        residenteService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Residente dado de baja correctamente"));
    }
}
