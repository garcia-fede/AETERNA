import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import { bienestarService } from '../bienestar/bienestarService';
import { familiarService } from './familiarService';
import { formatTurno, formatEstadoAnimo, formatEstadoComida } from '../../types';
import type { Turno } from '../../types';

const turnoBadgeColor = (turno: Turno): 'blue' | 'yellow' | 'gray' => {
  if (turno === 'MANIANA') return 'blue';
  if (turno === 'TARDE') return 'yellow';
  return 'gray';
};

export default function FamiliarBienestarPage() {
  const { data: residente, isLoading: loadingResidente } = useQuery({
    queryKey: ['mi-residente'],
    queryFn: familiarService.getMiResidente,
    staleTime: 0,
  });

  const hasta = new Date().toISOString().split('T')[0];
  const desdeDate = new Date();
  desdeDate.setDate(desdeDate.getDate() - 14);
  const desde = desdeDate.toISOString().split('T')[0];

  const { data: registros = [], isLoading: loadingRegistros } = useQuery({
    queryKey: ['familiar-bienestar', residente?.id, desde, hasta],
    queryFn: () => bienestarService.historial(residente!.id, desde, hasta),
    enabled: !!residente?.id,
    staleTime: 0,
  });

  if (loadingResidente) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </Layout>
    );
  }

  if (!residente) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-red-600 text-sm">No se encontró el residente vinculado.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienestar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {residente.nombre} {residente.apellido} — últimos 14 días
          </p>
        </div>

        {loadingRegistros ? (
          <div className="text-center py-16 text-gray-400 text-sm">Cargando registros...</div>
        ) : registros.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No hay registros de bienestar en los últimos 14 días</p>
          </div>
        ) : (
          <div className="space-y-4">
            {registros.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-900">
                      {new Date(r.fecha).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                      })}
                    </p>
                    <Badge label={formatTurno(r.turno)} color={turnoBadgeColor(r.turno)} />
                  </div>
                  {r.estadoAnimo && (
                    <span className="text-sm text-gray-500">{formatEstadoAnimo(r.estadoAnimo)}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {r.desayuno && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Desayuno</p>
                      <p className="text-sm font-medium text-gray-800">{formatEstadoComida(r.desayuno)}</p>
                    </div>
                  )}
                  {r.almuerzo && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Almuerzo</p>
                      <p className="text-sm font-medium text-gray-800">{formatEstadoComida(r.almuerzo)}</p>
                    </div>
                  )}
                  {r.merienda && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Merienda</p>
                      <p className="text-sm font-medium text-gray-800">{formatEstadoComida(r.merienda)}</p>
                    </div>
                  )}
                  {r.cena && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Cena</p>
                      <p className="text-sm font-medium text-gray-800">{formatEstadoComida(r.cena)}</p>
                    </div>
                  )}
                  {r.hidratacionMl != null && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-500 mb-1">Hidratación</p>
                      <p className="text-sm font-medium text-blue-800">{r.hidratacionMl} ml</p>
                    </div>
                  )}
                  {r.presionSistolica != null && r.presionDiastolica != null && (
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs text-red-500 mb-1">Presión arterial</p>
                      <p className="text-sm font-medium text-red-800">
                        {r.presionSistolica}/{r.presionDiastolica} mmHg
                      </p>
                    </div>
                  )}
                  {r.temperatura != null && (
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-500 mb-1">Temperatura</p>
                      <p className="text-sm font-medium text-orange-800">{r.temperatura} °C</p>
                    </div>
                  )}
                  {r.saturacion != null && (
                    <div className="bg-teal-50 rounded-lg p-3">
                      <p className="text-xs text-teal-500 mb-1">Saturación O₂</p>
                      <p className="text-sm font-medium text-teal-800">{r.saturacion}%</p>
                    </div>
                  )}
                  {r.glucemia != null && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-500 mb-1">Glucemia</p>
                      <p className="text-sm font-medium text-purple-800">{r.glucemia} mg/dL</p>
                    </div>
                  )}
                </div>

                {r.observaciones && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Observaciones</p>
                    <p className="text-sm text-gray-700">{r.observaciones}</p>
                  </div>
                )}

                <div className="mt-3 flex gap-4 text-xs text-gray-400">
                  <span className={`${r.higieneBanio ? 'text-green-600' : 'text-gray-400'}`}>
                    Higiene: {r.higieneBanio ? 'Sí' : 'No'}
                  </span>
                  <span className={`${r.higieneIntima ? 'text-green-600' : 'text-gray-400'}`}>
                    H. íntima: {r.higieneIntima ? 'Sí' : 'No'}
                  </span>
                  <span className={`${r.cambioRopa ? 'text-green-600' : 'text-gray-400'}`}>
                    Cambio ropa: {r.cambioRopa ? 'Sí' : 'No'}
                  </span>
                </div>

                <div className="mt-2 text-xs text-gray-400 italic">
                  Registrado por: {r.personalNombreCompleto}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
