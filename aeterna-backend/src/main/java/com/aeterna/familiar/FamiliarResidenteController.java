package com.aeterna.familiar;

import com.aeterna.common.dto.ApiResponse;
import com.aeterna.familiar.dto.PersonalAsignadoResponse;
import com.aeterna.familiar.dto.VinculoRequest;
import com.aeterna.familiar.dto.VinculoResponse;
import com.aeterna.residente.dto.ResidenteResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/familiares")
@RequiredArgsConstructor
public class FamiliarResidenteController {

    private final FamiliarResidenteService familiarResidenteService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VinculoResponse>> vincular(@Valid @RequestBody VinculoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(familiarResidenteService.vincular(request), "Vínculo creado correctamente"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> desvincular(@PathVariable Long id) {
        familiarResidenteService.desvincular(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Vínculo eliminado correctamente"));
    }

    @GetMapping("/residentes/{residenteId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<VinculoResponse>>> listarPorResidente(@PathVariable Long residenteId) {
        return ResponseEntity.ok(ApiResponse.ok(familiarResidenteService.listarPorResidente(residenteId)));
    }

    @GetMapping("/mi-residente")
    @PreAuthorize("hasRole('FAMILIAR')")
    public ResponseEntity<ApiResponse<ResidenteResponse>> miResidente(Authentication authentication) {
        ResidenteResponse response = ResidenteResponse.from(
                familiarResidenteService.obtenerResidenteDeFamiliar(authentication.getName())
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/personal-asignado")
    @PreAuthorize("hasRole('FAMILIAR')")
    public ResponseEntity<ApiResponse<List<PersonalAsignadoResponse>>> personalAsignado(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(
                familiarResidenteService.listarPersonalAsignado(authentication.getName())
        ));
    }
}
