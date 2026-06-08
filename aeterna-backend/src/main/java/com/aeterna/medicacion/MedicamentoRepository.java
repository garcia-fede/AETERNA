package com.aeterna.medicacion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {

    @Query("SELECT m FROM Medicamento m JOIN FETCH m.residente WHERE m.residente.id = :residenteId AND m.activo = true")
    List<Medicamento> findByResidenteIdAndActivoTrue(@Param("residenteId") Long residenteId);

    @Query("SELECT DISTINCT m FROM Medicamento m JOIN FETCH m.residente JOIN m.horariosTurnos t WHERE m.activo = true AND t = :turno")
    List<Medicamento> findActivosPorTurno(@Param("turno") Turno turno);

    @Query("SELECT DISTINCT m FROM Medicamento m JOIN FETCH m.residente JOIN m.horariosTurnos t WHERE m.activo = true AND t = :turno AND m.residente.id IN :residenteIds")
    List<Medicamento> findActivosPorTurnoYResidentes(@Param("turno") Turno turno, @Param("residenteIds") List<Long> residenteIds);

    @Query("SELECT COUNT(DISTINCT m) FROM Medicamento m JOIN m.horariosTurnos t WHERE m.activo = true AND t = :turno")
    long countActivosByTurno(@Param("turno") Turno turno);

    /**
     * Total de tomas programadas en un día = un par (medicamento activo, turno) por cada
     * turno configurado. Se cuenta cada fila de la colección de turnos.
     */
    @Query("SELECT COUNT(t) FROM Medicamento m JOIN m.horariosTurnos t WHERE m.activo = true")
    long countTomasProgramadasDiarias();
}
