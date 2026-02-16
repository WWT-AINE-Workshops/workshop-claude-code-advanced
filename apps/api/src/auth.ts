import type { User } from '@copperline/shared';
import type { FastifyInstance } from 'fastify';
import type { Db } from './db';
import { getUserRow, toUser } from './repo';

declare module 'fastify' {
  interface FastifyRequest {
    user: User;
  }
}

const PUBLIC = new Set(['/api/health']);

export function registerAuth(app: FastifyInstance, db: Db): void {
  app.decorateRequest('user', null as unknown as User);
  app.addHook('onRequest', async (request, reply) => {
    if (PUBLIC.has(request.url.split('?')[0])) return;
    const raw = request.headers['x-user-id'];
    const id = typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : NaN;
    const row = Number.isSafeInteger(id) && id > 0 ? getUserRow(db, id) : undefined;
    if (!row) {
      return reply
        .code(401)
        .send({ error: 'unauthorized', message: 'Missing or unknown X-User-Id header' });
    }
    request.user = toUser(row);
  });
}
