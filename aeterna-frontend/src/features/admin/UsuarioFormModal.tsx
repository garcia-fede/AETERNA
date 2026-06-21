import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, CheckCircle2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import VincularResidenteModal from './VincularResidenteModal';
import { usuariosService } from './usuariosService';
import type { UsuarioAdmin, Rol } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuario: UsuarioAdmin | null;
}

const roles: Rol[] = ['ADMIN', 'PERSONAL', 'FAMILIAR'];
const roleLabels: Record<Rol, string> = {
  ADMIN: 'Administrador',
  PERSONAL: 'Personal',
  FAMILIAR: 'Familiar',
};

export default function UsuarioFormModal({ isOpen, onClose, usuario }: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!usuario;

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Rol>('PERSONAL');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nuevoUsuarioId, setNuevoUsuarioId] = useState<number | null>(null);
  const [vincularOpen, setVincularOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (usuario) {
        setNombre(usuario.nombre);
        setApellido(usuario.apellido);
        setEmail(usuario.email);
        setRol(usuario.rol);
        setPassword('');
      } else {
        setNombre('');
        setApellido('');
        setEmail('');
        setPassword('');
        setRol('PERSONAL');
      }
      setErrors({});
      setNuevoUsuarioId(null);
    }
  }, [isOpen, usuario]);

  const crearMutation = useMutation({
    mutationFn: usuariosService.crear,
    onSuccess: (u) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario creado correctamente');
      setNuevoUsuarioId(u.id);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al crear el usuario');
    },
  });

  const invitacionMutation = useMutation({
    mutationFn: (id: number) => usuariosService.enviarInvitacion(id),
    onSuccess: () => toast.success('Invitación enviada por email'),
    onError: (err: any) =>
      toast.error(err.response?.data?.message || 'No se pudo enviar la invitación'),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => usuariosService.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario actualizado');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al actualizar el usuario');
    },
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nombre.trim()) errs.nombre = 'Requerido';
    if (!apellido.trim()) errs.apellido = 'Requerido';
    if (!email.trim()) errs.email = 'Requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido';
    if (!isEditing && password.length < 8) errs.password = 'Mínimo 8 caracteres';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (isEditing && usuario) {
      actualizarMutation.mutate({ id: usuario.id, data: { nombre, apellido, email, rol } });
    } else {
      crearMutation.mutate({ nombre, apellido, email, password, rol });
    }
  };

  const isLoading = crearMutation.isPending || actualizarMutation.isPending;

  if (nuevoUsuarioId) {
    const cerrarExito = () => { setNuevoUsuarioId(null); onClose(); };
    return (
      <>
        <Modal
          isOpen={isOpen}
          onClose={cerrarExito}
          title="Usuario creado"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              El usuario <strong>{nombre} {apellido}</strong> fue creado correctamente.
            </p>

            {invitacionMutation.isSuccess ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Invitación enviada a {email}</span>
              </div>
            ) : (
              <Button
                variant="secondary"
                className="w-full justify-center"
                loading={invitacionMutation.isPending}
                onClick={() => invitacionMutation.mutate(nuevoUsuarioId)}
              >
                <Mail className="w-4 h-4" />
                Enviar email para cambiar contraseña
              </Button>
            )}

            <div className="flex gap-3 justify-end pt-2">
              {rol === 'FAMILIAR' && (
                <Button onClick={() => setVincularOpen(true)}>
                  Vincular a residente
                </Button>
              )}
              <Button variant="secondary" onClick={cerrarExito}>
                Listo
              </Button>
            </div>
          </div>
        </Modal>
        <VincularResidenteModal
          isOpen={vincularOpen}
          onClose={() => { setVincularOpen(false); setNuevoUsuarioId(null); onClose(); }}
          usuarioId={nuevoUsuarioId}
        />
      </>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar usuario' : 'Nuevo usuario'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={errors.nombre}
          />
          <Input
            label="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            error={errors.apellido}
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        {!isEditing && (
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="Mínimo 8 caracteres"
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            className="input-field"
            value={rol}
            onChange={(e) => setRol(e.target.value as Rol)}
          >
            {roles.map((r) => (
              <option key={r} value={r}>{roleLabels[r]}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
