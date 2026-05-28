import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { usuariosService } from './usuariosService';
import type { UsuarioAdmin } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuario: UsuarioAdmin;
}

export default function CambiarPasswordModal({ isOpen, onClose, usuario }: Props) {
  const queryClient = useQueryClient();
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => usuariosService.cambiarPassword(usuario.id, { passwordNueva }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Contraseña actualizada correctamente');
      handleClose();
    },
    onError: () => toast.error('Error al cambiar la contraseña'),
  });

  const handleClose = () => {
    setPasswordNueva('');
    setConfirmar('');
    setErrors({});
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (passwordNueva.length < 8) errs.passwordNueva = 'Mínimo 8 caracteres';
    if (passwordNueva !== confirmar) errs.confirmar = 'Las contraseñas no coinciden';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Cambiar contraseña — ${usuario.nombre} ${usuario.apellido}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nueva contraseña"
          type="password"
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
          error={errors.passwordNueva}
          placeholder="Mínimo 8 caracteres"
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          error={errors.confirmar}
          placeholder="Repetí la contraseña"
        />
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
