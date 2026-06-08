package com.aeterna.medicacion;

import com.aeterna.asignacion.AsignacionPersonalRepository;
import com.aeterna.common.exception.BadRequestException;
import com.aeterna.common.exception.NotFoundException;
import com.aeterna.medicacion.dto.AdministracionRequest;
import com.aeterna.medicacion.dto.TomaPendienteResponse;
import com.aeterna.usuario.Rol;
import com.aeterna.usuario.Usuario;
import com.aeterna.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdministracionService {

    private final AdministracionRepository administracionRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AsignacionPersonalRepository asignacionPersonalRepository;

    @Transactional(readOnly = true)
    public List<TomaPendienteResponse> listarTomasPendientes(LocalDate fecha, Turno turno) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Usuario usuario = usuarioRepository.findByEmail(auth.getName()).orElse(null);

        List<Medicamento> medicamentos;
        if (usuario != null && usuario.getRol() == Rol.PERSONAL) {
            List<Long> residenteIds = asignacionPersonalRepository.findActivasByUsuarioId(usuario.getId())
                    .stream().map(a -> a.getResidente().getId()).toList();
            medicamentos = residenteIds.isEmpty()
                    ? List.of()
                    : medicamentoRepository.findActivosPorTurnoYResidentes(turno, residenteIds);
        } else {
            medicamentos = medicamentoRepository.findActivosPorTurno(turno);
        }

        List<Administracion> administraciones = administracionRepository.findByFechaAndTurno(fecha, turno);

        Map<Long, Administracion> adminPorMedicamento = administraciones.stream()
                .collect(Collectors.toMap(
                        a -> a.getMedicamento().getId(),
                        a -> a,
                        (a1, a2) -> a1
                ));

        return medicamentos.stream()
                .map(m -> {
                    Administracion admin = adminPorMedicamento.get(m.getId());
                    return TomaPendienteResponse.builder()
                            .medicamentoId(m.getId())
                            .residenteId(m.getResidente().getId())
                            .residenteNombre(m.getResidente().getApellido() + ", " + m.getResidente().getNombre())
                            .residenteHabitacion(m.getResidente().getNumeroHabitacion())
                            .nombreMedicamento(m.getNombreMedicamento())
                            .dosis(m.getDosis())
                            .via(m.getVia())
                            .frecuencia(m.getFrecuencia())
                            .observacionesMedicamento(m.getObservaciones())
                            .estadoActual(admin != null ? admin.getEstado() : null)
                            .administracionId(admin != null ? admin.getId() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public Administracion registrarAdministracion(AdministracionRequest request, String personalEmail) {
        Medicamento medicamento = medicamentoRepository.findById(request.getMedicamentoId())
                .orElseThrow(() -> new NotFoundException("Medicamento no encontrado con id: " + request.getMedicamentoId()));

        if (!medicamento.getActivo()) {
            throw new BadRequestException("El medicamento no está activo");
        }

        LocalDateTime fechaHoraAdmin = request.getFechaHora() != null ? request.getFechaHora() : LocalDateTime.now();
        LocalDate fechaAdmin = fechaHoraAdmin.toLocalDate();

        administracionRepository.findByMedicamentoIdAndFechaAndTurno(
                request.getMedicamentoId(), fechaAdmin, request.getTurno()
        ).ifPresent(a -> {
            throw new BadRequestException("Ya se registró una administración para este medicamento en este turno");
        });

        Usuario personal = usuarioRepository.findByEmail(personalEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado: " + personalEmail));

        Administracion administracion = Administracion.builder()
                .medicamento(medicamento)
                .personal(personal)
                .fecha(fechaAdmin)
                .fechaHora(fechaHoraAdmin)
                .turno(request.getTurno())
                .estado(request.getEstado())
                .observaciones(request.getObservaciones())
                .build();

        return administracionRepository.save(administracion);
    }

    public List<Administracion> historialPorResidente(Long residenteId, LocalDate desde, LocalDate hasta) {
        return administracionRepository.findHistorialPorResidente(residenteId, desde, hasta);
    }
}
