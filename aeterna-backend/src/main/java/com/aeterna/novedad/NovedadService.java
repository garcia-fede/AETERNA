package com.aeterna.novedad;

import com.aeterna.common.exception.NotFoundException;
import com.aeterna.novedad.dto.NovedadRequest;
import com.aeterna.novedad.dto.NovedadResponse;
import com.aeterna.residente.Residente;
import com.aeterna.residente.ResidenteRepository;
import com.aeterna.usuario.Usuario;
import com.aeterna.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NovedadService {

    private final NovedadRepository novedadRepository;
    private final ResidenteRepository residenteRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<NovedadResponse> listar(Long residenteId, TipoNovedad tipo, PrioridadNovedad prioridad) {
        return novedadRepository.findConFiltros(residenteId, tipo, prioridad)
                .stream()
                .map(NovedadResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public NovedadResponse crear(NovedadRequest request, String personalEmail) {
        Residente residente = residenteRepository.findByIdAndActivoTrue(request.getResidenteId())
                .orElseThrow(() -> new NotFoundException("Residente no encontrado con id: " + request.getResidenteId()));

        Usuario personal = usuarioRepository.findByEmail(personalEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado: " + personalEmail));

        Novedad novedad = Novedad.builder()
                .residente(residente)
                .personal(personal)
                .tipo(request.getTipo())
                .descripcion(request.getDescripcion())
                .prioridad(request.getPrioridad() != null ? request.getPrioridad() : PrioridadNovedad.MEDIA)
                .visibleFamiliar(request.getVisibleFamiliar() != null ? request.getVisibleFamiliar() : false)
                .visibleTurnoEntrante(request.getVisibleTurnoEntrante() != null ? request.getVisibleTurnoEntrante() : true)
                .fechaHora(request.getFechaHora() != null ? request.getFechaHora() : LocalDateTime.now())
                .build();

        return NovedadResponse.from(novedadRepository.save(novedad));
    }

    @Transactional
    public NovedadResponse actualizarVisibilidad(Long id, Boolean visibleFamiliar, Boolean visibleTurnoEntrante) {
        Novedad novedad = novedadRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Novedad no encontrada con id: " + id));
        if (visibleFamiliar != null) novedad.setVisibleFamiliar(visibleFamiliar);
        if (visibleTurnoEntrante != null) novedad.setVisibleTurnoEntrante(visibleTurnoEntrante);
        return NovedadResponse.from(novedadRepository.save(novedad));
    }

    @Transactional
    public NovedadResponse actualizarPrioridad(Long id, PrioridadNovedad prioridad) {
        Novedad novedad = novedadRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Novedad no encontrada con id: " + id));
        novedad.setPrioridad(prioridad);
        return NovedadResponse.from(novedadRepository.save(novedad));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!novedadRepository.existsById(id)) {
            throw new NotFoundException("Novedad no encontrada con id: " + id);
        }
        novedadRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<NovedadResponse> obtenerPorResidente(Long residenteId) {
        return novedadRepository.findByResidenteFetch(residenteId)
                .stream()
                .map(NovedadResponse::from)
                .collect(Collectors.toList());
    }
}
