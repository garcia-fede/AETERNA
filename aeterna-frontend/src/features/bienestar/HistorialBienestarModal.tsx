import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import { bienestarService } from './bienestarService';
import { formatTurno, formatEstadoComida, formatEstadoAnimo } from '../../types';
import type { BienestarDiario } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  residenteId: number;
  residenteNombre: string;
}

function formatFechaCorta(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function RegistroCard({ b }: { b: BienestarDiario }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">{formatFechaCorta(b.fecha)}</span>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
            {formatTurno(b.turno)}
          </span>
          <span className="text-xs text-gray-500">por {b.personalNombreCompleto}</span>
        </div>
        <span className="text-gray-400 text-xs">{open ? 'Ocultar' : 'Ver detalle'}</span>
      </button>

      {open && (
        <div className="px-4 py-3 space-y-3 text-sm">
          {/* Higiene */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Higiene</p>
            <div className="flex gap-4 text-gray-700">
              <span>{b.higieneBanio ? '✓' : '✗'} Baño</span>
              <span>{b.higieneIntima ? '✓' : '✗'} Higiene íntima</span>
              <span>{b.cambioRopa ? '✓' : '✗'} Cambio de ropa</span>
            </div>
          </div>

          {/* Alimentacion */}
          {(b.desayuno || b.almuerzo || b.merienda || b.cena || b.hidratacionMl != null) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Alimentación</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-700">
                {b.desayuno && <span>Desayuno: {formatEstadoComida(b.desayuno)}</span>}
                {b.almuerzo && <span>Almuerzo: {formatEstadoComida(b.almuerzo)}</span>}
                {b.merienda && <span>Merienda: {formatEstadoComida(b.merienda)}</span>}
                {b.cena && <span>Cena: {formatEstadoComida(b.cena)}</span>}
                {b.hidratacionMl != null && <span>Hidratación: {b.hidratacionMl} ml</span>}
              </div>
            </div>
          )}

          {/* Estado animo */}
          {b.estadoAnimo && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Estado de ánimo</p>
              <p className="text-gray-700">{formatEstadoAnimo(b.estadoAnimo)}</p>
            </div>
          )}

          {/* Signos vitales */}
          {(b.presionSistolica || b.temperatura || b.saturacion || b.glucemia || b.peso) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Signos vitales</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-700">
                {b.presionSistolica && b.presionDiastolica && (
                  <span>TA: {b.presionSistolica}/{b.presionDiastolica} mmHg</span>
                )}
                {b.temperatura && <span>Temp: {b.temperatura} °C</span>}
                {b.saturacion && <span>Sat O2: {b.saturacion}%</span>}
                {b.glucemia && <span>Glucemia: {b.glucemia} mg/dL</span>}
                {b.peso && <span>Peso: {b.peso} kg</span>}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {b.observaciones && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Observaciones</p>
              <p className="text-gray-700 italic">{b.observaciones}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistorialBienestarModal({ isOpen, onClose, residenteId, residenteNombre }: Props) {
  const hasta = new Date().toISOString().split('T')[0];
  const desdeDate = new Date();
  desdeDate.setDate(desdeDate.getDate() - 14);
  const desde = desdeDate.toISOString().split('T')[0];

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['bienestar-historial', residenteId],
    queryFn: () => bienestarService.historial(residenteId, desde, hasta),
    enabled: isOpen,
    staleTime: 60 * 1000,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Historial de cuidados — ${residenteNombre}`}
      size="lg"
    >
      <div className="space-y-2">
        <p className="text-xs text-gray-500 mb-4">Últimos 14 días</p>
        {isLoading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : registros.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">Sin registros en los últimos 14 días</div>
        ) : (
          registros.map((b) => <RegistroCard key={b.id} b={b} />)
        )}
      </div>
    </Modal>
  );
}
