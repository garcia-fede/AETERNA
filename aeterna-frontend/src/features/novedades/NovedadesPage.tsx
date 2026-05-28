import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Plus } from 'lucide-react';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import { novedadesService } from './novedadesService';
import { residentesService } from '../residentes/residentesService';
import NovedadFormModal from './NovedadFormModal';
import NovedadDetalleModal from './NovedadDetalleModal';
import {
  formatTipoNovedad,
  formatPrioridad,
  colorPrioridad,
} from '../../types';
import type { TipoNovedad, PrioridadNovedad, Novedad } from '../../types';
import { useAuthStore } from '../../stores/authStore';

const tiposNovedad: TipoNovedad[] = [
  'INCIDENCIA_CLINICA',
  'FALTA_INSUMO',
  'OBSERVACION',
  'CAIDA_ACCIDENTE',
  'VISITA_MEDICA',
  'CAMBIO_ESTADO',
];

const prioridadesFilter: PrioridadNovedad[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

function formatFechaHora(dt: string): string {
  return new Date(dt).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NovedadesPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'ADMIN';

  const [filtroResidenteId, setFiltroResidenteId] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<TipoNovedad | ''>('');
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadNovedad | ''>('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedNovedad, setSelectedNovedad] = useState<Novedad | null>(null);

  const queryKey = [
    'novedades',
    filtroResidenteId || undefined,
    filtroTipo || undefined,
    filtroPrioridad || undefined,
  ];

  const { data: novedades = [], isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      novedadesService.listar({
        residenteId: filtroResidenteId ? parseInt(filtroResidenteId) : undefined,
        tipo: filtroTipo || undefined,
        prioridad: filtroPrioridad || undefined,
      }),
    staleTime: 30 * 1000,
  });

  const { data: residentes = [] } = useQuery({
    queryKey: ['residentes'],
    queryFn: residentesService.listar,
    staleTime: 2 * 60 * 1000,
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novedades</h1>
            <p className="text-sm text-gray-500 mt-0.5">{novedades.length} novedades</p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva novedad
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <select
            className="input-field py-2 text-sm w-52"
            value={filtroResidenteId}
            onChange={(e) => setFiltroResidenteId(e.target.value)}
          >
            <option value="">Todos los residentes</option>
            {residentes.map((r) => (
              <option key={r.id} value={r.id}>{r.nombreCompleto}</option>
            ))}
          </select>

          <select
            className="input-field py-2 text-sm w-48"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoNovedad | '')}
          >
            <option value="">Todos los tipos</option>
            {tiposNovedad.map((t) => (
              <option key={t} value={t}>{formatTipoNovedad(t)}</option>
            ))}
          </select>

          <select
            className="input-field py-2 text-sm w-40"
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value as PrioridadNovedad | '')}
          >
            <option value="">Todas las prioridades</option>
            {prioridadesFilter.map((p) => (
              <option key={p} value={p}>{formatPrioridad(p)}</option>
            ))}
          </select>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Cargando...</div>
        ) : novedades.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No hay novedades para los filtros seleccionados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {novedades.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedNovedad(n)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 cursor-pointer hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorPrioridad(n.prioridad)}`}>
                        {formatPrioridad(n.prioridad)}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {formatTipoNovedad(n.tipo)}
                      </span>
                      {n.visibleFamiliar && (
                        <span className="text-xs text-purple-600">Familiar</span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 text-sm truncate">{n.residenteNombre}</p>
                    {n.residenteHabitacion && (
                      <p className="text-xs text-gray-500">Hab. {n.residenteHabitacion}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.descripcion}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">{formatFechaHora(n.fechaHora)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.personalNombreCompleto}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NovedadFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} />

      {selectedNovedad && (
        <NovedadDetalleModal
          isOpen={!!selectedNovedad}
          onClose={() => setSelectedNovedad(null)}
          novedad={selectedNovedad}
          isAdmin={isAdmin}
          queryKey={queryKey as string[]}
        />
      )}
    </Layout>
  );
}
