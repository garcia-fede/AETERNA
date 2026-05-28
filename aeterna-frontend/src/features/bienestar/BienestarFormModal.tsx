import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { bienestarService } from './bienestarService';
import type { Turno, EstadoComida, EstadoAnimo, BienestarDiarioRequest } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  residenteId: number;
  residenteNombre: string;
  fecha: string;
  turno: Turno;
}

const estadoComidaOpciones: { value: EstadoComida; label: string }[] = [
  { value: 'COMPLETO', label: 'Completo' },
  { value: 'PARCIAL', label: 'Parcial' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'NO_APLICA', label: 'No aplica' },
];

const estadoAnimoOpciones: { value: EstadoAnimo; label: string }[] = [
  { value: 'TRISTE', label: 'Triste' },
  { value: 'ENTRISTECIDO', label: 'Entristecido' },
  { value: 'NEUTRAL', label: 'Neutral' },
  { value: 'TRANQUILO', label: 'Tranquilo' },
  { value: 'ANIMADO', label: 'Animado' },
];

type FormState = {
  higieneBanio: boolean;
  higieneIntima: boolean;
  cambioRopa: boolean;
  desayuno: EstadoComida | '';
  almuerzo: EstadoComida | '';
  merienda: EstadoComida | '';
  cena: EstadoComida | '';
  hidratacionMl: string;
  estadoAnimo: EstadoAnimo | '';
  presionSistolica: string;
  presionDiastolica: string;
  temperatura: string;
  saturacion: string;
  glucemia: string;
  peso: string;
  observaciones: string;
};

const formVacio = (): FormState => ({
  higieneBanio: false,
  higieneIntima: false,
  cambioRopa: false,
  desayuno: '',
  almuerzo: '',
  merienda: '',
  cena: '',
  hidratacionMl: '',
  estadoAnimo: '',
  presionSistolica: '',
  presionDiastolica: '',
  temperatura: '',
  saturacion: '',
  glucemia: '',
  peso: '',
  observaciones: '',
});

export default function BienestarFormModal({
  isOpen,
  onClose,
  residenteId,
  residenteNombre,
  fecha,
  turno,
}: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(formVacio());

  const { data: existente, isLoading: loadingExistente } = useQuery({
    queryKey: ['bienestar-residente', residenteId, fecha, turno],
    queryFn: () => bienestarService.obtenerPorResidenteFechaTurno(residenteId, fecha, turno),
    enabled: isOpen,
    staleTime: 0,
  });

  useEffect(() => {
    if (existente) {
      setForm({
        higieneBanio: existente.higieneBanio,
        higieneIntima: existente.higieneIntima,
        cambioRopa: existente.cambioRopa,
        desayuno: existente.desayuno ?? '',
        almuerzo: existente.almuerzo ?? '',
        merienda: existente.merienda ?? '',
        cena: existente.cena ?? '',
        hidratacionMl: existente.hidratacionMl != null ? String(existente.hidratacionMl) : '',
        estadoAnimo: existente.estadoAnimo ?? '',
        presionSistolica: existente.presionSistolica != null ? String(existente.presionSistolica) : '',
        presionDiastolica: existente.presionDiastolica != null ? String(existente.presionDiastolica) : '',
        temperatura: existente.temperatura != null ? String(existente.temperatura) : '',
        saturacion: existente.saturacion != null ? String(existente.saturacion) : '',
        glucemia: existente.glucemia != null ? String(existente.glucemia) : '',
        peso: existente.peso != null ? String(existente.peso) : '',
        observaciones: existente.observaciones ?? '',
      });
    } else if (!loadingExistente) {
      setForm(formVacio());
    }
  }, [existente, loadingExistente]);

  const mutation = useMutation({
    mutationFn: (req: BienestarDiarioRequest) => bienestarService.guardar(residenteId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuidados-turno'] });
      queryClient.invalidateQueries({ queryKey: ['bienestar-residente', residenteId, fecha, turno] });
      toast.success('Registro guardado correctamente');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al guardar');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request: BienestarDiarioRequest = {
      fecha,
      turno,
      higieneBanio: form.higieneBanio,
      higieneIntima: form.higieneIntima,
      cambioRopa: form.cambioRopa,
      desayuno: form.desayuno || null,
      almuerzo: form.almuerzo || null,
      merienda: form.merienda || null,
      cena: form.cena || null,
      hidratacionMl: form.hidratacionMl ? parseInt(form.hidratacionMl) : null,
      estadoAnimo: form.estadoAnimo || null,
      presionSistolica: form.presionSistolica ? parseInt(form.presionSistolica) : null,
      presionDiastolica: form.presionDiastolica ? parseInt(form.presionDiastolica) : null,
      temperatura: form.temperatura ? parseFloat(form.temperatura) : null,
      saturacion: form.saturacion ? parseInt(form.saturacion) : null,
      glucemia: form.glucemia ? parseInt(form.glucemia) : null,
      peso: form.peso ? parseFloat(form.peso) : null,
      observaciones: form.observaciones || undefined,
    };
    mutation.mutate(request);
  };

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cuidados del turno — ${residenteNombre}`}
      size="lg"
    >
      {loadingExistente ? (
        <div className="py-8 text-center text-gray-400 text-sm">Cargando...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Higiene */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Higiene</h3>
            <div className="flex flex-wrap gap-6">
              {([
                ['higieneBanio', 'Baño'],
                ['higieneIntima', 'Higiene íntima'],
                ['cambioRopa', 'Cambio de ropa'],
              ] as [keyof FormState, string][]).map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-primary-600"
                    checked={form[field] as boolean}
                    onChange={(e) => set(field, e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Alimentacion */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Alimentación</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['desayuno', 'Desayuno'],
                ['almuerzo', 'Almuerzo'],
                ['merienda', 'Merienda'],
                ['cena', 'Cena'],
              ] as [keyof FormState, string][]).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs text-gray-600 mb-1">{label}</label>
                  <select
                    className="input-field py-2 text-sm"
                    value={form[field] as string}
                    onChange={(e) => set(field, e.target.value)}
                  >
                    <option value="">— Sin registrar —</option>
                    {estadoComidaOpciones.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-xs text-gray-600 mb-1">Hidratación (ml)</label>
              <input
                type="number"
                min={0}
                max={10000}
                className="input-field py-2 text-sm w-40"
                value={form.hidratacionMl}
                onChange={(e) => set('hidratacionMl', e.target.value)}
                placeholder="500"
              />
            </div>
          </section>

          {/* Estado animo */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Estado de ánimo</h3>
            <select
              className="input-field py-2 text-sm w-56"
              value={form.estadoAnimo}
              onChange={(e) => set('estadoAnimo', e.target.value)}
            >
              <option value="">— Sin registrar —</option>
              {estadoAnimoOpciones.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </section>

          {/* Signos vitales */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Signos vitales</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Presión arterial (mmHg)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={300}
                    className="input-field py-2 text-sm w-20"
                    value={form.presionSistolica}
                    onChange={(e) => set('presionSistolica', e.target.value)}
                    placeholder="120"
                  />
                  <span className="text-gray-400 text-sm">/</span>
                  <input
                    type="number"
                    min={0}
                    max={300}
                    className="input-field py-2 text-sm w-20"
                    value={form.presionDiastolica}
                    onChange={(e) => set('presionDiastolica', e.target.value)}
                    placeholder="80"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Temperatura (°C)</label>
                <input
                  type="number"
                  min={30}
                  max={45}
                  step={0.1}
                  className="input-field py-2 text-sm w-28"
                  value={form.temperatura}
                  onChange={(e) => set('temperatura', e.target.value)}
                  placeholder="36.5"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Saturación O2 (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input-field py-2 text-sm w-24"
                  value={form.saturacion}
                  onChange={(e) => set('saturacion', e.target.value)}
                  placeholder="97"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Glucemia (mg/dL)</label>
                <input
                  type="number"
                  min={0}
                  max={600}
                  className="input-field py-2 text-sm w-28"
                  value={form.glucemia}
                  onChange={(e) => set('glucemia', e.target.value)}
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  step={0.1}
                  className="input-field py-2 text-sm w-28"
                  value={form.peso}
                  onChange={(e) => set('peso', e.target.value)}
                  placeholder="70.5"
                />
              </div>
            </div>
          </section>

          {/* Observaciones */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Observaciones</h3>
            <textarea
              className="input-field resize-none text-sm"
              rows={3}
              value={form.observaciones}
              onChange={(e) => set('observaciones', e.target.value)}
              placeholder="Observaciones del turno..."
            />
          </section>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : existente ? 'Actualizar registro' : 'Guardar registro'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
