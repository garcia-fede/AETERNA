package com.aeterna.novedad;

import com.aeterna.residente.Residente;
import com.aeterna.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "novedades")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Novedad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residente_id", nullable = false)
    private Residente residente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "personal_id", nullable = false)
    private Usuario personal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoNovedad tipo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PrioridadNovedad prioridad = PrioridadNovedad.MEDIA;

    @Column(name = "visible_familiar", nullable = false)
    @Builder.Default
    private Boolean visibleFamiliar = false;

    @Column(name = "visible_turno_entrante", nullable = false)
    @Builder.Default
    private Boolean visibleTurnoEntrante = true;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
