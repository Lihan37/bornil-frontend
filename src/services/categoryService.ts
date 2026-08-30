import { api } from './api';
import type { ApiResponse, Category } from '../types';

export type CategoryRecord = {
  _id: string;
  name: Category | string;
  slug: string;
  image?: string;
  isFeatured: boolean;
};

const visibleCategory = (category: CategoryRecord) => category.name !== 'Bridal Jewelry';

export async function getCategories() {
  const { data } = await api.get<ApiResponse<CategoryRecord[]>>('/categories');
  return data.data.filter(visibleCategory);
}

export async function createCategory(payload: { name: string; image?: string; isFeatured: boolean }) {
  const { data } = await api.post<ApiResponse<CategoryRecord>>('/categories/admin', payload);
  return data.data;
}

export async function updateCategory(id: string, payload: { name: string; image?: string; isFeatured: boolean }) {
  const { data } = await api.patch<ApiResponse<CategoryRecord>>(`/categories/admin/${id}`, payload);
  return data.data;
}

export async function deleteCategory(id: string) {
  const { data } = await api.delete<ApiResponse<null>>(`/categories/admin/${id}`);
  return data;
}
