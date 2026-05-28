import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import MedicamentoFormModal from './MedicamentoFormModal';
import { medicacionService } from './medicacionService';
import { useAuthStore } from '../../stores/authStore';
import { formatTurno } from '../../types';
import type { Medicamento, Turno } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  residenteId: number;
}

const turnoBadgeColor = (turno: Turno): 'blue' | 'yellow' | 'gray' => {
  if (turno === 'MANIANA') return 'blue';
  if (turno === 'TARDE') return 'yellow';
  return 'gray';
};

export default function MedicamentosResidente({ residenteId }: Props) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.rol === 'ADMIN';

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Medicamento | null>(null);

  const { data: medicamentos = [], isLoading } = useQuery({
    queryKey: ['medicamentos', residenteId],
    queryFn: () => medicacionService.listarMedicamentosResidente(residenteId),
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: medicacionService.eliminarMedicamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos', residenteId] });
      toast.success('Medicamento dado de baja');
    },
    onError: () => toast.error('Error al dar de baja el medicamento'),
  });

  const handleEdit = (m: Medicamento) => {
    setSelected(m);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelected(null);
    setModalOpen(true);
  };

  const handleDelete = (m: Medicamento) => {
    if (confirm(`¿Dar de baja ${m.nombreMedicamento}? Ya no aparecerá en el plan activo.`)) {
      deleteMutation.mutate(m.id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Plan farmacológico
        </h3>
        {isAdmin && (
          <Button onClick={handleNew} className="gap-1.5 text-xs py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" />
            Agregar
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 py-4 text-center">Cargando...</p>
      ) : medicamentos.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          Sin medicamentos activos en el plan
        </p>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-medium text-gray-600">Medicamento</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Dosis</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Vía</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Frecuencia</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Turnos</th>
                {isAdmin && (
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {medicamentos.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900">{m.nombreMedicamento}</td>
                  <td className="px-3 py-2 text-gray-600">{m.dosis ?? '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{m.via ?? '—'}</td>
                  <td className="px-3 py-2 text-gray-600 max-w-[180px] truncate">{m.frecuencia ?? '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      {m.horariosTurnos.map((t) => (
                        <Badge key={t} label={formatTurno(t)} color={turnoBadgeColor(t)} />
                      ))}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(m)}
                          className="p-1.5 rounded hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Dar de baja"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && (
        <MedicamentoFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          residenteId={residenteId}
          medicamento={selected}
        />
      )}
    </div>
  );
}
