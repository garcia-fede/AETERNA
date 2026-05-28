package com.aeterna.familiar;

import com.aeterna.residente.Residente;
import com.aeterna.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "familiar_residente",
    uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "residente_id"})
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FamiliarResidente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residente_id", nullable = false)
    private Residente residente;

    @Column(length = 50)
    private String vinculo;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_acceso", nullable = false)
    @Builder.Default
    private NivelAcceso nivelAcceso = NivelAcceso.COMPLETO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
