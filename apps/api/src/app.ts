import Fastify, { type FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { registerAuth } from './auth';
import type { Db } from './db';
import { HttpError } from './errors';
import { itemRoutes } from './routes/items';
import { requestRoutes } from './routes/requests';
import { systemRoutes } from './routes/system';
import type { VendorClient } from './vendor';

export interface AppDeps {
  db: Db;
  vendor: VendorClient;
  now?: () => Date;
  logger?: boolean;
}

export function buildApp(deps: AppDeps): FastifyInstance {
  const app = Fastify({ logger: deps.logger ?? false });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.status).send({ error: error.code, message: error.message });
    }
    if (error instanceof ZodError) {
      const message = error.issues
        .map((i) => `${i.path.join('.') || 'value'}: ${i.message}`)
        .join('; ');
      return reply.code(400).send({ error: 'validation_error', message });
    }
    const err = error as Error & { statusCode?: number };
    if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
      return reply.code(err.statusCode).send({ error: 'bad_request', message: err.message });
    }
    request.log.error(err);
    return reply.code(500).send({ error: 'internal_error', message: 'Internal Server Error' });
  });

  app.setNotFoundHandler((request, reply) =>
    reply
      .code(404)
      .send({ error: 'not_found', message: `Route ${request.method} ${request.url} not found` }),
  );

  registerAuth(app, deps.db);
  systemRoutes(app, deps);
  itemRoutes(app, deps);
  requestRoutes(app, deps);
  return app;
}
