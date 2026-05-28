package com.aeterna.familiar;

import com.aeterna.common.exception.BadRequestException;
import com.aeterna.common.exception.NotFoundException;
import com.aeterna.familiar.dto.VinculoRequest;
import com.aeterna.familiar.dto.VinculoResponse;
import com.aeterna.residente.Residente;
import com.aeterna.residente.ResidenteRepository;
import com.aeterna.usuario.Rol;
import com.aeterna.usuario.Usuario;
import com.aeterna.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FamiliarResidenteService {

    private final FamiliarResidenteRepository familiarResidenteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ResidenteRepository residenteRepository;

    @Transactional
    public VinculoResponse vincular(VinculoRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con id: " + request.getUsuarioId()));

        if (usuario.getRol() != Rol.FAMILIAR) {
            throw new BadRequestException("Solo se pueden vincular usuarios con rol FAMILIAR");
        }

        Residente residente = residenteRepository.findById(request.getResidenteId())
                .orElseThrow(() -> new NotFoundException("Residente no encontrado con id: " + request.getResidenteId()));

        if (familiarResidenteRepository.existsByUsuarioIdAndResidenteId(usuario.getId(), residente.getId())) {
            throw new BadRequestException("Este familiar ya está vinculado al residente indicado");
        }

        NivelAcceso nivel = request.getNivelAcceso() != null ? request.getNivelAcceso() : NivelAcceso.COMPLETO;

        FamiliarResidente vínculo = FamiliarResidente.builder()
                .usuario(usuario)
                .residente(residente)
                .vinculo(request.getVinculo())
                .nivelAcceso(nivel)
                .build();

        return VinculoResponse.from(familiarResidenteRepository.save(vínculo));
    }

    @Transactional
    public void desvincular(Long id) {
        if (!familiarResidenteRepository.existsById(id)) {
            throw new NotFoundException("Vínculo no encontrado con id: " + id);
        }
        familiarResidenteRepository.deleteById(id);
    }

    public List<VinculoResponse> listarPorResidente(Long residenteId) {
        return familiarResidenteRepository.findByResidenteIdFetch(residenteId)
                .stream()
                .map(VinculoResponse::from)
                .toList();
    }

    public List<VinculoResponse> listarPorUsuario(Long usuarioId) {
        return familiarResidenteRepository.findByUsuarioIdFetch(usuarioId)
                .stream()
                .map(VinculoResponse::from)
                .toList();
    }

    public Residente obtenerResidenteDeFamiliar(String usuarioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con email: " + usuarioEmail));

        FamiliarResidente vinculo = familiarResidenteRepository.findFirstByUsuarioId(usuario.getId())
                .orElseThrow(() -> new NotFoundException("No hay ningún residente vinculado a este familiar"));

        return vinculo.getResidente();
    }
}
