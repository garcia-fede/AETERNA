package com.aeterna.medicacion;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AdministracionRepository extends JpaRepository<Administracion, Long> {

    @Query("SELECT a FROM Administracion a JOIN FETCH a.medicamento m JOIN FETCH m.residente WHERE a.fecha = :fecha AND a.turno = :turno")
    List<Administracion> findByFechaAndTurno(@Param("fecha") LocalDate fecha, @Param("turno") Turno turno);

    @Query("SELECT a FROM Administracion a JOIN FETCH a.medicamento m JOIN FETCH m.residente JOIN FETCH a.personal WHERE m.residente.id = :residenteId AND a.fecha BETWEEN :desde AND :hasta ORDER BY a.fechaHora DESC")
    List<Administracion> findHistorialPorResidente(
            @Param("residenteId") Long residenteId,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta);

    Optional<Administracion> findByMedicamentoIdAndFechaAndTurno(Long medicamentoId, LocalDate fecha, Turno turno);

    long countByFechaAndTurno(LocalDate fecha, Turno turno);

    long countByFechaAndEstado(LocalDate fecha, EstadoAdministracion estado);

    @Query("SELECT a FROM Administracion a JOIN FETCH a.medicamento m JOIN FETCH m.residente JOIN FETCH a.personal WHERE a.fecha = :fecha ORDER BY a.fechaHora DESC")
    List<Administracion> findTop10ByFecha(@Param("fecha") LocalDate fecha, Pageable pageable);
}
