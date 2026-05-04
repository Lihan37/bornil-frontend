import { api } from './api';
import { fallbackProducts } from '../data/mockData';
import type { Product, ProductFilters } from '../types';

const normalizeProducts = (products: Product[], filters?: ProductFilters) => {
  let result = [...products];
  const search = filters?.search?.trim().toLowerCase();

  if (search) {
    result = result.filter((product) => product.name.toLowerCase().includes(search));
  }
  if (filters?.category) {
    result = result.filter((product) => product.category === filters.category);
  }
  if (filters?.availability === 'in-stock') {
    result = result.filter((product) => product.stock > 0);
  }
  if (filters?.availability === 'out-of-stock') {
    result = result.filter((product) => product.stock === 0);
  }
  if (filters?.minPrice) {
    result = result.filter((product) => product.price >= Number(filters.minPrice));
  }
  if (filters?.maxPrice) {
    result = result.filter((product) => product.price <= Number(filters.maxPrice));
  }
  if (filters?.sort === 'price-low-high') {
    result.sort((a, b) => a.price - b.price);
  }
  if (filters?.sort === 'price-high-low') {
    result.sort((a, b) => b.price - a.price);
  }
  if (filters?.sort === 'newest') {
    result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  return result;
};

export async function getProducts(filters?: ProductFilters) {
  try {
    const { data } = await api.get<Product[]>('/products', { params: filters });
    return data;
  } catch {
    return normalizeProducts(fallbackProducts, filters);
  }
}

export async function getProduct(id: string) {
  try {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  } catch {
    const product = fallbackProducts.find((item) => item._id === id || item.slug === id);
    if (!product) throw new Error('Product not found');
    return product;
  }
}

export async function createProduct(payload: Omit<Product, '_id'>) {
  const { data } = await api.post<Product>('/products', payload);
  return data;
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const { data } = await api.put<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete<{ message: string }>(`/products/${id}`);
  return data;
}
