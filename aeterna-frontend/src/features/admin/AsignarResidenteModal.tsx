import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { asignacionService } from './asignacionService';
import { residentesService } from '../residentes/residentesService';
import type { PersonalConResidentes, Residente } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  personal: PersonalConResidentes;
}

export default function AsignarResidenteModal({ isOpen, onClose, personal }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: todosLosResidentes = [], isLoading } = useQuery({
    queryKey: ['residentes-todos'],
    queryFn: residentesService.listar,
    staleTime: 2 * 60 * 1000,
    enabled: isOpen,
  });

  const asignarMutation = useMutation({
    mutationFn: (residenteId: number) => asignacionService.asignar(personal.usuarioId, residenteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones-personal'] });
      toast.success('Residente asignado correctamente');
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Error al asignar residente';
      toast.error(msg);
    },
  });

  // Filtrar los que ya están asignados a este personal
  const yaAsignadosIds = new Set(personal.residentes.map((r) => r.residenteId));

  const disponibles = todosLosResidentes.filter((r: Residente) => {
    if (yaAsignadosIds.has(r.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.nombreCompleto.toLowerCase().includes(q) ||
      r.dni.includes(q) ||
      (r.numeroHabitacion?.toLowerCase().includes(q) ?? false)
    );
  });

  const handleAsignar = (residenteId: number) => {
    asignarMutation.mutate(residenteId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Asignar residente a ${personal.nombre} ${personal.apellido}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, habitación..."
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-400">Cargando residentes...</div>
        ) : disponibles.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            {search ? 'Sin resultados para la búsqueda' : 'No hay residentes disponibles para asignar'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto rounded-lg border border-gray-200">
            {disponibles.map((r: Residente) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.nombreCompleto}</p>
                  <p className="text-xs text-gray-500">
                    DNI {r.dni}
                    {r.numeroHabitacion ? ` · Hab. ${r.numeroHabitacion}` : ''}
                    {r.sector ? ` · ${r.sector}` : ''}
                  </p>
                </div>
                <Button
                  onClick={() => handleAsignar(r.id)}
                  disabled={asignarMutation.isPending}
                  className="!py-1.5 !px-3 !text-xs"
                >
                  Asignar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
