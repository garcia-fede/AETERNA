import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import MedicamentosResidente from '../medicacion/MedicamentosResidente';
import { medicacionService } from '../medicacion/medicacionService';
import { familiarService } from './familiarService';
import Badge from '../../components/ui/Badge';
import { formatTurno, formatEstadoAdministracion } from '../../types';
import type { EstadoAdministracion } from '../../types';

const estadoAdminColor = (estado: EstadoAdministracion): 'green' | 'red' | 'yellow' => {
  if (estado === 'ADMINISTRADA') return 'green';
  if (estado === 'OMITIDA') return 'red';
  return 'yellow';
};

export default function FamiliarMedicacionPage() {
  const { data: residente, isLoading: loadingResidente } = useQuery({
    queryKey: ['mi-residente'],
    queryFn: familiarService.getMiResidente,
    staleTime: 5 * 60 * 1000,
  });

  const hasta = new Date().toISOString().split('T')[0];
  const desdeDate = new Date();
  desdeDate.setDate(desdeDate.getDate() - 14);
  const desde = desdeDate.toISOString().split('T')[0];

  const { data: historial = [], isLoading: loadingHistorial } = useQuery({
    queryKey: ['familiar-historial-medicacion', residente?.id, desde, hasta],
    queryFn: () => medicacionService.historialAdministraciones(residente!.id, desde, hasta),
    enabled: !!residente?.id,
    staleTime: 2 * 60 * 1000,
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
          <h1 className="text-2xl font-bold text-gray-900">Medicación</h1>
          <p className="text-sm text-gray-500 mt-0.5">{residente.nombre} {residente.apellido}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <MedicamentosResidente residenteId={residente.id} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Últimas administraciones
          </h3>

          {loadingHistorial ? (
            <p className="text-sm text-gray-400 text-center py-4">Cargando...</p>
          ) : historial.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin registros de administración</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {historial.map((a) => (
                <div key={a.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{a.nombreMedicamento}</p>
                    {a.dosis && <p className="text-xs text-gray-500">{a.dosis}</p>}
                    {a.observaciones && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">{a.observaciones}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge label={formatEstadoAdministracion(a.estado)} color={estadoAdminColor(a.estado)} />
                    <span className="text-xs text-gray-400">
                      {new Date(a.fechaHora).toLocaleDateString('es-AR')} — {formatTurno(a.turno)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
