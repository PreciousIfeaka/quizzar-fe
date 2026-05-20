import api from '../lib/axios';
import type { GenerateFromPasteRequest, GenerationResponse } from '../types/generation.types';

export const generationApi = {
  fromUpload: (formData: FormData): Promise<GenerationResponse> =>
    api.post('/api/v1/generate/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000,  // 2 min — AI calls are slow
    }).then(r => r.data.data),

  fromPaste: (data: GenerateFromPasteRequest): Promise<GenerationResponse> =>
    api.post('/api/v1/generate/paste', data, { timeout: 120_000 })
      .then(r => r.data.data),

  fromSpecs: (formData: FormData): Promise<GenerationResponse> =>
    api.post('/api/v1/generate/specs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000,
    }).then(r => r.data.data),
};
