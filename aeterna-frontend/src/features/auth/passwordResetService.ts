import api from '../../services/api';
import type { ApiResponse, ResetPasswordRequest, TokenInfo } from '../../types';

export const passwordResetService = {
  validarToken: async (token: string): Promise<TokenInfo> => {
    const { data } = await api.get<ApiResponse<TokenInfo>>('/api/auth/reset-password/validar', {
      params: { token },
    });
    return data.data;
  },

  restablecer: async (request: ResetPasswordRequest): Promise<void> => {
    await api.post('/api/auth/reset-password', request);
  },
};
