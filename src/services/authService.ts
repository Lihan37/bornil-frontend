import { api } from './api';
import type { AuthResponse } from '../types';

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function register(payload: { name: string; email: string; password: string }) {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}
