package com.aeterna.residente;

import com.aeterna.common.exception.BadRequestException;
import com.aeterna.common.exception.NotFoundException;
import com.aeterna.residente.dto.ResidenteRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidenteService {

    private final ResidenteRepository residenteRepository;

    public List<Residente> listarActivos() {
        return residenteRepository.findAllByActivoTrue();
    }

    public Residente buscarPorId(Long id) {
        return residenteRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new NotFoundException("Residente no encontrado con id: " + id));
    }

    @Transactional
    public Residente crear(ResidenteRequest request) {
        if (residenteRepository.existsByDni(request.getDni())) {
            throw new BadRequestException("Ya existe un residente con el DNI: " + request.getDni());
        }

        Residente residente = Residente.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .fechaNacimiento(request.getFechaNacimiento())
                .dni(request.getDni())
                .numeroHabitacion(request.getNumeroHabitacion())
                .sector(request.getSector())
                .estado(request.getEstado() != null ? request.getEstado() : EstadoResidente.ACTIVO)
                .obraSocial(request.getObraSocial())
                .numeroAfiliado(request.getNumeroAfiliado())
                .contactoFamiliarNombre(request.getContactoFamiliarNombre())
                .contactoFamiliarTelefono(request.getContactoFamiliarTelefono())
                .observaciones(request.getObservaciones())
                .build();

        return residenteRepository.save(residente);
    }

    @Transactional
    public Residente actualizar(Long id, ResidenteRequest request) {
        Residente residente = buscarPorId(id);

        // Si cambia el DNI, verificar que no exista otro residente con ese DNI
        if (!residente.getDni().equals(request.getDni()) && residenteRepository.existsByDni(request.getDni())) {
            throw new BadRequestException("Ya existe un residente con el DNI: " + request.getDni());
        }

        residente.setNombre(request.getNombre());
        residente.setApellido(request.getApellido());
        residente.setFechaNacimiento(request.getFechaNacimiento());
        residente.setDni(request.getDni());
        residente.setNumeroHabitacion(request.getNumeroHabitacion());
        residente.setSector(request.getSector());
        if (request.getEstado() != null) residente.setEstado(request.getEstado());
        residente.setObraSocial(request.getObraSocial());
        residente.setNumeroAfiliado(request.getNumeroAfiliado());
        residente.setContactoFamiliarNombre(request.getContactoFamiliarNombre());
        residente.setContactoFamiliarTelefono(request.getContactoFamiliarTelefono());
        residente.setObservaciones(request.getObservaciones());

        return residenteRepository.save(residente);
    }

    @Transactional
    public void eliminar(Long id) {
        Residente residente = buscarPorId(id);
        residente.setActivo(false);
        residenteRepository.save(residente);
    }

    public long contarActivos() {
        return residenteRepository.countByActivoTrue();
    }
}
