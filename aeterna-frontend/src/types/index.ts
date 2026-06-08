export type Rol = 'ADMIN' | 'PERSONAL' | 'FAMILIAR';

export type EstadoResidente = 'ACTIVO' | 'INTERNADO' | 'HOSPITALIZADO' | 'ALTA' | 'FALLECIDO';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
  activo: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
}

export interface Residente {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  edad: number;
  dni: string;
  numeroHabitacion: string | null;
  sector: string | null;
  estado: EstadoResidente;
  obraSocial: string | null;
  numeroAfiliado: string | null;
  contactoFamiliarNombre: string | null;
  contactoFamiliarTelefono: string | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResidenteRequest {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  dni: string;
  numeroHabitacion?: string;
  sector?: string;
  estado?: EstadoResidente;
  obraSocial?: string;
  numeroAfiliado?: string;
  contactoFamiliarNombre?: string;
  contactoFamiliarTelefono?: string;
  observaciones?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

// --- Medicación ---

export type Turno = 'MANIANA' | 'TARDE' | 'NOCHE';

export type EstadoAdministracion = 'ADMINISTRADA' | 'OMITIDA' | 'CON_DEMORA';

export function formatTurno(turno: Turno): string {
  const map: Record<Turno, string> = {
    MANIANA: 'Mañana',
    TARDE: 'Tarde',
    NOCHE: 'Noche',
  };
  return map[turno];
}

export function formatEstadoAdministracion(estado: EstadoAdministracion): string {
  const map: Record<EstadoAdministracion, string> = {
    ADMINISTRADA: 'Administrada',
    OMITIDA: 'Omitida',
    CON_DEMORA: 'Con demora',
  };
  return map[estado];
}

export function getTurnoActual(): Turno {
  const hora = new Date().getHours();
  if (hora >= 6 && hora <= 13) return 'MANIANA';
  if (hora >= 14 && hora <= 20) return 'TARDE';
  return 'NOCHE';
}

/**
 * Formatea un Date como YYYY-MM-DD según la zona horaria local.
 * No usar Date.toISOString() porque convierte a UTC y, en husos
 * negativos (ej. Argentina UTC-3), de noche devuelve el día siguiente.
 */
export function formatFechaLocal(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Fecha de hoy en formato YYYY-MM-DD según la zona horaria local. */
export function fechaHoy(): string {
  return formatFechaLocal(new Date());
}

export interface Medicamento {
  id: number;
  residenteId: number;
  residenteNombre: string;
  nombreMedicamento: string;
  dosis: string | null;
  via: string | null;
  frecuencia: string | null;
  horariosTurnos: Turno[];
  observaciones: string | null;
  activo: boolean;
  desde: string;
  createdAt: string;
}

export interface MedicamentoRequest {
  nombreMedicamento: string;
  dosis?: string;
  via?: string;
  frecuencia?: string;
  horariosTurnos: Turno[];
  observaciones?: string;
  desde: string;
}

export interface Administracion {
  id: number;
  medicamentoId: number;
  nombreMedicamento: string;
  dosis: string | null;
  residenteId: number;
  residenteNombre: string;
  personalId: number;
  personalNombreCompleto: string;
  fecha: string;
  fechaHora: string;
  turno: Turno;
  estado: EstadoAdministracion;
  observaciones: string | null;
}

export interface AdministracionRequest {
  medicamentoId: number;
  estado: EstadoAdministracion;
  turno: Turno;
  observaciones?: string;
  fechaHora?: string;
}

export interface TomaPendiente {
  medicamentoId: number;
  residenteId: number;
  residenteNombre: string;
  residenteHabitacion: string | null;
  nombreMedicamento: string;
  dosis: string | null;
  via: string | null;
  frecuencia: string | null;
  observacionesMedicamento: string | null;
  estadoActual: EstadoAdministracion | null;
  administracionId: number | null;
}

// --- Bienestar Diario ---

export type EstadoComida = 'COMPLETO' | 'PARCIAL' | 'RECHAZADO' | 'NO_APLICA';
export type EstadoAnimo = 'TRISTE' | 'ENTRISTECIDO' | 'NEUTRAL' | 'TRANQUILO' | 'ANIMADO';

export function formatEstadoComida(e: EstadoComida): string {
  const map: Record<EstadoComida, string> = {
    COMPLETO: 'Completo',
    PARCIAL: 'Parcial',
    RECHAZADO: 'Rechazado',
    NO_APLICA: 'No aplica',
  };
  return map[e];
}

export function formatEstadoAnimo(e: EstadoAnimo): string {
  const map: Record<EstadoAnimo, string> = {
    TRISTE: 'Triste',
    ENTRISTECIDO: 'Entristecido',
    NEUTRAL: 'Neutral',
    TRANQUILO: 'Tranquilo',
    ANIMADO: 'Animado',
  };
  return map[e];
}

export interface BienestarDiario {
  id: number;
  residenteId: number;
  residenteNombre: string;
  personalId: number;
  personalNombreCompleto: string;
  fecha: string;
  turno: Turno;
  higieneBanio: boolean;
  higieneIntima: boolean;
  cambioRopa: boolean;
  desayuno: EstadoComida | null;
  almuerzo: EstadoComida | null;
  merienda: EstadoComida | null;
  cena: EstadoComida | null;
  hidratacionMl: number | null;
  estadoAnimo: EstadoAnimo | null;
  presionSistolica: number | null;
  presionDiastolica: number | null;
  temperatura: number | null;
  saturacion: number | null;
  glucemia: number | null;
  peso: number | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BienestarDiarioRequest {
  fecha: string;
  turno: Turno;
  higieneBanio?: boolean;
  higieneIntima?: boolean;
  cambioRopa?: boolean;
  desayuno?: EstadoComida | null;
  almuerzo?: EstadoComida | null;
  merienda?: EstadoComida | null;
  cena?: EstadoComida | null;
  hidratacionMl?: number | null;
  estadoAnimo?: EstadoAnimo | null;
  presionSistolica?: number | null;
  presionDiastolica?: number | null;
  temperatura?: number | null;
  saturacion?: number | null;
  glucemia?: number | null;
  peso?: number | null;
  observaciones?: string;
}

export interface EstadoCuidadosTurno {
  residenteId: number;
  residenteNombre: string;
  residenteHabitacion: string | null;
  registrado: boolean;
  bienestarId: number | null;
}

// --- Novedades ---

export type TipoNovedad =
  | 'INCIDENCIA_CLINICA'
  | 'FALTA_INSUMO'
  | 'OBSERVACION'
  | 'CAIDA_ACCIDENTE'
  | 'VISITA_MEDICA'
  | 'CAMBIO_ESTADO';

export type PrioridadNovedad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export function formatTipoNovedad(t: TipoNovedad): string {
  const map: Record<TipoNovedad, string> = {
    INCIDENCIA_CLINICA: 'Incidencia clínica',
    FALTA_INSUMO: 'Falta de insumo',
    OBSERVACION: 'Observación',
    CAIDA_ACCIDENTE: 'Caída/accidente',
    VISITA_MEDICA: 'Visita médica',
    CAMBIO_ESTADO: 'Cambio de estado',
  };
  return map[t];
}

export function formatPrioridad(p: PrioridadNovedad): string {
  const map: Record<PrioridadNovedad, string> = {
    BAJA: 'Baja',
    MEDIA: 'Media',
    ALTA: 'Alta',
    CRITICA: 'Crítica',
  };
  return map[p];
}

export function colorPrioridad(p: PrioridadNovedad): string {
  const map: Record<PrioridadNovedad, string> = {
    BAJA: 'bg-gray-100 text-gray-700',
    MEDIA: 'bg-blue-100 text-blue-700',
    ALTA: 'bg-orange-100 text-orange-700',
    CRITICA: 'bg-red-100 text-red-700',
  };
  return map[p];
}

export interface Novedad {
  id: number;
  residenteId: number;
  residenteNombre: string;
  residenteHabitacion: string | null;
  personalId: number;
  personalNombreCompleto: string;
  tipo: TipoNovedad;
  descripcion: string;
  prioridad: PrioridadNovedad;
  visibleFamiliar: boolean;
  visibleTurnoEntrante: boolean;
  fechaHora: string;
  createdAt: string;
}

export interface NovedadRequest {
  residenteId: number;
  tipo: TipoNovedad;
  descripcion: string;
  prioridad?: PrioridadNovedad;
  visibleFamiliar?: boolean;
  visibleTurnoEntrante?: boolean;
  fechaHora?: string;
}

// --- Admin de usuarios ---

export type NivelAcceso = 'COMPLETO' | 'SOLO_LECTURA' | 'LIMITADO';

export interface Vinculo {
  id: number;
  usuarioId: number;
  usuarioEmail: string;
  usuarioNombreCompleto: string;
  residenteId: number;
  residenteNombre: string;
  residenteApellido: string;
  residenteHabitacion: string | null;
  vinculo: string | null;
  nivelAcceso: NivelAcceso;
}

export interface VinculoRequest {
  usuarioId: number;
  residenteId: number;
  vinculo?: string;
  nivelAcceso?: NivelAcceso;
}

export interface PersonalAsignado {
  id: number;
  nombre: string;
  apellido: string;
}

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: Rol;
}

export interface UsuarioUpdateRequest {
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
}

export interface CambiarPasswordRequest {
  passwordNueva: string;
}

export function formatRol(rol: Rol): string {
  const map: Record<Rol, string> = {
    ADMIN: 'Administrador',
    PERSONAL: 'Personal',
    FAMILIAR: 'Familiar',
  };
  return map[rol];
}

// --- Asignaciones de personal ---

export interface ResidenteAsignado {
  asignacionId: number;
  residenteId: number;
  nombre: string;
  apellido: string;
  habitacion: string | null;
  sector: string | null;
}

export interface PersonalConResidentes {
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  residentes: ResidenteAsignado[];
}

export interface AsignacionPersonal {
  id: number;
  usuarioId: number;
  usuarioEmail: string;
  usuarioNombreCompleto: string;
  residenteId: number;
  residenteNombre: string;
  residenteApellido: string;
  residenteHabitacion: string | null;
  residenteSector: string | null;
  fechaAsignacion: string;
  createdAt: string;
}

// --- Dashboard ---

export interface ResumenDashboard {
  residentesActivos: number;
  tomasPendientesTurno: number;
  tomasAdministradasHoy: number;
  cuidadosRegistradosHoy: number;
  totalNovedadesHoy: number;
  novedadesPorPrioridad: { baja: number; media: number; alta: number; critica: number };
  actividadReciente: EventoActividad[];
  /** Indicadores gerenciales; solo presente para el rol ADMIN. */
  indicadoresGestion?: IndicadoresGestion | null;
}

export interface PuntoTendencia {
  fecha: string;
  valor: number;
}

export interface CargaCuidador {
  usuarioId: number;
  nombre: string;
  residentesAsignados: number;
}

export interface IndicadoresGestion {
  // Adherencia
  adherenciaHoy: number;
  tasaOmisionHoy: number;
  tasaDemoraHoy: number;
  tomasProgramadasHoy: number;
  adherencia7dias: PuntoTendencia[];
  // Cobertura de cuidados
  coberturaCuidadosTurno: number;
  residentesSinCuidadoTurno: number;
  cuidados7dias: PuntoTendencia[];
  // Carga del personal
  ratioResidentesPorCuidador: number;
  residentesSinAsignar: number;
  personalSinAsignaciones: number;
  cargaPorCuidador: CargaCuidador[];
}

export interface EventoActividad {
  tipo: 'ADMINISTRACION' | 'NOVEDAD' | 'BIENESTAR';
  titulo: string;
  residenteNombre: string;
  residenteHabitacion: string | null;
  usuarioNombre: string;
  fechaHora: string;
  prioridad?: PrioridadNovedad | null;
  estado?: EstadoAdministracion | null;
}
