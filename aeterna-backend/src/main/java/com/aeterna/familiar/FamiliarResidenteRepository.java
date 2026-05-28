package com.aeterna.familiar;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FamiliarResidenteRepository extends JpaRepository<FamiliarResidente, Long> {

    @Query("SELECT fr FROM FamiliarResidente fr JOIN FETCH fr.residente WHERE fr.usuario.id = :usuarioId")
    List<FamiliarResidente> findByUsuarioIdFetch(@Param("usuarioId") Long usuarioId);

    @Query("SELECT fr FROM FamiliarResidente fr JOIN FETCH fr.usuario WHERE fr.residente.id = :residenteId")
    List<FamiliarResidente> findByResidenteIdFetch(@Param("residenteId") Long residenteId);

    Optional<FamiliarResidente> findFirstByUsuarioId(Long usuarioId);

    boolean existsByUsuarioIdAndResidenteId(Long usuarioId, Long residenteId);
}
