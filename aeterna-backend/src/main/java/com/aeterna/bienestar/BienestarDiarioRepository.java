package com.aeterna.bienestar;

import com.aeterna.medicacion.Turno;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BienestarDiarioRepository extends JpaRepository<BienestarDiario, Long> {

    Optional<BienestarDiario> findByResidenteIdAndFechaAndTurno(Long residenteId, LocalDate fecha, Turno turno);

    @Query("SELECT b FROM BienestarDiario b JOIN FETCH b.residente JOIN FETCH b.personal " +
           "WHERE b.fecha = :fecha AND b.turno = :turno")
    List<BienestarDiario> findByFechaAndTurnoFetch(@Param("fecha") LocalDate fecha, @Param("turno") Turno turno);

    @Query("SELECT b FROM BienestarDiario b JOIN FETCH b.personal " +
           "WHERE b.residente.id = :residenteId AND b.fecha BETWEEN :desde AND :hasta " +
           "ORDER BY b.fecha DESC, b.turno")
    List<BienestarDiario> findByResidenteAndRango(
            @Param("residenteId") Long residenteId,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta);

    long countByFecha(LocalDate fecha);

    @Query("SELECT b FROM BienestarDiario b JOIN FETCH b.residente JOIN FETCH b.personal WHERE b.fecha = :fecha ORDER BY b.createdAt DESC")
    List<BienestarDiario> findTop5ByFecha(@Param("fecha") LocalDate fecha, Pageable pageable);
}
