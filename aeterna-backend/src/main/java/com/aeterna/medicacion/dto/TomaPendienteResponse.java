package com.aeterna.medicacion.dto;

import com.aeterna.medicacion.EstadoAdministracion;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TomaPendienteResponse {

    private Long medicamentoId;
    private Long residenteId;
    private String residenteNombre;
    private String residenteHabitacion;
    private String nombreMedicamento;
    private String dosis;
    private String via;
    private String frecuencia;
    private String observacionesMedicamento;
    private EstadoAdministracion estadoActual;
    private Long administracionId;
}
