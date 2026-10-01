import type {
  DashboardSummary,
  EquipmentRequest,
  Item,
  ItemPrice,
  Page,
  RequestEvent,
  RequestStatus,
  User,
} from '@copperline/shared';
import { getCurrentUserId } from './session';

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-user-id': String(getCurrentUserId()),
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message ?? `Request failed (${res.status})`);
  return body as T;
}

const post = <T>(path: string, body: unknown = {}) =>
  call<T>(path, { method: 'POST', body: JSON.stringify(body) });

export const api = {
  me: () => call<User>('/api/me'),
  users: () => call<User[]>('/api/users'),
  dashboard: () => call<DashboardSummary>('/api/dashboard'),
  items: (q?: string) => call<Item[]>(q ? `/api/items?q=${encodeURIComponent(q)}` : '/api/items'),
  price: (id: number) => call<ItemPrice>(`/api/items/${id}/price`),
  requests: (page: number, pageSize = 10, status?: RequestStatus) =>
    call<Page<EquipmentRequest>>(
      `/api/requests?page=${page}&pageSize=${pageSize}${status ? `&status=${status}` : ''}`,
    ),
  events: (id: number) => call<RequestEvent[]>(`/api/requests/${id}/events`),
  request: (id: number) => call<EquipmentRequest>(`/api/requests/${id}`),
  createRequest: (input: { itemId: number; qty: number; justification: string }) =>
    post<EquipmentRequest>('/api/requests', input),
  approvals: () => call<EquipmentRequest[]>('/api/approvals'),
  approve: (id: number) => post<EquipmentRequest>(`/api/requests/${id}/approve`),
  reject: (id: number, note?: string) =>
    post<EquipmentRequest>(`/api/requests/${id}/reject`, { note }),
  cancel: (id: number) => post<EquipmentRequest>(`/api/requests/${id}/cancel`),
};
