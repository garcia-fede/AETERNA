import api from '../../services/api';
import type { ApiResponse, Vinculo, VinculoRequest } from '../../types';

export const familiaresService = {
  vincular: async (request: VinculoRequest): Promise<Vinculo> => {
    const { data } = await api.post<ApiResponse<Vinculo>>('/api/familiares', request);
    return data.data;
  },

  desvincular: async (id: number): Promise<void> => {
    await api.delete(`/api/familiares/${id}`);
  },

  listarPorResidente: async (residenteId: number): Promise<Vinculo[]> => {
    const { data } = await api.get<ApiResponse<Vinculo[]>>(`/api/familiares/residentes/${residenteId}`);
    return data.data;
  },
};
