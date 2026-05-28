package com.aeterna.bienestar;

import com.aeterna.bienestar.dto.BienestarDiarioRequest;
import com.aeterna.bienestar.dto.BienestarDiarioResponse;
import com.aeterna.bienestar.dto.EstadoCuidadosTurnoResponse;
import com.aeterna.common.exception.NotFoundException;
import com.aeterna.medicacion.Turno;
import com.aeterna.residente.Residente;
import com.aeterna.residente.ResidenteRepository;
import com.aeterna.usuario.Usuario;
import com.aeterna.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BienestarDiarioService {

    private final BienestarDiarioRepository bienestarRepository;
    private final ResidenteRepository residenteRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public BienestarDiarioResponse obtenerOTraerNull(Long residenteId, LocalDate fecha, Turno turno) {
        return bienestarRepository.findByResidenteIdAndFechaAndTurno(residenteId, fecha, turno)
                .map(BienestarDiarioResponse::from)
                .orElse(null);
    }

    @Transactional
    public BienestarDiarioResponse guardar(Long residenteId, BienestarDiarioRequest request, String personalEmail) {
        Residente residente = residenteRepository.findByIdAndActivoTrue(residenteId)
                .orElseThrow(() -> new NotFoundException("Residente no encontrado con id: " + residenteId));

        Usuario personal = usuarioRepository.findByEmail(personalEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado: " + personalEmail));

        Optional<BienestarDiario> existente = bienestarRepository
                .findByResidenteIdAndFechaAndTurno(residenteId, request.getFecha(), request.getTurno());

        BienestarDiario registro;
        if (existente.isPresent()) {
            registro = existente.get();
            registro.setPersonal(personal);
            aplicarCampos(registro, request);
        } else {
            registro = BienestarDiario.builder()
                    .residente(residente)
                    .personal(personal)
                    .fecha(request.getFecha())
                    .turno(request.getTurno())
                    .build();
            aplicarCampos(registro, request);
        }

        return BienestarDiarioResponse.from(bienestarRepository.save(registro));
    }

    @Transactional(readOnly = true)
    public List<EstadoCuidadosTurnoResponse> listarEstadoCuidadosTurno(LocalDate fecha, Turno turno) {
        List<Residente> residentes = residenteRepository.findAllByActivoTrue();

        List<BienestarDiario> registros = bienestarRepository.findByFechaAndTurnoFetch(fecha, turno);

        Map<Long, BienestarDiario> registroPorResidente = registros.stream()
                .collect(Collectors.toMap(
                        b -> b.getResidente().getId(),
                        b -> b,
                        (b1, b2) -> b1
                ));

        return residentes.stream()
                .map(r -> {
                    BienestarDiario registro = registroPorResidente.get(r.getId());
                    return EstadoCuidadosTurnoResponse.builder()
                            .residenteId(r.getId())
                            .residenteNombre(r.getApellido() + ", " + r.getNombre())
                            .residenteHabitacion(r.getNumeroHabitacion())
                            .registrado(registro != null)
                            .bienestarId(registro != null ? registro.getId() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BienestarDiarioResponse> historialPorResidente(Long residenteId, LocalDate desde, LocalDate hasta) {
        return bienestarRepository.findByResidenteAndRango(residenteId, desde, hasta)
                .stream()
                .map(BienestarDiarioResponse::from)
                .collect(Collectors.toList());
    }

    private void aplicarCampos(BienestarDiario b, BienestarDiarioRequest req) {
        if (req.getHigieneBanio() != null) b.setHigieneBanio(req.getHigieneBanio());
        if (req.getHigieneIntima() != null) b.setHigieneIntima(req.getHigieneIntima());
        if (req.getCambioRopa() != null) b.setCambioRopa(req.getCambioRopa());
        b.setDesayuno(req.getDesayuno());
        b.setAlmuerzo(req.getAlmuerzo());
        b.setMerienda(req.getMerienda());
        b.setCena(req.getCena());
        b.setHidratacionMl(req.getHidratacionMl());
        b.setEstadoAnimo(req.getEstadoAnimo());
        b.setPresionSistolica(req.getPresionSistolica());
        b.setPresionDiastolica(req.getPresionDiastolica());
        b.setTemperatura(req.getTemperatura());
        b.setSaturacion(req.getSaturacion());
        b.setGlucemia(req.getGlucemia());
        b.setPeso(req.getPeso());
        b.setObservaciones(req.getObservaciones());
    }
}
