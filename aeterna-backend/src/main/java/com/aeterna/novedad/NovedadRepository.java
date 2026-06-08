package com.aeterna.novedad;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NovedadRepository extends JpaRepository<Novedad, Long> {

    @Query("SELECT n FROM Novedad n JOIN FETCH n.residente JOIN FETCH n.personal " +
           "WHERE (:residenteId IS NULL OR n.residente.id = :residenteId) " +
           "AND (:tipo IS NULL OR n.tipo = :tipo) " +
           "AND (:prioridad IS NULL OR n.prioridad = :prioridad) " +
           "ORDER BY n.fechaHora DESC")
    List<Novedad> findConFiltros(
            @Param("residenteId") Long residenteId,
            @Param("tipo") TipoNovedad tipo,
            @Param("prioridad") PrioridadNovedad prioridad);

    @Query("SELECT n FROM Novedad n JOIN FETCH n.residente JOIN FETCH n.personal " +
           "WHERE n.residente.id IN :residenteIds " +
           "AND (:residenteId IS NULL OR n.residente.id = :residenteId) " +
           "AND (:tipo IS NULL OR n.tipo = :tipo) " +
           "AND (:prioridad IS NULL OR n.prioridad = :prioridad) " +
           "ORDER BY n.fechaHora DESC")
    List<Novedad> findConFiltrosYResidentes(
            @Param("residenteIds") List<Long> residenteIds,
            @Param("residenteId") Long residenteId,
            @Param("tipo") TipoNovedad tipo,
            @Param("prioridad") PrioridadNovedad prioridad);

    @Query("SELECT n FROM Novedad n JOIN FETCH n.personal " +
           "WHERE n.residente.id = :residenteId ORDER BY n.fechaHora DESC")
    List<Novedad> findByResidenteFetch(@Param("residenteId") Long residenteId);

    List<Novedad> findAllByResidenteId(Long residenteId);

    long countByPrioridadAndCreatedAtBetween(PrioridadNovedad prioridad, LocalDateTime desde, LocalDateTime hasta);

    @Query("SELECT n FROM Novedad n JOIN FETCH n.residente JOIN FETCH n.personal WHERE n.createdAt BETWEEN :desde AND :hasta ORDER BY n.createdAt DESC")
    List<Novedad> findTop10DelDia(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta, Pageable pageable);
}
