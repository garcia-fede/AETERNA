package com.aeterna.medicacion;

import com.aeterna.residente.Residente;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "medicamentos_residente")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Medicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residente_id", nullable = false)
    private Residente residente;

    @Column(name = "nombre_medicamento", length = 150, nullable = false)
    private String nombreMedicamento;

    @Column(length = 50)
    private String dosis;

    @Column(length = 50)
    private String via;

    @Column(length = 150)
    private String frecuencia;

    @ElementCollection(targetClass = Turno.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "medicamento_turnos", joinColumns = @JoinColumn(name = "medicamento_id"))
    @Column(name = "turno")
    @Builder.Default
    private Set<Turno> horariosTurnos = new HashSet<>();

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    private LocalDate desde;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
