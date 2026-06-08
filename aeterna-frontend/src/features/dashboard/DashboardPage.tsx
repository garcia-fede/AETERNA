import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Pill,
  HeartPulse,
  AlertTriangle,
  Activity,
  Clock,
} from 'lucide-react';
import Layout from '../../components/Layout';
import IndicadoresGestion from './IndicadoresGestion';
import { dashboardService } from './dashboardService';
import { useAuthStore } from '../../stores/authStore';
import type { EventoActividad, PrioridadNovedad, EstadoAdministracion } from '../../types';
import { getTurnoActual, formatTurno } from '../../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSaludo(): string {
  const hora = new Date().getHours();
  if (hora >= 6 && hora <= 12) return 'Buen día';
  if (hora >= 13 && hora <= 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function horaActual(): string {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function tiempoRelativo(fechaIso: string): string {
  const ahora = Date.now();
  const fecha = new Date(fechaIso).getTime();
  const diffMs = ahora - fecha;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `hace ${diffHoras} h`;
  const diffDias = Math.floor(diffHoras / 24);
  return `hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
}

// ─── KpiCard ────────────────────────────────────────────────────────────────

type ColorKpi = 'teal' | 'amber' | 'emerald' | 'blue' | 'rose' | 'orange';

const borderColorMap: Record<ColorKpi, string> = {
  teal: 'border-l-teal-500',
  amber: 'border-l-amber-500',
  emerald: 'border-l-emerald-500',
  blue: 'border-l-blue-500',
  rose: 'border-l-rose-500',
  orange: 'border-l-orange-500',
};

const iconBgMap: Record<ColorKpi, string> = {
  teal: 'bg-teal-50 text-teal-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  rose: 'bg-rose-50 text-rose-600',
  orange: 'bg-orange-50 text-orange-600',
};

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: ColorKpi;
  sublabel?: string;
}

function KpiCard({ label, value, icon, colorClass, sublabel }: KpiCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${borderColorMap[colorClass]} p-5 flex flex-col gap-3`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
          {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgMap[colorClass]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── BarrasPrioridad ────────────────────────────────────────────────────────

interface BarrasPrioridadProps {
  data: { baja: number; media: number; alta: number; critica: number };
}

const barras: { key: keyof BarrasPrioridadProps['data']; label: string; color: string }[] = [
  { key: 'critica', label: 'Crítica', color: 'bg-red-500' },
  { key: 'alta', label: 'Alta', color: 'bg-orange-500' },
  { key: 'media', label: 'Media', color: 'bg-blue-500' },
  { key: 'baja', label: 'Baja', color: 'bg-gray-400' },
];

function BarrasPrioridad({ data }: BarrasPrioridadProps) {
  const maxVal = Math.max(data.baja, data.media, data.alta, data.critica, 1);
  const total = data.baja + data.media + data.alta + data.critica;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-400">
        <Activity className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-sm">Sin novedades hoy</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {barras.map(({ key, label, color }) => {
        const valor = data[key];
        const pct = Math.max((valor / maxVal) * 100, valor > 0 ? 4 : 0);
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`${color} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700 w-6 text-right flex-shrink-0">
              {valor}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Ícono por tipo de evento ───────────────────────────────────────────────

function IconoEvento({ tipo }: { tipo: EventoActividad['tipo'] }) {
  if (tipo === 'ADMINISTRACION')
    return <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0"><Pill className="w-4 h-4 text-teal-600" /></div>;
  if (tipo === 'NOVEDAD')
    return <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-4 h-4 text-orange-500" /></div>;
  return <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0"><HeartPulse className="w-4 h-4 text-blue-500" /></div>;
}

const badgePrioridad: Record<PrioridadNovedad, string> = {
  BAJA: 'bg-gray-100 text-gray-600',
  MEDIA: 'bg-blue-100 text-blue-700',
  ALTA: 'bg-orange-100 text-orange-700',
  CRITICA: 'bg-red-100 text-red-700',
};

const badgeEstado: Record<EstadoAdministracion, string> = {
  ADMINISTRADA: 'bg-emerald-100 text-emerald-700',
  OMITIDA: 'bg-gray-100 text-gray-600',
  CON_DEMORA: 'bg-yellow-100 text-yellow-700',
};

function labelEstado(estado: EstadoAdministracion): string {
  const map: Record<EstadoAdministracion, string> = {
    ADMINISTRADA: 'Administrada',
    OMITIDA: 'Omitida',
    CON_DEMORA: 'Con demora',
  };
  return map[estado];
}

// ─── ActividadFeed ──────────────────────────────────────────────────────────

function ActividadFeed({ eventos }: { eventos: EventoActividad[] }) {
  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-400">
        <Clock className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-sm">Sin actividad registrada hoy</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {eventos.map((ev, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <IconoEvento tipo={ev.tipo} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-800 truncate">{ev.titulo}</p>
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                {tiempoRelativo(ev.fechaHora)}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {ev.residenteNombre}
              {ev.residenteHabitacion ? ` · Hab. ${ev.residenteHabitacion}` : ''}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-gray-400">{ev.usuarioNombre}</span>
              {ev.prioridad && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${badgePrioridad[ev.prioridad]}`}>
                  {ev.prioridad.charAt(0) + ev.prioridad.slice(1).toLowerCase()}
                </span>
              )}
              {ev.estado && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${badgeEstado[ev.estado]}`}>
                  {labelEstado(ev.estado)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 border-l-4 border-l-gray-200 p-5 h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-48" />
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-48" />
        </div>
      </div>
    </Layout>
  );
}

// ─── DashboardPage ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();
  const turnoActual = getTurnoActual();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-resumen'],
    queryFn: dashboardService.getResumen,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  if (isLoading || !data) return <DashboardSkeleton />;

  const hayNovedadesCriticas = data.novedadesPorPrioridad.critica > 0;
  const hayTomasPendientes = data.tomasPendientesTurno > 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {getSaludo()}, {user?.nombre}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Turno actual: <span className="font-medium text-gray-700">{formatTurno(turnoActual)}</span>
              {' · '}
              {horaActual()}
            </span>
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Residentes activos"
            value={data.residentesActivos}
            icon={<Users className="w-5 h-5" />}
            colorClass="teal"
          />
          <KpiCard
            label="Tomas pendientes"
            value={data.tomasPendientesTurno}
            icon={<Pill className="w-5 h-5" />}
            colorClass={hayTomasPendientes ? 'amber' : 'emerald'}
            sublabel={`Turno ${formatTurno(turnoActual)}`}
          />
          <KpiCard
            label="Cuidados registrados hoy"
            value={data.cuidadosRegistradosHoy}
            icon={<HeartPulse className="w-5 h-5" />}
            colorClass="blue"
            sublabel={`${data.tomasAdministradasHoy} tomas administradas`}
          />
          <KpiCard
            label="Novedades del día"
            value={data.totalNovedadesHoy}
            icon={<AlertTriangle className="w-5 h-5" />}
            colorClass={hayNovedadesCriticas ? 'rose' : 'orange'}
            sublabel={hayNovedadesCriticas ? `${data.novedadesPorPrioridad.critica} crítica${data.novedadesPorPrioridad.critica > 1 ? 's' : ''}` : undefined}
          />
        </div>

        {/* Sección secundaria */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Novedades por prioridad */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Novedades por prioridad
              </h2>
              <span className="text-xs text-gray-400">Hoy</span>
            </div>
            <BarrasPrioridad data={data.novedadesPorPrioridad} />
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Actividad reciente
              </h2>
              <span className="text-xs text-gray-400">Últimos 10 eventos</span>
            </div>
            <ActividadFeed eventos={data.actividadReciente} />
          </div>
        </div>

        {/* Indicadores de gestión (solo ADMIN: el backend solo los envía a ese rol) */}
        {data.indicadoresGestion && <IndicadoresGestion data={data.indicadoresGestion} />}
      </div>
    </Layout>
  );
}
