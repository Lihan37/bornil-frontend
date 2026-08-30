import { api } from './api';
import type { ApiResponse, PaginatedProducts, Product, ProductFilters } from '../types';

export async function getProducts(filters?: ProductFilters) {
  const { data } = await api.get<ApiResponse<Product[]>>('/products', { params: filters });
  const products = data.data.filter((product) => String(product.category) !== 'Bridal Jewelry');
  return {
    products,
    meta: data.meta || { page: 1, limit: products.length, total: products.length, totalPages: 1 },
  } satisfies PaginatedProducts;
}

export async function getProduct(id: string) {
  const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return data.data;
}

export async function getProductBySlug(slug: string) {
  const { data } = await api.get<ApiResponse<Product>>(`/products/slug/${slug}`);
  return data.data;
}

export async function createProduct(payload: FormData) {
  const { data } = await api.post<ApiResponse<Product>>('/products/admin', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function updateProduct(id: string, payload: FormData) {
  const { data } = await api.patch<ApiResponse<Product>>(`/products/admin/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete<ApiResponse<null>>(`/products/admin/${id}`);
  return data;
}
