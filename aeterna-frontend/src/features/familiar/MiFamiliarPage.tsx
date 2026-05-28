import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Pill, HeartPulse, Bell, User, Building2, Calendar, CreditCard } from 'lucide-react';
import Layout from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import { familiarService } from './familiarService';
import type { EstadoResidente } from '../../types';

const estadoBadgeColor = (estado: EstadoResidente): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
  const map: Record<EstadoResidente, 'green' | 'yellow' | 'red' | 'blue' | 'gray'> = {
    ACTIVO: 'green',
    INTERNADO: 'yellow',
    HOSPITALIZADO: 'red',
    ALTA: 'blue',
    FALLECIDO: 'gray',
  };
  return map[estado];
};

export default function MiFamiliarPage() {
  const { data: residente, isLoading, isError } = useQuery({
    queryKey: ['mi-residente'],
    queryFn: familiarService.getMiResidente,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Cargando información...</p>
        </div>
      </Layout>
    );
  }

  if (isError || !residente) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">No se encontró información del residente vinculado.</p>
            <p className="text-red-500 text-sm mt-1">Contactá al personal del geriátrico para verificar el vínculo.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const iniciales = `${residente.nombre[0]}${residente.apellido[0]}`.toUpperCase();

  const accesos = [
    {
      to: '/familiar/medicacion',
      icon: Pill,
      label: 'Medicación',
      descripcion: 'Plan farmacológico y registro de tomas',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    },
    {
      to: '/familiar/bienestar',
      icon: HeartPulse,
      label: 'Bienestar',
      descripcion: 'Registros diarios de cuidados y signos vitales',
      color: 'bg-teal-50 text-teal-600 hover:bg-teal-100',
    },
    {
      to: '/familiar/novedades',
      icon: Bell,
      label: 'Novedades',
      descripcion: 'Comunicados del equipo de salud',
      color: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi familiar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Información del residente vinculado a tu cuenta</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary-700">{iniciales}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900">
                  {residente.nombre} {residente.apellido}
                </h2>
                <Badge label={residente.estado} color={estadoBadgeColor(residente.estado)} />
              </div>
              <p className="text-gray-500 mt-1">{residente.edad} años</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Habitación</p>
                <p className="text-sm text-gray-900 font-medium">
                  {residente.numeroHabitacion ?? '—'}
                  {residente.sector ? ` — ${residente.sector}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Fecha de nacimiento</p>
                <p className="text-sm text-gray-900">
                  {new Date(residente.fechaNacimiento).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Obra social</p>
                <p className="text-sm text-gray-900">
                  {residente.obraSocial ?? '—'}
                  {residente.numeroAfiliado ? ` — ${residente.numeroAfiliado}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">DNI</p>
                <p className="text-sm text-gray-900">{residente.dni}</p>
              </div>
            </div>
          </div>

          {residente.observaciones && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Observaciones clínicas</p>
              <p className="text-sm text-gray-700">{residente.observaciones}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Accesos rápidos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {accesos.map(({ to, icon: Icon, label, descripcion, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all duration-150 group`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{descripcion}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
