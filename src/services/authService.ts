import { api } from './api';
import type { ApiResponse, AuthResponse, User } from '../types';

export async function login(payload: { phone: string; password: string }) {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
  return data.data;
}

export async function register(payload: { name: string; phone: string; email?: string; password: string }) {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
  return data.data;
}

export async function requestPasswordReset(payload: { phone: string; password: string }) {
  const { data } = await api.post<ApiResponse<null>>('/auth/password-reset/request', payload);
  return data;
}

export async function getMe() {
  const { data } = await api.get<ApiResponse<User>>('/auth/me');
  return data.data;
}

export async function updateMe(payload: { name: string; email?: string }) {
  const { data } = await api.patch<ApiResponse<User>>('/auth/me', payload);
  return data.data;
}