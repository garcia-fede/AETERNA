package com.aeterna.residente;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResidenteRepository extends JpaRepository<Residente, Long> {

    List<Residente> findAllByActivoTrue();

    Optional<Residente> findByIdAndActivoTrue(Long id);

    boolean existsByDni(String dni);

    long countByActivoTrue();
}
