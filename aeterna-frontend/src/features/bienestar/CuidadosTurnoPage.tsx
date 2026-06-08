import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HeartPulse, CheckCircle, Clock } from 'lucide-react';
import Layout from '../../components/Layout';
import { bienestarService } from './bienestarService';
import BienestarFormModal from './BienestarFormModal';
import { formatTurno, getTurnoActual, fechaHoy } from '../../types';
import type { Turno, EstadoCuidadosTurno } from '../../types';

const turnoOptions: Turno[] = ['MANIANA', 'TARDE', 'NOCHE'];

export default function CuidadosTurnoPage() {
  const hoy = fechaHoy();
  const [fecha, setFecha] = useState(hoy);
  const [turno, setTurno] = useState<Turno>(getTurnoActual());
  const [modalResidente, setModalResidente] = useState<EstadoCuidadosTurno | null>(null);

  const queryKey = ['cuidados-turno', fecha, turno];

  const { data: estado = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => bienestarService.listarEstadoTurno(fecha, turno),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const registrados = estado.filter((r) => r.registrado).length;
  const pendientes = estado.filter((r) => !r.registrado).length;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cuidados del turno</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {registrados} registrados · {pendientes} pendientes
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

        {/* Lista */}
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Cargando...</div>
        ) : estado.length === 0 ? (
          <div className="py-16 text-center">
            <HeartPulse className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No hay residentes activos</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Residente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Habitación</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estado.map((r) => (
                  <tr
                    key={r.residenteId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setModalResidente(r)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.residenteNombre}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.residenteHabitacion ?? '—'}</td>
                    <td className="px-4 py-3">
                      {r.registrado ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Cargado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setModalResidente(r); }}
                        className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        {r.registrado ? 'Editar' : 'Cargar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalResidente && (
        <BienestarFormModal
          isOpen={!!modalResidente}
          onClose={() => setModalResidente(null)}
          residenteId={modalResidente.residenteId}
          residenteNombre={modalResidente.residenteNombre}
          fecha={fecha}
          turno={turno}
        />
      )}
    </Layout>
  );
}
