import type { RequestStatus, Role } from '@copperline/shared';
import type { Db } from './db';

export interface SeedUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export interface SeedItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  unitCostCents: number;
}

export const USERS: SeedUser[] = [
  {
    id: 1,
    name: 'Ava Patel',
    email: 'ava.patel@copperline.test',
    role: 'employee',
    department: 'Engineering',
  },
  {
    id: 2,
    name: 'Ben Okafor',
    email: 'ben.okafor@copperline.test',
    role: 'manager',
    department: 'Engineering',
  },
  {
    id: 3,
    name: 'Chloe Nguyen',
    email: 'chloe.nguyen@copperline.test',
    role: 'employee',
    department: 'Engineering',
  },
  {
    id: 4,
    name: 'Diego Ramirez',
    email: 'diego.ramirez@copperline.test',
    role: 'employee',
    department: 'Sales',
  },
  {
    id: 5,
    name: 'Emma Schulz',
    email: 'emma.schulz@copperline.test',
    role: 'manager',
    department: 'Sales',
  },
  {
    id: 6,
    name: 'Farah Haddad',
    email: 'farah.haddad@copperline.test',
    role: 'employee',
    department: 'Finance',
  },
  {
    id: 7,
    name: 'Grace Kim',
    email: 'grace.kim@copperline.test',
    role: 'manager',
    department: 'Finance',
  },
  {
    id: 8,
    name: 'Hiro Tanaka',
    email: 'hiro.tanaka@copperline.test',
    role: 'admin',
    department: 'IT',
  },
];

export const ITEMS: SeedItem[] = [
  {
    id: 1,
    sku: 'LAP-14-STD',
    name: '14" Standard Laptop',
    category: 'Laptops',
    stock: 8,
    unitCostCents: 129900,
  },
  {
    id: 2,
    sku: 'LAP-16-PRO',
    name: '16" Pro Laptop',
    category: 'Laptops',
    stock: 3,
    unitCostCents: 249900,
  },
  {
    id: 3,
    sku: 'MON-27-4K',
    name: '27" 4K Monitor',
    category: 'Monitors',
    stock: 12,
    unitCostCents: 39900,
  },
  {
    id: 4,
    sku: 'MON-34-UW',
    name: '34" Ultrawide Monitor',
    category: 'Monitors',
    stock: 2,
    unitCostCents: 69900,
  },
  {
    id: 5,
    sku: 'KB-WL',
    name: 'Wireless Keyboard',
    category: 'Peripherals',
    stock: 25,
    unitCostCents: 7900,
  },
  {
    id: 6,
    sku: 'MS-WL',
    name: 'Wireless Mouse',
    category: 'Peripherals',
    stock: 30,
    unitCostCents: 4900,
  },
  {
    id: 7,
    sku: 'HS-ANC',
    name: 'Noise-Cancelling Headset',
    category: 'Audio',
    stock: 6,
    unitCostCents: 19900,
  },
  {
    id: 8,
    sku: 'DOCK-USBC',
    name: 'USB-C Dock',
    category: 'Peripherals',
    stock: 9,
    unitCostCents: 22900,
  },
  {
    id: 9,
    sku: 'CAM-HD',
    name: 'HD Webcam',
    category: 'Peripherals',
    stock: 1,
    unitCostCents: 8900,
  },
  {
    id: 10,
    sku: 'CHAIR-ERG',
    name: 'Ergonomic Chair',
    category: 'Furniture',
    stock: 4,
    unitCostCents: 54900,
  },
  {
    id: 11,
    sku: 'DESK-SIT',
    name: 'Sit-Stand Desk',
    category: 'Furniture',
    stock: 0,
    unitCostCents: 79900,
  },
  {
    id: 12,
    sku: 'TAB-11',
    name: '11" Tablet',
    category: 'Tablets',
    stock: 5,
    unitCostCents: 59900,
  },
];

const JUSTIFICATIONS = [
  'Replacing hardware that failed this week.',
  'New hire starting on the team next Monday.',
  'Current device is past its refresh date.',
  'Needed for the customer demo lab.',
  'Working from the new office two days a week.',
  'Ergonomic recommendation from occupational health.',
];

const BASE = Date.parse('2026-09-01T14:00:00.000Z');
const HOUR = 3_600_000;
const ADMIN_ID = 8;

interface SeedRequest {
  requesterId: number;
  itemId: number;
  qty: number;
  status: RequestStatus;
  justification: string;
}

function lcg(seedValue: number): () => number {
  let s = seedValue;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function approverFor(requesterId: number): number {
  const requester = USERS.find((u) => u.id === requesterId)!;
  if (requester.role !== 'employee') return ADMIN_ID;
  return USERS.find((u) => u.role === 'manager' && u.department === requester.department)!.id;
}

function buildRequests(): SeedRequest[] {
  const rand = lcg(42);
  const requesters = USERS.filter((u) => u.role !== 'admin');
  const statuses: RequestStatus[] = [
    'pending',
    'approved',
    'approved',
    'rejected',
    'fulfilled',
    'cancelled',
  ];
  const list: SeedRequest[] = [
    {
      requesterId: 1,
      itemId: 9,
      qty: 1,
      status: 'pending',
      justification: 'My webcam died during a customer call.',
    },
    {
      requesterId: 3,
      itemId: 9,
      qty: 1,
      status: 'pending',
      justification: 'Need a webcam for the new interview loop.',
    },
  ];
  for (let n = 0; n < 38; n++) {
    list.push({
      requesterId: requesters[Math.floor(rand() * requesters.length)].id,
      itemId: ITEMS[Math.floor(rand() * ITEMS.length)].id,
      qty: 1 + Math.floor(rand() * 2),
      status: statuses[Math.floor(rand() * statuses.length)],
      justification: JUSTIFICATIONS[n % JUSTIFICATIONS.length],
    });
  }
  return list;
}

export function seed(db: Db): void {
  const insertUser = db.prepare(
    'INSERT INTO users (id, name, email, role, department) VALUES (?, ?, ?, ?, ?)',
  );
  const insertItem = db.prepare(
    'INSERT INTO items (id, sku, name, category, stock, unit_cost_cents) VALUES (?, ?, ?, ?, ?, ?)',
  );
  const insertRequest = db.prepare(
    `INSERT INTO requests (requester_id, item_id, qty, status, justification, approved_unit_cost_cents, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertEvent = db.prepare(
    `INSERT INTO request_events (request_id, actor_id, from_status, to_status, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  db.transaction(() => {
    for (const u of USERS) insertUser.run(u.id, u.name, u.email, u.role, u.department);
    for (const i of ITEMS)
      insertItem.run(i.id, i.sku, i.name, i.category, i.stock, i.unitCostCents);

    buildRequests().forEach((r, idx) => {
      const created = new Date(BASE + idx * 7 * HOUR).toISOString();
      const decided = new Date(BASE + idx * 7 * HOUR + 26 * HOUR).toISOString();
      const fulfilled = new Date(BASE + idx * 7 * HOUR + 50 * HOUR).toISOString();
      const updated =
        r.status === 'pending' ? created : r.status === 'fulfilled' ? fulfilled : decided;
      const approved = r.status === 'approved' || r.status === 'fulfilled';
      const cost = approved ? ITEMS[r.itemId - 1].unitCostCents : null;
      const id = Number(
        insertRequest.run(
          r.requesterId,
          r.itemId,
          r.qty,
          r.status,
          r.justification,
          cost,
          created,
          updated,
        ).lastInsertRowid,
      );
      const approver = approverFor(r.requesterId);
      insertEvent.run(id, r.requesterId, null, 'pending', null, created);
      if (approved) insertEvent.run(id, approver, 'pending', 'approved', null, decided);
      if (r.status === 'fulfilled')
        insertEvent.run(
          id,
          ADMIN_ID,
          'approved',
          'fulfilled',
          'Shipped from the IT stockroom',
          fulfilled,
        );
      if (r.status === 'rejected')
        insertEvent.run(
          id,
          approver,
          'pending',
          'rejected',
          "Not in this quarter's budget",
          decided,
        );
      if (r.status === 'cancelled')
        insertEvent.run(id, r.requesterId, 'pending', 'cancelled', null, decided);
    });
  })();
}
