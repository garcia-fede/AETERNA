package com.aeterna.medicacion;

import com.aeterna.common.exception.NotFoundException;
import com.aeterna.medicacion.dto.MedicamentoRequest;
import com.aeterna.residente.Residente;
import com.aeterna.residente.ResidenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicamentoService {

    private final MedicamentoRepository medicamentoRepository;
    private final ResidenteRepository residenteRepository;

    @Transactional(readOnly = true)
    public List<Medicamento> listarPorResidente(Long residenteId) {
        return medicamentoRepository.findByResidenteIdAndActivoTrue(residenteId);
    }

    @Transactional(readOnly = true)
    public Medicamento obtenerPorId(Long id) {
        return medicamentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Medicamento no encontrado con id: " + id));
    }

    @Transactional
    public Medicamento crear(Long residenteId, MedicamentoRequest request) {
        Residente residente = residenteRepository.findByIdAndActivoTrue(residenteId)
                .orElseThrow(() -> new NotFoundException("Residente no encontrado con id: " + residenteId));

        Medicamento medicamento = Medicamento.builder()
                .residente(residente)
                .nombreMedicamento(request.getNombreMedicamento())
                .dosis(request.getDosis())
                .via(request.getVia())
                .frecuencia(request.getFrecuencia())
                .horariosTurnos(request.getHorariosTurnos())
                .observaciones(request.getObservaciones())
                .desde(request.getDesde())
                .activo(true)
                .build();

        return medicamentoRepository.save(medicamento);
    }

    @Transactional
    public Medicamento actualizar(Long id, MedicamentoRequest request) {
        Medicamento medicamento = obtenerPorId(id);

        medicamento.setNombreMedicamento(request.getNombreMedicamento());
        medicamento.setDosis(request.getDosis());
        medicamento.setVia(request.getVia());
        medicamento.setFrecuencia(request.getFrecuencia());
        medicamento.setHorariosTurnos(request.getHorariosTurnos());
        medicamento.setObservaciones(request.getObservaciones());
        medicamento.setDesde(request.getDesde());

        return medicamentoRepository.save(medicamento);
    }

    @Transactional
    public void darDeBaja(Long id) {
        Medicamento medicamento = obtenerPorId(id);
        medicamento.setActivo(false);
        medicamentoRepository.save(medicamento);
    }
}
