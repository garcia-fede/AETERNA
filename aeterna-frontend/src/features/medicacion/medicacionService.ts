import api from '../../services/api';
import type {
  ApiResponse,
  Medicamento,
  MedicamentoRequest,
  Administracion,
  AdministracionRequest,
  TomaPendiente,
  Turno,
} from '../../types';

export const medicacionService = {
  listarMedicamentosResidente: async (residenteId: number): Promise<Medicamento[]> => {
    const { data } = await api.get<ApiResponse<Medicamento[]>>(
      `/api/residentes/${residenteId}/medicamentos`
    );
    return data.data;
  },

  crearMedicamento: async (residenteId: number, request: MedicamentoRequest): Promise<Medicamento> => {
    const { data } = await api.post<ApiResponse<Medicamento>>(
      `/api/residentes/${residenteId}/medicamentos`,
      request
    );
    return data.data;
  },

  actualizarMedicamento: async (id: number, request: MedicamentoRequest): Promise<Medicamento> => {
    const { data } = await api.put<ApiResponse<Medicamento>>(
      `/api/medicamentos/${id}`,
      request
    );
    return data.data;
  },

  eliminarMedicamento: async (id: number): Promise<void> => {
    await api.delete(`/api/medicamentos/${id}`);
  },

  listarTomasPendientes: async (fecha: string, turno: Turno): Promise<TomaPendiente[]> => {
    const { data } = await api.get<ApiResponse<TomaPendiente[]>>(
      `/api/administraciones/turno`,
      { params: { fecha, turno } }
    );
    return data.data;
  },

  registrarAdministracion: async (request: AdministracionRequest): Promise<Administracion> => {
    const { data } = await api.post<ApiResponse<Administracion>>(
      `/api/administraciones`,
      request
    );
    return data.data;
  },

  historialAdministraciones: async (
    residenteId: number,
    desde: string,
    hasta: string
  ): Promise<Administracion[]> => {
    const { data } = await api.get<ApiResponse<Administracion[]>>(
      `/api/administraciones/residentes/${residenteId}`,
      { params: { desde, hasta } }
    );
    return data.data;
  },
};
