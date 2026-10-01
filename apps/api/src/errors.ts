import { z } from 'zod';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, 'not_found', `${what} not found`);
export const forbidden = () =>
  new HttpError(403, 'forbidden', 'You do not have access to this resource');
export const conflict = (message: string) => new HttpError(409, 'conflict', message);

const IdParam = z.coerce.number().int().positive();

export function toId(raw: string): number {
  return IdParam.parse(raw);
}
