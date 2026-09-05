import { api } from './api';
import type { ApiResponse, DeliveryArea, Order, OrderStatus } from '../types';

export type CreateOrderPayload = {
  customerName: string;
  phone: string;
  address: string;
  deliveryArea: DeliveryArea;
  paymentMethod: 'cash_on_delivery';
  items: Array<{ productId: string; quantity: number }>;
};

export type OrderEditRequestPayload = {
  note?: string;
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

export async function requestOrderEdit(id: string, payload: OrderEditRequestPayload) {
  const { data } = await api.patch<ApiResponse<Order>>(`/orders/${id}/edit-request`, payload);
  return data.data;
}

export async function approveOrderEditRequest(id: string, adminNote?: string) {
  const { data } = await api.patch<ApiResponse<Order>>(`/orders/admin/${id}/edit-request/approve`, { adminNote });
  return data.data;
}

export async function rejectOrderEditRequest(id: string, adminNote?: string) {
  const { data } = await api.patch<ApiResponse<Order>>(`/orders/admin/${id}/edit-request/reject`, { adminNote });
  return data.data;
}