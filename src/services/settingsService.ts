import { api } from './api';
import type { ApiResponse } from '../types';

export type TrackingSettings = {
  gtmId: string;
  metaPixelId: string;
  ga4Id: string;
};

export async function getTrackingSettings() {
  const { data } = await api.get<ApiResponse<TrackingSettings>>('/settings');
  return data.data;
}

export async function updateTrackingSettings(payload: TrackingSettings) {
  const { data } = await api.put<ApiResponse<TrackingSettings>>('/settings/admin', payload);
  return data.data;
}
