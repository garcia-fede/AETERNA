package com.aeterna.bienestar;

import com.aeterna.medicacion.Turno;
import com.aeterna.residente.Residente;
import com.aeterna.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "bienestar_diario",
    uniqueConstraints = @UniqueConstraint(columnNames = {"residente_id", "fecha", "turno"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BienestarDiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residente_id", nullable = false)
    private Residente residente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "personal_id", nullable = false)
    private Usuario personal;

    @Column(nullable = false)
    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Turno turno;

    // Higiene
    @Column(name = "higiene_banio", nullable = false)
    @Builder.Default
    private Boolean higieneBanio = false;

    @Column(name = "higiene_intima", nullable = false)
    @Builder.Default
    private Boolean higieneIntima = false;

    @Column(name = "cambio_ropa", nullable = false)
    @Builder.Default
    private Boolean cambioRopa = false;

    // Alimentacion
    @Enumerated(EnumType.STRING)
    @Column(name = "desayuno")
    private EstadoComida desayuno;

    @Enumerated(EnumType.STRING)
    @Column(name = "almuerzo")
    private EstadoComida almuerzo;

    @Enumerated(EnumType.STRING)
    @Column(name = "merienda")
    private EstadoComida merienda;

    @Enumerated(EnumType.STRING)
    @Column(name = "cena")
    private EstadoComida cena;

    @Column(name = "hidratacion_ml")
    private Integer hidratacionMl;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_animo")
    private EstadoAnimo estadoAnimo;

    // Signos vitales
    @Column(name = "presion_sistolica")
    private Integer presionSistolica;

    @Column(name = "presion_diastolica")
    private Integer presionDiastolica;

    @Column(name = "temperatura", precision = 4, scale = 1)
    private BigDecimal temperatura;

    private Integer saturacion;

    private Integer glucemia;

    @Column(precision = 5, scale = 2)
    private BigDecimal peso;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
