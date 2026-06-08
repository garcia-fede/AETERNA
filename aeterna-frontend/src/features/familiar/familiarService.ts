import api from '../../services/api';
import type { ApiResponse, Residente, Novedad, PersonalAsignado } from '../../types';

export const familiarService = {
  getMiResidente: async (): Promise<Residente> => {
    const { data } = await api.get<ApiResponse<Residente>>('/api/familiares/mi-residente');
    return data.data;
  },

  getMisNovedades: async (residenteId: number): Promise<Novedad[]> => {
    const { data } = await api.get<ApiResponse<Novedad[]>>(`/api/novedades/residentes/${residenteId}`);
    return data.data.filter((n) => n.visibleFamiliar);
  },

  getPersonalAsignado: async (): Promise<PersonalAsignado[]> => {
    const { data } = await api.get<ApiResponse<PersonalAsignado[]>>('/api/familiares/personal-asignado');
    return data.data;
  },
};
