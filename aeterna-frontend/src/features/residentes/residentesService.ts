import api from '../../services/api';
import type { ApiResponse, Residente, ResidenteRequest } from '../../types';

export const residentesService = {
  listar: async (): Promise<Residente[]> => {
    const { data } = await api.get<ApiResponse<Residente[]>>('/api/residentes');
    return data.data;
  },

  buscarPorId: async (id: number): Promise<Residente> => {
    const { data } = await api.get<ApiResponse<Residente>>(`/api/residentes/${id}`);
    return data.data;
  },

  crear: async (request: ResidenteRequest): Promise<Residente> => {
    const { data } = await api.post<ApiResponse<Residente>>('/api/residentes', request);
    return data.data;
  },

  actualizar: async (id: number, request: ResidenteRequest): Promise<Residente> => {
    const { data } = await api.put<ApiResponse<Residente>>(`/api/residentes/${id}`, request);
    return data.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/api/residentes/${id}`);
  },
};
