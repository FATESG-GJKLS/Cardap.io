import { Platform } from 'react-native';
import type { Auth } from './types';

const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL).replace(/\/$/, '');

export async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || (response.status === 401 ? 'Faça login para continuar.' : `Erro ${response.status} na API`));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const post = <T,>(path: string, body: unknown, token?: string) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token);
export const put = <T,>(path: string, body: unknown, token: string) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, token);
export const patch = <T,>(path: string, body: unknown, token: string) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token);
export const remove = (path: string, token: string) =>
  request<void>(path, { method: 'DELETE' }, token);
export const formatMoney = (number: number) => `R$ ${Number(number).toFixed(2).replace('.', ',')}`;
export const priceCalc = (entries: { product: { price: number }; quantity: number }[]) =>
  Number(entries.reduce((sum, e) => sum + e.product.price * e.quantity, 0).toFixed(2));
export const shipping = (subtotal: number) => subtotal >= 80 ? 0 : 6.9;
export type { Auth };
