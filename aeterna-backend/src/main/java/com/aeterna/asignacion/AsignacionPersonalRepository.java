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

    boolean existsByUsuarioIdAndResidenteIdAndActivoTrue(Long usuarioId, Long residenteId);

    @Query("SELECT a FROM AsignacionPersonal a WHERE a.usuario.id = :usuarioId AND a.residente.id = :residenteId AND a.activo = true")
    java.util.Optional<AsignacionPersonal> findActivaByUsuarioIdAndResidenteId(
            @Param("usuarioId") Long usuarioId,
            @Param("residenteId") Long residenteId
    );
}
