import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { medicacionService } from './medicacionService';
import { fechaHoy } from '../../types';
import type { Medicamento, MedicamentoRequest, Turno } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  residenteId: number;
  medicamento?: Medicamento | null;
}

const viaOptions = ['Oral', 'SC', 'IV', 'IM', 'Tópica'];

const turnosDisponibles: { value: Turno; label: string }[] = [
  { value: 'MANIANA', label: 'Mañana' },
  { value: 'TARDE', label: 'Tarde' },
  { value: 'NOCHE', label: 'Noche' },
];

const emptyForm: MedicamentoRequest = {
  nombreMedicamento: '',
  dosis: '',
  via: 'Oral',
  frecuencia: '',
  horariosTurnos: [],
  observaciones: '',
  desde: fechaHoy(),
};

export default function MedicamentoFormModal({ isOpen, onClose, residenteId, medicamento }: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!medicamento;

  const [form, setForm] = useState<MedicamentoRequest>(emptyForm);
  const [turnoError, setTurnoError] = useState('');

  useEffect(() => {
    if (medicamento) {
      setForm({
        nombreMedicamento: medicamento.nombreMedicamento,
        dosis: medicamento.dosis ?? '',
        via: medicamento.via ?? 'Oral',
        frecuencia: medicamento.frecuencia ?? '',
        horariosTurnos: medicamento.horariosTurnos,
        observaciones: medicamento.observaciones ?? '',
        desde: medicamento.desde,
      });
    } else {
      setForm(emptyForm);
    }
    setTurnoError('');
  }, [medicamento, isOpen]);

  const setField = (field: keyof MedicamentoRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTurno = (turno: Turno) => {
    setTurnoError('');
    setForm((prev) => {
      const current = prev.horariosTurnos;
      const next = current.includes(turno)
        ? current.filter((t) => t !== turno)
        : [...current, turno];
      return { ...prev, horariosTurnos: next };
    });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: MedicamentoRequest = {
        ...form,
        dosis: form.dosis || undefined,
        via: form.via || undefined,
        frecuencia: form.frecuencia || undefined,
        observaciones: form.observaciones || undefined,
      };
      if (isEditing) {
        return medicacionService.actualizarMedicamento(medicamento!.id, payload);
      }
      return medicacionService.crearMedicamento(residenteId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos', residenteId] });
      toast.success(isEditing ? 'Medicamento actualizado' : 'Medicamento creado');
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al guardar';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.horariosTurnos.length === 0) {
      setTurnoError('Seleccioná al menos un turno');
      return;
    }
    mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar medicamento' : 'Nuevo medicamento'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Medicamento *"
          value={form.nombreMedicamento}
          onChange={(e) => setField('nombreMedicamento', e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Dosis"
            placeholder="ej: 10mg"
            value={form.dosis}
            onChange={(e) => setField('dosis', e.target.value)}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Vía</label>
            <select
              className="input-field"
              value={form.via}
              onChange={(e) => setField('via', e.target.value)}
            >
              {viaOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Frecuencia"
          placeholder="ej: 1x día 08:00 o 2x día 08:00 y 20:00"
          value={form.frecuencia}
          onChange={(e) => setField('frecuencia', e.target.value)}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Turnos *</label>
          <div className="flex gap-3">
            {turnosDisponibles.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                  form.horariosTurnos.includes(value)
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.horariosTurnos.includes(value)}
                  onChange={() => toggleTurno(value)}
                />
                {label}
              </label>
            ))}
          </div>
          {turnoError && <p className="text-xs text-red-500">{turnoError}</p>}
        </div>

        <Input
          label="Desde"
          type="date"
          value={form.desde}
          onChange={(e) => setField('desde', e.target.value)}
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Observaciones</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            value={form.observaciones}
            onChange={(e) => setField('observaciones', e.target.value)}
            placeholder="Indicaciones especiales, precauciones..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEditing ? 'Guardar cambios' : 'Crear medicamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
