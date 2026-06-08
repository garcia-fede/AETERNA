import { Pill, HeartPulse, Users } from 'lucide-react';
import type { IndicadoresGestion as Indicadores } from '../../types';
import { formatTurno, getTurnoActual } from '../../types';
import Sparkline from './Sparkline';

// Color semáforo según umbral de cumplimiento (0-100).
function colorCumplimiento(pct: number): { text: string; dot: string; stroke: string } {
  if (pct >= 90) return { text: 'text-emerald-600', dot: 'bg-emerald-500', stroke: '#059669' };
  if (pct >= 70) return { text: 'text-amber-600', dot: 'bg-amber-500', stroke: '#d97706' };
  return { text: 'text-rose-600', dot: 'bg-rose-500', stroke: '#e11d48' };
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>{children}</div>;
}

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-gray-400">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
    </div>
  );
}

export default function IndicadoresGestion({ data }: { data: Indicadores }) {
  const adh = colorCumplimiento(data.adherenciaHoy);
  const cob = colorCumplimiento(data.coberturaCuidadosTurno);
  const turno = getTurnoActual();

  const maxCarga = Math.max(...data.cargaPorCuidador.map((c) => c.residentesAsignados), 1);
  const maxCuidados = Math.max(...data.cuidados7dias.map((p) => p.valor), 1);

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Indicadores de gestión</h2>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adherencia a la medicación */}
        <Card>
          <CardHeader icon={<Pill className="w-4 h-4" />} title="Adherencia a la medicación" />
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-4xl font-bold ${adh.text}`}>{data.adherenciaHoy}%</span>
                <span className={`w-2.5 h-2.5 rounded-full ${adh.dot}`} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {data.tomasProgramadasHoy} tomas programadas hoy
              </p>
            </div>
            <div className="text-right">
              <Sparkline
                values={data.adherencia7dias.map((p) => p.valor)}
                max={100}
                color={adh.stroke}
              />
              <p className="text-xs text-gray-400 mt-1">Últimos 7 días</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-lg font-semibold text-gray-700">{data.tasaOmisionHoy}%</p>
              <p className="text-xs text-gray-400">Omitidas</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">{data.tasaDemoraHoy}%</p>
              <p className="text-xs text-gray-400">Con demora</p>
            </div>
          </div>
        </Card>

        {/* Cobertura de cuidados */}
        <Card>
          <CardHeader icon={<HeartPulse className="w-4 h-4" />} title="Cobertura de cuidados" />
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-4xl font-bold ${cob.text}`}>{data.coberturaCuidadosTurno}%</span>
                <span className={`w-2.5 h-2.5 rounded-full ${cob.dot}`} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Turno {formatTurno(turno)}</p>
            </div>
            <div className="text-right">
              <Sparkline
                values={data.cuidados7dias.map((p) => p.valor)}
                max={maxCuidados}
                color="#2563eb"
              />
              <p className="text-xs text-gray-400 mt-1">Registros · 7 días</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            {data.residentesSinCuidadoTurno > 0 ? (
              <p className="text-sm">
                <span className="font-semibold text-rose-600">{data.residentesSinCuidadoTurno}</span>
                <span className="text-gray-500"> residente{data.residentesSinCuidadoTurno > 1 ? 's' : ''} sin registro en este turno</span>
              </p>
            ) : (
              <p className="text-sm text-emerald-600 font-medium">Todos los residentes tienen registro en este turno</p>
            )}
          </div>
        </Card>

        {/* Carga del personal — ocupa el ancho completo */}
        <Card className="lg:col-span-2">
          <div>
            <CardHeader icon={<Users className="w-4 h-4" />} title="Carga del personal" />
            <div className="flex flex-wrap gap-x-8 gap-y-2 mb-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">1 : {data.ratioResidentesPorCuidador}</p>
                <p className="text-xs text-gray-400">Cuidador / residentes</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${data.residentesSinAsignar > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                  {data.residentesSinAsignar}
                </p>
                <p className="text-xs text-gray-400">Residentes sin asignar</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${data.personalSinAsignaciones > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                  {data.personalSinAsignaciones}
                </p>
                <p className="text-xs text-gray-400">Personal sin asignaciones</p>
              </div>
            </div>

            {data.cargaPorCuidador.length === 0 ? (
              <p className="text-sm text-gray-400">Sin asignaciones registradas.</p>
            ) : (
              <div className="space-y-2">
                {data.cargaPorCuidador.map((c) => (
                  <div key={c.usuarioId} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-36 truncate flex-shrink-0">{c.nombre}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max((c.residentesAsignados / maxCarga) * 100, 4)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-6 text-right flex-shrink-0">
                      {c.residentesAsignados}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
