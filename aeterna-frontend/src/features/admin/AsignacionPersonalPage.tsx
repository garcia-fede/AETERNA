import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, UserPlus, X, ChevronDown, ChevronRight } from 'lucide-react';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AsignarResidenteModal from './AsignarResidenteModal';
import { asignacionService } from './asignacionService';
import type { PersonalConResidentes } from '../../types';
import toast from 'react-hot-toast';

export default function AsignacionPersonalPage() {
  const queryClient = useQueryClient();

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [modalPersonal, setModalPersonal] = useState<PersonalConResidentes | null>(null);

  const { data: personalList = [], isLoading } = useQuery({
    queryKey: ['asignaciones-personal'],
    queryFn: asignacionService.listarPersonalConResidentes,
    staleTime: 60 * 1000,
  });

  const desasignarMutation = useMutation({
    mutationFn: ({ usuarioId, residenteId }: { usuarioId: number; residenteId: number }) =>
      asignacionService.desasignar(usuarioId, residenteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones-personal'] });
      toast.success('Residente desasignado');
    },
    onError: () => toast.error('Error al desasignar residente'),
  });

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDesasignar = (usuarioId: number, residenteId: number, residenteNombre: string) => {
    if (confirm(`¿Desasignar a ${residenteNombre} de este personal?`)) {
      desasignarMutation.mutate({ usuarioId, residenteId });
    }
  };

  const totalAsignaciones = personalList.reduce((acc, p) => acc + p.residentes.length, 0);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Asignaciones de personal</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {personalList.length} miembros del personal · {totalAsignaciones} asignaciones activas
            </p>
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Cargando...</div>
          ) : personalList.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No hay usuarios con rol Personal registrados
            </div>
          ) : (
            personalList.map((personal) => {
              const isExpanded = expandedIds.has(personal.usuarioId);
              return (
                <div
                  key={personal.usuarioId}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Fila del personal */}
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpanded(personal.usuarioId)}
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary-700">
                          {personal.nombre[0]}{personal.apellido[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {personal.nombre} {personal.apellido}
                        </p>
                        <p className="text-xs text-gray-500">{personal.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <Badge
                        label={`${personal.residentes.length} residente${personal.residentes.length !== 1 ? 's' : ''}`}
                        color={personal.residentes.length > 0 ? 'blue' : 'gray'}
                      />
                      {!personal.activo && (
                        <Badge label="Inactivo" color="gray" />
                      )}
                      <Button
                        onClick={() => setModalPersonal(personal)}
                        variant="secondary"
                        className="gap-1.5 !py-1.5 !px-3 !text-xs"
                        disabled={!personal.activo}
                        title={!personal.activo ? 'El usuario está inactivo' : 'Asignar residente'}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Asignar
                      </Button>
                    </div>
                  </div>

                  {/* Residentes asignados (expandible) */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      {personal.residentes.length === 0 ? (
                        <div className="px-5 py-4 text-sm text-gray-400 text-center">
                          Sin residentes asignados
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {personal.residentes.map((r) => (
                            <div
                              key={r.asignacionId}
                              className="flex items-center justify-between px-5 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <UserCheck className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {r.apellido}, {r.nombre}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {r.habitacion ? `Hab. ${r.habitacion}` : 'Sin habitación'}
                                    {r.sector ? ` · ${r.sector}` : ''}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  handleDesasignar(personal.usuarioId, r.residenteId, `${r.nombre} ${r.apellido}`)
                                }
                                disabled={desasignarMutation.isPending}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                title="Desasignar residente"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {modalPersonal && (
        <AsignarResidenteModal
          isOpen={!!modalPersonal}
          onClose={() => setModalPersonal(null)}
          personal={modalPersonal}
        />
      )}
    </Layout>
  );
}
