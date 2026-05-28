import api from '../../services/api';
import type { ApiResponse, ResumenDashboard } from '../../types';

export const dashboardService = {
  getResumen: async (): Promise<ResumenDashboard> => {
    const { data } = await api.get<ApiResponse<ResumenDashboard>>('/api/dashboard/resumen');
    return data.data;
  },
};
