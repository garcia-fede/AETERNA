import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Pill, ClipboardList, HeartPulse, Bell, Users } from 'lucide-react';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ResidenteFormModal from './ResidenteFormModal';
import MedicamentosResidente from '../medicacion/MedicamentosResidente';
import HistorialAdministracionesModal from '../medicacion/HistorialAdministracionesModal';
import HistorialBienestarModal from '../bienestar/HistorialBienestarModal';
import NovedadesResidenteModal from '../novedades/NovedadesResidenteModal';
import FamiliaresResidenteModal from '../admin/FamiliaresResidenteModal';
import { residentesService } from './residentesService';
import { useAuthStore } from '../../stores/authStore';
import type { Residente, EstadoResidente } from '../../types';
import toast from 'react-hot-toast';

const estadoBadgeColor = (estado: EstadoResidente) => {
  const map: Record<EstadoResidente, 'green' | 'yellow' | 'red' | 'blue' | 'gray'> = {
    ACTIVO: 'green',
    INTERNADO: 'yellow',
    HOSPITALIZADO: 'red',
    ALTA: 'blue',
    FALLECIDO: 'gray',
  };
  return map[estado];
};

export default function ResidentesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.rol === 'ADMIN';

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Residente | null>(null);
  const [planModalResidente, setPlanModalResidente] = useState<Residente | null>(null);
  const [historialResidente, setHistorialResidente] = useState<Residente | null>(null);
  const [bienestarResidente, setBienestarResidente] = useState<Residente | null>(null);
  const [novedadesResidente, setNovedadesResidente] = useState<Residente | null>(null);
  const [familiaresResidente, setFamiliaresResidente] = useState<Residente | null>(null);

  // React Query: staleTime de 2 min — los residentes no cambian en cada click
  const { data: residentes = [], isLoading } = useQuery({
    queryKey: ['residentes'],
    queryFn: residentesService.listar,
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: residentesService.eliminar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentes'] });
      toast.success('Residente dado de baja');
    },
    onError: () => toast.error('Error al dar de baja'),
  });

  const handleDelete = (residente: Residente) => {
    if (confirm(`¿Dar de baja a ${residente.nombreCompleto}? Esta acción es reversible desde el backend.`)) {
      deleteMutation.mutate(residente.id);
    }
  };

  const handleEdit = (residente: Residente) => {
    setSelected(residente);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelected(null);
    setModalOpen(true);
  };

  const filtered = residentes.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.nombreCompleto.toLowerCase().includes(q) ||
      r.dni.includes(q) ||
      (r.numeroHabitacion?.toLowerCase().includes(q) ?? false) ||
      (r.sector?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Residentes</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {residentes.length} residentes activos
            </p>
          </div>
          {isAdmin && (
            <Button onClick={handleNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo residente
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, habitación..."
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              {search ? 'Sin resultados para la búsqueda' : 'No hay residentes registrados'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Residente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">DNI</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Habitación</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Sector</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Edad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Obra Social</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.nombreCompleto}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.dni}</td>
                    <td className="px-4 py-3 text-gray-600">{r.numeroHabitacion ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.sector ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.edad} años</td>
                    <td className="px-4 py-3 text-gray-600">{r.obraSocial ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge label={r.estado} color={estadoBadgeColor(r.estado)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPlanModalResidente(r)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver plan farmacológico"
                        >
                          <Pill className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setHistorialResidente(r)}
                          className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Historial de medicación"
                        >
                          <ClipboardList className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setBienestarResidente(r)}
                          className="p-1.5 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors"
                          title="Historial de cuidados"
                        >
                          <HeartPulse className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setNovedadesResidente(r)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                          title="Novedades del residente"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setFamiliaresResidente(r)}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Familiares vinculados"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(r)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                              title="Dar de baja"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isAdmin && (
        <ResidenteFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          residente={selected}
        />
      )}

      {planModalResidente && (
        <Modal
          isOpen={!!planModalResidente}
          onClose={() => setPlanModalResidente(null)}
          title={`Plan farmacológico — ${planModalResidente.nombreCompleto}`}
          size="lg"
        >
          <MedicamentosResidente residenteId={planModalResidente.id} />
        </Modal>
      )}

      {historialResidente && (
        <HistorialAdministracionesModal
          isOpen={!!historialResidente}
          onClose={() => setHistorialResidente(null)}
          residenteId={historialResidente.id}
          residenteNombre={historialResidente.nombreCompleto}
        />
      )}

      {bienestarResidente && (
        <HistorialBienestarModal
          isOpen={!!bienestarResidente}
          onClose={() => setBienestarResidente(null)}
          residenteId={bienestarResidente.id}
          residenteNombre={bienestarResidente.nombreCompleto}
        />
      )}

      {novedadesResidente && (
        <NovedadesResidenteModal
          isOpen={!!novedadesResidente}
          onClose={() => setNovedadesResidente(null)}
          residenteId={novedadesResidente.id}
          residenteNombre={novedadesResidente.nombreCompleto}
        />
      )}

      {familiaresResidente && (
        <FamiliaresResidenteModal
          isOpen={!!familiaresResidente}
          onClose={() => setFamiliaresResidente(null)}
          residenteId={familiaresResidente.id}
          residenteNombre={familiaresResidente.nombreCompleto}
        />
      )}
    </Layout>
  );
}
