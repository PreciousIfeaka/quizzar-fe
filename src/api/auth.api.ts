import api from '../lib/axios';
import type { Teacher } from '../types/auth.types';

export const authApi = {
  provisionProfile: (): Promise<Teacher> =>
    api.post('/api/v1/auth/me').then(r => r.data.data),

  getProfile: (): Promise<Teacher> =>
    api.get('/api/v1/auth/me').then(r => r.data.data),
};
