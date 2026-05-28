import { useQuery } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { medicacionService } from './medicacionService';
import { formatEstadoAdministracion, formatTurno } from '../../types';
import type { EstadoAdministracion } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  residenteId: number;
  residenteNombre: string;
}

const estadoColor = (estado: EstadoAdministracion): 'green' | 'red' | 'yellow' => {
  if (estado === 'ADMINISTRADA') return 'green';
  if (estado === 'OMITIDA') return 'red';
  return 'yellow';
};

export default function HistorialAdministracionesModal({
  isOpen,
  onClose,
  residenteId,
  residenteNombre,
}: Props) {
  const hasta = new Date().toISOString().split('T')[0];
  const desdeDate = new Date();
  desdeDate.setDate(desdeDate.getDate() - 7);
  const desde = desdeDate.toISOString().split('T')[0];

  const { data: historial = [], isLoading } = useQuery({
    queryKey: ['historial-administraciones', residenteId],
    queryFn: () => medicacionService.historialAdministraciones(residenteId, desde, hasta),
    enabled: isOpen,
    staleTime: 30 * 1000,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Historial de medicación — ${residenteNombre}`}
      size="lg"
    >
      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">Cargando...</p>
      ) : historial.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Sin registros en los últimos 7 días
        </p>
      ) : (
        <div className="space-y-2">
          {historial.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {a.nombreMedicamento}
                  {a.dosis && <span className="text-gray-500 font-normal"> — {a.dosis}</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(a.fechaHora).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  · {formatTurno(a.turno)} · {a.personalNombreCompleto}
                </p>
                {a.observaciones && (
                  <p className="text-xs text-gray-400 mt-0.5 italic">{a.observaciones}</p>
                )}
              </div>
              <Badge
                label={formatEstadoAdministracion(a.estado)}
                color={estadoColor(a.estado)}
              />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
