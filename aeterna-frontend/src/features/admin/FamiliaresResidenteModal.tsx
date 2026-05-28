import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import VincularFamiliarModal from './VincularFamiliarModal';
import { familiaresService } from './familiaresService';
import type { Vinculo } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  residenteId: number;
  residenteNombre: string;
}

export default function FamiliaresResidenteModal({ isOpen, onClose, residenteId, residenteNombre }: Props) {
  const queryClient = useQueryClient();
  const [vincularOpen, setVincularOpen] = useState(false);

  const { data: vinculos = [], isLoading } = useQuery<Vinculo[]>({
    queryKey: ['familiares', 'residente', residenteId],
    queryFn: () => familiaresService.listarPorResidente(residenteId),
    enabled: isOpen,
    staleTime: 30 * 1000,
  });

  const desvincularMutation = useMutation({
    mutationFn: familiaresService.desvincular,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familiares', 'residente', residenteId] });
      toast.success('Familiar desvinculado');
    },
    onError: () => toast.error('Error al desvincular'),
  });

  const handleDesvincular = (v: Vinculo) => {
    if (confirm(`¿Desvincular a ${v.usuarioNombreCompleto} del residente?`)) {
      desvincularMutation.mutate(v.id);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Familiares — ${residenteNombre}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setVincularOpen(true)} className="gap-2 text-sm">
              <Plus className="w-3.5 h-3.5" />
              Vincular familiar
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-4">Cargando...</p>
          ) : vinculos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No hay familiares vinculados a este residente
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {vinculos.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.usuarioNombreCompleto}</p>
                    <p className="text-xs text-gray-500">{v.usuarioEmail}</p>
                    <div className="flex gap-2 mt-1">
                      {v.vinculo && <Badge label={v.vinculo} color="blue" />}
                      <Badge
                        label={
                          v.nivelAcceso === 'COMPLETO'
                            ? 'Acceso completo'
                            : v.nivelAcceso === 'SOLO_LECTURA'
                            ? 'Solo lectura'
                            : 'Limitado'
                        }
                        color="gray"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDesvincular(v)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Desvincular"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <VincularFamiliarModal
        isOpen={vincularOpen}
        onClose={() => setVincularOpen(false)}
        residenteId={residenteId}
      />
    </>
  );
}
