import { api } from './api';
import type { ApiResponse, User } from '../types';

export async function getAdminUsers() {
  const { data } = await api.get<ApiResponse<User[]>>('/users/admin');
  return data.data;
}

export async function updateUserStatus(id: string, status: 'active' | 'blocked') {
  const { data } = await api.patch<ApiResponse<User>>(`/users/admin/${id}/status`, { status });
  return data.data;
}

export async function approvePasswordReset(id: string, adminNote?: string) {
  const { data } = await api.patch<ApiResponse<User>>(`/users/admin/${id}/password-reset/approve`, { adminNote });
  return data.data;
}

export async function rejectPasswordReset(id: string, adminNote?: string) {
  const { data } = await api.patch<ApiResponse<User>>(`/users/admin/${id}/password-reset/reject`, { adminNote });
  return data.data;
}

export async function deleteUser(id: string) {
  const { data } = await api.delete<ApiResponse<null>>(`/users/admin/${id}`);
  return data;
}