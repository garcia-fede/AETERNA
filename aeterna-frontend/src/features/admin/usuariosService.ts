import api from '../../services/api';
import type { ApiResponse, UsuarioAdmin, UsuarioRequest, UsuarioUpdateRequest, CambiarPasswordRequest, Rol } from '../../types';

export const usuariosService = {
  listar: async (rol?: Rol): Promise<UsuarioAdmin[]> => {
    const { data } = await api.get<ApiResponse<UsuarioAdmin[]>>('/api/usuarios', {
      params: rol ? { rol } : undefined,
    });
    return data.data;
  },

  obtener: async (id: number): Promise<UsuarioAdmin> => {
    const { data } = await api.get<ApiResponse<UsuarioAdmin>>(`/api/usuarios/${id}`);
    return data.data;
  },

  crear: async (request: UsuarioRequest): Promise<UsuarioAdmin> => {
    const { data } = await api.post<ApiResponse<UsuarioAdmin>>('/api/usuarios', request);
    return data.data;
  },

  actualizar: async (id: number, request: UsuarioUpdateRequest): Promise<UsuarioAdmin> => {
    const { data } = await api.put<ApiResponse<UsuarioAdmin>>(`/api/usuarios/${id}`, request);
    return data.data;
  },

  activarDesactivar: async (id: number, activo: boolean): Promise<void> => {
    await api.patch(`/api/usuarios/${id}/activo`, null, { params: { activo } });
  },

  cambiarPassword: async (id: number, request: CambiarPasswordRequest): Promise<void> => {
    await api.patch(`/api/usuarios/${id}/password`, request);
  },
};
