import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { residentesService } from './residentesService';
import type { Residente, ResidenteRequest, EstadoResidente } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  residente?: Residente | null;
}

const estadoOptions: EstadoResidente[] = ['ACTIVO', 'INTERNADO', 'HOSPITALIZADO', 'ALTA', 'FALLECIDO'];

const emptyForm: ResidenteRequest = {
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  dni: '',
  numeroHabitacion: '',
  sector: '',
  estado: 'ACTIVO',
  obraSocial: '',
  numeroAfiliado: '',
  contactoFamiliarNombre: '',
  contactoFamiliarTelefono: '',
  observaciones: '',
};

export default function ResidenteFormModal({ isOpen, onClose, residente }: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!residente;

  const [form, setForm] = useState<ResidenteRequest>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ResidenteRequest, string>>>({});

  useEffect(() => {
    if (residente) {
      setForm({
        nombre: residente.nombre,
        apellido: residente.apellido,
        fechaNacimiento: residente.fechaNacimiento,
        dni: residente.dni,
        numeroHabitacion: residente.numeroHabitacion ?? '',
        sector: residente.sector ?? '',
        estado: residente.estado,
        obraSocial: residente.obraSocial ?? '',
        numeroAfiliado: residente.numeroAfiliado ?? '',
        contactoFamiliarNombre: residente.contactoFamiliarNombre ?? '',
        contactoFamiliarTelefono: residente.contactoFamiliarTelefono ?? '',
        observaciones: residente.observaciones ?? '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [residente, isOpen]);

  const set = (field: keyof ResidenteRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ResidenteRequest, string>> = {};
    if (!form.nombre.trim()) newErrors.nombre = 'Obligatorio';
    if (!form.apellido.trim()) newErrors.apellido = 'Obligatorio';
    if (!form.fechaNacimiento) newErrors.fechaNacimiento = 'Obligatorio';
    if (!form.dni.trim()) newErrors.dni = 'Obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: ResidenteRequest = {
        ...form,
        numeroHabitacion: form.numeroHabitacion || undefined,
        sector: form.sector || undefined,
        obraSocial: form.obraSocial || undefined,
        numeroAfiliado: form.numeroAfiliado || undefined,
        contactoFamiliarNombre: form.contactoFamiliarNombre || undefined,
        contactoFamiliarTelefono: form.contactoFamiliarTelefono || undefined,
        observaciones: form.observaciones || undefined,
      };
      if (isEditing) {
        return residentesService.actualizar(residente!.id, payload);
      }
      return residentesService.crear(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentes'] });
      toast.success(isEditing ? 'Residente actualizado' : 'Residente creado');
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al guardar';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Residente' : 'Nuevo Residente'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre *"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            error={errors.nombre}
          />
          <Input
            label="Apellido *"
            value={form.apellido}
            onChange={(e) => set('apellido', e.target.value)}
            error={errors.apellido}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="DNI *"
            value={form.dni}
            onChange={(e) => set('dni', e.target.value)}
            error={errors.dni}
          />
          <Input
            label="Fecha de nacimiento *"
            type="date"
            value={form.fechaNacimiento}
            onChange={(e) => set('fechaNacimiento', e.target.value)}
            error={errors.fechaNacimiento}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="N° Habitación"
            value={form.numeroHabitacion}
            onChange={(e) => set('numeroHabitacion', e.target.value)}
          />
          <Input
            label="Sector"
            value={form.sector}
            onChange={(e) => set('sector', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            className="input-field"
            value={form.estado}
            onChange={(e) => set('estado', e.target.value)}
          >
            {estadoOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Obra Social"
            value={form.obraSocial}
            onChange={(e) => set('obraSocial', e.target.value)}
          />
          <Input
            label="N° Afiliado"
            value={form.numeroAfiliado}
            onChange={(e) => set('numeroAfiliado', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contacto familiar"
            value={form.contactoFamiliarNombre}
            onChange={(e) => set('contactoFamiliarNombre', e.target.value)}
          />
          <Input
            label="Teléfono familiar"
            value={form.contactoFamiliarTelefono}
            onChange={(e) => set('contactoFamiliarTelefono', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Observaciones</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            value={form.observaciones}
            onChange={(e) => set('observaciones', e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEditing ? 'Guardar cambios' : 'Crear residente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
