import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pill, ClipboardEdit } from 'lucide-react';
import Layout from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import { medicacionService } from './medicacionService';
import { formatTurno, formatEstadoAdministracion, getTurnoActual } from '../../types';
import type { Turno, EstadoAdministracion, TomaPendiente } from '../../types';
import RegistrarAdministracionModal from './RegistrarAdministracionModal';

const turnoOptions: Turno[] = ['MANIANA', 'TARDE', 'NOCHE'];

const estadoColor = (estado: EstadoAdministracion): 'green' | 'yellow' | 'red' => {
  if (estado === 'ADMINISTRADA') return 'green';
  if (estado === 'CON_DEMORA') return 'yellow';
  return 'red';
};

export default function TableroTurnoPage() {
  const hoy = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoy);
  const [turno, setTurno] = useState<Turno>(getTurnoActual());
  const [tomaSeleccionada, setTomaSeleccionada] = useState<TomaPendiente | null>(null);

  const queryKey = ['tomas-turno', fecha, turno];

  const { data: tomas = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => medicacionService.listarTomasPendientes(fecha, turno),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Agrupar tomas por residente
  const tomasPorResidente = tomas.reduce<Record<number, TomaPendiente[]>>((acc, toma) => {
    const key = toma.residenteId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(toma);
    return acc;
  }, {});

  const pendientesCount = tomas.filter((t) => t.estadoActual == null).length;
  const administradasCount = tomas.filter((t) => t.estadoActual === 'ADMINISTRADA').length;
  const omitadasCount = tomas.filter((t) => t.estadoActual === 'OMITIDA').length;
  const demoraCount = tomas.filter((t) => t.estadoActual === 'CON_DEMORA').length;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tablero del turno</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {pendientesCount} pendientes · {administradasCount} administradas · {omitadasCount} omitidas{demoraCount > 0 ? ` · ${demoraCount} con demora` : ''}
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
              const administradasResidente = tomasResidente.filter((t) => t.estadoActual === 'ADMINISTRADA').length;
              const omitadasResidente = tomasResidente.filter((t) => t.estadoActual === 'OMITIDA').length;
              const pendientesResidente = tomasResidente.filter((t) => t.estadoActual == null).length;

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
                    <div className="text-xs text-gray-400 text-right space-y-0.5">
                      {administradasResidente > 0 && <p className="text-green-600">{administradasResidente} administradas</p>}
                      {omitadasResidente > 0 && <p className="text-red-500">{omitadasResidente} omitidas</p>}
                      {pendientesResidente > 0 && <p>{pendientesResidente} pendientes</p>}
                    </div>
                  </div>

                  {/* Tomas del residente */}
                  <div className="divide-y divide-gray-100">
                    {tomasResidente.map((toma) => (
                      <div key={toma.medicamentoId} className="px-4 py-3 flex items-center justify-between gap-4">
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

                        {/* Estado o botón registrar */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {toma.estadoActual != null ? (
                            <Badge
                              label={formatEstadoAdministracion(toma.estadoActual)}
                              color={estadoColor(toma.estadoActual)}
                            />
                          ) : (
                            <button
                              onClick={() => setTomaSeleccionada(toma)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors"
                            >
                              <ClipboardEdit className="w-3.5 h-3.5" />
                              Registrar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {tomaSeleccionada && (
        <RegistrarAdministracionModal
          isOpen={!!tomaSeleccionada}
          onClose={() => setTomaSeleccionada(null)}
          toma={tomaSeleccionada}
          turno={turno}
          fecha={fecha}
          queryKey={queryKey}
        />
      )}
    </Layout>
  );
}
