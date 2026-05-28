import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { familiaresService } from './familiaresService';
import { usuariosService } from './usuariosService';
import type { NivelAcceso } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  residenteId: number;
}

const nivelAccesoOptions: { value: NivelAcceso; label: string }[] = [
  { value: 'COMPLETO', label: 'Completo' },
  { value: 'SOLO_LECTURA', label: 'Solo lectura' },
  { value: 'LIMITADO', label: 'Limitado' },
];

export default function VincularFamiliarModal({ isOpen, onClose, residenteId }: Props) {
  const queryClient = useQueryClient();
  const [usuarioId, setUsuarioId] = useState<string>('');
  const [vinculo, setVinculo] = useState('');
  const [nivelAcceso, setNivelAcceso] = useState<NivelAcceso>('COMPLETO');
  const [error, setError] = useState('');

  const { data: familiares = [] } = useQuery({
    queryKey: ['usuarios', 'FAMILIAR'],
    queryFn: () => usuariosService.listar('FAMILIAR'),
    staleTime: 60 * 1000,
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: () =>
      familiaresService.vincular({
        usuarioId: Number(usuarioId),
        residenteId,
        vinculo: vinculo.trim() || undefined,
        nivelAcceso,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familiares'] });
      toast.success('Familiar vinculado correctamente');
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al vincular');
    },
  });

  const handleClose = () => {
    setUsuarioId('');
    setVinculo('');
    setNivelAcceso('COMPLETO');
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioId) {
      setError('Seleccioná un familiar');
      return;
    }
    setError('');
    mutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Vincular familiar" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Familiar</label>
          <select
            className="input-field"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
          >
            <option value="">Seleccionar familiar...</option>
            {familiares.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre} {f.apellido} — {f.email}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          {familiares.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">
              No hay usuarios con rol Familiar. Creá uno primero desde Usuarios.
            </p>
          )}
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
