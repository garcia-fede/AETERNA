import { useQuery } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import { novedadesService } from './novedadesService';
import { formatTipoNovedad, formatPrioridad, colorPrioridad } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  residenteId: number;
  residenteNombre: string;
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

export default function NovedadesResidenteModal({ isOpen, onClose, residenteId, residenteNombre }: Props) {
  const { data: novedades = [], isLoading } = useQuery({
    queryKey: ['novedades-residente', residenteId],
    queryFn: () => novedadesService.obtenerPorResidente(residenteId),
    enabled: isOpen,
    staleTime: 60 * 1000,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Novedades — ${residenteNombre}`} size="lg">
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : novedades.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">Sin novedades registradas</div>
        ) : (
          novedades.map((n) => (
            <div key={n.id} className="border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorPrioridad(n.prioridad)}`}>
                  {formatPrioridad(n.prioridad)}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  {formatTipoNovedad(n.tipo)}
                </span>
              </div>
              <p className="text-sm text-gray-800 mt-1">{n.descripcion}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">{n.personalNombreCompleto}</p>
                <p className="text-xs text-gray-400">{formatFechaHora(n.fechaHora)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
