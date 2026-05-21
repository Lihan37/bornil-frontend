import { api } from './api';
import type { ApiResponse, Order, OrderStatus } from '../types';

export type CreateOrderPayload = {
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: 'cash_on_delivery';
  items: Array<{ productId: string; quantity: number }>;
};

export async function createOrder(payload: CreateOrderPayload) {
  const { data } = await api.post<ApiResponse<Order>>('/orders', payload);
  return data.data;
}

export async function getOrders() {
  const { data } = await api.get<ApiResponse<Order[]>>('/orders/admin');
  return data.data;
}

export async function getMyOrders() {
  const { data } = await api.get<ApiResponse<Order[]>>('/orders/my-orders');
  return data.data;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data } = await api.patch<ApiResponse<Order>>(`/orders/admin/${id}/status`, { orderStatus: status });
  return data.data;
}
