import api from '../../services/api';
import type { ApiResponse, BienestarDiario, BienestarDiarioRequest, EstadoCuidadosTurno, Turno } from '../../types';

export const bienestarService = {
  listarEstadoTurno: async (fecha: string, turno: Turno): Promise<EstadoCuidadosTurno[]> => {
    const { data } = await api.get<ApiResponse<EstadoCuidadosTurno[]>>('/api/bienestar/turno', {
      params: { fecha, turno },
    });
    return data.data;
  },

  obtenerPorResidenteFechaTurno: async (
    residenteId: number,
    fecha: string,
    turno: Turno
  ): Promise<BienestarDiario | null> => {
    try {
      const { data } = await api.get<ApiResponse<BienestarDiario>>(
        `/api/bienestar/residentes/${residenteId}`,
        { params: { fecha, turno } }
      );
      return data.data;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  guardar: async (residenteId: number, request: BienestarDiarioRequest): Promise<BienestarDiario> => {
    const { data } = await api.post<ApiResponse<BienestarDiario>>(
      `/api/bienestar/residentes/${residenteId}`,
      request
    );
    return data.data;
  },

  historial: async (residenteId: number, desde: string, hasta: string): Promise<BienestarDiario[]> => {
    const { data } = await api.get<ApiResponse<BienestarDiario[]>>(
      `/api/bienestar/residentes/${residenteId}/historial`,
      { params: { desde, hasta } }
    );
    return data.data;
  },
};
