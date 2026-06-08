package com.aeterna.config;

import com.aeterna.asignacion.AsignacionPersonal;
import com.aeterna.asignacion.AsignacionPersonalRepository;
import com.aeterna.bienestar.BienestarDiario;
import com.aeterna.bienestar.BienestarDiarioRepository;
import com.aeterna.bienestar.EstadoAnimo;
import com.aeterna.bienestar.EstadoComida;
import com.aeterna.familiar.FamiliarResidente;
import com.aeterna.familiar.FamiliarResidenteRepository;
import com.aeterna.familiar.NivelAcceso;
import com.aeterna.medicacion.Administracion;
import com.aeterna.medicacion.AdministracionRepository;
import com.aeterna.medicacion.EstadoAdministracion;
import com.aeterna.medicacion.Medicamento;
import com.aeterna.medicacion.MedicamentoRepository;
import com.aeterna.medicacion.Turno;
import com.aeterna.novedad.Novedad;
import com.aeterna.novedad.NovedadRepository;
import com.aeterna.novedad.PrioridadNovedad;
import com.aeterna.novedad.TipoNovedad;
import com.aeterna.residente.EstadoResidente;
import com.aeterna.residente.Residente;
import com.aeterna.residente.ResidenteRepository;
import com.aeterna.usuario.Rol;
import com.aeterna.usuario.Usuario;
import com.aeterna.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final ResidenteRepository residenteRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final AdministracionRepository administracionRepository;
    private final BienestarDiarioRepository bienestarRepository;
    private final NovedadRepository novedadRepository;
    private final FamiliarResidenteRepository familiarResidenteRepository;
    private final AsignacionPersonalRepository asignacionPersonalRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdminUser();
        seedPersonalUsers();
        seedResidentes();
        seedMedicamentos();
        seedAdministraciones();
        seedBienestar();
        seedNovedades();
        seedFamiliar();
        seedAsignacionesPersonal();
    }

    private void seedAdminUser() {
        if (!usuarioRepository.existsByEmail("admin@aeterna.com")) {
            Usuario admin = Usuario.builder()
                    .nombre("Administrador")
                    .apellido("AETERNA")
                    .email("admin@aeterna.com")
                    .passwordHash(passwordEncoder.encode("Admin123!"))
                    .rol(Rol.ADMIN)
                    .activo(true)
                    .build();
            usuarioRepository.save(admin);
            log.info("Admin inicial creado: admin@aeterna.com");
        }
    }

    private void seedResidentes() {
        if (residenteRepository.count() == 0) {
            residenteRepository.save(Residente.builder()
                    .nombre("María Elena")
                    .apellido("González")
                    .fechaNacimiento(LocalDate.of(1942, 3, 15))
                    .dni("12345678")
                    .numeroHabitacion("101")
                    .sector("Ala Norte")
                    .estado(EstadoResidente.ACTIVO)
                    .obraSocial("PAMI")
                    .numeroAfiliado("PAM-001234")
                    .contactoFamiliarNombre("Carlos González")
                    .contactoFamiliarTelefono("1155551234")
                    .observaciones("Requiere dieta blanda. Hipertensa controlada.")
                    .build());

            residenteRepository.save(Residente.builder()
                    .nombre("Roberto")
                    .apellido("Fernández")
                    .fechaNacimiento(LocalDate.of(1938, 7, 22))
                    .dni("87654321")
                    .numeroHabitacion("102")
                    .sector("Ala Norte")
                    .estado(EstadoResidente.ACTIVO)
                    .obraSocial("IOMA")
                    .numeroAfiliado("IOMA-005678")
                    .contactoFamiliarNombre("Laura Fernández")
                    .contactoFamiliarTelefono("1166669876")
                    .observaciones("Diabético tipo 2. Control glucémico diario.")
                    .build());

            residenteRepository.save(Residente.builder()
                    .nombre("Ana Luisa")
                    .apellido("Martínez")
                    .fechaNacimiento(LocalDate.of(1945, 11, 8))
                    .dni("23456789")
                    .numeroHabitacion("205")
                    .sector("Ala Sur")
                    .estado(EstadoResidente.ACTIVO)
                    .obraSocial("PAMI")
                    .numeroAfiliado("PAM-009876")
                    .contactoFamiliarNombre("Pedro Martínez")
                    .contactoFamiliarTelefono("1177773456")
                    .observaciones("Movilidad reducida. Silla de ruedas.")
                    .build());

            log.info("3 residentes de ejemplo creados");
        }
    }

    private void seedMedicamentos() {
        if (medicamentoRepository.count() > 0) {
            return;
        }

        List<Residente> residentes = residenteRepository.findAllByActivoTrue();
        if (residentes.size() < 3) {
            log.warn("No hay suficientes residentes para seed de medicamentos");
            return;
        }

        Residente gonzalez = residentes.get(0);
        Residente fernandez = residentes.get(1);
        Residente martinez = residentes.get(2);

        medicamentoRepository.save(Medicamento.builder()
                .residente(gonzalez)
                .nombreMedicamento("Enalapril")
                .dosis("10mg")
                .via("Oral")
                .frecuencia("1x día 08:00")
                .horariosTurnos(new HashSet<>(Set.of(Turno.MANIANA)))
                .activo(true)
                .desde(LocalDate.now())
                .build());

        medicamentoRepository.save(Medicamento.builder()
                .residente(gonzalez)
                .nombreMedicamento("Paracetamol")
                .dosis("500mg")
                .via("Oral")
                .frecuencia("Según necesidad")
                .horariosTurnos(new HashSet<>(Set.of(Turno.TARDE)))
                .activo(true)
                .desde(LocalDate.now())
                .build());

        medicamentoRepository.save(Medicamento.builder()
                .residente(fernandez)
                .nombreMedicamento("Metformina")
                .dosis("850mg")
                .via("Oral")
                .frecuencia("2x día 08:00 y 14:00")
                .horariosTurnos(new HashSet<>(Set.of(Turno.MANIANA, Turno.TARDE)))
                .activo(true)
                .desde(LocalDate.now())
                .build());

        medicamentoRepository.save(Medicamento.builder()
                .residente(fernandez)
                .nombreMedicamento("Atorvastatina")
                .dosis("20mg")
                .via("Oral")
                .frecuencia("1x día 21:00")
                .horariosTurnos(new HashSet<>(Set.of(Turno.NOCHE)))
                .activo(true)
                .desde(LocalDate.now())
                .build());

        medicamentoRepository.save(Medicamento.builder()
                .residente(martinez)
                .nombreMedicamento("Omeprazol")
                .dosis("20mg")
                .via("Oral")
                .frecuencia("1x día 08:00 en ayunas")
                .horariosTurnos(new HashSet<>(Set.of(Turno.MANIANA)))
                .activo(true)
                .desde(LocalDate.now())
                .build());

        log.info("5 medicamentos de ejemplo creados");
    }

    private void seedAdministraciones() {
        if (administracionRepository.count() > 0) {
            return;
        }

        List<Medicamento> medicamentos = medicamentoRepository.findAll();
        if (medicamentos.isEmpty()) return;

        Usuario enfermero = usuarioRepository.findByEmail("enfermero@aeterna.com").orElse(null);
        Usuario enfermera = usuarioRepository.findByEmail("enfermera@aeterna.com").orElse(null);
        if (enfermero == null && enfermera == null) return;

        LocalDate hoy = LocalDate.now();
        LocalDate ayer = hoy.minusDays(1);
        LocalDate antesDeAyer = hoy.minusDays(2);

        for (Medicamento med : medicamentos) {
            // Determinar el personal responsable según el residente asignado
            String apellidoResidente = med.getResidente().getApellido();
            // Martínez está asignada a enfermera; González y Fernández al enfermero
            Usuario responsable = apellidoResidente.equals("Martínez")
                    ? (enfermera != null ? enfermera : enfermero)
                    : (enfermero != null ? enfermero : enfermera);
            if (responsable == null) continue;

            Set<Turno> turnos = med.getHorariosTurnos();
            for (Turno turno : turnos) {
                int horaBase = turno == Turno.MANIANA ? 8 : turno == Turno.TARDE ? 14 : 22;
                String horaStr = (horaBase < 10 ? "0" + horaBase : horaBase) + ":15";

                // Anteayer — todas administradas
                administracionRepository.save(Administracion.builder()
                        .medicamento(med)
                        .personal(responsable)
                        .fecha(antesDeAyer)
                        .fechaHora(antesDeAyer.atTime(horaBase, 15))
                        .turno(turno)
                        .estado(EstadoAdministracion.ADMINISTRADA)
                        .observaciones("Administrado a las " + horaStr + " — dosis completa. Sin incidencias.")
                        .build());

                // Ayer — Paracetamol omitido, resto administrado
                boolean omitir = med.getNombreMedicamento().equals("Paracetamol");
                administracionRepository.save(Administracion.builder()
                        .medicamento(med)
                        .personal(responsable)
                        .fecha(ayer)
                        .fechaHora(ayer.atTime(horaBase, 30))
                        .turno(turno)
                        .estado(omitir ? EstadoAdministracion.OMITIDA : EstadoAdministracion.ADMINISTRADA)
                        .observaciones(omitir
                                ? "Residente rechazó la toma. Se dejó constancia para control médico."
                                : "Administrado a las " + (horaBase < 10 ? "0" + horaBase : horaBase) + ":30 — dosis completa.")
                        .build());
            }
        }

        log.info("Administraciones históricas de ejemplo creadas (por personal asignado)");
    }

    private void seedBienestar() {
        if (bienestarRepository.count() > 0) {
            return;
        }

        List<Residente> residentes = residenteRepository.findAllByActivoTrue();
        if (residentes.isEmpty()) {
            log.warn("No hay residentes para seed de bienestar");
            return;
        }

        Usuario admin = usuarioRepository.findByEmail("admin@aeterna.com").orElse(null);
        if (admin == null) return;

        LocalDate hoy = LocalDate.now();

        bienestarRepository.save(BienestarDiario.builder()
                .residente(residentes.get(0))
                .personal(admin)
                .fecha(hoy)
                .turno(Turno.MANIANA)
                .higieneBanio(true)
                .higieneIntima(true)
                .cambioRopa(true)
                .desayuno(EstadoComida.COMPLETO)
                .almuerzo(EstadoComida.PARCIAL)
                .hidratacionMl(500)
                .estadoAnimo(EstadoAnimo.TRANQUILO)
                .presionSistolica(130)
                .presionDiastolica(80)
                .temperatura(new BigDecimal("36.5"))
                .saturacion(97)
                .observaciones("Paciente colaborativa. Desayunó bien.")
                .build());

        if (residentes.size() > 1) {
            bienestarRepository.save(BienestarDiario.builder()
                    .residente(residentes.get(1))
                    .personal(admin)
                    .fecha(hoy)
                    .turno(Turno.MANIANA)
                    .higieneBanio(true)
                    .higieneIntima(false)
                    .cambioRopa(true)
                    .desayuno(EstadoComida.RECHAZADO)
                    .almuerzo(EstadoComida.PARCIAL)
                    .hidratacionMl(300)
                    .estadoAnimo(EstadoAnimo.TRISTE)
                    .glucemia(180)
                    .peso(new BigDecimal("72.50"))
                    .observaciones("Rechazó el desayuno. Glucemia elevada, notificado médico.")
                    .build());
        }

        if (residentes.size() > 2) {
            bienestarRepository.save(BienestarDiario.builder()
                    .residente(residentes.get(2))
                    .personal(admin)
                    .fecha(hoy)
                    .turno(Turno.TARDE)
                    .higieneBanio(false)
                    .higieneIntima(true)
                    .cambioRopa(true)
                    .merienda(EstadoComida.COMPLETO)
                    .cena(EstadoComida.NO_APLICA)
                    .hidratacionMl(400)
                    .estadoAnimo(EstadoAnimo.ANIMADO)
                    .presionSistolica(120)
                    .presionDiastolica(75)
                    .saturacion(98)
                    .build());
        }

        log.info("Registros de bienestar diario de ejemplo creados");
    }

    private void seedNovedades() {
        if (novedadRepository.count() > 0) {
            return;
        }

        List<Residente> residentes = residenteRepository.findAllByActivoTrue();
        if (residentes.isEmpty()) {
            log.warn("No hay residentes para seed de novedades");
            return;
        }

        Usuario admin = usuarioRepository.findByEmail("admin@aeterna.com").orElse(null);
        if (admin == null) return;

        LocalDateTime ahora = LocalDateTime.now();

        novedadRepository.save(Novedad.builder()
                .residente(residentes.get(0))
                .personal(admin)
                .tipo(TipoNovedad.INCIDENCIA_CLINICA)
                .descripcion("Paciente presentó mareos leves al levantarse. Se tomaron constantes vitales. Presión 140/90, se comunicó al médico de guardia.")
                .prioridad(PrioridadNovedad.ALTA)
                .visibleFamiliar(true)
                .visibleTurnoEntrante(true)
                .fechaHora(ahora.minusHours(3))
                .build());

        if (residentes.size() > 1) {
            novedadRepository.save(Novedad.builder()
                    .residente(residentes.get(1))
                    .personal(admin)
                    .tipo(TipoNovedad.FALTA_INSUMO)
                    .descripcion("Se agotaron los guantes de látex talla M en el depósito del Ala Norte. Solicitar reposición urgente.")
                    .prioridad(PrioridadNovedad.MEDIA)
                    .visibleFamiliar(false)
                    .visibleTurnoEntrante(true)
                    .fechaHora(ahora.minusHours(1))
                    .build());

            novedadRepository.save(Novedad.builder()
                    .residente(residentes.get(1))
                    .personal(admin)
                    .tipo(TipoNovedad.VISITA_MEDICA)
                    .descripcion("Visita del Dr. Ramírez. Ajuste de dosis de Metformina a 1000mg por descontrol glucémico. Nueva indicación en plan farmacológico.")
                    .prioridad(PrioridadNovedad.ALTA)
                    .visibleFamiliar(true)
                    .visibleTurnoEntrante(true)
                    .fechaHora(ahora.minusHours(5))
                    .build());
        }

        if (residentes.size() > 2) {
            novedadRepository.save(Novedad.builder()
                    .residente(residentes.get(2))
                    .personal(admin)
                    .tipo(TipoNovedad.CAIDA_ACCIDENTE)
                    .descripcion("Residente intentó levantarse sin asistencia. No hubo caída pero se reforzó protocolo de llamado. Se notificó a la familia.")
                    .prioridad(PrioridadNovedad.CRITICA)
                    .visibleFamiliar(true)
                    .visibleTurnoEntrante(true)
                    .fechaHora(ahora.minusMinutes(30))
                    .build());
        }

        log.info("Novedades de ejemplo creadas");
    }

    private void seedPersonalUsers() {
        if (!usuarioRepository.existsByEmail("enfermero@aeterna.com")) {
            Usuario enfermero = Usuario.builder()
                    .nombre("Marcos")
                    .apellido("Rodríguez")
                    .email("enfermero@aeterna.com")
                    .passwordHash(passwordEncoder.encode("Personal123!"))
                    .rol(Rol.PERSONAL)
                    .activo(true)
                    .build();
            usuarioRepository.save(enfermero);
            log.info("Usuario personal creado: enfermero@aeterna.com");
        }

        if (!usuarioRepository.existsByEmail("enfermera@aeterna.com")) {
            Usuario enfermera = Usuario.builder()
                    .nombre("Laura")
                    .apellido("Sánchez")
                    .email("enfermera@aeterna.com")
                    .passwordHash(passwordEncoder.encode("Personal123!"))
                    .rol(Rol.PERSONAL)
                    .activo(true)
                    .build();
            usuarioRepository.save(enfermera);
            log.info("Usuario personal creado: enfermera@aeterna.com");
        }
    }

    private void seedAsignacionesPersonal() {
        List<Residente> residentes = residenteRepository.findAllByActivoTrue();
        if (residentes.isEmpty()) {
            log.warn("No hay residentes para seed de asignaciones de personal");
            return;
        }

        usuarioRepository.findByEmail("enfermero@aeterna.com").ifPresent(enfermero -> {
            // Asignar primeros 2 residentes al enfermero
            for (int i = 0; i < Math.min(2, residentes.size()); i++) {
                Residente r = residentes.get(i);
                if (!asignacionPersonalRepository.existsByUsuarioIdAndResidenteIdAndActivoTrue(enfermero.getId(), r.getId())) {
                    asignacionPersonalRepository.save(AsignacionPersonal.builder()
                            .usuario(enfermero)
                            .residente(r)
                            .fechaAsignacion(LocalDate.now())
                            .activo(true)
                            .build());
                    log.info("Asignación creada: {} -> residente {}", enfermero.getEmail(), r.getId());
                }
            }
        });

        usuarioRepository.findByEmail("enfermera@aeterna.com").ifPresent(enfermera -> {
            // Asignar el tercer residente a la enfermera (si existe)
            if (residentes.size() >= 3) {
                Residente r = residentes.get(2);
                if (!asignacionPersonalRepository.existsByUsuarioIdAndResidenteIdAndActivoTrue(enfermera.getId(), r.getId())) {
                    asignacionPersonalRepository.save(AsignacionPersonal.builder()
                            .usuario(enfermera)
                            .residente(r)
                            .fechaAsignacion(LocalDate.now())
                            .activo(true)
                            .build());
                    log.info("Asignación creada: {} -> residente {}", enfermera.getEmail(), r.getId());
                }
            }
        });
    }

    private void seedFamiliar() {
        // Usuario familiar María González
        if (!usuarioRepository.existsByEmail("maria.gonzalez@familia.com")) {
            Usuario familiar = Usuario.builder()
                    .nombre("María")
                    .apellido("González")
                    .email("maria.gonzalez@familia.com")
                    .passwordHash(passwordEncoder.encode("Familiar123!"))
                    .rol(Rol.FAMILIAR)
                    .activo(true)
                    .build();
            usuarioRepository.save(familiar);
            log.info("Usuario familiar creado: maria.gonzalez@familia.com");
        }

        // Buscar usuario familiar y residente González para vincular
        usuarioRepository.findByEmail("maria.gonzalez@familia.com").ifPresent(familiar -> {
            List<Residente> residentes = residenteRepository.findAllByActivoTrue();
            if (residentes.isEmpty()) return;

            Residente gonzalez = residentes.get(0);

            if (!familiarResidenteRepository.existsByUsuarioIdAndResidenteId(familiar.getId(), gonzalez.getId())) {
                familiarResidenteRepository.save(FamiliarResidente.builder()
                        .usuario(familiar)
                        .residente(gonzalez)
                        .vinculo("Hija")
                        .nivelAcceso(NivelAcceso.COMPLETO)
                        .build());
                log.info("Vínculo familiar creado: María González → residente González");
            }

            // Asegurar que al menos una novedad del residente González sea visible al familiar
            List<Novedad> novedadesGonzalez = novedadRepository.findAllByResidenteId(gonzalez.getId());
            novedadesGonzalez.stream()
                    .filter(n -> !n.getVisibleFamiliar())
                    .findFirst()
                    .ifPresent(n -> {
                        n.setVisibleFamiliar(true);
                        novedadRepository.save(n);
                        log.info("Novedad id={} marcada como visible para familiar", n.getId());
                    });

            // Crear novedad VISITA_MEDICA para el portal familiar si no existe aún
            String descripcionVisita = "Visita médica de control programada para el lunes próximo.";
            boolean yaExiste = novedadesGonzalez.stream()
                    .anyMatch(n -> descripcionVisita.equals(n.getDescripcion()));
            if (!yaExiste) {
                Usuario admin = usuarioRepository.findByEmail("admin@aeterna.com").orElse(null);
                if (admin != null) {
                    novedadRepository.save(Novedad.builder()
                            .residente(gonzalez)
                            .personal(admin)
                            .tipo(TipoNovedad.VISITA_MEDICA)
                            .descripcion(descripcionVisita)
                            .prioridad(PrioridadNovedad.MEDIA)
                            .visibleFamiliar(true)
                            .visibleTurnoEntrante(true)
                            .fechaHora(LocalDateTime.now())
                            .build());
                    log.info("Novedad VISITA_MEDICA para familiar creada");
                }
            }
        });
    }
}
