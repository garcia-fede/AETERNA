package com.aeterna.auth;

import com.aeterna.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    /** Invalida los tokens vigentes de un usuario antes de emitir uno nuevo. */
    @Modifying
    @Query("update PasswordResetToken t set t.used = true where t.usuario = :usuario and t.used = false")
    void invalidarVigentesDe(@Param("usuario") Usuario usuario);
}
