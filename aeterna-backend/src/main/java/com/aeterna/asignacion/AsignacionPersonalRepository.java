package com.aeterna.asignacion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AsignacionPersonalRepository extends JpaRepository<AsignacionPersonal, Long> {

    @Query("SELECT a FROM AsignacionPersonal a JOIN FETCH a.residente WHERE a.usuario.id = :usuarioId AND a.activo = true")
    List<AsignacionPersonal> findActivasByUsuarioId(@Param("usuarioId") Long usuarioId);

    @Query("SELECT a FROM AsignacionPersonal a JOIN FETCH a.residente JOIN FETCH a.usuario WHERE a.activo = true ORDER BY a.usuario.apellido, a.usuario.nombre")
    List<AsignacionPersonal> findAllActivas();

    @Query("SELECT a FROM AsignacionPersonal a JOIN FETCH a.usuario WHERE a.residente.id = :residenteId AND a.activo = true")
    List<AsignacionPersonal> findActivasByResidenteId(@Param("residenteId") Long residenteId);

    boolean existsByUsuarioIdAndResidenteIdAndActivoTrue(Long usuarioId, Long residenteId);

    @Query("SELECT a FROM AsignacionPersonal a WHERE a.usuario.id = :usuarioId AND a.residente.id = :residenteId AND a.activo = true")
    java.util.Optional<AsignacionPersonal> findActivaByUsuarioIdAndResidenteId(
            @Param("usuarioId") Long usuarioId,
            @Param("residenteId") Long residenteId
    );

    /** Cuidadores distintos con al menos una asignación activa a un residente activo. */
    @Query("SELECT COUNT(DISTINCT a.usuario.id) FROM AsignacionPersonal a WHERE a.activo = true AND a.residente.activo = true")
    long countCuidadoresConAsignaciones();

    /** Residentes activos distintos que tienen al menos un cuidador asignado. */
    @Query("SELECT COUNT(DISTINCT a.residente.id) FROM AsignacionPersonal a WHERE a.activo = true AND a.residente.activo = true")
    long countResidentesAsignados();

    /** Carga por cuidador: (usuarioId, nombre, apellido, cantidad de residentes activos asignados). */
    @Query("SELECT a.usuario.id, a.usuario.nombre, a.usuario.apellido, COUNT(DISTINCT a.residente.id) " +
           "FROM AsignacionPersonal a WHERE a.activo = true AND a.residente.activo = true " +
           "GROUP BY a.usuario.id, a.usuario.nombre, a.usuario.apellido " +
           "ORDER BY COUNT(DISTINCT a.residente.id) DESC")
    List<Object[]> cargaPorCuidador();
}
