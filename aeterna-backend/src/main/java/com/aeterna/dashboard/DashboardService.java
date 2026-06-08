package com.aeterna.dashboard;

import com.aeterna.asignacion.AsignacionPersonalRepository;
import com.aeterna.bienestar.BienestarDiario;
import com.aeterna.bienestar.BienestarDiarioRepository;
import com.aeterna.dashboard.dto.CargaCuidadorDto;
import com.aeterna.dashboard.dto.EventoActividadDto;
import com.aeterna.dashboard.dto.IndicadoresGestionDto;
import com.aeterna.dashboard.dto.NovedadesPorPrioridadDto;
import com.aeterna.dashboard.dto.PuntoTendenciaDto;
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
import com.aeterna.usuario.Rol;
import com.aeterna.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ResidenteRepository residenteRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final AdministracionRepository administracionRepository;
    private final BienestarDiarioRepository bienestarDiarioRepository;
    private final NovedadRepository novedadRepository;
    private final AsignacionPersonalRepository asignacionPersonalRepository;
    private final UsuarioRepository usuarioRepository;

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

        // Indicadores gerenciales: solo para ADMIN.
        IndicadoresGestionDto indicadores = esAdmin()
                ? construirIndicadoresGestion(hoy, turnoActual, residentesActivos)
                : null;

        return ResumenDashboardResponse.builder()
                .residentesActivos(residentesActivos)
                .tomasPendientesTurno(tomasPendientes)
                .tomasAdministradasHoy(tomasAdministradasHoy)
                .cuidadosRegistradosHoy(cuidadosHoy)
                .totalNovedadesHoy(totalNovedadesHoy)
                .novedadesPorPrioridad(porPrioridad)
                .actividadReciente(actividad)
                .indicadoresGestion(indicadores)
                .build();
    }

    private boolean esAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return usuarioRepository.findByEmail(auth.getName())
                .map(u -> u.getRol() == Rol.ADMIN)
                .orElse(false);
    }

    private IndicadoresGestionDto construirIndicadoresGestion(LocalDate hoy, Turno turnoActual, long residentesActivos) {
        // ── Adherencia a la medicación ──────────────────────────
        long programadasDiarias = medicamentoRepository.countTomasProgramadasDiarias();
        long administradasHoy = administracionRepository.countByFechaAndEstado(hoy, EstadoAdministracion.ADMINISTRADA);
        long omitidasHoy = administracionRepository.countByFechaAndEstado(hoy, EstadoAdministracion.OMITIDA);
        long demoraHoy = administracionRepository.countByFechaAndEstado(hoy, EstadoAdministracion.CON_DEMORA);

        double adherenciaHoy = pct(administradasHoy, programadasDiarias);
        double tasaOmisionHoy = pct(omitidasHoy, programadasDiarias);
        double tasaDemoraHoy = pct(demoraHoy, programadasDiarias);

        List<PuntoTendenciaDto> adherencia7dias = construirAdherencia7dias(hoy, programadasDiarias);

        // ── Cobertura de cuidados ───────────────────────────────
        long resConCuidado = bienestarDiarioRepository.countResidentesConCuidado(hoy, turnoActual);
        double coberturaCuidados = pct(resConCuidado, residentesActivos);
        long sinCuidado = Math.max(0, residentesActivos - resConCuidado);

        List<PuntoTendenciaDto> cuidados7dias = construirCuidados7dias(hoy);

        // ── Carga del personal ──────────────────────────────────
        long cuidadores = asignacionPersonalRepository.countCuidadoresConAsignaciones();
        long resAsignados = asignacionPersonalRepository.countResidentesAsignados();
        double ratio = cuidadores > 0 ? redondear((double) resAsignados / cuidadores) : 0;
        long sinAsignar = Math.max(0, residentesActivos - resAsignados);

        long totalPersonal = usuarioRepository.findAllByRol(Rol.PERSONAL).stream()
                .filter(u -> Boolean.TRUE.equals(u.getActivo()))
                .count();
        long personalSinAsignaciones = Math.max(0, totalPersonal - cuidadores);

        List<CargaCuidadorDto> cargaPorCuidador = asignacionPersonalRepository.cargaPorCuidador().stream()
                .map(row -> CargaCuidadorDto.builder()
                        .usuarioId((Long) row[0])
                        .nombre(row[1] + " " + row[2])
                        .residentesAsignados((Long) row[3])
                        .build())
                .toList();

        return IndicadoresGestionDto.builder()
                .adherenciaHoy(adherenciaHoy)
                .tasaOmisionHoy(tasaOmisionHoy)
                .tasaDemoraHoy(tasaDemoraHoy)
                .tomasProgramadasHoy(programadasDiarias)
                .adherencia7dias(adherencia7dias)
                .coberturaCuidadosTurno(coberturaCuidados)
                .residentesSinCuidadoTurno(sinCuidado)
                .cuidados7dias(cuidados7dias)
                .ratioResidentesPorCuidador(ratio)
                .residentesSinAsignar(sinAsignar)
                .personalSinAsignaciones(personalSinAsignaciones)
                .cargaPorCuidador(cargaPorCuidador)
                .build();
    }

    private List<PuntoTendenciaDto> construirAdherencia7dias(LocalDate hoy, long programadasDiarias) {
        LocalDate desde = hoy.minusDays(6);
        // fecha -> administradas ese día
        Map<LocalDate, Long> administradasPorDia = new HashMap<>();
        for (Object[] row : administracionRepository.countPorFechaYEstadoEnRango(desde, hoy)) {
            LocalDate fecha = (LocalDate) row[0];
            EstadoAdministracion estado = (EstadoAdministracion) row[1];
            long cant = (Long) row[2];
            if (estado == EstadoAdministracion.ADMINISTRADA) {
                administradasPorDia.merge(fecha, cant, Long::sum);
            }
        }
        List<PuntoTendenciaDto> serie = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate dia = desde.plusDays(i);
            long admin = administradasPorDia.getOrDefault(dia, 0L);
            serie.add(PuntoTendenciaDto.builder().fecha(dia).valor(pct(admin, programadasDiarias)).build());
        }
        return serie;
    }

    private List<PuntoTendenciaDto> construirCuidados7dias(LocalDate hoy) {
        LocalDate desde = hoy.minusDays(6);
        Map<LocalDate, Long> porDia = new HashMap<>();
        for (Object[] row : bienestarDiarioRepository.countPorFechaEnRango(desde, hoy)) {
            porDia.put((LocalDate) row[0], (Long) row[1]);
        }
        List<PuntoTendenciaDto> serie = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate dia = desde.plusDays(i);
            serie.add(PuntoTendenciaDto.builder().fecha(dia).valor(porDia.getOrDefault(dia, 0L)).build());
        }
        return serie;
    }

    /** Porcentaje 0-100 redondeado a un decimal; 0 si el total es 0. */
    private double pct(long parte, long total) {
        if (total <= 0) return 0;
        return redondear((double) parte / total * 100);
    }

    private double redondear(double v) {
        return Math.round(v * 10.0) / 10.0;
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
