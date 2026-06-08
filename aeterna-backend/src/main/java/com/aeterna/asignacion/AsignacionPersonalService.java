package com.aeterna.asignacion;

import com.aeterna.asignacion.dto.AsignacionResponse;
import com.aeterna.asignacion.dto.PersonalConResidentesResponse;
import com.aeterna.common.exception.BadRequestException;
import com.aeterna.common.exception.NotFoundException;
import com.aeterna.residente.Residente;
import com.aeterna.residente.ResidenteRepository;
import com.aeterna.usuario.Rol;
import com.aeterna.usuario.Usuario;
import com.aeterna.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AsignacionPersonalService {

    private final AsignacionPersonalRepository asignacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final ResidenteRepository residenteRepository;

    @Transactional
    public AsignacionResponse asignar(Long usuarioId, Long residenteId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con id: " + usuarioId));

        if (usuario.getRol() != Rol.PERSONAL) {
            throw new BadRequestException("Solo se pueden asignar residentes a usuarios con rol PERSONAL");
        }

        if (!usuario.getActivo()) {
            throw new BadRequestException("No se puede asignar a un usuario inactivo");
        }

        Residente residente = residenteRepository.findByIdAndActivoTrue(residenteId)
                .orElseThrow(() -> new NotFoundException("Residente no encontrado con id: " + residenteId));

        if (asignacionRepository.existsByUsuarioIdAndResidenteIdAndActivoTrue(usuarioId, residenteId)) {
            throw new BadRequestException("El residente ya está asignado a este personal");
        }

        AsignacionPersonal asignacion = AsignacionPersonal.builder()
                .usuario(usuario)
                .residente(residente)
                .fechaAsignacion(LocalDate.now())
                .activo(true)
                .build();

        return AsignacionResponse.from(asignacionRepository.save(asignacion));
    }

    @Transactional
    public void desasignar(Long usuarioId, Long residenteId) {
        AsignacionPersonal asignacion = asignacionRepository
                .findActivaByUsuarioIdAndResidenteId(usuarioId, residenteId)
                .orElseThrow(() -> new NotFoundException(
                        "No existe asignación activa entre usuario " + usuarioId + " y residente " + residenteId));

        asignacion.setActivo(false);
        asignacionRepository.save(asignacion);
    }

    public List<AsignacionResponse> listarPorPersonal(Long usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new NotFoundException("Usuario no encontrado con id: " + usuarioId);
        }
        return asignacionRepository.findActivasByUsuarioId(usuarioId)
                .stream()
                .map(AsignacionResponse::from)
                .toList();
    }

    public List<PersonalConResidentesResponse> listarTodoElPersonalConResidentes() {
        // Traer todos los usuarios PERSONAL activos
        List<Usuario> personal = usuarioRepository.findAllByRol(Rol.PERSONAL);

        // Traer todas las asignaciones activas en una sola query (evitar N+1)
        List<AsignacionPersonal> todasAsignaciones = asignacionRepository.findAllActivas();

        // Agrupar asignaciones por usuarioId para lookup eficiente
        Map<Long, List<AsignacionPersonal>> asignacionesPorUsuario = new LinkedHashMap<>();
        for (AsignacionPersonal a : todasAsignaciones) {
            asignacionesPorUsuario
                    .computeIfAbsent(a.getUsuario().getId(), k -> new ArrayList<>())
                    .add(a);
        }

        return personal.stream()
                .map(u -> {
                    List<AsignacionPersonal> asignaciones = asignacionesPorUsuario
                            .getOrDefault(u.getId(), List.of());

                    List<PersonalConResidentesResponse.ResidenteAsignadoDto> residentes = asignaciones.stream()
                            .map(a -> PersonalConResidentesResponse.ResidenteAsignadoDto.builder()
                                    .asignacionId(a.getId())
                                    .residenteId(a.getResidente().getId())
                                    .nombre(a.getResidente().getNombre())
                                    .apellido(a.getResidente().getApellido())
                                    .habitacion(a.getResidente().getNumeroHabitacion())
                                    .sector(a.getResidente().getSector())
                                    .build())
                            .toList();

                    return PersonalConResidentesResponse.builder()
                            .usuarioId(u.getId())
                            .nombre(u.getNombre())
                            .apellido(u.getApellido())
                            .email(u.getEmail())
                            .activo(u.getActivo())
                            .residentes(residentes)
                            .build();
                })
                .toList();
    }
}
