package com.aeterna.asignacion;

import com.aeterna.residente.Residente;
import com.aeterna.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "asignaciones_personal",
    uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "residente_id"})
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AsignacionPersonal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residente_id", nullable = false)
    private Residente residente;

    @Column(name = "fecha_asignacion", nullable = false)
    @Builder.Default
    private LocalDate fechaAsignacion = LocalDate.now();

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
