import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import { novedadesService } from './novedadesService';
import {
  formatTipoNovedad,
  formatPrioridad,
  colorPrioridad,
} from '../../types';
import type { Novedad, PrioridadNovedad } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  novedad: Novedad;
  isAdmin: boolean;
  queryKey: string[];
}

function formatFechaHora(dt: string): string {
  return new Date(dt).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const prioridades: PrioridadNovedad[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

export default function NovedadDetalleModal({ isOpen, onClose, novedad, isAdmin, queryKey }: Props) {
  const queryClient = useQueryClient();

  const prioridadMutation = useMutation({
    mutationFn: (p: PrioridadNovedad) => novedadesService.actualizarPrioridad(novedad.id, p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Prioridad actualizada');
    },
    onError: () => toast.error('Error al actualizar prioridad'),
  });

  const visibilidadMutation = useMutation({
    mutationFn: ({ vf, vt }: { vf: boolean; vt: boolean }) =>
      novedadesService.actualizarVisibilidad(novedad.id, vf, vt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Visibilidad actualizada');
    },
    onError: () => toast.error('Error al actualizar visibilidad'),
  });

  const eliminarMutation = useMutation({
    mutationFn: () => novedadesService.eliminar(novedad.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Novedad eliminada');
      onClose();
    },
    onError: () => toast.error('Error al eliminar novedad'),
  });

  const handleEliminar = () => {
    if (confirm('¿Eliminar esta novedad? Esta acción no se puede deshacer.')) {
      eliminarMutation.mutate();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de novedad" size="md">
      <div className="space-y-4 text-sm">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorPrioridad(novedad.prioridad)}`}>
            {formatPrioridad(novedad.prioridad)}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {formatTipoNovedad(novedad.tipo)}
          </span>
          {novedad.visibleFamiliar && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
              Visible familiar
            </span>
          )}
          {novedad.visibleTurnoEntrante && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
              Turno entrante
            </span>
          )}
        </div>

        {/* Info residente */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <p className="font-semibold text-gray-900">{novedad.residenteNombre}</p>
          {novedad.residenteHabitacion && (
            <p className="text-gray-500 text-xs">Habitación {novedad.residenteHabitacion}</p>
          )}
        </div>

        {/* Descripcion */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Descripción</p>
          <p className="text-gray-800 leading-relaxed">{novedad.descripcion}</p>
        </div>

        {/* Meta */}
        <div className="text-xs text-gray-500 space-y-0.5">
          <p>Registrado por: <span className="text-gray-700 font-medium">{novedad.personalNombreCompleto}</span></p>
          <p>Fecha: <span className="text-gray-700">{formatFechaHora(novedad.fechaHora)}</span></p>
        </div>

        {/* Acciones admin */}
        {isAdmin && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cambiar prioridad</label>
              <div className="flex flex-wrap gap-2">
                {prioridades.map((p) => (
                  <button
                    key={p}
                    onClick={() => prioridadMutation.mutate(p)}
                    disabled={prioridadMutation.isPending || novedad.prioridad === p}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                      novedad.prioridad === p
                        ? colorPrioridad(p) + ' ring-2 ring-offset-1 ring-gray-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formatPrioridad(p)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Visibilidad</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    defaultChecked={novedad.visibleFamiliar}
                    onChange={(e) =>
                      visibilidadMutation.mutate({ vf: e.target.checked, vt: novedad.visibleTurnoEntrante })
                    }
                  />
                  <span className="text-xs text-gray-700">Familiar</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    defaultChecked={novedad.visibleTurnoEntrante}
                    onChange={(e) =>
                      visibilidadMutation.mutate({ vf: novedad.visibleFamiliar, vt: e.target.checked })
                    }
                  />
                  <span className="text-xs text-gray-700">Turno entrante</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleEliminar}
              disabled={eliminarMutation.isPending}
              className="w-full px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Eliminar novedad
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
