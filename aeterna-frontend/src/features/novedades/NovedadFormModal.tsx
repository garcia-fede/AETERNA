import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { novedadesService } from './novedadesService';
import { residentesService } from '../residentes/residentesService';
import { formatTipoNovedad, formatPrioridad } from '../../types';
import type { TipoNovedad, PrioridadNovedad, NovedadRequest } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const tiposNovedad: TipoNovedad[] = [
  'INCIDENCIA_CLINICA',
  'FALTA_INSUMO',
  'OBSERVACION',
  'CAIDA_ACCIDENTE',
  'VISITA_MEDICA',
  'CAMBIO_ESTADO',
];

const prioridades: PrioridadNovedad[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

export default function NovedadFormModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const [residenteId, setResidenteId] = useState('');
  const [tipo, setTipo] = useState<TipoNovedad | ''>('');
  const [prioridad, setPrioridad] = useState<PrioridadNovedad>('MEDIA');
  const [descripcion, setDescripcion] = useState('');
  const [visibleFamiliar, setVisibleFamiliar] = useState(false);
  const [visibleTurnoEntrante, setVisibleTurnoEntrante] = useState(true);

  const { data: residentes = [] } = useQuery({
    queryKey: ['residentes'],
    queryFn: residentesService.listar,
    staleTime: 2 * 60 * 1000,
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: novedadesService.crear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novedades'] });
      toast.success('Novedad registrada');
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al crear novedad');
    },
  });

  const handleClose = () => {
    setResidenteId('');
    setTipo('');
    setPrioridad('MEDIA');
    setDescripcion('');
    setVisibleFamiliar(false);
    setVisibleTurnoEntrante(true);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residenteId || !tipo) return;
    if (descripcion.trim().length < 5) {
      toast.error('La descripción debe tener al menos 5 caracteres');
      return;
    }
    const request: NovedadRequest = {
      residenteId: parseInt(residenteId),
      tipo,
      descripcion: descripcion.trim(),
      prioridad,
      visibleFamiliar,
      visibleTurnoEntrante,
    };
    mutation.mutate(request);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva novedad" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Residente *</label>
          <select
            required
            className="input-field py-2 text-sm"
            value={residenteId}
            onChange={(e) => setResidenteId(e.target.value)}
          >
            <option value="">— Seleccionar residente —</option>
            {residentes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombreCompleto} — Hab. {r.numeroHabitacion ?? 'S/N'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select
            required
            className="input-field py-2 text-sm"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoNovedad)}
          >
            <option value="">— Seleccionar tipo —</option>
            {tiposNovedad.map((t) => (
              <option key={t} value={t}>{formatTipoNovedad(t)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select
            className="input-field py-2 text-sm"
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value as PrioridadNovedad)}
          >
            {prioridades.map((p) => (
              <option key={p} value={p}>{formatPrioridad(p)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
          <textarea
            required
            minLength={5}
            rows={4}
            className="input-field resize-none text-sm"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describir la novedad con detalle relevante..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-primary-600"
              checked={visibleFamiliar}
              onChange={(e) => setVisibleFamiliar(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Visible para el familiar</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-primary-600"
              checked={visibleTurnoEntrante}
              onChange={(e) => setVisibleTurnoEntrante(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Visible para el turno entrante</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Registrar novedad'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
