import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../app';
import { dashboardSummary, listUsers } from '../repo';

export function systemRoutes(app: FastifyInstance, deps: AppDeps): void {
  const now = deps.now ?? (() => new Date());
  app.get('/api/health', async () => ({ ok: true }));
  app.get('/api/me', async (request) => request.user);
  app.get('/api/users', async () => listUsers(deps.db));
  app.get('/api/dashboard', async (request) => dashboardSummary(deps.db, request.user, now()));
}
