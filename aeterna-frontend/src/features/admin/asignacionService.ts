import api from '../../services/api';
import type { ApiResponse, AsignacionPersonal, PersonalConResidentes } from '../../types';

export const asignacionService = {
  /**
   * Lista todos los usuarios PERSONAL con sus residentes asignados.
   * Solo ADMIN.
   */
  listarPersonalConResidentes: async (): Promise<PersonalConResidentes[]> => {
    const { data } = await api.get<ApiResponse<PersonalConResidentes[]>>('/api/asignaciones/personal');
    return data.data;
  },

  /**
   * Lista los residentes asignados a un personal específico.
   * Solo ADMIN.
   */
  listarPorPersonal: async (usuarioId: number): Promise<AsignacionPersonal[]> => {
    const { data } = await api.get<ApiResponse<AsignacionPersonal[]>>(
      `/api/asignaciones/personal/${usuarioId}/residentes`
    );
    return data.data;
  },

  /**
   * Asigna un residente a un miembro del personal.
   * Solo ADMIN.
   */
  asignar: async (usuarioId: number, residenteId: number): Promise<AsignacionPersonal> => {
    const { data } = await api.post<ApiResponse<AsignacionPersonal>>(
      `/api/asignaciones/personal/${usuarioId}/residentes/${residenteId}`
    );
    return data.data;
  },

  /**
   * Desasigna un residente de un miembro del personal.
   * Solo ADMIN.
   */
  desasignar: async (usuarioId: number, residenteId: number): Promise<void> => {
    await api.delete(`/api/asignaciones/personal/${usuarioId}/residentes/${residenteId}`);
  },
};
