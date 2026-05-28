import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Key, Link2, Power } from 'lucide-react';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import UsuarioFormModal from './UsuarioFormModal';
import CambiarPasswordModal from './CambiarPasswordModal';
import VincularResidenteModal from './VincularResidenteModal';
import { usuariosService } from './usuariosService';
import { formatRol } from '../../types';
import type { UsuarioAdmin, Rol } from '../../types';
import toast from 'react-hot-toast';

const rolBadgeColor = (rol: Rol): 'blue' | 'green' | 'gray' => {
  if (rol === 'ADMIN') return 'blue';
  if (rol === 'PERSONAL') return 'green';
  return 'gray';
};

type FiltroRol = Rol | 'TODOS';

export default function UsuariosPage() {
  const queryClient = useQueryClient();

  const [filtroRol, setFiltroRol] = useState<FiltroRol>('TODOS');
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioAdmin | null>(null);
  const [passwordModalUsuario, setPasswordModalUsuario] = useState<UsuarioAdmin | null>(null);
  const [vincularUsuario, setVincularUsuario] = useState<UsuarioAdmin | null>(null);

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios', filtroRol],
    queryFn: () => usuariosService.listar(filtroRol === 'TODOS' ? undefined : filtroRol),
    staleTime: 60 * 1000,
  });

  const toggleActivoMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      usuariosService.activarDesactivar(id, activo),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success(vars.activo ? 'Usuario activado' : 'Usuario desactivado');
    },
    onError: () => toast.error('Error al cambiar estado del usuario'),
  });

  const handleNew = () => {
    setSelectedUsuario(null);
    setModalFormOpen(true);
  };

  const handleEdit = (u: UsuarioAdmin) => {
    setSelectedUsuario(u);
    setModalFormOpen(true);
  };

  const handleToggleActivo = (u: UsuarioAdmin) => {
    const accion = u.activo ? 'desactivar' : 'activar';
    if (confirm(`¿Confirma ${accion} al usuario ${u.nombre} ${u.apellido}?`)) {
      toggleActivoMutation.mutate({ id: u.id, activo: !u.activo });
    }
  };

  const filtros: { label: string; value: FiltroRol }[] = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Personal', value: 'PERSONAL' },
    { label: 'Familiar', value: 'FAMILIAR' },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-sm text-gray-500 mt-0.5">{usuarios.length} usuarios</p>
          </div>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </Button>
        </div>

        <div className="flex gap-2">
          {filtros.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFiltroRol(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtroRol === value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Cargando...</div>
          ) : usuarios.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No hay usuarios</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge label={formatRol(u.rol)} color={rolBadgeColor(u.rol)} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={u.activo ? 'Activo' : 'Inactivo'}
                        color={u.activo ? 'green' : 'gray'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(u)}
                          className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPasswordModalUsuario(u)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                          title="Cambiar contraseña"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActivo(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.activo
                              ? 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                              : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                          }`}
                          title={u.activo ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        {u.rol === 'FAMILIAR' && (
                          <button
                            onClick={() => setVincularUsuario(u)}
                            className="p-1.5 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors"
                            title="Vincular a residente"
                          >
                            <Link2 className="w-4 h-4" />
                          </button>
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

      <UsuarioFormModal
        isOpen={modalFormOpen}
        onClose={() => setModalFormOpen(false)}
        usuario={selectedUsuario}
      />

      {passwordModalUsuario && (
        <CambiarPasswordModal
          isOpen={!!passwordModalUsuario}
          onClose={() => setPasswordModalUsuario(null)}
          usuario={passwordModalUsuario}
        />
      )}

      {vincularUsuario && (
        <VincularResidenteModal
          isOpen={!!vincularUsuario}
          onClose={() => setVincularUsuario(null)}
          usuarioId={vincularUsuario.id}
        />
      )}
    </Layout>
  );
}
