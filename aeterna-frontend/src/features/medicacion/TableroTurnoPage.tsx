import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pill, CheckCircle, Clock, XCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { medicacionService } from './medicacionService';
import { formatTurno, formatEstadoAdministracion, getTurnoActual } from '../../types';
import type { Turno, EstadoAdministracion, TomaPendiente } from '../../types';
import toast from 'react-hot-toast';

const turnoOptions: Turno[] = ['MANIANA', 'TARDE', 'NOCHE'];

const estadoColor = (estado: EstadoAdministracion): 'green' | 'yellow' | 'red' => {
  if (estado === 'ADMINISTRADA') return 'green';
  if (estado === 'CON_DEMORA') return 'yellow';
  return 'red';
};

interface TomaAccionState {
  observaciones: string;
}

export default function TableroTurnoPage() {
  const queryClient = useQueryClient();
  const hoy = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoy);
  const [turno, setTurno] = useState<Turno>(getTurnoActual());
  const [acciones, setAcciones] = useState<Record<number, TomaAccionState>>({});

  const queryKey = ['tomas-turno', fecha, turno];

  const { data: tomas = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => medicacionService.listarTomasPendientes(fecha, turno),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const registrarMutation = useMutation({
    mutationFn: medicacionService.registrarAdministracion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Administración registrada');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al registrar';
      toast.error(msg);
    },
  });

  const handleRegistrar = (toma: TomaPendiente, estado: EstadoAdministracion) => {
    const obs = acciones[toma.medicamentoId]?.observaciones ?? '';
    registrarMutation.mutate({
      medicamentoId: toma.medicamentoId,
      estado,
      turno,
      observaciones: obs || undefined,
    });
  };

  const setObservacion = (medicamentoId: number, value: string) => {
    setAcciones((prev) => ({
      ...prev,
      [medicamentoId]: { observaciones: value },
    }));
  };

  // Agrupar tomas por residente
  const tomasPorResidente = tomas.reduce<Record<number, TomaPendiente[]>>((acc, toma) => {
    const key = toma.residenteId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(toma);
    return acc;
  }, {});

  const pendientesCount = tomas.filter((t) => t.estadoActual === null).length;
  const completadasCount = tomas.filter((t) => t.estadoActual !== null).length;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tablero del turno</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {pendientesCount} pendientes · {completadasCount} completadas
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="date"
              className="input-field py-2 text-sm"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {turnoOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setTurno(t)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    turno === t
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {formatTurno(t)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Cargando tomas...</div>
        ) : tomas.length === 0 ? (
          <div className="py-16 text-center">
            <Pill className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No hay medicamentos asignados para este turno</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(tomasPorResidente).map(([residenteIdStr, tomasResidente]) => {
              const residenteId = parseInt(residenteIdStr);
              const primer = tomasResidente[0];
              return (
                <div key={residenteId} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Header del residente */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{primer.residenteNombre}</p>
                      {primer.residenteHabitacion && (
                        <p className="text-xs text-gray-500">Hab. {primer.residenteHabitacion}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {tomasResidente.filter((t) => t.estadoActual !== null).length}/{tomasResidente.length} administradas
                    </div>
                  </div>

                  {/* Tomas del residente */}
                  <div className="divide-y divide-gray-100">
                    {tomasResidente.map((toma) => (
                      <div key={toma.medicamentoId} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-4">
                          {/* Info del medicamento */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900 text-sm">
                                {toma.nombreMedicamento}
                              </span>
                              {toma.dosis && (
                                <span className="text-xs text-gray-500">{toma.dosis}</span>
                              )}
                              {toma.via && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                  {toma.via}
                                </span>
                              )}
                            </div>
                            {toma.frecuencia && (
                              <p className="text-xs text-gray-400 mt-0.5">{toma.frecuencia}</p>
                            )}
                            {toma.observacionesMedicamento && (
                              <p className="text-xs text-amber-600 mt-0.5 italic">
                                {toma.observacionesMedicamento}
                              </p>
                            )}
                          </div>

                          {/* Estado o acciones */}
                          <div className="flex-shrink-0">
                            {toma.estadoActual !== null ? (
                              <Badge
                                label={formatEstadoAdministracion(toma.estadoActual)}
                                color={estadoColor(toma.estadoActual)}
                              />
                            ) : (
                              <Badge label="Pendiente" color="gray" />
                            )}
                          </div>
                        </div>

                        {/* Acciones si está pendiente */}
                        {toma.estadoActual === null && (
                          <div className="mt-3 space-y-2">
                            <textarea
                              className="input-field resize-none text-xs py-1.5"
                              rows={1}
                              placeholder="Observación opcional..."
                              value={acciones[toma.medicamentoId]?.observaciones ?? ''}
                              onChange={(e) => setObservacion(toma.medicamentoId, e.target.value)}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRegistrar(toma, 'ADMINISTRADA')}
                                disabled={registrarMutation.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Administrar
                              </button>
                              <button
                                onClick={() => handleRegistrar(toma, 'CON_DEMORA')}
                                disabled={registrarMutation.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                Con demora
                              </button>
                              <button
                                onClick={() => handleRegistrar(toma, 'OMITIDA')}
                                disabled={registrarMutation.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Omitir
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
