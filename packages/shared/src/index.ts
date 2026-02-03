export type Role = 'employee' | 'manager' | 'admin';

export const REQUEST_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'fulfilled',
  'cancelled',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export interface Item {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  unitCostCents: number;
}

export interface EquipmentRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  department: string;
  itemId: number;
  itemName: string;
  qty: number;
  status: RequestStatus;
  justification: string;
  approvedUnitCostCents: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestEvent {
  id: number;
  requestId: number;
  actorId: number;
  actorName: string;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus;
  note: string | null;
  createdAt: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DashboardSummary {
  pendingCount: number;
  approvedThisMonth: number;
  lowStockItems: number;
  myOpenRequests: number;
}

export interface ItemPrice {
  itemId: number;
  unitCostCents: number;
  source: 'vendor' | 'cache' | 'fallback';
  fetchedAt: string;
}

export interface ApiError {
  error: string;
  message: string;
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatCents(cents: number): string {
  return usd.format(cents / 100);
}
