import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { familiaresService } from './familiaresService';
import { residentesService } from '../residentes/residentesService';
import type { NivelAcceso } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: number;
}

const nivelAccesoOptions: { value: NivelAcceso; label: string }[] = [
  { value: 'COMPLETO', label: 'Completo' },
  { value: 'SOLO_LECTURA', label: 'Solo lectura' },
  { value: 'LIMITADO', label: 'Limitado' },
];

export default function VincularResidenteModal({ isOpen, onClose, usuarioId }: Props) {
  const queryClient = useQueryClient();
  const [residenteId, setResidenteId] = useState<string>('');
  const [vinculo, setVinculo] = useState('');
  const [nivelAcceso, setNivelAcceso] = useState<NivelAcceso>('COMPLETO');
  const [error, setError] = useState('');

  const { data: residentes = [] } = useQuery({
    queryKey: ['residentes'],
    queryFn: residentesService.listar,
    staleTime: 2 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: () =>
      familiaresService.vincular({
        usuarioId,
        residenteId: Number(residenteId),
        vinculo: vinculo.trim() || undefined,
        nivelAcceso,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familiares'] });
      toast.success('Vínculo creado correctamente');
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al crear el vínculo');
    },
  });

  const handleClose = () => {
    setResidenteId('');
    setVinculo('');
    setNivelAcceso('COMPLETO');
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residenteId) {
      setError('Seleccioná un residente');
      return;
    }
    setError('');
    mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Vincular familiar a residente"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Residente</label>
          <select
            className="input-field"
            value={residenteId}
            onChange={(e) => setResidenteId(e.target.value)}
          >
            <option value="">Seleccionar residente...</option>
            {residentes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombreCompleto} — Hab. {r.numeroHabitacion ?? '—'}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>

        <Input
          label="Vínculo (opcional)"
          value={vinculo}
          onChange={(e) => setVinculo(e.target.value)}
          placeholder="Ej: Hija, Nieto, Esposo..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de acceso</label>
          <select
            className="input-field"
            value={nivelAcceso}
            onChange={(e) => setNivelAcceso(e.target.value as NivelAcceso)}
          >
            {nivelAccesoOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Vincular
          </Button>
        </div>
      </form>
    </Modal>
  );
}
