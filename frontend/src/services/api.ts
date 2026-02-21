import axios from 'axios';
import type { 
  PersonalsConfig, 
  SearchConfig, 
  SecretsConfig, 
  SettingsConfig, 
  QuestionsConfig,
  BotStatus,
  JobHistory 
} from '../types/config';

const API_BASE = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const configApi = {
  getAll: async () => {
    const response = await api.get('/config/all');
    return response.data;
  },

  getPersonals: async (): Promise<PersonalsConfig> => {
    const response = await api.get('/config/personals');
    return response.data;
  },

  savePersonals: async (config: Partial<PersonalsConfig>) => {
    const response = await api.post('/config/personals', config);
    return response.data;
  },

  getSearch: async (): Promise<SearchConfig> => {
    const response = await api.get('/config/search');
    return response.data;
  },

  saveSearch: async (config: Partial<SearchConfig>) => {
    const response = await api.post('/config/search', config);
    return response.data;
  },

  getSecrets: async (): Promise<SecretsConfig> => {
    const response = await api.get('/config/secrets');
    return response.data;
  },

  saveSecrets: async (config: Partial<SecretsConfig>) => {
    const response = await api.post('/config/secrets', config);
    return response.data;
  },

  getSettings: async (): Promise<SettingsConfig> => {
    const response = await api.get('/config/settings');
    return response.data;
  },

  saveSettings: async (config: Partial<SettingsConfig>) => {
    const response = await api.post('/config/settings', config);
    return response.data;
  },

  getQuestions: async (): Promise<QuestionsConfig> => {
    const response = await api.get('/config/questions');
    return response.data;
  },

  saveQuestions: async (config: Partial<QuestionsConfig>) => {
    const response = await api.post('/config/questions', config);
    return response.data;
  },
};

export const botApi = {
  start: async (config?: Partial<SearchConfig>) => {
    const response = await api.post('/bot/start', config);
    return response.data;
  },

  stop: async () => {
    const response = await api.post('/bot/stop');
    return response.data;
  },

  status: async (): Promise<BotStatus> => {
    const response = await api.get('/bot/status');
    return response.data;
  },

  logs: async () => {
    const response = await api.get('/bot/logs');
    return response.data;
  },
};

export const jobsApi = {
  getHistory: async (): Promise<JobHistory[]> => {
    const response = await api.get('/applied-jobs');
    return response.data;
  },

  getFailed: async (): Promise<JobHistory[]> => {
    const response = await api.get('/failed-jobs');
    return response.data;
  },

  updateAppliedDate: async (jobId: string) => {
    const response = await api.put(`/applied-jobs/${jobId}`);
    return response.data;
  },
};

export default api;
