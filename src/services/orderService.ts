import { api } from './api';
import { fallbackOrders } from '../data/mockData';
import type { Order, OrderStatus } from '../types';

export async function createOrder(payload: Omit<Order, '_id' | 'status' | 'createdAt'>) {
  const { data } = await api.post<Order>('/orders', payload);
  return data;
}

export async function getOrders() {
  try {
    const { data } = await api.get<Order[]>('/orders');
    return data;
  } catch {
    return fallbackOrders;
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
  return data;
}
