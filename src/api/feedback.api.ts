import api from '../lib/axios';

export interface SendFeedbackRequest {
  text: string;
  imageUrl?: string;
}

export const feedbackApi = {
  sendFeedback: (data: SendFeedbackRequest): Promise<void> =>
    api.post('/api/v1/auth/send-feedback', data).then(r => r.data),
};
