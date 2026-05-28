package com.aeterna.dashboard;

import com.aeterna.common.dto.ApiResponse;
import com.aeterna.dashboard.dto.ResumenDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL')")
    public ResponseEntity<ApiResponse<ResumenDashboardResponse>> obtenerResumen() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.obtenerResumen()));
    }
}
