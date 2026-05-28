package com.aeterna.dashboard;

import com.aeterna.bienestar.BienestarDiario;
import com.aeterna.bienestar.BienestarDiarioRepository;
import com.aeterna.dashboard.dto.EventoActividadDto;
import com.aeterna.dashboard.dto.NovedadesPorPrioridadDto;
import com.aeterna.dashboard.dto.ResumenDashboardResponse;
import com.aeterna.medicacion.Administracion;
import com.aeterna.medicacion.AdministracionRepository;
import com.aeterna.medicacion.EstadoAdministracion;
import com.aeterna.medicacion.MedicamentoRepository;
import com.aeterna.medicacion.Turno;
import com.aeterna.novedad.Novedad;
import com.aeterna.novedad.NovedadRepository;
import com.aeterna.novedad.PrioridadNovedad;
import com.aeterna.residente.ResidenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ResidenteRepository residenteRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final AdministracionRepository administracionRepository;
    private final BienestarDiarioRepository bienestarDiarioRepository;
    private final NovedadRepository novedadRepository;

    @Transactional(readOnly = true)
    public ResumenDashboardResponse obtenerResumen() {
        LocalDate hoy = LocalDate.now();
        Turno turnoActual = TurnoUtil.getTurnoActual();

        long residentesActivos = residenteRepository.countByActivoTrue();

        long medicamentosTurno = medicamentoRepository.countActivosByTurno(turnoActual);
        long administradasTurno = administracionRepository.countByFechaAndTurno(hoy, turnoActual);
        long tomasPendientes = Math.max(0, medicamentosTurno - administradasTurno);

        long tomasAdministradasHoy = administracionRepository.countByFechaAndEstado(hoy, EstadoAdministracion.ADMINISTRADA);

        long cuidadosHoy = bienestarDiarioRepository.countByFecha(hoy);

        LocalDateTime inicioHoy = hoy.atStartOfDay();
        LocalDateTime finHoy = hoy.atTime(23, 59, 59);

        NovedadesPorPrioridadDto porPrioridad = NovedadesPorPrioridadDto.builder()
                .baja(novedadRepository.countByPrioridadAndCreatedAtBetween(PrioridadNovedad.BAJA, inicioHoy, finHoy))
                .media(novedadRepository.countByPrioridadAndCreatedAtBetween(PrioridadNovedad.MEDIA, inicioHoy, finHoy))
                .alta(novedadRepository.countByPrioridadAndCreatedAtBetween(PrioridadNovedad.ALTA, inicioHoy, finHoy))
                .critica(novedadRepository.countByPrioridadAndCreatedAtBetween(PrioridadNovedad.CRITICA, inicioHoy, finHoy))
                .build();

        long totalNovedadesHoy = porPrioridad.getBaja() + porPrioridad.getMedia()
                + porPrioridad.getAlta() + porPrioridad.getCritica();

        List<EventoActividadDto> actividad = construirActividadReciente(hoy, inicioHoy, finHoy);

        return ResumenDashboardResponse.builder()
                .residentesActivos(residentesActivos)
                .tomasPendientesTurno(tomasPendientes)
                .tomasAdministradasHoy(tomasAdministradasHoy)
                .cuidadosRegistradosHoy(cuidadosHoy)
                .totalNovedadesHoy(totalNovedadesHoy)
                .novedadesPorPrioridad(porPrioridad)
                .actividadReciente(actividad)
                .build();
    }

    private List<EventoActividadDto> construirActividadReciente(LocalDate hoy, LocalDateTime inicioHoy, LocalDateTime finHoy) {
        List<EventoActividadDto> eventos = new ArrayList<>();

        List<Administracion> administraciones = administracionRepository
                .findTop10ByFecha(hoy, PageRequest.of(0, 10));
        for (Administracion a : administraciones) {
            eventos.add(EventoActividadDto.builder()
                    .tipo("ADMINISTRACION")
                    .titulo(a.getMedicamento().getNombreMedicamento() + " administrado")
                    .residenteNombre(a.getMedicamento().getResidente().getNombre() + " " + a.getMedicamento().getResidente().getApellido())
                    .residenteHabitacion(a.getMedicamento().getResidente().getNumeroHabitacion())
                    .usuarioNombre(a.getPersonal().getNombre() + " " + a.getPersonal().getApellido())
                    .fechaHora(a.getFechaHora())
                    .prioridad(null)
                    .estado(a.getEstado().name())
                    .build());
        }

        List<Novedad> novedades = novedadRepository
                .findTop10DelDia(inicioHoy, finHoy, PageRequest.of(0, 10));
        for (Novedad n : novedades) {
            eventos.add(EventoActividadDto.builder()
                    .tipo("NOVEDAD")
                    .titulo(formatTipoNovedad(n.getTipo().name()))
                    .residenteNombre(n.getResidente().getNombre() + " " + n.getResidente().getApellido())
                    .residenteHabitacion(n.getResidente().getNumeroHabitacion())
                    .usuarioNombre(n.getPersonal().getNombre() + " " + n.getPersonal().getApellido())
                    .fechaHora(n.getFechaHora())
                    .prioridad(n.getPrioridad().name())
                    .estado(null)
                    .build());
        }

        List<BienestarDiario> cuidados = bienestarDiarioRepository
                .findTop5ByFecha(hoy, PageRequest.of(0, 5));
        for (BienestarDiario b : cuidados) {
            eventos.add(EventoActividadDto.builder()
                    .tipo("BIENESTAR")
                    .titulo("Cuidados registrados")
                    .residenteNombre(b.getResidente().getNombre() + " " + b.getResidente().getApellido())
                    .residenteHabitacion(b.getResidente().getNumeroHabitacion())
                    .usuarioNombre(b.getPersonal().getNombre() + " " + b.getPersonal().getApellido())
                    .fechaHora(b.getCreatedAt())
                    .prioridad(null)
                    .estado(null)
                    .build());
        }

        eventos.sort(Comparator.comparing(EventoActividadDto::getFechaHora).reversed());
        return eventos.stream().limit(10).toList();
    }

    private String formatTipoNovedad(String tipo) {
        return switch (tipo) {
            case "INCIDENCIA_CLINICA" -> "Incidencia clínica reportada";
            case "FALTA_INSUMO" -> "Falta de insumo reportada";
            case "OBSERVACION" -> "Observación registrada";
            case "CAIDA_ACCIDENTE" -> "Caída/accidente reportado";
            case "VISITA_MEDICA" -> "Visita médica registrada";
            case "CAMBIO_ESTADO" -> "Cambio de estado registrado";
            default -> tipo;
        };
    }
}
