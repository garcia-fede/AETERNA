import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { passwordResetService } from './passwordResetService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validacion = useQuery({
    queryKey: ['reset-token', token],
    queryFn: () => passwordResetService.validarToken(token),
    enabled: token.length > 0,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: () => passwordResetService.restablecer({ token, passwordNueva }),
    onSuccess: () => {
      toast.success('Contraseña establecida. Ya podés iniciar sesión.');
      navigate('/login');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'No se pudo establecer la contraseña');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (passwordNueva.length < 8) errs.passwordNueva = 'Mínimo 8 caracteres';
    if (passwordNueva !== confirmar) errs.confirmar = 'Las contraseñas no coinciden';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    mutation.mutate();
  };

  const tokenInvalido = !token || validacion.isError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mb-3">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AETERNA</h1>
          <p className="text-sm text-gray-500 mt-1">Establecé tu contraseña</p>
        </div>

        {validacion.isLoading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Validando enlace...</div>
        ) : tokenInvalido ? (
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-gray-700 font-medium">El enlace no es válido</p>
            <p className="text-sm text-gray-500">
              Puede haber expirado (válido por 10 minutos) o ya haber sido utilizado.
              Pedile a un administrador que te reenvíe la invitación.
            </p>
            <Button variant="secondary" className="w-full justify-center" onClick={() => navigate('/login')}>
              Volver al login
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2 mb-4">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Hola {validacion.data?.nombre}, definí una contraseña para{' '}
                <strong>{validacion.data?.email}</strong>.
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nueva contraseña"
                type="password"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                error={errors.passwordNueva}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                autoFocus
              />
              <Input
                label="Confirmar contraseña"
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                error={errors.confirmar}
                placeholder="Repetí la contraseña"
                autoComplete="new-password"
              />
              <Button
                type="submit"
                loading={mutation.isPending}
                className="w-full justify-center mt-2"
              >
                Establecer contraseña
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
