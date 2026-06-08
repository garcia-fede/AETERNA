import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, XCircle, User } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { medicacionService } from './medicacionService';
import { useAuthStore } from '../../stores/authStore';
import { formatEstadoAdministracion } from '../../types';
import type { TomaPendiente, EstadoAdministracion, Turno } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  toma: TomaPendiente;
  turno: Turno;
  fecha: string;
  queryKey: string[];
}

const estadoConfig: { value: EstadoAdministracion; label: string; icon: React.ReactNode; active: string; inactive: string }[] = [
  {
    value: 'ADMINISTRADA',
    label: 'Administrada',
    icon: <CheckCircle className="w-4 h-4" />,
    active: 'bg-green-600 text-white border-green-600',
    inactive: 'bg-white text-green-700 border-green-200 hover:bg-green-50',
  },
  {
    value: 'CON_DEMORA',
    label: 'Con demora',
    icon: <Clock className="w-4 h-4" />,
    active: 'bg-yellow-500 text-white border-yellow-500',
    inactive: 'bg-white text-yellow-700 border-yellow-200 hover:bg-yellow-50',
  },
  {
    value: 'OMITIDA',
    label: 'Omitida',
    icon: <XCircle className="w-4 h-4" />,
    active: 'bg-red-600 text-white border-red-600',
    inactive: 'bg-white text-red-700 border-red-200 hover:bg-red-50',
  },
];

function toLocalDatetimeValue(date: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function RegistrarAdministracionModal({ isOpen, onClose, toma, turno, fecha, queryKey }: Props) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [estado, setEstado] = useState<EstadoAdministracion>('ADMINISTRADA');
  const [fechaHoraInput, setFechaHoraInput] = useState(() => toLocalDatetimeValue(fecha));
  const [observaciones, setObservaciones] = useState('');

  const mutation = useMutation({
    mutationFn: medicacionService.registrarAdministracion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Administración registrada');
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al registrar';
      toast.error(msg);
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      medicamentoId: toma.medicamentoId,
      estado,
      turno,
      observaciones: observaciones.trim() || undefined,
      fechaHora: fechaHoraInput ? fechaHoraInput + ':00' : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar administración"
      size="sm"
    >
      <div className="space-y-5">
        {/* Info del residente y medicamento */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Residente</p>
          <p className="font-semibold text-gray-900">{toma.residenteNombre}</p>
          {toma.residenteHabitacion && (
            <p className="text-xs text-gray-500">Hab. {toma.residenteHabitacion}</p>
          )}
        </div>

        <div className="bg-blue-50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Medicamento</p>
          <p className="font-semibold text-gray-900">{toma.nombreMedicamento}</p>
          <div className="flex gap-3 text-xs text-gray-600 flex-wrap">
            {toma.dosis && <span>Dosis: <strong>{toma.dosis}</strong></span>}
            {toma.via && <span>Vía: <strong>{toma.via}</strong></span>}
            {toma.frecuencia && <span>{toma.frecuencia}</span>}
          </div>
          {toma.observacionesMedicamento && (
            <p className="text-xs text-amber-600 italic mt-1">{toma.observacionesMedicamento}</p>
          )}
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <div className="flex gap-2">
            {estadoConfig.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEstado(opt.value)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  estado === opt.value ? opt.active : opt.inactive
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Fecha y hora de administración
          </label>
          <input
            type="datetime-local"
            className="input-field text-sm"
            value={fechaHoraInput}
            onChange={(e) => setFechaHoraInput(e.target.value)}
          />
        </div>

        {/* Observaciones */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            className="input-field resize-none text-sm"
            rows={3}
            placeholder="Ej: Dosis completa administrada sin incidencias. Paciente colaboró correctamente..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        {/* Registrado por */}
        <div className="flex items-center gap-2 text-xs text-gray-400 pt-1 border-t border-gray-100">
          <User className="w-3.5 h-3.5" />
          <span>Registrado por: <strong className="text-gray-600">{user?.nombre} {user?.apellido}</strong></span>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : `Confirmar — ${formatEstadoAdministracion(estado)}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
