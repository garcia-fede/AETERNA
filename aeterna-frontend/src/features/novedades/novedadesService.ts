import api from '../../services/api';
import type { ApiResponse, Novedad, NovedadRequest, TipoNovedad, PrioridadNovedad } from '../../types';

export const novedadesService = {
  listar: async (params?: {
    residenteId?: number;
    tipo?: TipoNovedad;
    prioridad?: PrioridadNovedad;
  }): Promise<Novedad[]> => {
    const { data } = await api.get<ApiResponse<Novedad[]>>('/api/novedades', { params });
    return data.data;
  },

  crear: async (request: NovedadRequest): Promise<Novedad> => {
    const { data } = await api.post<ApiResponse<Novedad>>('/api/novedades', request);
    return data.data;
  },

  actualizarVisibilidad: async (
    id: number,
    visibleFamiliar?: boolean,
    visibleTurnoEntrante?: boolean
  ): Promise<Novedad> => {
    const { data } = await api.patch<ApiResponse<Novedad>>(
      `/api/novedades/${id}/visibilidad`,
      null,
      { params: { visibleFamiliar, visibleTurnoEntrante } }
    );
    return data.data;
  },

  actualizarPrioridad: async (id: number, prioridad: PrioridadNovedad): Promise<Novedad> => {
    const { data } = await api.patch<ApiResponse<Novedad>>(
      `/api/novedades/${id}/prioridad`,
      null,
      { params: { prioridad } }
    );
    return data.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/api/novedades/${id}`);
  },

  obtenerPorResidente: async (residenteId: number): Promise<Novedad[]> => {
    const { data } = await api.get<ApiResponse<Novedad[]>>(`/api/novedades/residentes/${residenteId}`);
    return data.data;
  },
};
