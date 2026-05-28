package com.aeterna.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    List<Usuario> findAllByActivoTrue();

    boolean existsByEmail(String email);

    List<Usuario> findAllByRol(Rol rol);
}
