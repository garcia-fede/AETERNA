import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import { familiarService } from './familiarService';
import {
  formatTipoNovedad,
  formatPrioridad,
  colorPrioridad,
} from '../../types';

export default function FamiliarNovedadesPage() {
  const { data: residente, isLoading: loadingResidente } = useQuery({
    queryKey: ['mi-residente'],
    queryFn: familiarService.getMiResidente,
    staleTime: 0,
  });

  const { data: novedades = [], isLoading: loadingNovedades } = useQuery({
    queryKey: ['familiar-novedades', residente?.id],
    queryFn: () => familiarService.getMisNovedades(residente!.id),
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
          <h1 className="text-2xl font-bold text-gray-900">Novedades</h1>
          <p className="text-sm text-gray-500 mt-0.5">{residente.nombre} {residente.apellido}</p>
        </div>

        {loadingNovedades ? (
          <div className="text-center py-16 text-gray-400 text-sm">Cargando...</div>
        ) : novedades.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No hay novedades nuevas para mostrar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {novedades.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge label={formatTipoNovedad(n.tipo)} color="blue" />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorPrioridad(n.prioridad)}`}>
                        {formatPrioridad(n.prioridad)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{n.descripcion}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                  <span>
                    {new Date(n.fechaHora).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="italic">Reportado por: {n.personalNombreCompleto}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
